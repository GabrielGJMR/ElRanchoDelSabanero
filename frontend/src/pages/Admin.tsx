import { useCallback, useEffect, useState } from 'react'
import {
  adminRequest, basicAuth, fetchGallery, UnauthorizedError,
  type Category, type CategoryInput, type GalleryPhoto, type ItemInput, type MenuItem,
} from '../api.ts'
import Brand from '../components/Brand.tsx'
import CategoryEditor from '../components/CategoryEditor.tsx'
import GalleryEditor from '../components/GalleryEditor.tsx'
import { normalize } from '../format.ts'
import { resizeImage } from '../image.ts'
import LoginForm from '../components/LoginForm.tsx'
import Toast from '../components/Toast.tsx'

// Las credenciales viven solo en esta pestaña (sessionStorage) y se envían como HTTP Basic.
const STORAGE_KEY = 'adminAuth'

type Tab = 'menu' | 'gallery'

export default function Admin() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '')
  const [menu, setMenu] = useState<Category[] | null>(null)
  const [gallery, setGallery] = useState<GalleryPhoto[] | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('menu')
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', note: '' })
  const [query, setQuery] = useState('')
  const [openCategories, setOpenCategories] = useState<Set<number> | null>(null)

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuth('')
    setMenu(null)
    setGallery(null)
    setOpenCategories(null)
  }, [])

  const load = useCallback(async () => {
    try {
      const [menuData, galleryData] = await Promise.all([
        adminRequest<Category[]>(auth, 'menu'),
        fetchGallery(),
      ])
      setMenu(menuData)
      setGallery(galleryData)
      // Solo la primera vez que carga: abre la primera categoría y deja las demás como están.
      setOpenCategories((prev) => prev ?? new Set(menuData[0] ? [menuData[0].id] : []))
    } catch (e) {
      if (e instanceof UnauthorizedError) logout()
      else setError((e as Error).message)
    }
  }, [auth, logout])

  useEffect(() => {
    if (!auth) return
    let cancelled = false
    void (async () => {
      try {
        const [menuData, galleryData] = await Promise.all([
          adminRequest<Category[]>(auth, 'menu'),
          fetchGallery(),
        ])
        if (cancelled) return
        setMenu(menuData)
        setGallery(galleryData)
        setOpenCategories((prev) => prev ?? new Set(menuData[0] ? [menuData[0].id] : []))
      } catch (e) {
        if (cancelled) return
        if (e instanceof UnauthorizedError) logout()
        else setError((e as Error).message)
      }
    })()
    return () => { cancelled = true }
  }, [auth, logout])

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
      setAddingCategory(false)
    }
  }

  const itemCount = menu?.reduce((n, c) => n + c.items.length, 0) ?? 0

  const toggleCategory = (id: number) =>
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const q = normalize(query)
  const visibleCategories = (menu ?? []).flatMap((c) => {
    if (!q) return [{ category: c, items: c.items }]
    const categoryMatches = normalize(c.name).includes(q)
    const items = categoryMatches ? c.items : c.items.filter(
      (it) => normalize(it.name).includes(q) || normalize(it.description ?? '').includes(q),
    )
    return categoryMatches || items.length > 0 ? [{ category: c, items }] : []
  })

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between border-b border-line-soft pb-4">
        <Brand />
        <span className="text-xs tracking-[.14em] text-muted uppercase">Administración</span>
      </div>

      {!auth && <LoginForm onLogin={login} />}

      {auth && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {menu ? `${menu.length} categorías · ${itemCount} platillos` : 'Cargando...'}
              {gallery && ` · ${gallery.length} fotos del local`}
            </p>
            <button className="btn btn-sm btn-ghost" onClick={logout}>Cerrar sesión</button>
          </div>

          <div role="tablist" aria-label="Secciones del panel" className="mb-5 flex gap-1 border-b border-line-soft">
            {([
              ['menu', 'Menú'],
              ['gallery', 'Fotos del local'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`cursor-pointer border-b-2 px-3.5 py-2 text-sm font-semibold transition-colors ${
                  tab === value ? 'border-fire text-gold' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'menu' && (
            <div role="tabpanel">
              {!menu && <p className="text-sm text-muted">Cargando...</p>}

              {menu && menu.length > 0 && (
                <div className="relative mb-4">
                  <svg
                    viewBox="0 0 20 20" fill="none" aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
                  >
                    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth={2} />
                    <path d="M14 14l4 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar categoría o platillo..."
                    aria-label="Buscar en el menú"
                    className="field pl-9"
                  />
                </div>
              )}

              {menu && q && visibleCategories.length === 0 && (
                <p className="text-sm text-muted italic">No encontramos nada con "{query}".</p>
              )}

              {visibleCategories.map(({ category: c, items }) => (
                <CategoryEditor
                  key={c.id}
                  category={c}
                  items={items}
                  open={q ? true : (openCategories?.has(c.id) ?? false)}
                  onToggle={() => toggleCategory(c.id)}
                  onSaveCategory={saveCategory}
                  onDeleteCategory={deleteCategory}
                  onSaveItem={saveItem}
                  onDeleteItem={deleteItem}
                  onAddItem={addItem}
                  onUploadImage={uploadImage}
                  onRemoveImage={removeImage}
                />
              ))}

              {menu && !addingCategory && (
                <button
                  type="button"
                  onClick={() => setAddingCategory(true)}
                  className="mt-5 cursor-pointer text-sm font-semibold text-gold hover:text-fire"
                >
                  + Nueva categoría
                </button>
              )}

              {menu && addingCategory && (
                <div className="mt-5 grid grid-cols-2 items-center gap-2 rounded-lg border border-dashed border-line p-2.5 sm:grid-cols-[1fr_1fr_auto_auto]">
                  <input
                    className="field"
                    autoFocus
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
                  <button className="btn btn-sm btn-ghost" onClick={() => setAddingCategory(false)}>Cancelar</button>
                </div>
              )}
            </div>
          )}

          {tab === 'gallery' && (
            <div role="tabpanel">
              {!gallery && <p className="text-sm text-muted">Cargando...</p>}
              {gallery && (
                <GalleryEditor photos={gallery} onUpload={uploadGalleryPhoto} onDelete={deleteGalleryPhoto} />
              )}
            </div>
          )}
        </>
      )}

      {error && <Toast key={error} message={error} onDismiss={() => setError('')} />}
    </main>
  )
}
