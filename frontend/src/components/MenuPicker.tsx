import { useState } from 'react'
import type { MenuType } from '../api.ts'

interface Props {
  menus: MenuType[]
  onSelect: (menu: MenuType) => void
  onCreate: (name: string) => Promise<boolean>
  onRename: (menu: MenuType, name: string) => Promise<boolean>
  onDelete: (menu: MenuType) => Promise<void>
}

/** Pantalla tras iniciar sesión: elegir cuál de los tipos de menú administrar. */
export default function MenuPicker({ menus, onSelect, onCreate, onRename, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  function startRename(menu: MenuType) {
    setEditingId(menu.id)
    setEditingName(menu.name)
  }

  async function saveRename(menu: MenuType) {
    if (await onRename(menu, editingName)) setEditingId(null)
  }

  async function createMenu() {
    if (await onCreate(newName)) {
      setNewName('')
      setAdding(false)
    }
  }

  async function deleteMenu(menu: MenuType) {
    if (!window.confirm(`¿Borrar el menú "${menu.name}" y todas sus categorías y platillos?`)) return
    await onDelete(menu)
  }

  return (
    <section>
      <p className="mb-5 text-sm text-muted">Elija qué menú quiere administrar.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="flex flex-col gap-2 rounded-xl border border-line-soft bg-card/40 p-4"
          >
            {editingId === menu.id ? (
              <div className="flex items-center gap-2">
                <input
                  className="field"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  aria-label="Nombre del menú"
                />
                <button className="btn btn-sm" onClick={() => saveRename(menu)}>Guardar</button>
                <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(null)}>Cancelar</button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelect(menu)}
                  className="cursor-pointer rounded-lg border border-line-soft bg-card px-4 py-6 text-left font-bold text-gold hover:border-fire hover:text-fire"
                >
                  {menu.name}
                </button>
                <div className="flex gap-3 text-xs">
                  <button type="button" className="cursor-pointer font-semibold text-muted hover:text-gold" onClick={() => startRename(menu)}>
                    Renombrar
                  </button>
                  <button type="button" className="cursor-pointer font-semibold text-muted hover:text-fire" onClick={() => deleteMenu(menu)}>
                    Borrar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-5 cursor-pointer text-sm font-semibold text-gold hover:text-fire"
        >
          + Nuevo menú
        </button>
      )}

      {adding && (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-dashed border-line p-2.5 sm:w-96">
          <input
            className="field"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre (ej. Menú de bebidas)"
          />
          <button className="btn btn-sm" onClick={createMenu}>Agregar</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setAdding(false)}>Cancelar</button>
        </div>
      )}
    </section>
  )
}
