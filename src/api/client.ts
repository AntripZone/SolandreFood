const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'https://backend-solandre.onrender.com'

export const TOKEN_KEY = 'comida.token'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

type Query = Record<string, string | number | boolean | null | undefined>

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  form?: FormData
  query?: Query
}

function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((d: { loc?: unknown[]; msg?: string }) => {
          const campo = d.loc?.filter((l) => l !== 'body').join('.')
          return campo ? `${campo}: ${d.msg}` : (d.msg ?? '')
        })
        .join(' · ')
    }
  }
  if (status === 401) return 'Credenciales inválidas o sesión expirada'
  if (status === 403) return 'No tienes permiso para realizar esta acción'
  if (status === 404) return 'No encontrado'
  return `Error del servidor (${status})`
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', body, form, query } = opts
  const url = new URL(BASE_URL + path)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    }
  }

  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Reintenta en unos segundos.')
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith('/auth/login')) onUnauthorized?.()
    throw new ApiError(res.status, errorMessage(data, res.status))
  }
  return data as T
}
