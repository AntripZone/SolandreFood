import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ErrorBox, Field, btnPrimary, card, input } from '../components/ui'
import { homeFor, useAuth } from '../context/auth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={from ?? homeFor(user.rol_id)} replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setLoading(true)
    setError(null)
    try {
      const u = await login(String(f.get('email')).trim(), String(f.get('password')))
      navigate(from ?? homeFor(u.rol_id), { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className={`${card} mx-auto max-w-sm space-y-4`}>
      <h1 className="text-xl font-bold">Ingresar</h1>
      {error != null && <ErrorBox error={error} />}
      <Field label="Correo">
        <input name="email" type="email" required autoComplete="email" className={input} />
      </Field>
      <Field label="Contraseña">
        <input name="password" type="password" required minLength={6} autoComplete="current-password" className={input} />
      </Field>
      <button disabled={loading} className={`${btnPrimary} w-full`}>
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
      <p className="text-center text-sm text-stone-500">
        ¿No tienes cuenta? <Link to="/register" className="text-brand-600 underline">Regístrate</Link>
      </p>
    </form>
  )
}