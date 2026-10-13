import { useState } from 'react'
import type { AppUser, Role } from '../api.ts'
import AddButton from './AddButton.tsx'
import DeleteButton from './DeleteButton.tsx'

interface Props {
  users: AppUser[] | null
  currentUsername: string
  onCreate: (data: { username: string; password: string; role: Role }) => Promise<boolean>
  onUpdate: (user: AppUser, data: { password: string; role: Role }) => Promise<boolean>
  onDelete: (user: AppUser) => Promise<void>
}

const ROLE_LABEL: Record<Role, string> = { ADMIN: 'Administrador', EDITOR: 'Editor' }

/** Pestaña solo para Admin: quién entra al panel y con qué rol (ver Role en el backend para los permisos). */
export default function UsersPanel({ users, currentUsername, onCreate, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRole, setEditRole] = useState<Role>('EDITOR')
  const [editPassword, setEditPassword] = useState('')
  const [adding, setAdding] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'EDITOR' as Role })

  function startEdit(u: AppUser) {
    setEditingId(u.id)
    setEditRole(u.role)
    setEditPassword('')
  }

  async function saveEdit(u: AppUser) {
    if (await onUpdate(u, { password: editPassword, role: editRole })) setEditingId(null)
  }

  async function createUser() {
    if (await onCreate(newUser)) {
      setNewUser({ username: '', password: '', role: 'EDITOR' })
      setAdding(false)
    }
  }

  async function deleteUser(u: AppUser) {
    if (!window.confirm(`¿Borrar el usuario "${u.username}"? Ya no va a poder entrar al panel.`)) return
    await onDelete(u)
  }

  return (
    <section>
      <p className="mb-5 text-sm text-muted">
        Administrador: acceso total. Editor: platillos, precios, disponibilidad y fotos; no borra categorías/menús ni gestiona usuarios.
      </p>

      {!users && <p className="text-sm text-muted">Cargando...</p>}

      {users && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-2 rounded-xl border border-line-soft bg-card/40 p-4">
              {editingId === u.id ? (
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-gold">{u.username}</p>
                  <select
                    className="field"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                    aria-label={`Rol de ${u.username}`}
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="EDITOR">Editor</option>
                  </select>
                  <input
                    className="field"
                    type="password"
                    minLength={12}
                    maxLength={72}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Nueva clave (opcional)"
                    aria-label={`Nueva clave para ${u.username}`}
                  />
                  <div className="flex gap-2">
                    <button className="btn btn-sm flex-1" onClick={() => saveEdit(u)}>Guardar</button>
                    <button className="btn btn-sm btn-ghost flex-1" onClick={() => setEditingId(null)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-bold text-gold">{u.username}</p>
                  <p className="text-xs text-muted">{ROLE_LABEL[u.role]}</p>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <button type="button" className="cursor-pointer font-semibold text-muted hover:text-gold" onClick={() => startEdit(u)}>
                      Editar
                    </button>
                    {u.username !== currentUsername && (
                      <DeleteButton onClick={() => deleteUser(u)} description={`Borrar usuario ${u.username}`} size="sm" />
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {users && !adding && <AddButton onClick={() => setAdding(true)} label="Nuevo usuario" className="mt-5" />}

      {users && adding && (
        <div className="mt-5 grid grid-cols-1 items-center gap-2 rounded-lg border border-dashed border-line p-2.5 sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:w-fit">
          <input
            className="field"
            autoFocus
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            placeholder="Usuario"
          />
          <input
            className="field"
            type="password"
            minLength={12}
            maxLength={72}
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="Clave"
          />
          <select
            className="field"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
            aria-label="Rol del nuevo usuario"
          >
            <option value="ADMIN">Administrador</option>
            <option value="EDITOR">Editor</option>
          </select>
          <button className="btn btn-sm" onClick={createUser}>Agregar</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setAdding(false)}>Cancelar</button>
        </div>
      )}
    </section>
  )
}
