import { useCallback, useEffect, useState } from 'react'
import {
  adminRequest, basicAuth, UnauthorizedError,
  type Category, type CategoryInput, type ItemInput, type MenuItem,
} from '../api.ts'
import CategoryEditor from '../components/CategoryEditor.tsx'
import LoginForm from '../components/LoginForm.tsx'

// Las credenciales viven solo en esta pestaña (sessionStorage) y se envían como HTTP Basic.
const STORAGE_KEY = 'adminAuth'

export default function Admin() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '')
  const [menu, setMenu] = useState<Category[] | null>(null)
  const [error, setError] = useState('')
  const [newCategory, setNewCategory] = useState({ name: '', note: '' })

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuth('')
    setMenu(null)
  }, [])

  const load = useCallback(async () => {
    try {
      setMenu(await adminRequest<Category[]>(auth, 'menu'))
    } catch (e) {
      if (e instanceof UnauthorizedError) logout()
      else setError((e as Error).message)
    }
  }, [auth, logout])

  useEffect(() => {
    if (auth) load()
  }, [auth, load])

  /** Ejecuta una acción de escritura: muestra el error si falla y recarga el menú si sale bien. Devuelve si tuvo éxito. */
  async function run(action: () => Promise<unknown>, reload = false): Promise<boolean> {
    setError('')
    try {
      await action()
      if (reload) await load()
      return true
    } catch (e) {
      if (e instanceof UnauthorizedError) logout()
      else setError((e as Error).message)
      return false
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    const header = basicAuth(username, password)
    try {
      await adminRequest(header, 'menu')
    } catch {
      return false
    }
    sessionStorage.setItem(STORAGE_KEY, header)
    setAuth(header)
    return true
  }

  const saveCategory = (id: number, data: CategoryInput) =>
    run(() => adminRequest(auth, `categories/${id}`, 'PUT', data))

  const deleteCategory = async (c: Category) => {
    if (!window.confirm(`¿Borrar la categoría "${c.name}" y todos sus platillos?`)) return
    await run(() => adminRequest(auth, `categories/${c.id}`, 'DELETE'), true)
  }

  const saveItem = (id: number, data: ItemInput) => run(() => adminRequest(auth, `items/${id}`, 'PUT', data))

  const deleteItem = async (item: MenuItem) => {
    if (!window.confirm(`¿Borrar "${item.name}"?`)) return
    await run(() => adminRequest(auth, `items/${item.id}`, 'DELETE'), true)
  }

  const addItem = (data: ItemInput) => run(() => adminRequest(auth, 'items', 'POST', data), true)

  async function addCategory() {
    if (await run(() => adminRequest(auth, 'categories', 'POST', newCategory), true)) {
      setNewCategory({ name: '', note: '' })
    }
  }

  return (
    <div className="admin">
      <main className="wrap">
        <h1>Administración del menú</h1>

        {!auth && <LoginForm onLogin={login} />}

        {auth && (
          <>
            <p><button className="btn sm" onClick={logout}>Cerrar sesión</button></p>
            {error && <p className="banner" role="alert">{error}</p>}
            {!menu && <p className="note">Cargando...</p>}

            {menu?.map((c) => (
              <CategoryEditor
                key={c.id}
                category={c}
                onSaveCategory={saveCategory}
                onDeleteCategory={deleteCategory}
                onSaveItem={saveItem}
                onDeleteItem={deleteItem}
                onAddItem={addItem}
              />
            ))}

            {menu && (
              <>
                <h3>Nueva categoría</h3>
                <div className="row cat-row">
                  <input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Nombre (ej. Postres)"
                  />
                  <input
                    value={newCategory.note}
                    onChange={(e) => setNewCategory({ ...newCategory, note: e.target.value })}
                    placeholder="Nota (opcional)"
                  />
                  <button className="btn sm" onClick={addCategory}>Agregar</button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
