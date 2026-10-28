import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApiQuery } from '../api/hooks'
import { EstadoBadge, PageTitle, QueryState, btnPrimary, card, input, money } from '../components/ui'
import type { TrackPedido } from '../types'
import { Timeline } from './PedidoDetalle'

function Resultado({ token }: { token: string }) {
  const q = useApiQuery<TrackPedido>(`/pedidos/${token}/track`, undefined, { refetchInterval: 15000 })
  return (
    <QueryState q={q}>
      {(p) => (
        <div className={`${card} mt-5 space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Pedido #{p.pedido_id}</span>
            <EstadoBadge estado={p.estado} />
          </div>
          <p className="text-sm">Total {money(p.total_pedido)} · {p.metodo_pago} · {p.esta_pagado ? 'Pagado' : 'Sin pagar'}</p>
          {p.nombre_delivery && <p className="text-sm">Repartidor: {p.nombre_delivery}</p>}
          <Timeline p={p} />
        </div>
      )}
    </QueryState>
  )
}

export default function Track() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [valor, setValor] = useState(token ?? '')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (valor.trim()) navigate(`/track/${valor.trim()}`)
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageTitle>Rastrear pedido</PageTitle>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input className={input} placeholder="Código del pedido" value={valor} onChange={(e) => setValor(e.target.value)} />
        <button className={btnPrimary}>Buscar</button>
      </form>
      {token && <Resultado token={token} />}
    </div>
  )
}