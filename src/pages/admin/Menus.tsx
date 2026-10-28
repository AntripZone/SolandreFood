import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../../api/client'
import { useApiMutation, useApiQuery } from '../../api/hooks'
import { ConfirmButton, Empty, ErrorBox, Field, Modal, PageTitle, QueryState, btnGhost, btnPrimary, card, fmtFecha, hoy, input, money } from '../../components/ui'
import type { MenuAdmin, PlatoSimple } from '../../types'

function MenuForm({ menu, onClose }: { menu: MenuAdmin | null; onClose: () => void }) {
  const platos = useApiQuery<PlatoSimple[]>('/admin/platos')
  const guardar = useApiMutation(
    (v: { id?: number; body: unknown }) =>
      v.id ? api(`/admin/menu/${v.id}`, { method: 'PUT', body: v.body }) : api('/admin/menu', { method: 'POST', body: v.body }),
    ['/admin/menu', '/catalogo'],
  )
  const opts = (t: string) => platos.data?.filter((p) => p.tipo === t) ?? []

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const num = (k: string) => (f.get(k) ? Number(f.get(k)) : null)
    const comunes = {
      cantidad_disponible: Number(f.get('stock')),
      precio_menu: Number(f.get('precio')),
      imagen_url: String(f.get('imagen') || '') || null,
      publicado: f.get('publicado') === 'on',
    }
    guardar.mutate(
      {
        id: menu?.menu_dia_id,
        body: menu
          ? comunes
          : {
              ...comunes,
              fecha: f.get('fecha'),
              plato_principal_id: Number(f.get('principal')),
              bebida_id: num('bebida'),
              postre_id: num('postre'),
              info_nutricional: String(f.get('info') || '') || null,
            },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {guardar.error && <ErrorBox error={guardar.error} />}
      {!menu && (
        <>
          <Field label="Fecha"><input name="fecha" type="date" required defaultValue={hoy()} className={input} /></Field>
          <Field label="Plato principal">
            <select name="principal" required className={input} defaultValue="">
              <option value="" disabled>Selecciona…</option>
              {platos.data?.filter((p) => p.tipo === 'Principal').map((p) => <option key={p.plato_id} value={p.plato_id}>{p.nombre}</option>)}
            </select>
          </Field>
          <Field label="Bebida">
            <select name="bebida" className={input}><option value="">—</option>{opts('Bebida').map((p) => <option key={p.plato_id} value={p.plato_id}>{p.nombre}</option>)}</select>
          </Field>
          <Field label="Postre">
            <select name="postre" className={input}><option value="">—</option>{opts('Postre').map((p) => <option key={p.plato_id} value={p.plato_id}>{p.nombre}</option>)}</select>
          </Field>
          <Field label="Info nutricional"><input name="info" className={input} /></Field>
        </>
      )}
      <Field label="Precio"><input name="precio" type="number" min={0.01} step="0.01" required defaultValue={menu?.precio_menu} className={input} /></Field>
      <Field label="Stock"><input name="stock" type="number" min={0} required defaultValue={menu?.cantidad_disponible ?? 20} className={input} /></Field>
      <Field label="URL de imagen"><input name="imagen" defaultValue={menu?.imagen_url ?? ''} className={input} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="publicado" defaultChecked={menu?.publicado ?? true} /> Publicado</label>
      <button className={btnPrimary} disabled={guardar.isPending}>Guardar</button>
    </form>
  )
}

export default function Menus() {
  const q = useApiQuery<MenuAdmin[]>('/admin/menu')
  const platos = useApiQuery<PlatoSimple[]>('/admin/platos')
  const [edit, setEdit] = useState<MenuAdmin | 'nuevo' | null>(null)
  const borrar = useApiMutation((id: number) => api(`/admin/menu/${id}`, { method: 'DELETE' }), ['/admin/menu', '/catalogo'])
  const nombre = (id: number | null) => platos.data?.find((p) => p.plato_id === id)?.nombre ?? '—'

  return (
    <>
      <PageTitle action={<button className={btnPrimary} onClick={() => setEdit('nuevo')}>+ Nuevo menú</button>}>Menús</PageTitle>
      {borrar.error && <ErrorBox error={borrar.error} />}
      <QueryState q={q}>
        {(ms) =>
          ms.length === 0 ? <Empty>Sin menús.</Empty> : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ms.map((m) => (
                <li key={m.menu_dia_id} className={`${card} space-y-1`}>
                  <p className="text-xs uppercase text-stone-500">{fmtFecha(m.fecha, true)} · {m.publicado ? 'Publicado' : 'Borrador'}</p>
                  <p className="font-medium">{nombre(m.plato_principal_id)}</p>
                  <p className="text-sm text-stone-600">{money(m.precio_menu)} · stock {m.cantidad_disponible}</p>
                  <div className="flex gap-2 pt-1">
                    <button className={btnGhost} onClick={() => setEdit(m)}>Editar</button>
                    <ConfirmButton message="¿Eliminar menú?" onConfirm={() => borrar.mutate(m.menu_dia_id)}>Eliminar</ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
      {edit && (
        <Modal title={edit === 'nuevo' ? 'Nuevo menú' : 'Editar menú'} onClose={() => setEdit(null)}>
          <MenuForm menu={edit === 'nuevo' ? null : edit} onClose={() => setEdit(null)} />
        </Modal>
      )}
    </>
  )
}