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
    <form id="login" onSubmit={submit}>
      <label>
        Usuario
        <input value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
      </label>
      <label>
        Clave
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>
      <button className="btn" type="submit" disabled={busy}>Entrar</button>
      <p className="note" role="status">{message}</p>
    </form>
  )
}
