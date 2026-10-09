import { useCallback, useEffect, useState } from 'react'
import {
  adminRequest, basicAuth, fetchGallery, UnauthorizedError,
  type Category, type CategoryInput, type GalleryPhoto, type ItemInput, type MenuItem,
} from '../api.ts'
import Brand from '../components/Brand.tsx'
import CategoryEditor from '../components/CategoryEditor.tsx'
import GalleryEditor from '../components/GalleryEditor.tsx'
import { resizeImage } from '../image.ts'
import LoginForm from '../components/LoginForm.tsx'

// Las credenciales viven solo en esta pestaña (sessionStorage) y se envían como HTTP Basic.
const STORAGE_KEY = 'adminAuth'

export default function Admin() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '')
  const [menu, setMenu] = useState<Category[] | null>(null)
  const [gallery, setGallery] = useState<GalleryPhoto[] | null>(null)
  const [error, setError] = useState('')
  const [newCategory, setNewCategory] = useState({ name: '', note: '' })

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuth('')
    setMenu(null)
    setGallery(null)
  }, [])

  const load = useCallback(async () => {
    try {
      const [menuData, galleryData] = await Promise.all([
        adminRequest<Category[]>(auth, 'menu'),
        fetchGallery(),
      ])
      setMenu(menuData)
      setGallery(galleryData)
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

  const uploadImage = (id: number, file: File) =>
    run(async () => {
      const form = new FormData()
      form.append('file', await resizeImage(file), 'foto.jpg')
      await adminRequest(auth, `items/${id}/image`, 'POST', form)
    }, true)

  const removeImage = (id: number) => run(() => adminRequest(auth, `items/${id}/image`, 'DELETE'), true)

  const uploadGalleryPhoto = (file: File) =>
    run(async () => {
      const form = new FormData()
      form.append('file', await resizeImage(file), 'foto.jpg')
      await adminRequest(auth, 'gallery', 'POST', form)
    }, true)

  const deleteGalleryPhoto = async (photo: GalleryPhoto) => {
    await run(() => adminRequest(auth, `gallery/${photo.id}`, 'DELETE'), true)
  }

  async function addCategory() {
    if (await run(() => adminRequest(auth, 'categories', 'POST', newCategory), true)) {
      setNewCategory({ name: '', note: '' })
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between border-b border-line-soft pb-4">
        <Brand />
        <span className="text-xs tracking-[.14em] text-muted uppercase">Administración</span>
      </div>

      {!auth && <LoginForm onLogin={login} />}

      {auth && (
        <>
          <p className="mb-4">
            <button className="btn btn-sm" onClick={logout}>Cerrar sesión</button>
          </p>
          {error && (
            <p className="my-3 rounded-lg border border-fire bg-[#3a1410] px-3.5 py-2.5" role="alert">{error}</p>
          )}
          {!menu && <p className="text-sm text-muted">Cargando...</p>}

          {menu?.map((c) => (
            <CategoryEditor
              key={c.id}
              category={c}
              onSaveCategory={saveCategory}
              onDeleteCategory={deleteCategory}
              onSaveItem={saveItem}
              onDeleteItem={deleteItem}
              onAddItem={addItem}
              onUploadImage={uploadImage}
              onRemoveImage={removeImage}
            />
          ))}

          {menu && (
            <>
              <h2 className="mt-8 mb-1.5 text-lg text-gold">Nueva categoría</h2>
              <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  className="field"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Nombre (ej. Postres)"
                />
                <input
                  className="field"
                  value={newCategory.note}
                  onChange={(e) => setNewCategory({ ...newCategory, note: e.target.value })}
                  placeholder="Nota (opcional)"
                />
                <button className="btn btn-sm" onClick={addCategory}>Agregar</button>
              </div>
            </>
          )}

          {gallery && (
            <GalleryEditor photos={gallery} onUpload={uploadGalleryPhoto} onDelete={deleteGalleryPhoto} />
          )}
        </>
      )}
    </main>
  )
}
