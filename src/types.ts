export type Estado =
  | 'Pendiente'
  | 'Confirmado'
  | 'En Cocina'
  | 'Listo para Entrega'
  | 'En Reparto'
  | 'Entregado'
  | 'Cancelado'
export const ESTADOS: Estado[] = [
  'Pendiente',
  'Confirmado',
  'En Cocina',
  'Listo para Entrega',
  'En Reparto',
  'Entregado',
  'Cancelado',
]

export type MetodoPago = 'Efectivo' | 'QR' | 'Transferencia'
export const METODOS_PAGO: MetodoPago[] = ['Efectivo', 'QR', 'Transferencia']

export type TipoPlato = 'Principal' | 'Acompanamiento' | 'Bebida' | 'Postre'
export const TIPOS_PLATO: TipoPlato[] = ['Principal', 'Acompanamiento', 'Bebida', 'Postre']

export const ROL = { Admin: 1, Cocina: 2, Delivery: 3, Cliente: 4 } as const
export type RolId = (typeof ROL)[keyof typeof ROL]
export const ROL_NOMBRE: Record<number, string> = {
  1: 'Administrador',
  2: 'Cocina',
  3: 'Delivery',
  4: 'Cliente',
}

export interface TokenResponse {
  access_token: string
  token_type?: string
  usuario_id: number
  rol_id: number
  nombre_completo: string
  email: string
}
export interface UserResponse {
  usuario_id: number
  nombre_completo: string
  email: string
  telefono: string | null
  rol_id: number
  nombre_rol: string
}

export interface Zona {
  zona_id: number
  nombre_zona: string
}
export interface Ingrediente {
  ingrediente_id: number
  nombre: string
  stock_actual?: string | null
}
export interface PlatoSimple {
  plato_id: number
  nombre: string
  descripcion: string | null
  tipo: TipoPlato
}
export interface PlatoCompleto extends PlatoSimple {
  imagen_url: string | null
  ingredientes?: Ingrediente[]
}
export interface PlatoDetalle {
  plato_id: number
  nombre: string
  imagen_url: string | null
  descripcion: string | null
  tipo: TipoPlato
  ingredientes?: Ingrediente[]
}
export interface MenuDia {
  menu_dia_id: number
  fecha: string
  precio_menu: string
  cantidad_disponible: number
  publicado: boolean
  info_nutricional: string | null
  imagen_url: string | null
  plato_principal: PlatoSimple
  bebida: PlatoSimple | null
  postre: PlatoSimple | null
}
export interface MenuIngredientes {
  menu_dia_id: number
  fecha: string
  plato_principal: PlatoSimple
  ingredientes: Ingrediente[]
}
export interface MenuAdmin {
  menu_dia_id: number
  fecha: string
  plato_principal_id: number
  bebida_id: number | null
  postre_id: number | null
  cantidad_disponible: number
  precio_menu: string
  imagen_url: string | null
  publicado: boolean
}

export interface ItemPedidoRequest {
  menu_dia_id: number
  cantidad: number
  exclusiones?: number[]
}
export interface CrearPedidoRequest {
  zona_id: number
  google_maps_link?: string | null
  latitud?: number | null
  longitud?: number | null
  direccion_referencia?: string | null
  metodo_pago: MetodoPago
  items: ItemPedidoRequest[]
}
export interface PedidoResponse {
  pedido_id: number
  token_recoger: string
  estado: Estado
  total_pedido: string
  metodo_pago: MetodoPago
  esta_pagado: boolean
  zona_id: number
  direccion_referencia: string | null
  fecha_pedido: string | null
}
export interface MisPedido {
  pedido_id: number
  token_recoger: string
  estado: Estado
  total_pedido: string
  metodo_pago: MetodoPago
  esta_pagado: boolean
  fecha_pedido: string | null
  fecha_entrega: string | null
  items_count: number
}
export interface ItemPedidoResponse {
  item_id: number
  cantidad: number
  precio_unitario: string
  menu: { menu_dia_id: number; fecha: string; precio_menu: string }
  exclusiones?: string[]
}
export interface PedidoDetalle {
  pedido_id: number
  token_recoger: string
  estado: Estado
  total_pedido: string
  metodo_pago: MetodoPago
  esta_pagado: boolean
  zona_id: number
  direccion_referencia: string | null
  google_maps_link: string | null
  latitud: string | null
  longitud: string | null
  fecha_pedido: string | null
  fecha_confirmado: string | null
  fecha_listo_cocina: string | null
  fecha_en_reparto: string | null
  fecha_entrega: string | null
  items: ItemPedidoResponse[]
}
export interface TrackPedido {
  pedido_id: number
  token_recoger: string
  estado: Estado
  total_pedido: string
  metodo_pago: MetodoPago
  esta_pagado: boolean
  fecha_pedido: string | null
  fecha_confirmado: string | null
  fecha_listo_cocina: string | null
  fecha_en_reparto: string | null
  fecha_entrega: string | null
  delivery_asignado_id: number | null
  nombre_delivery?: string | null
}

export interface ItemCocina {
  item_id: number
  cantidad: number
  menu_fecha: string
  plato_principal: string
  bebida: string
  postre: string
  exclusiones?: string[]
}
export interface PedidoCocina {
  pedido_id: number
  token_recoger: string
  estado: Estado
  fecha_pedido: string | null
  cliente_nombre: string
  cliente_telefono: string | null
  items: ItemCocina[]
  minutos_desde_pedido?: number | null
}
export interface EstadisticasCocina {
  fecha: string
  total_pedidos_procesados: number
  pedidos_en_proceso: number
  tiempo_promedio_preparacion?: number | null
  pedido_mas_rapido?: number | null
  pedido_mas_lento?: number | null
  platos_preparados: number
}
export interface Entrega {
  pedido_id: number
  token_recoger: string
  estado: Estado
  cliente_nombre: string
  cliente_telefono: string | null
  zona_nombre: string
  direccion_referencia: string | null
  google_maps_link: string | null
  latitud: string | null
  longitud: string | null
  total_pedido: string
  metodo_pago: MetodoPago
  esta_pagado: boolean
  cantidad_items: number
  fecha_pedido: string | null
  fecha_listo_cocina: string | null
  fecha_en_reparto: string | null
  minutos_desde_listo?: number | null
}

export interface PedidoDashboard {
  pedido_id: number
  token_recoger: string
  estado: Estado
  cliente_nombre: string
  cliente_email: string
  cliente_telefono?: string | null
  zona_nombre: string
  delivery_nombre: string | null
  total_pedido: string
  fecha_pedido: string
  fecha_confirmado: string | null
  fecha_listo_cocina: string | null
  fecha_en_reparto: string | null
  fecha_entrega: string | null
}
export interface Kpis {
  fecha: string
  total_pedidos: number
  pedidos_por_estado: Record<string, number>
  ventas_totales: string
  ventas_por_metodo_pago: Record<string, number | string>
  tiempo_promedio_preparacion?: number | null
  tiempo_promedio_entrega?: number | null
}
export interface Empleado {
  usuario_id: number
  email: string
  nombre_completo: string
  telefono: string | null
  rol_id: number
  rol_nombre: string
  zona_reparto_id: number | null
  zona_nombre: string | null
}
export interface Cliente {
  usuario_id: number
  email: string
  nombre_completo: string
  telefono: string | null
  rol_id: number
  fecha_registro?: string | null
}
export interface Evento {
  evento_id: string
  tipo: string
  titulo: string
  mensaje: string
  data: Record<string, unknown>
  fecha_creacion: string
}
export interface ContadorEventos {
  total: number
  desde: string
  eventos_por_tipo: Record<string, number>
}
