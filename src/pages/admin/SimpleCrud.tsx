import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api } from '../../api/client'
import { useApiMutation, useApiQuery } from '../../api/hooks'
import { ConfirmButton, Empty, ErrorBox, Field, Modal, PageTitle, QueryState, btnGhost, btnPrimary, card, input } from '../../components/ui'
import type { Ingrediente, Zona } from '../../types'

interface Cfg<T> {
  titulo: string
  path: string
  idOf: (t: T) => number
  nombreOf: (t: T) => string
  extraOf?: (t: T) => ReactNode
  buildBody: (f: FormData) => unknown
  extraFields?: (t: T | null) => ReactNode
  canDelete: boolean
}

function Crud<T>({ cfg }: { cfg: Cfg<T> }) {
  const q = useApiQuery<T[]>(cfg.path)
  const [edit, setEdit] = useState<T | 'nuevo' | null>(null)
  const guardar = useApiMutation(
    (v: { id?: number; body: unknown }) =>
      v.id ? api(`${cfg.path}/${v.id}`, { method: 'PUT', body: v.body }) : api(cfg.path, { method: 'POST', body: v.body }),
    [cfg.path],
  )
  const borrar = useApiMutation((id: number) => api(`${cfg.path}/${id}`, { method: 'DELETE' }), [cfg.path])
  const actual = edit && edit !== 'nuevo' ? edit : null

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    guardar.mutate(
      { id: actual ? cfg.idOf(actual) : undefined, body: cfg.buildBody(new FormData(e.currentTarget)) },
      { onSuccess: () => setEdit(null) },
    )
  }

  return (
    <>
      <PageTitle action={<button className={btnPrimary} onClick={() => { guardar.reset(); setEdit('nuevo') }}>+ Nuevo</button>}>
        {cfg.titulo}
      </PageTitle>
      {borrar.error && <ErrorBox error={borrar.error} />}
      <QueryState q={q}>
        {(items) =>
          items.length === 0 ? <Empty>Sin registros.</Empty> : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => (
                <li key={cfg.idOf(t)} className={`${card} flex items-center justify-between gap-2`}>
                  <div><p className="font-medium">{cfg.nombreOf(t)}</p>{cfg.extraOf?.(t)}</div>
                  <div className="flex gap-2">
                    <button className={btnGhost} onClick={() => { guardar.reset(); setEdit(t) }}>Editar</button>
                    {cfg.canDelete && <ConfirmButton message="¿Eliminar?" onConfirm={() => borrar.mutate(cfg.idOf(t))}>✕</ConfirmButton>}
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
      {edit && (
        <Modal title={actual ? 'Editar' : 'Nuevo'} onClose={() => setEdit(null)}>
          <form onSubmit={onSubmit} className="space-y-3">
            {guardar.error && <ErrorBox error={guardar.error} />}
            <Field label="Nombre">
              <input name="nombre" required defaultValue={actual ? cfg.nombreOf(actual) : ''} className={input} />
            </Field>
            {cfg.extraFields?.(actual)}
            <button className={btnPrimary} disabled={guardar.isPending}>Guardar</button>
          </form>
        </Modal>
      )}
    </>
  )
}

export function Zonas() {
  return (
    <Crud<Zona>
      cfg={{
        titulo: 'Zonas de reparto',
        path: '/admin/zonas',
        idOf: (z) => z.zona_id,
        nombreOf: (z) => z.nombre_zona,
        buildBody: (f) => ({ nombre_zona: String(f.get('nombre')).trim() }),
        canDelete: true,
      }}
    />
  )
}

export function Ingredientes() {
  return (
    <Crud<Ingrediente>
      cfg={{
        titulo: 'Ingredientes',
        path: '/admin/ingredientes',
        idOf: (i) => i.ingrediente_id,
        nombreOf: (i) => i.nombre,
        extraOf: (i) => <p className="text-xs text-stone-500">Stock: {i.stock_actual ?? 0}</p>,
        buildBody: (f) => ({ nombre: String(f.get('nombre')).trim(), stock_actual: Number(f.get('stock') || 0) }),
        extraFields: (i) => (
          <Field label="Stock actual">
            <input name="stock" type="number" min={0} step="any" defaultValue={i?.stock_actual ?? 0} className={input} />
          </Field>
        ),
        canDelete: false,
      }}
    />
  )
}