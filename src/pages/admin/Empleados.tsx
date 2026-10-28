import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../../api/client'
import { useApiMutation, useApiQuery } from '../../api/hooks'
import { ConfirmButton, Empty, ErrorBox, Field, Modal, PageTitle, QueryState, btnGhost, btnPrimary, card, input } from '../../components/ui'
import { ROL, ROL_NOMBRE } from '../../types'
import type { Empleado, Zona } from '../../types'

export default function Empleados() {
  const q = useApiQuery<Empleado[]>('/admin/empleados')
  const zonas = useApiQuery<Zona[]>('/catalogo/zonas')
  const [edit, setEdit] = useState<Empleado | 'nuevo' | null>(null)
  const guardar = useApiMutation(
    (v: { id?: number; body: unknown }) =>
      v.id ? api(`/admin/empleados/${v.id}`, { method: 'PUT', body: v.body }) : api('/admin/empleados', { method: 'POST', body: v.body }),
    ['/admin/empleados'],
  )
  const desactivar = useApiMutation((id: number) => api(`/admin/empleados/${id}`, { method: 'DELETE' }), ['/admin/empleados'])
  const zona = useApiMutation((v: { id: number; z: number }) => api(`/admin/empleados/${v.id}/zona`, { method: 'PATCH', body: { zona_reparto_id: v.z } }), ['/admin/empleados'])
  const actual = edit && edit !== 'nuevo' ? edit : null

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    guardar.mutate(
      {
        id: actual?.usuario_id,
        body: {
          email: String(f.get('email')).trim(),
          password: String(f.get('password')),
          nombre_completo: String(f.get('nombre')).trim(),
          telefono: String(f.get('telefono') || '') || null,
          rol_id: Number(f.get('rol')),
          zona_reparto_id: f.get('zona') ? Number(f.get('zona')) : null,
        },
      },
      { onSuccess: () => setEdit(null) },
    )
  }

  return (
    <>
      <PageTitle action={<button className={btnPrimary} onClick={() => { guardar.reset(); setEdit('nuevo') }}>+ Nuevo empleado</button>}>Empleados</PageTitle>
      {(desactivar.error ?? zona.error) && <ErrorBox error={desactivar.error ?? zona.error} />}
      <QueryState q={q}>
        {(es) =>
          es.length === 0 ? <Empty>Sin empleados.</Empty> : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {es.map((e) => (
                <li key={e.usuario_id} className={`${card} space-y-1`}>
                  <p className="font-medium">{e.nombre_completo}</p>
                  <p className="text-sm text-stone-600">{e.email} · {e.rol_nombre}</p>
                  {e.rol_id === ROL.Delivery && (
                    <select className={input} value={e.zona_reparto_id ?? ''} onChange={(ev) => ev.target.value && zona.mutate({ id: e.usuario_id, z: Number(ev.target.value) })}>
                      <option value="">Sin zona</option>
                      {zonas.data?.map((z) => <option key={z.zona_id} value={z.zona_id}>{z.nombre_zona}</option>)}
                    </select>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button className={btnGhost} onClick={() => { guardar.reset(); setEdit(e) }}>Editar</button>
                    <ConfirmButton message="¿Desactivar empleado?" onConfirm={() => desactivar.mutate(e.usuario_id)}>Desactivar</ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
      {edit && (
        <Modal title={actual ? 'Editar empleado' : 'Nuevo empleado'} onClose={() => setEdit(null)}>
          <form onSubmit={onSubmit} className="space-y-3">
            {guardar.error && <ErrorBox error={guardar.error} />}
            <Field label="Nombre completo"><input name="nombre" required defaultValue={actual?.nombre_completo} className={input} /></Field>
            <Field label="Correo"><input name="email" type="email" required defaultValue={actual?.email} className={input} /></Field>
            <Field label="Teléfono"><input name="telefono" defaultValue={actual?.telefono ?? ''} className={input} /></Field>
            <Field label="Contraseña" hint={actual ? 'La API exige enviarla también al editar' : undefined}>
              <input name="password" type="password" required minLength={6} className={input} />
            </Field>
            <Field label="Rol">
              <select name="rol" defaultValue={actual?.rol_id ?? ROL.Cocina} className={input}>
                {[ROL.Admin, ROL.Cocina, ROL.Delivery].map((r) => <option key={r} value={r}>{ROL_NOMBRE[r]}</option>)}
              </select>
            </Field>
            <Field label="Zona (solo Delivery)">
              <select name="zona" defaultValue={actual?.zona_reparto_id ?? ''} className={input}>
                <option value="">—</option>
                {zonas.data?.map((z) => <option key={z.zona_id} value={z.zona_id}>{z.nombre_zona}</option>)}
              </select>
            </Field>
            <button className={btnPrimary} disabled={guardar.isPending}>Guardar</button>
          </form>
        </Modal>
      )}
    </>
  )
}