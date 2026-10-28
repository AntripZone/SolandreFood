import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ErrorBox, Field, btnPrimary, card, input } from '../components/ui'
import { homeFor, useAuth } from '../context/auth'

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={homeFor(user.rol_id)} replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (f.get('password') !== f.get('password2')) return setError(new Error('Las contraseñas no coinciden'))
    setLoading(true)
    setError(null)
    try {
      const u = await register({
        nombre_completo: String(f.get('nombre')).trim(),
        email: String(f.get('email')).trim(),
        password: String(f.get('password')),
        telefono: String(f.get('telefono') || '') || null,
      })
      navigate(homeFor(u.rol_id), { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className={`${card} mx-auto max-w-sm space-y-4`}>
      <h1 className="text-xl font-bold">Crear cuenta</h1>
      {error != null && <ErrorBox error={error} />}
      <Field label="Nombre completo">
        <input name="nombre" required minLength={2} maxLength={100} className={input} />
      </Field>
      <Field label="Correo">
        <input name="email" type="email" required autoComplete="email" className={input} />
      </Field>
      <Field label="Teléfono (opcional)">
        <input name="telefono" type="tel" maxLength={20} className={input} />
      </Field>
      <Field label="Contraseña" hint="Mínimo 6 caracteres">
        <input name="password" type="password" required minLength={6} autoComplete="new-password" className={input} />
      </Field>
      <Field label="Repite la contraseña">
        <input name="password2" type="password" required minLength={6} autoComplete="new-password" className={input} />
      </Field>
      <button disabled={loading} className={`${btnPrimary} w-full`}>
        {loading ? 'Creando…' : 'Registrarme'}
      </button>
      <p className="text-center text-sm text-stone-500">
        ¿Ya tienes cuenta? <Link to="/login" className="text-brand-600 underline">Ingresa</Link>
      </p>
    </form>
  )
}