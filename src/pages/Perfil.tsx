import type { FormEvent } from 'react'
import { api } from '../api/client'
import { useApiMutation, useApiQuery } from '../api/hooks'
import { ErrorBox, Field, PageTitle, QueryState, btnPrimary, card, input } from '../components/ui'
import { useAuth } from '../context/auth'
import type { UserResponse } from '../types'

export default function Perfil() {
  const { updateName } = useAuth()
  const q = useApiQuery<UserResponse>('/auth/perfil')
  const guardar = useApiMutation(
    (b: { nombre_completo: string; telefono: string | null }) =>
      api<UserResponse>('/auth/perfil', { method: 'PATCH', body: b }),
    ['/auth/perfil'],
  )
  const pass = useApiMutation(
    (b: { password_actual: string; password_nueva: string }) =>
      api('/auth/cambiar-password', { method: 'PATCH', body: b }),
  )

  function onPerfil(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const nombre = String(f.get('nombre')).trim()
    guardar.mutate(
      { nombre_completo: nombre, telefono: String(f.get('telefono') || '') || null },
      { onSuccess: () => updateName(nombre) },
    )
  }

  function onPass(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    pass.mutate(
      { password_actual: String(f.get('actual')), password_nueva: String(f.get('nueva')) },
      { onSuccess: () => form.reset() },
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageTitle>Mi perfil</PageTitle>
      <QueryState q={q}>
        {(u) => (
          <form onSubmit={onPerfil} className={`${card} space-y-3`}>
            <p className="text-sm text-stone-500">{u.email} · {u.nombre_rol}</p>
            {guardar.error && <ErrorBox error={guardar.error} />}
            {guardar.isSuccess && <p className="text-sm text-green-700">Perfil actualizado.</p>}
            <Field label="Nombre completo">
              <input name="nombre" defaultValue={u.nombre_completo} required minLength={2} maxLength={100} className={input} />
            </Field>
            <Field label="Teléfono">
              <input name="telefono" defaultValue={u.telefono ?? ''} maxLength={20} className={input} />
            </Field>
            <button className={btnPrimary} disabled={guardar.isPending}>Guardar</button>
          </form>
        )}
      </QueryState>
      <form onSubmit={onPass} className={`${card} space-y-3`}>
        <h2 className="font-semibold">Cambiar contraseña</h2>
        {pass.error && <ErrorBox error={pass.error} />}
        {pass.isSuccess && <p className="text-sm text-green-700">Contraseña actualizada.</p>}
        <Field label="Actual"><input name="actual" type="password" required minLength={6} className={input} /></Field>
        <Field label="Nueva"><input name="nueva" type="password" required minLength={6} className={input} /></Field>
        <button className={btnPrimary} disabled={pass.isPending}>Cambiar</button>
      </form>
    </div>
  )
}