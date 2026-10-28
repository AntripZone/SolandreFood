import { useState } from 'react'
import { useApiQuery } from '../../api/hooks'
import { Empty, EstadoBadge, Modal, PageTitle, QueryState, btnGhost, card, fmtFecha, money } from '../../components/ui'
import type { Cliente, PedidoDashboard } from '../../types'

function Historial({ c, onClose }: { c: Cliente; onClose: () => void }) {
  const q = useApiQuery<PedidoDashboard[]>(`/admin/clientes/${c.usuario_id}/historial`)
  return (
    <Modal title={`Historial · ${c.nombre_completo}`} onClose={onClose}>
      <QueryState q={q}>
        {(ps) =>
          ps.length === 0 ? <Empty>Sin pedidos.</Empty> : (
            <ul className="divide-y divide-stone-100 text-sm">
              {ps.map((p) => (
                <li key={p.pedido_id} className="flex items-center justify-between gap-2 py-2">
                  <span>#{p.pedido_id} · {fmtFecha(p.fecha_pedido)}</span>
                  <span className="flex items-center gap-2"><EstadoBadge estado={p.estado} /> {money(p.total_pedido)}</span>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
    </Modal>
  )
}

export default function Clientes() {
  const q = useApiQuery<Cliente[]>('/admin/clientes')
  const [sel, setSel] = useState<Cliente | null>(null)
  const [texto, setTexto] = useState('')
  return (
    <>
      <PageTitle action={<input className="w-60 rounded-lg border border-stone-300 px-3 py-2 text-sm" placeholder="Buscar…" value={texto} onChange={(e) => setTexto(e.target.value)} />}>
        Clientes
      </PageTitle>
      <QueryState q={q}>
        {(cs) => {
          const f = cs.filter((c) => `${c.nombre_completo} ${c.email}`.toLowerCase().includes(texto.toLowerCase()))
          return f.length === 0 ? <Empty>Sin resultados.</Empty> : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {f.map((c) => (
                <li key={c.usuario_id} className={`${card} space-y-1`}>
                  <p className="font-medium">{c.nombre_completo}</p>
                  <p className="text-sm text-stone-600">{c.email}{c.telefono && ` · ${c.telefono}`}</p>
                  <p className="text-xs text-stone-500">Registro: {fmtFecha(c.fecha_registro)}</p>
                  <button className={btnGhost} onClick={() => setSel(c)}>Ver historial</button>
                </li>
              ))}
            </ul>
          )
        }}
      </QueryState>
      {sel && <Historial c={sel} onClose={() => setSel(null)} />}
    </>
  )
}