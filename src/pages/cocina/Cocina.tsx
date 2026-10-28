import { useState } from 'react'
import { api } from '../../api/client'
import { useApiMutation, useApiQuery } from '../../api/hooks'
import { Empty, ErrorBox, EstadoBadge, PageTitle, QueryState, btnPrimary, card, hoy, input } from '../../components/ui'
import type { EstadisticasCocina, Estado, PedidoCocina } from '../../types'

const SIGUIENTE: Partial<Record<Estado, Estado>> = {
  Confirmado: 'En Cocina',
  'En Cocina': 'Listo para Entrega',
}

function PedidoCard({ p, onAvanzar, pending }: { p: PedidoCocina; onAvanzar?: (s: Estado) => void; pending?: boolean }) {
  const sig = SIGUIENTE[p.estado]
  return (
    <article className={`${card} space-y-2`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">#{p.pedido_id} · {p.cliente_nombre}</h3>
        <EstadoBadge estado={p.estado} />
      </div>
      {p.minutos_desde_pedido != null && <p className="text-xs text-stone-500">Hace {p.minutos_desde_pedido} min</p>}
      <ul className="text-sm">
        {p.items.map((i) => (
          <li key={i.item_id}>
            <b>{i.cantidad}×</b> {i.plato_principal} · {i.bebida} · {i.postre}
            {i.exclusiones && i.exclusiones.length > 0 && <span className="text-red-600"> · SIN {i.exclusiones.join(', ')}</span>}
          </li>
        ))}
      </ul>
      {onAvanzar && sig && (
        <button className={btnPrimary} disabled={pending} onClick={() => onAvanzar(sig)}>
          Pasar a «{sig}»
        </button>
      )}
    </article>
  )
}

export default function Cocina() {
  const [tab, setTab] = useState<'pendientes' | 'historial' | 'stats'>('pendientes')
  const [fecha, setFecha] = useState(hoy())
  const pend = useApiQuery<PedidoCocina[]>('/cocina/pendientes', undefined, { refetchInterval: 10000, enabled: tab === 'pendientes' })
  const hist = useApiQuery<PedidoCocina[]>('/cocina/historial', { fecha }, { enabled: tab === 'historial' })
  const stats = useApiQuery<EstadisticasCocina>('/cocina/estadisticas', { fecha }, { enabled: tab === 'stats' })
  const cambiar = useApiMutation(
    (v: { id: number; nuevo_estado: Estado }) =>
      api(`/cocina/pedidos/${v.id}/estado`, { method: 'PATCH', body: { nuevo_estado: v.nuevo_estado } }),
    ['/cocina'],
  )

  return (
    <>
      <PageTitle>Cocina</PageTitle>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {([['pendientes', 'Pendientes'], ['historial', 'Historial'], ['stats', 'Estadísticas']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === k ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-stone-300'}`}>
            {l}
          </button>
        ))}
        {tab !== 'pendientes' && <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={`${input} max-w-44`} />}
      </div>
      {cambiar.error && <ErrorBox error={cambiar.error} />}
      {tab === 'pendientes' && (
        <QueryState q={pend}>
          {(ps) =>
            ps.length === 0 ? <Empty>No hay pedidos pendientes.</Empty> : (
              <div className="grid gap-4 md:grid-cols-2">
                {ps.map((p) => (
                  <PedidoCard key={p.pedido_id} p={p} pending={cambiar.isPending}
                    onAvanzar={(s) => cambiar.mutate({ id: p.pedido_id, nuevo_estado: s })} />
                ))}
              </div>
            )
          }
        </QueryState>
      )}
      {tab === 'historial' && (
        <QueryState q={hist}>
          {(ps) =>
            ps.length === 0 ? <Empty>Sin pedidos ese día.</Empty> : (
              <div className="grid gap-4 md:grid-cols-2">{ps.map((p) => <PedidoCard key={p.pedido_id} p={p} />)}</div>
            )
          }
        </QueryState>
      )}
      {tab === 'stats' && (
        <QueryState q={stats}>
          {(s) => (
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ['Procesados', s.total_pedidos_procesados],
                ['En proceso', s.pedidos_en_proceso],
                ['Platos preparados', s.platos_preparados],
                ['Prom. preparación (min)', s.tiempo_promedio_preparacion?.toFixed(1) ?? '—'],
              ].map(([k, v]) => (
                <div key={String(k)} className={card}>
                  <dt className="text-xs text-stone-500">{k}</dt>
                  <dd className="text-2xl font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </QueryState>
      )}
    </>
  )
}