import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ItemPedidoRequest } from '../types'

export interface CartItem {
  key: string
  menu_dia_id: number
  nombre: string
  precio: number
  cantidad: number
  exclusiones: number[]
  exclusionesNombres: string[]
}

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  add: (item: Omit<CartItem, 'key' | 'cantidad'>, cantidad: number) => void
  setCantidad: (key: string, cantidad: number) => void
  remove: (key: string) => void
  clear: () => void
  toRequest: () => ItemPedidoRequest[]
}

const CART_KEY = 'comida.cart'
const CartContext = createContext<CartContextValue | null>(null)

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

const keyOf = (id: number, excl: number[]) => `${id}:${[...excl].sort((a, b) => a - b).join(',')}`

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(read)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {
      /* noop */
    }
  }, [items])

  const add = useCallback<CartContextValue['add']>((item, cantidad) => {
    const key = keyOf(item.menu_dia_id, item.exclusiones)
    setItems((prev) => {
      const found = prev.find((i) => i.key === key)
      if (found) return prev.map((i) => (i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i))
      return [...prev, { ...item, key, cantidad }]
    })
  }, [])

  const setCantidad = useCallback((key: string, cantidad: number) => {
    setItems((prev) =>
      cantidad <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, cantidad } : i)),
    )
  }, [])

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.cantidad, 0),
      total: items.reduce((n, i) => n + i.cantidad * i.precio, 0),
      add,
      setCantidad,
      remove,
      clear,
      toRequest: () =>
        items.map((i) => ({
          menu_dia_id: i.menu_dia_id,
          cantidad: i.cantidad,
          exclusiones: i.exclusiones,
        })),
    }),
    [items, add, setCantidad, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
