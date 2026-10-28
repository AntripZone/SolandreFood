import { useState } from 'react'
import { api } from '../../api/client'
import { useApiMutation, useApiQuery } from '../../api/hooks'
import { ConfirmButton, Empty, ErrorBox, EstadoBadge, PageTitle, QueryState, btnGhost, btnPrimary, card, fmtFecha, hoy, input, money } from '../../components/ui'
import { ESTADOS, ROL } from '../../types'
import type { Empleado, Estado, Kpis, PedidoDashboard } from '../../types'

export default function Dashboard() {
  const [fecha, setFecha] = useState(hoy())
  const [estado, setEstado] = useState('')
  const kpis = useApiQuery<Kpis>('/admin/kpis', { fecha })
  const pedidos = useApiQuery<PedidoDashboard[]>('/admin/pedidos', { fecha_inicio: fecha, fecha_fin: fecha, estado }, { refetchInterval: 15000 })
  const deliveries = useApiQuery<Empleado[]>('/admin/empleados')

  const confirmar = useApiMutation((id: number) => api(`/admin/pedidos/${id}/confirmar`, { method: 'PATCH' }), ['/admin/pedidos', '/admin/kpis'])
  const cancelar = useApiMutation((id: number) => api(`/admin/pedidos/${id}/cancelar`, { method: 'PATCH' }), ['/admin/pedidos', '/admin/kpis'])
  const cambiarEstado = useApiMutation((v: { id: number; estado: Estado }) => api(`/admin/pedidos/${v.id}/estado`, { method: 'PATCH', body: { estado: v.estado } }), ['/admin/pedidos', '/admin/kpis'])
  const reasignar = useApiMutation((v: { id: number; d: number }) => api(`/admin/pedidos/${v.id}/reasignar`, { method: 'PATCH', body: { nuevo_delivery_id: v.d } }), ['/admin/pedidos'])
  const err = confirmar.error ?? cancelar.error ?? cambiarEstado.error ?? reasignar.error
  const repartidores = deliveries.data?.filter((e) => e.rol_id === ROL.Delivery) ?? []

  return (
    <>
      <PageTitle action={<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={`${input} max-w-44`} />}>
        Dashboard
      </PageTitle>
      <QueryState q={kpis}>
        {(k) => (
          <dl className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className={card}><dt className="text-xs text-stone-500">Pedidos</dt><dd className="text-2xl font-bold">{k.total_pedidos}</dd></div>
            <div className={card}><dt className="text-xs text-stone-500">Ventas</dt><dd className="text-2xl font-bold">{money(k.ventas_totales)}</dd></div>
            <div className={card}><dt className="text-xs text-stone-500">Prom. preparación</dt><dd className="text-2xl font-bold">{k.tiempo_promedio_preparacion?.toFixed(1) ?? '—'} min</dd></div>
            <div className={card}><dt className="text-xs text-stone-500">Prom. entrega</dt><dd className="text-2xl font-bold">{k.tiempo_promedio_entrega?.toFixed(1) ?? '—'} min</dd></div>
            <div className={`${card} col-span-2 md:col-span-4 flex flex-wrap gap-3 text-sm`}>
              {Object.entries(k.pedidos_por_estado).map(([e, n]) => <span key={e}>{e}: <b>{n}</b></span>)}
              {Object.entries(k.ventas_por_metodo_pago).map(([m, v]) => <span key={m} className="text-stone-500">{m}: {money(v)}</span>)}
            </div>
          </dl>
        )}
      </QueryState>

      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-semibold">Pedidos</h2>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={`${input} max-w-52`}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e}>{e}</option>)}
        </select>
      </div>
      {err && <ErrorBox error={err} />}
      <QueryState q={pedidos}>
        {(ps) =>
          ps.length === 0 ? <Empty>Sin pedidos.</Empty> : (
            <div className="space-y-3">
              {ps.map((p) => (
                <article key={p.pedido_id} className={`${card} space-y-2`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">#{p.pedido_id} · {p.cliente_nombre}</span>
                    <EstadoBadge estado={p.estado} />
                  </div>
                  <p className="text-sm text-stone-600">
                    {p.zona_nombre} · {money(p.total_pedido)} · {fmtFecha(p.fecha_pedido)} · Delivery: {p.delivery_nombre ?? 'sin asignar'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {p.estado === 'Pendiente' && <button className={btnPrimary} onClick={() => confirmar.mutate(p.pedido_id)}>Confirmar</button>}
                    <select className={`${input} max-w-44`} value="" onChange={(e) => e.target.value && reasignar.mutate({ id: p.pedido_id, d: Number(e.target.value) })}>
                      <option value="">Reasignar…</option>
                      {repartidores.map((r) => <option key={r.usuario_id} value={r.usuario_id}>{r.nombre_completo}</option>)}
                    </select>
                    <select className={`${input} max-w-44`} value="" onChange={(e) => e.target.value && cambiarEstado.mutate({ id: p.pedido_id, estado: e.target.value as Estado })}>
                      <option value="">Cambiar estado…</option>
                      {ESTADOS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    {p.estado !== 'Cancelado' && p.estado !== 'Entregado' && (
                      <ConfirmButton message="¿Cancelar el pedido?" onConfirm={() => cancelar.mutate(p.pedido_id)}>Cancelar</ConfirmButton>
                    )}
                    <button className={btnGhost} disabled>{p.token_recoger}</button>
                  </div>
                </article>
              ))}
            </div>
          )
        }
      </QueryState>
    </>
  )
}