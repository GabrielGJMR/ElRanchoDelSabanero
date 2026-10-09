import { useState, type FormEvent } from 'react'

interface Props {
  onLogin: (username: string, password: string) => Promise<boolean>
}

export default function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    const ok = await onLogin(username, password)
    if (!ok) setMessage('Usuario o clave incorrectos')
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-3">
      <label className="block text-sm text-muted">
        Usuario
        <input
          className="field mt-1"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
      </label>
      <label className="block text-sm text-muted">
        Clave
        <input
          className="field mt-1"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>
      <button className="btn w-full" type="submit" disabled={busy}>Entrar</button>
      <p className="text-sm text-muted" role="status">{message}</p>
    </form>
  )
}
