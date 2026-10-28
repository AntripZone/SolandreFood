import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApiQuery } from '../api/hooks'
import { useAuth } from '../context/auth'
import { useCart } from '../context/cart'
import { ROL, ROL_NOMBRE } from '../types'
import type { ContadorEventos } from '../types'
import { btnGhost, btnPrimary } from './ui'

function Bell() {
  const q = useApiQuery<ContadorEventos>('/notificaciones/contador', undefined, { refetchInterval: 30000 })
  const n = q.data?.total ?? 0
  return (
    <span title="Notificaciones nuevas" className="rounded-full bg-stone-100 px-2 py-1 text-xs">
      🔔 {n}
    </span>
  )
}

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-brand-100 text-brand-700' : 'text-stone-600 hover:bg-stone-100'}`

export default function Layout() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const esCliente = !user || user.rol_id === ROL.Cliente

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-3 text-lg font-bold text-brand-600">
            🍲 Solandre
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {esCliente && (
              <NavLink to="/catalogo" className={linkCls}>
                Catálogo
              </NavLink>
            )}
            <NavLink to="/track" className={linkCls}>
              Rastrear
            </NavLink>
            {user?.rol_id === ROL.Cliente && (
              <>
                <NavLink to="/mis-pedidos" className={linkCls}>
                  Mis pedidos
                </NavLink>
                <NavLink to="/carrito" className={linkCls}>
                  Carrito{count > 0 && ` (${count})`}
                </NavLink>
              </>
            )}
            {user?.rol_id === ROL.Cocina && <NavLink to="/cocina" className={linkCls}>Cocina</NavLink>}
            {user?.rol_id === ROL.Delivery && <NavLink to="/delivery" className={linkCls}>Entregas</NavLink>}
            {user?.rol_id === ROL.Admin && <NavLink to="/admin" className={linkCls}>Administración</NavLink>}
          </nav>
          {user ? (
            <div className="flex items-center gap-2">
              <Bell />
              <Link to="/perfil" className="text-sm text-stone-600 hover:underline">
                {user.nombre_completo} · {ROL_NOMBRE[user.rol_id]}
              </Link>
              <button
                className={btnGhost}
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className={btnGhost}>Ingresar</Link>
              <Link to="/register" className={btnPrimary}>Registrarse</Link>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}