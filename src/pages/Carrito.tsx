import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useApiMutation, useApiQuery } from '../api/hooks'
import { Empty, ErrorBox, Field, PageTitle, btnGhost, btnPrimary, card, input, money } from '../components/ui'
import { useCart } from '../context/cart'
import { METODOS_PAGO } from '../types'
import type { CrearPedidoRequest, MetodoPago, PedidoResponse, Zona } from '../types'

export default function Carrito() {
  const cart = useCart()
  const navigate = useNavigate()
  const zonas = useApiQuery<Zona[]>('/catalogo/zonas')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoError, setGeoError] = useState('')
  const crear = useApiMutation(
    (b: CrearPedidoRequest) => api<PedidoResponse>('/pedidos/', { method: 'POST', body: b }),
    ['/pedidos', '/catalogo'],
  )

  if (cart.items.length === 0)
    return (
      <Empty>
        Tu carrito está vacío. <Link to="/catalogo" className="text-brand-600 underline">Ver catálogo</Link>
      </Empty>
    )

  function ubicar() {
    setGeoError('')
    navigator.geolocation?.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setGeoError('No se pudo obtener tu ubicación'),
    )
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    crear.mutate(
      {
        zona_id: Number(f.get('zona')),
        metodo_pago: f.get('pago') as MetodoPago,
        direccion_referencia: String(f.get('direccion') || '') || null,
        google_maps_link: String(f.get('maps') || '') || null,
        latitud: coords?.lat ?? null,
        longitud: coords?.lng ?? null,
        items: cart.toRequest(),
      },
      {
        onSuccess: (p) => {
          cart.clear()
          navigate(`/pedidos/${p.pedido_id}`)
        },
      },
    )
  }

  return (
    <>
      <PageTitle>Tu pedido</PageTitle>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${card} space-y-3`}>
          {cart.items.map((i) => (
            <div key={i.key} className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3 last:border-0">
              <div>
                <p className="font-medium">{i.nombre}</p>
                {i.exclusionesNombres.length > 0 && (
                  <p className="text-xs text-stone-500">Sin: {i.exclusionesNombres.join(', ')}</p>
                )}
                <p className="text-sm text-stone-600">{money(i.precio)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button className={btnGhost} onClick={() => cart.setCantidad(i.key, i.cantidad - 1)} aria-label="Menos">−</button>
                <span className="w-6 text-center">{i.cantidad}</span>
                <button className={btnGhost} onClick={() => cart.setCantidad(i.key, i.cantidad + 1)} aria-label="Más">+</button>
                <button className="text-sm text-red-600 underline" onClick={() => cart.remove(i.key)}>Quitar</button>
              </div>
            </div>
          ))}
          <p className="text-right text-lg font-bold">Total: {money(cart.total)}</p>
        </section>

        <form onSubmit={onSubmit} className={`${card} space-y-3`}>
          <h2 className="font-semibold">Entrega y pago</h2>
          {crear.error && <ErrorBox error={crear.error} />}
          <Field label="Zona">
            <select name="zona" required className={input} defaultValue="">
              <option value="" disabled>{zonas.isLoading ? 'Cargando…' : 'Selecciona una zona'}</option>
              {zonas.data?.map((z) => <option key={z.zona_id} value={z.zona_id}>{z.nombre_zona}</option>)}
            </select>
          </Field>
          <Field label="Dirección / referencia">
            <input name="direccion" className={input} placeholder="Calle, número, referencia…" />
          </Field>
          <Field label="Enlace de Google Maps (opcional)">
            <input name="maps" type="url" className={input} />
          </Field>
          <div className="flex items-center gap-3 text-sm">
            <button type="button" className={btnGhost} onClick={ubicar}>📍 Usar mi ubicación</button>
            {coords && <span className="text-green-700">Ubicación guardada</span>}
            {geoError && <span className="text-red-600">{geoError}</span>}
          </div>
          <Field label="Método de pago">
            <select name="pago" className={input} defaultValue="Efectivo">
              {METODOS_PAGO.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <button disabled={crear.isPending} className={`${btnPrimary} w-full`}>
            {crear.isPending ? 'Enviando…' : `Confirmar pedido · ${money(cart.total)}`}
          </button>
        </form>
      </div>
    </>
  )
}