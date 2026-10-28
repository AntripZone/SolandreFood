import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { homeFor, useAuth } from './context/auth'
import { ROL } from './types'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalogo from './pages/Catalogo'
import Carrito from './pages/Carrito'
import MisPedidos from './pages/MisPedidos'
import PedidoDetalle from './pages/PedidoDetalle'
import Track from './pages/Track'
import Perfil from './pages/Perfil'
import Cocina from './pages/cocina/Cocina'
import Delivery from './pages/delivery/Delivery'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Menus from './pages/admin/Menus'
import Platos from './pages/admin/Platos'
import { Ingredientes, Zonas } from './pages/admin/SimpleCrud'
import Empleados from './pages/admin/Empleados'
import Clientes from './pages/admin/Clientes'

function Inicio() {
  const { user } = useAuth()
  return <Navigate to={user ? homeFor(user.rol_id) : '/catalogo'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="track" element={<Track />} />
        <Route path="track/:token" element={<Track />} />

        <Route element={<ProtectedRoute />}>
          <Route path="perfil" element={<Perfil />} />
        </Route>
        <Route element={<ProtectedRoute roles={[ROL.Cliente]} />}>
          <Route path="carrito" element={<Carrito />} />
          <Route path="mis-pedidos" element={<MisPedidos />} />
          <Route path="pedidos/:id" element={<PedidoDetalle />} />
        </Route>
        <Route element={<ProtectedRoute roles={[ROL.Cocina]} />}>
          <Route path="cocina" element={<Cocina />} />
        </Route>
        <Route element={<ProtectedRoute roles={[ROL.Delivery]} />}>
          <Route path="delivery" element={<Delivery />} />
        </Route>
        <Route path="admin" element={<ProtectedRoute roles={[ROL.Admin]} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="menus" element={<Menus />} />
            <Route path="platos" element={<Platos />} />
            <Route path="ingredientes" element={<Ingredientes />} />
            <Route path="empleados" element={<Empleados />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="zonas" element={<Zonas />} />
          </Route>
        </Route>

        <Route path="403" element={<p className="py-20 text-center">403 · No tienes acceso a esta sección.</p>} />
        <Route path="*" element={<p className="py-20 text-center">404 · Página no encontrada.</p>} />
      </Route>
    </Routes>
  )
}