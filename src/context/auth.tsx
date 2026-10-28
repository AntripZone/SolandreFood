import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, setUnauthorizedHandler, TOKEN_KEY } from '../api/client'
import { ROL } from '../types'
import type { TokenResponse } from '../types'

export interface SessionUser {
  usuario_id: number
  rol_id: number
  nombre_completo: string
  email: string
}

interface AuthContextValue {
  user: SessionUser | null
  login: (email: string, password: string) => Promise<SessionUser>
  register: (data: {
    nombre_completo: string
    email: string
    password: string
    telefono?: string | null
  }) => Promise<SessionUser>
  logout: () => void
  updateName: (nombre: string) => void
}

const USER_KEY = 'comida.user'
const AuthContext = createContext<AuthContextValue | null>(null)

function readUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw && localStorage.getItem(TOKEN_KEY) ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

export function homeFor(rol: number): string {
  switch (rol) {
    case ROL.Admin:
      return '/admin'
    case ROL.Cocina:
      return '/cocina'
    case ROL.Delivery:
      return '/delivery'
    default:
      return '/catalogo'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readUser)
  const qc = useQueryClient()

  const persist = useCallback((t: TokenResponse): SessionUser => {
    const u: SessionUser = {
      usuario_id: t.usuario_id,
      rol_id: t.rol_id,
      nombre_completo: t.nombre_completo,
      email: t.email,
    }
    try {
      localStorage.setItem(TOKEN_KEY, t.access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(u))
    } catch {
      /* almacenamiento no disponible: la sesión dura lo que la pestaña */
    }
    qc.clear()
    setUser(u)
    return u
  }, [qc])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      /* noop */
    }
    qc.clear()
    setUser(null)
  }, [qc])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      logout,
      login: async (email, password) =>
        persist(await api<TokenResponse>('/auth/login', { method: 'POST', body: { email, password } })),
      register: async (data) =>
        persist(await api<TokenResponse>('/auth/register', { method: 'POST', body: data })),
      updateName: (nombre) => {
        setUser((prev) => {
          if (!prev) return prev
          const next = { ...prev, nombre_completo: nombre }
          try {
            localStorage.setItem(USER_KEY, JSON.stringify(next))
          } catch {
            /* noop */
          }
          return next
        })
      },
    }),
    [user, logout, persist],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
