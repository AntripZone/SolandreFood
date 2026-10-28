import { useState } from 'react'
import { api } from '../../api/client'
import { useApiMutation, useApiQuery } from '../../api/hooks'
import { Empty, ErrorBox, EstadoBadge, PageTitle, QueryState, btnGhost, btnPrimary, card, money } from '../../components/ui'
import type { Entrega } from '../../types'

function EntregaCard({ e }: { e: Entrega }) {
  const [pago, setPago] = useState(false)
  const tomar = useApiMutation(() => api(`/delivery/pedidos/${e.pedido_id}/tomar`, { method: 'PATCH' }), ['/delivery', '/notificaciones'])
  const fin = useApiMutation(
    () => api(`/delivery/pedidos/${e.pedido_id}/finalizar`, { method: 'PATCH', body: { confirmar_pago: pago } }),
    ['/delivery'],
  )
  const llegada = useApiMutation(() => api(`/notificaciones/delivery/notificar-llegada/${e.pedido_id}`, { method: 'POST' }))
  const mapa = e.google_maps_link ?? (e.latitud && e.longitud ? `https://maps.google.com/?q=${e.latitud},${e.longitud}` : null)
  const err = tomar.error ?? fin.error ?? llegada.error

  return (
    <article className={`${card} space-y-2`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">#{e.pedido_id} · {e.cliente_nombre}</h3>
        <EstadoBadge estado={e.estado} />
      </div>
      <p className="text-sm">{e.zona_nombre} · {e.direccion_referencia ?? 'Sin referencia'}</p>
      <p className="text-sm">{e.cantidad_items} ítem(s) · {money(e.total_pedido)} · {e.metodo_pago} · {e.esta_pagado ? 'Pagado' : 'Por cobrar'}</p>
      {e.cliente_telefono && <a className="text-sm text-brand-600 underline" href={`tel:${e.cliente_telefono}`}>📞 {e.cliente_telefono}</a>}
      {mapa && <a className="ml-3 text-sm text-brand-600 underline" href={mapa} target="_blank" rel="noreferrer">🗺️ Mapa</a>}
      {err && <ErrorBox error={err} />}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {e.estado === 'Listo para Entrega' && (
          <button className={btnPrimary} disabled={tomar.isPending} onClick={() => tomar.mutate(undefined)}>Tomar pedido</button>
        )}
        {e.estado === 'En Reparto' && (
          <>
            <button className={btnGhost} disabled={llegada.isPending} onClick={() => llegada.mutate(undefined)}>Avisar llegada</button>
            {!e.esta_pagado && (
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={pago} onChange={(ev) => setPago(ev.target.checked)} /> Cobrado
              </label>
            )}
            <button className={btnPrimary} disabled={fin.isPending} onClick={() => fin.mutate(undefined)}>Finalizar entrega</button>
          </>
        )}
      </div>
    </article>
  )
}

export default function Delivery() {
  const q = useApiQuery<Entrega[]>('/delivery/mis-entregas', undefined, { refetchInterval: 10000 })
  return (
    <>
      <PageTitle>Mis entregas</PageTitle>
      <QueryState q={q}>
        {(es) =>
          es.length === 0 ? <Empty>No tienes entregas asignadas.</Empty> : (
            <div className="grid gap-4 md:grid-cols-2">{es.map((e) => <EntregaCard key={e.pedido_id} e={e} />)}</div>
          )
        }
      </QueryState>
    </>
  )
}