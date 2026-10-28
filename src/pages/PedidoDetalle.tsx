import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useApiMutation, useApiQuery } from '../api/hooks'
import { ConfirmButton, ErrorBox, EstadoBadge, PageTitle, QueryState, card, fmtFecha, money } from '../components/ui'
import type { PedidoDetalle as Detalle } from '../types'

export function Timeline({ p }: { p: Pick<Detalle, 'fecha_pedido' | 'fecha_confirmado' | 'fecha_listo_cocina' | 'fecha_en_reparto' | 'fecha_entrega'> }) {
  const pasos: [string, string | null][] = [
    ['Pedido realizado', p.fecha_pedido],
    ['Confirmado', p.fecha_confirmado],
    ['Listo en cocina', p.fecha_listo_cocina],
    ['En reparto', p.fecha_en_reparto],
    ['Entregado', p.fecha_entrega],
  ]
  return (
    <ol className="space-y-2">
      {pasos.map(([l, f]) => (
        <li key={l} className={`flex items-center gap-3 text-sm ${f ? 'text-stone-900' : 'text-stone-400'}`}>
          <span className={`h-3 w-3 rounded-full ${f ? 'bg-brand-600' : 'bg-stone-300'}`} />
          <span className="flex-1">{l}</span>
          <span>{fmtFecha(f)}</span>
        </li>
      ))}
    </ol>
  )
}

export default function PedidoDetalle() {
  const { id } = useParams()
  const q = useApiQuery<Detalle>(`/pedidos/${id}/detalle`, undefined, { refetchInterval: 15000 })
  const cancelar = useApiMutation(() => api(`/pedidos/${id}`, { method: 'DELETE' }), ['/pedidos'])

  return (
    <>
      <Link to="/mis-pedidos" className="text-sm text-brand-600 underline">← Mis pedidos</Link>
      <PageTitle>Pedido #{id}</PageTitle>
      {cancelar.error && <ErrorBox error={cancelar.error} />}
      <QueryState q={q}>
        {(p) => (
          <div className="grid gap-4 md:grid-cols-2">
            <section className={`${card} space-y-2`}>
              <div className="flex items-center justify-between">
                <EstadoBadge estado={p.estado} />
                <span className="text-lg font-bold">{money(p.total_pedido)}</span>
              </div>
              <p className="text-sm">Código para recoger: <b className="font-mono">{p.token_recoger}</b></p>
              <p className="text-sm">Pago: {p.metodo_pago} · {p.esta_pagado ? 'Pagado' : 'Pendiente de pago'}</p>
              <p className="text-sm">Dirección: {p.direccion_referencia ?? '—'}</p>
              <Link to={`/track/${p.token_recoger}`} className="text-sm text-brand-600 underline">Enlace de seguimiento</Link>
              {p.estado === 'Pendiente' && (
                <ConfirmButton message="¿Cancelar este pedido?" onConfirm={() => cancelar.mutate(undefined)} disabled={cancelar.isPending}>
                  Cancelar pedido
                </ConfirmButton>
              )}
            </section>
            <section className={card}>
              <h2 className="mb-2 font-semibold">Seguimiento</h2>
              <Timeline p={p} />
            </section>
            <section className={`${card} md:col-span-2`}>
              <h2 className="mb-2 font-semibold">Ítems</h2>
              <ul className="divide-y divide-stone-100 text-sm">
                {p.items.map((i) => (
                  <li key={i.item_id} className="flex justify-between py-2">
                    <span>
                      {i.cantidad}× Menú {fmtFecha(i.menu.fecha, true)}
                      {i.exclusiones && i.exclusiones.length > 0 && <em className="text-stone-500"> (sin {i.exclusiones.join(', ')})</em>}
                    </span>
                    <span>{money(Number(i.precio_unitario) * i.cantidad)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </QueryState>
    </>
  )
}