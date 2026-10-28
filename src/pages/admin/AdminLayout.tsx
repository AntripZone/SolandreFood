import { NavLink, Outlet } from 'react-router-dom'

const links: [string, string, boolean][] = [
  ['/admin', 'Dashboard', true],
  ['/admin/menus', 'Menús', false],
  ['/admin/platos', 'Platos', false],
  ['/admin/ingredientes', 'Ingredientes', false],
  ['/admin/empleados', 'Empleados', false],
  ['/admin/clientes', 'Clientes', false],
  ['/admin/zonas', 'Zonas', false],
]

export default function AdminLayout() {
  return (
    <>
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-stone-200 pb-2">
        {links.map(([to, label, end]) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-brand-600 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  )
}