import { useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Estado } from '../types'

export const btn =
  'inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50'
export const btnPrimary = `${btn} bg-brand-600 text-white hover:bg-brand-700`
export const btnGhost = `${btn} border border-stone-300 bg-white text-stone-700 hover:bg-stone-100`
export const btnDanger = `${btn} bg-red-600 text-white hover:bg-red-700`
export const input =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
export const card = 'rounded-xl border border-stone-200 bg-white p-4 shadow-sm'

export function money(v: string | number | null | undefined): string {
  const n = Number(v ?? 0)
  return `Bs ${Number.isFinite(n) ? n.toFixed(2) : '0.00'}`
}

export function fmtFecha(v: string | null | undefined, soloFecha = false): string {
  if (!v) return '—'
  const d = new Date(soloFecha && v.length === 10 ? `${v}T00:00:00` : v)
  if (Number.isNaN(d.getTime())) return v
  return soloFecha
    ? d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
    : d.toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const hoy = () => new Date().toLocaleDateString('en-CA')

export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-stone-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof Error ? error.message : String(error)
  return (
    <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <span>{msg}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-medium underline">
          Reintentar
        </button>
      )}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">{children}</p>
}

export function QueryState<T>({
  q,
  children,
}: {
  q: { data: T | undefined; isLoading: boolean; error: unknown; refetch: () => unknown }
  children: (data: T) => ReactNode
}) {
  if (q.isLoading) return <Spinner label="Cargando… (el servidor puede tardar al despertar)" />
  if (q.error) return <ErrorBox error={q.error} onRetry={() => void q.refetch()} />
  if (q.data === undefined) return null
  return <>{children(q.data)}</>
}

const ESTADO_COLOR: Record<Estado, string> = {
  Pendiente: 'bg-stone-100 text-stone-700',
  Confirmado: 'bg-blue-100 text-blue-700',
  'En Cocina': 'bg-amber-100 text-amber-800',
  'Listo para Entrega': 'bg-lime-100 text-lime-800',
  'En Reparto': 'bg-violet-100 text-violet-700',
  Entregado: 'bg-green-100 text-green-700',
  Cancelado: 'bg-red-100 text-red-700',
}

export function EstadoBadge({ estado }: { estado: Estado }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_COLOR[estado] ?? ''}`}>
      {estado}
    </span>
  )
}

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-stone-900">{children}</h1>
      {action}
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="rounded p-1 text-stone-500 hover:bg-stone-100">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ConfirmButton({
  children,
  message,
  onConfirm,
  className = btnDanger,
  disabled,
}: {
  children: ReactNode
  message: string
  onConfirm: () => void
  className?: string
  disabled?: boolean
}) {
  return (
    <button className={className} disabled={disabled} onClick={() => window.confirm(message) && onConfirm()}>
      {children}
    </button>
  )
}