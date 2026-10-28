import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { api } from '../../api/client'
import { useApiMutation, useApiQuery } from '../../api/hooks'
import { ConfirmButton, Empty, ErrorBox, Field, Modal, PageTitle, QueryState, btnGhost, btnPrimary, card, input } from '../../components/ui'
import { TIPOS_PLATO } from '../../types'
import type { Ingrediente, PlatoDetalle, TipoPlato } from '../../types'

interface PlatoRow { plato_id: number; nombre: string; imagen_url: string | null; descripcion: string | null; tipo: TipoPlato }

function PlatoForm({ plato, onClose }: { plato: PlatoRow | null; onClose: () => void }) {
  const ings = useApiQuery<Ingrediente[]>('/admin/ingredientes')
  const detalle = useApiQuery<PlatoDetalle>(`/admin/platos/${plato?.plato_id}`, undefined, { enabled: !!plato })
  const [sel, setSel] = useState<number[] | null>(null)
  const [imagen, setImagen] = useState(plato?.imagen_url ?? '')
  const [subiendo, setSubiendo] = useState(false)
  const [upErr, setUpErr] = useState<unknown>(null)
  const seleccion = sel ?? detalle.data?.ingredientes?.map((i) => i.ingrediente_id) ?? []

  const guardar = useApiMutation(
    (v: { id?: number; body: unknown }) =>
      v.id ? api(`/admin/platos/${v.id}`, { method: 'PUT', body: v.body }) : api('/admin/platos', { method: 'POST', body: v.body }),
    ['/admin/platos'],
  )

  async function subir(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    setUpErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await api<Record<string, string>>('/upload/image', { method: 'POST', form: fd })
      setImagen(r.url ?? r.imagen_url ?? r.secure_url ?? '')
    } catch (err) {
      setUpErr(err)
    } finally {
      setSubiendo(false)
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    guardar.mutate(
      {
        id: plato?.plato_id,
        body: {
          nombre: String(f.get('nombre')).trim(),
          descripcion: String(f.get('descripcion') || '') || null,
          tipo: f.get('tipo'),
          imagen_url: imagen || null,
          ingredientes: seleccion.map((ingrediente_id) => ({ ingrediente_id })),
        },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {guardar.error && <ErrorBox error={guardar.error} />}
      <Field label="Nombre"><input name="nombre" required maxLength={150} defaultValue={plato?.nombre} className={input} /></Field>
      <Field label="Descripción"><textarea name="descripcion" rows={2} defaultValue={plato?.descripcion ?? ''} className={input} /></Field>
      <Field label="Tipo">
        <select name="tipo" defaultValue={plato?.tipo ?? 'Principal'} className={input}>{TIPOS_PLATO.map((t) => <option key={t}>{t}</option>)}</select>
      </Field>
      <Field label="Imagen (URL o subir archivo)">
        <input value={imagen} onChange={(e) => setImagen(e.target.value)} className={input} placeholder="https://…" />
        <input type="file" accept="image/*" onChange={subir} className="mt-2 text-sm" />
        {subiendo && <span className="text-xs">Subiendo…</span>}
      </Field>
      {upErr != null && <ErrorBox error={upErr} />}
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Ingredientes</legend>
        <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto">
          {ings.data?.map((i) => (
            <label key={i.ingrediente_id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={seleccion.includes(i.ingrediente_id)}
                onChange={() => setSel(seleccion.includes(i.ingrediente_id) ? seleccion.filter((x) => x !== i.ingrediente_id) : [...seleccion, i.ingrediente_id])} />
              {i.nombre}
            </label>
          ))}
        </div>
      </fieldset>
      <button className={btnPrimary} disabled={guardar.isPending || subiendo}>Guardar</button>
    </form>
  )
}

export default function Platos() {
  const q = useApiQuery<PlatoRow[]>('/admin/platos')
  const [edit, setEdit] = useState<PlatoRow | 'nuevo' | null>(null)
  const borrar = useApiMutation((id: number) => api(`/admin/platos/${id}`, { method: 'DELETE' }), ['/admin/platos'])

  return (
    <>
      <PageTitle action={<button className={btnPrimary} onClick={() => setEdit('nuevo')}>+ Nuevo plato</button>}>Platos</PageTitle>
      {borrar.error && <ErrorBox error={borrar.error} />}
      <QueryState q={q}>
        {(ps) =>
          ps.length === 0 ? <Empty>Sin platos.</Empty> : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ps.map((p) => (
                <li key={p.plato_id} className={`${card} space-y-2`}>
                  {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} loading="lazy" className="h-28 w-full rounded-lg object-cover" />}
                  <p className="text-xs uppercase text-stone-500">{p.tipo}</p>
                  <p className="font-medium">{p.nombre}</p>
                  <div className="flex gap-2">
                    <button className={btnGhost} onClick={() => setEdit(p)}>Editar</button>
                    <ConfirmButton message="¿Eliminar plato?" onConfirm={() => borrar.mutate(p.plato_id)}>Eliminar</ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
      {edit && (
        <Modal title={edit === 'nuevo' ? 'Nuevo plato' : 'Editar plato'} onClose={() => setEdit(null)}>
          <PlatoForm plato={edit === 'nuevo' ? null : edit} onClose={() => setEdit(null)} />
        </Modal>
      )}
    </>
  )
}