import { Link } from 'react-router-dom'
import { useApiQuery } from '../api/hooks'
import { Empty, EstadoBadge, PageTitle, QueryState, card, fmtFecha, money } from '../components/ui'
import type { MisPedido } from '../types'

export default function MisPedidos() {
  const q = useApiQuery<MisPedido[]>('/pedidos/mis-pedidos', undefined, { refetchInterval: 20000 })
  return (
    <>
      <PageTitle>Mis pedidos</PageTitle>
      <QueryState q={q}>
        {(ps) =>
          ps.length === 0 ? (
            <Empty>Aún no tienes pedidos.</Empty>
          ) : (
            <ul className="space-y-3">
              {ps.map((p) => (
                <li key={p.pedido_id}>
                  <Link to={`/pedidos/${p.pedido_id}`} className={`${card} flex items-center justify-between gap-3 hover:border-brand-500`}>
                    <div>
                      <p className="font-medium">Pedido #{p.pedido_id} · {p.items_count} ítem(s)</p>
                      <p className="text-xs text-stone-500">{fmtFecha(p.fecha_pedido)} · {p.metodo_pago}</p>
                    </div>
                    <div className="text-right">
                      <EstadoBadge estado={p.estado} />
                      <p className="mt-1 text-sm font-semibold">{money(p.total_pedido)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
    </>
  )
}