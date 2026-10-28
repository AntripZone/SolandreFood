import { useState } from 'react'
import { ApiError } from '../api/client'
import { useApiQuery } from '../api/hooks'
import { Empty, Modal, PageTitle, QueryState, btnGhost, btnPrimary, card, fmtFecha, input, money } from '../components/ui'
import { useAuth } from '../context/auth'
import { useCart } from '../context/cart'
import { ROL, TIPOS_PLATO } from '../types'
import type { MenuDia, MenuIngredientes, PlatoCompleto, TipoPlato } from '../types'

function PersonalizarModal({ menu, onClose }: { menu: MenuDia; onClose: () => void }) {
  const { add } = useCart()
  const ing = useApiQuery<MenuIngredientes>(`/catalogo/menu/${menu.menu_dia_id}/ingredientes`)
  const [excluidos, setExcluidos] = useState<number[]>([])
  const [cantidad, setCantidad] = useState(1)

  const toggle = (id: number) =>
    setExcluidos((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  function agregar() {
    const nombres = (ing.data?.ingredientes ?? []).filter((i) => excluidos.includes(i.ingrediente_id)).map((i) => i.nombre)
    add(
      {
        menu_dia_id: menu.menu_dia_id,
        nombre: menu.plato_principal.nombre,
        precio: Number(menu.precio_menu),
        exclusiones: excluidos,
        exclusionesNombres: nombres,
      },
      cantidad,
    )
    onClose()
  }

  return (
    <Modal title={menu.plato_principal.nombre} onClose={onClose}>
      <p className="mb-3 text-sm text-stone-600">Desmarca los ingredientes que quieres quitar.</p>
      <QueryState q={ing}>
        {(d) =>
          d.ingredientes.length === 0 ? (
            <p className="text-sm text-stone-500">Sin ingredientes personalizables.</p>
          ) : (
            <ul className="mb-4 grid grid-cols-2 gap-2">
              {d.ingredientes.map((i) => (
                <li key={i.ingrediente_id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!excluidos.includes(i.ingrediente_id)}
                      onChange={() => toggle(i.ingrediente_id)}
                    />
                    {i.nombre}
                  </label>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className={btnGhost} onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Menos">−</button>
          <span className="w-6 text-center">{cantidad}</span>
          <button
            className={btnGhost}
            onClick={() => setCantidad((c) => Math.min(menu.cantidad_disponible, c + 1))}
            aria-label="Más"
          >
            +
          </button>
        </div>
        <button className={btnPrimary} onClick={agregar}>
          Agregar · {money(Number(menu.precio_menu) * cantidad)}
        </button>
      </div>
    </Modal>
  )
}

function MenuCard({ m, puedeComprar }: { m: MenuDia; puedeComprar: boolean }) {
  const [open, setOpen] = useState(false)
  const agotado = m.cantidad_disponible <= 0
  return (
    <article className={`${card} flex flex-col gap-2`}>
      {m.imagen_url && <img src={m.imagen_url} alt={m.plato_principal.nombre} loading="lazy" className="h-40 w-full rounded-lg object-cover" />}
      <p className="text-xs uppercase text-stone-500">{fmtFecha(m.fecha, true)}</p>
      <h3 className="text-lg font-semibold">{m.plato_principal.nombre}</h3>
      <p className="text-sm text-stone-600">{m.plato_principal.descripcion}</p>
      <ul className="text-sm text-stone-600">
        {m.bebida && <li>🥤 {m.bebida.nombre}</li>}
        {m.postre && <li>🍰 {m.postre.nombre}</li>}
      </ul>
      {m.info_nutricional && <p className="text-xs text-stone-500">{m.info_nutricional}</p>}
      <div className="mt-auto flex items-center justify-between pt-2">
        <div>
          <p className="font-bold text-brand-700">{money(m.precio_menu)}</p>
          <p className="text-xs text-stone-500">{agotado ? 'Agotado' : `${m.cantidad_disponible} disponibles`}</p>
        </div>
        {puedeComprar && (
          <button className={btnPrimary} disabled={agotado} onClick={() => setOpen(true)}>
            Personalizar y agregar
          </button>
        )}
      </div>
      {open && <PersonalizarModal menu={m} onClose={() => setOpen(false)} />}
    </article>
  )
}

function Grid({ menus, puedeComprar }: { menus: MenuDia[]; puedeComprar: boolean }) {
  if (menus.length === 0) return <Empty>No hay menús disponibles.</Empty>
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {menus.map((m) => (
        <MenuCard key={m.menu_dia_id} m={m} puedeComprar={puedeComprar} />
      ))}
    </div>
  )
}

function Platos() {
  const q = useApiQuery<PlatoCompleto[]>('/catalogo/platos')
  const [tipo, setTipo] = useState<TipoPlato | ''>('')
  const [texto, setTexto] = useState('')
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <select className={`${input} max-w-48`} value={tipo} onChange={(e) => setTipo(e.target.value as TipoPlato | '')}>
          <option value="">Todos los tipos</option>
          {TIPOS_PLATO.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input className={`${input} max-w-64`} placeholder="Buscar plato…" value={texto} onChange={(e) => setTexto(e.target.value)} />
      </div>
      <QueryState q={q}>
        {(platos) => {
          const f = platos.filter(
            (p) => (!tipo || p.tipo === tipo) && p.nombre.toLowerCase().includes(texto.toLowerCase()),
          )
          return f.length === 0 ? (
            <Empty>Sin resultados.</Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {f.map((p) => (
                <article key={p.plato_id} className={card}>
                  {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} loading="lazy" className="mb-2 h-36 w-full rounded-lg object-cover" />}
                  <p className="text-xs uppercase text-stone-500">{p.tipo}</p>
                  <h3 className="font-semibold">{p.nombre}</h3>
                  <p className="text-sm text-stone-600">{p.descripcion}</p>
                  {p.ingredientes && p.ingredientes.length > 0 && (
                    <p className="mt-2 text-xs text-stone-500">{p.ingredientes.map((i) => i.nombre).join(', ')}</p>
                  )}
                </article>
              ))}
            </div>
          )
        }}
      </QueryState>
    </>
  )
}

type Tab = 'hoy' | 'semana' | 'platos'

export default function Catalogo() {
  const { user } = useAuth()
  const puedeComprar = !user || user.rol_id === ROL.Cliente
  const [tab, setTab] = useState<Tab>('hoy')
  const hoy = useApiQuery<MenuDia>('/catalogo/menu-hoy', undefined, { enabled: tab === 'hoy' })
  const semana = useApiQuery<MenuDia[]>('/catalogo/menu-semanal', undefined, { enabled: tab === 'semana' })

  const tabs: [Tab, string][] = [['hoy', 'Menú de hoy'], ['semana', 'Menú semanal'], ['platos', 'Platos']]

  return (
    <>
      <PageTitle>Catálogo</PageTitle>
      <div role="tablist" className="mb-5 flex gap-2">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === k ? 'bg-brand-600 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-300'}`}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === 'hoy' &&
        (hoy.error instanceof ApiError && hoy.error.status === 404 ? (
          <Empty>No hay menú publicado para hoy.</Empty>
        ) : (
          <QueryState q={hoy}>{(m) => <Grid menus={[m]} puedeComprar={puedeComprar} />}</QueryState>
        ))}
      {tab === 'semana' && <QueryState q={semana}>{(ms) => <Grid menus={ms} puedeComprar={puedeComprar} />}</QueryState>}
      {tab === 'platos' && <Platos />}
    </>
  )
}