import { useCallback, useEffect, useState } from 'react'
import {
  adminRequest, basicAuth, fetchGallery, UnauthorizedError,
  type Category, type CategoryInput, type GalleryPhoto, type ItemInput, type MenuItem, type MenuType,
} from '../api.ts'
import Brand from '../components/Brand.tsx'
import CategoryEditor from '../components/CategoryEditor.tsx'
import GalleryEditor from '../components/GalleryEditor.tsx'
import MenuPicker from '../components/MenuPicker.tsx'
import { normalize } from '../format.ts'
import { resizeImage } from '../image.ts'
import LoginForm from '../components/LoginForm.tsx'
import Toast from '../components/Toast.tsx'

// Las credenciales viven solo en esta pestaña (sessionStorage) y se envían como HTTP Basic.
const STORAGE_KEY = 'adminAuth'
// Qué tipo de menú se eligió en el panel (también por pestaña, para que sobreviva un refresh).
const SELECTED_MENU_KEY = 'adminSelectedMenu'

type Tab = 'menu' | 'gallery'

export default function Admin() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '')
  const [menus, setMenus] = useState<MenuType[] | null>(null)
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(() => {
    const saved = sessionStorage.getItem(SELECTED_MENU_KEY)
    return saved ? Number(saved) : null
  })
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [gallery, setGallery] = useState<GalleryPhoto[] | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('menu')
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', note: '' })
  const [query, setQuery] = useState('')
  const [openCategories, setOpenCategories] = useState<Set<number> | null>(null)

  const selectedMenu = menus?.find((m) => m.id === selectedMenuId) ?? null

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(SELECTED_MENU_KEY)
    setAuth('')
    setMenus(null)
    setSelectedMenuId(null)
    setCategories(null)
    setGallery(null)
    setOpenCategories(null)
  }, [])

  function selectMenu(menu: MenuType) {
    sessionStorage.setItem(SELECTED_MENU_KEY, String(menu.id))
    setSelectedMenuId(menu.id)
    setCategories(null)
    setOpenCategories(null)
    setQuery('')
    setAddingCategory(false)
  }

  function backToMenus() {
    sessionStorage.removeItem(SELECTED_MENU_KEY)
    setSelectedMenuId(null)
    setCategories(null)
    setOpenCategories(null)
    setQuery('')
    setAddingCategory(false)
  }

  const loadCategories = useCallback(async (menuId: number) => {
    try {
      const data = await adminRequest<Category[]>(auth, `menus/${menuId}/categories`)
      setCategories(data)
      setOpenCategories((prev) => prev ?? new Set(data[0] ? [data[0].id] : []))
    } catch (e) {
      if (e instanceof UnauthorizedError) logout()
      else {
        setError((e as Error).message)
        backToMenus()
      }
    }
  }, [auth, logout])

  const reloadMenus = useCallback(async () => {
    setMenus(await adminRequest<MenuType[]>(auth, 'menus'))
  }, [auth])

  const reloadGallery = useCallback(async () => {
    setGallery(await fetchGallery())
  }, [])

  // Al iniciar sesión: carga los tipos de menú y la galería.
  useEffect(() => {
    if (!auth) return
    let cancelled = false
    void (async () => {
      try {
        const [menusData, galleryData] = await Promise.all([
          adminRequest<MenuType[]>(auth, 'menus'),
          fetchGallery(),
        ])
        if (cancelled) return
        setMenus(menusData)
        setGallery(galleryData)
      } catch (e) {
        if (cancelled) return
        if (e instanceof UnauthorizedError) logout()
        else setError((e as Error).message)
      }
    })()
    return () => { cancelled = true }
  }, [auth, logout])

  // Al elegir un menú (o restaurar la elección guardada): carga sus categorías.
  useEffect(() => {
    if (!auth || selectedMenuId == null) return
    void loadCategories(selectedMenuId)
  }, [auth, selectedMenuId, loadCategories])

  /** Ejecuta una acción de escritura: muestra el error si falla y recarga si sale bien. Devuelve si tuvo éxito. */
  async function run(action: () => Promise<unknown>, reload?: () => Promise<void>): Promise<boolean> {
    setError('')
    try {
      await action()
      if (reload) await reload()
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
      await adminRequest(header, 'menus')
    } catch {
      return false
    }
    sessionStorage.setItem(STORAGE_KEY, header)
    setAuth(header)
    return true
  }

  const reloadCurrentCategories = () => (selectedMenuId == null ? Promise.resolve() : loadCategories(selectedMenuId))

  const createMenuType = (name: string) => run(() => adminRequest(auth, 'menus', 'POST', { name }), reloadMenus)
  const renameMenuType = (menu: MenuType, name: string) => run(() => adminRequest(auth, `menus/${menu.id}`, 'PUT', { name }), reloadMenus)
  const deleteMenuType = async (menu: MenuType) => {
    await run(() => adminRequest(auth, `menus/${menu.id}`, 'DELETE'), reloadMenus)
    if (selectedMenuId === menu.id) backToMenus()
  }

  const saveCategory = (id: number, data: CategoryInput) =>
    run(() => adminRequest(auth, `categories/${id}`, 'PUT', data))

  const deleteCategory = async (c: Category) => {
    if (!window.confirm(`¿Borrar la categoría "${c.name}" y todos sus platillos?`)) return
    await run(() => adminRequest(auth, `categories/${c.id}`, 'DELETE'), reloadCurrentCategories)
  }

  const saveItem = (id: number, data: ItemInput) => run(() => adminRequest(auth, `items/${id}`, 'PUT', data))

  const deleteItem = async (item: MenuItem) => {
    if (!window.confirm(`¿Borrar "${item.name}"?`)) return
    await run(() => adminRequest(auth, `items/${item.id}`, 'DELETE'), reloadCurrentCategories)
  }

  const addItem = (data: ItemInput) => run(() => adminRequest(auth, 'items', 'POST', data), reloadCurrentCategories)

  const uploadImage = (id: number, file: File) =>
    run(async () => {
      const form = new FormData()
      form.append('file', await resizeImage(file), 'foto.jpg')
      await adminRequest(auth, `items/${id}/image`, 'POST', form)
    }, reloadCurrentCategories)

  const removeImage = (id: number) => run(() => adminRequest(auth, `items/${id}/image`, 'DELETE'), reloadCurrentCategories)

  const uploadGalleryPhoto = (file: File) =>
    run(async () => {
      const form = new FormData()
      form.append('file', await resizeImage(file), 'foto.jpg')
      await adminRequest(auth, 'gallery', 'POST', form)
    }, reloadGallery)

  const deleteGalleryPhoto = async (photo: GalleryPhoto) => {
    await run(() => adminRequest(auth, `gallery/${photo.id}`, 'DELETE'), reloadGallery)
  }

  async function addCategory() {
    if (!selectedMenu) return
    const ok = await run(
      () => adminRequest(auth, 'categories', 'POST', { ...newCategory, menuId: selectedMenu.id }),
      reloadCurrentCategories,
    )
    if (ok) {
      setNewCategory({ name: '', note: '' })
      setAddingCategory(false)
    }
  }

  const itemCount = categories?.reduce((n, c) => n + c.items.length, 0) ?? 0

  const toggleCategory = (id: number) =>
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const q = normalize(query)
  const visibleCategories = (categories ?? []).flatMap((c) => {
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
              {tab === 'menu' && selectedMenu && (categories ? `${categories.length} categorías · ${itemCount} platillos` : 'Cargando...')}
              {tab === 'menu' && !selectedMenu && (menus ? `${menus.length} ${menus.length === 1 ? 'menú' : 'menús'}` : 'Cargando...')}
              {tab === 'gallery' && (gallery ? `${gallery.length} fotos del local` : 'Cargando...')}
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
              {!menus && <p className="text-sm text-muted">Cargando...</p>}

              {menus && !selectedMenu && (
                <MenuPicker
                  menus={menus}
                  onSelect={selectMenu}
                  onCreate={createMenuType}
                  onRename={renameMenuType}
                  onDelete={deleteMenuType}
                />
              )}

              {menus && selectedMenu && (
                <div>
                  <button
                    type="button"
                    onClick={backToMenus}
                    className="mb-4 cursor-pointer text-sm font-semibold text-muted hover:text-gold"
                  >
                    ← Cambiar menú
                  </button>
                  <h2 className="mb-4 font-bold text-gold">{selectedMenu.name}</h2>

                  {!categories && <p className="text-sm text-muted">Cargando...</p>}

                  {categories && categories.length > 0 && (
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

                  {categories && q && visibleCategories.length === 0 && (
                    <p className="text-sm text-muted italic">No encontramos nada con "{query}".</p>
                  )}

                  {visibleCategories.map(({ category: c, items }) => (
                    <CategoryEditor
                      key={c.id}
                      category={c}
                      items={items}
                      open={q ? true : (openCategories?.has(c.id) ?? false)}
                      onToggle={() => toggleCategory(c.id)}
                      onSaveCategory={(id, data) => saveCategory(id, { ...data, menuId: selectedMenu.id })}
                      onDeleteCategory={deleteCategory}
                      onSaveItem={saveItem}
                      onDeleteItem={deleteItem}
                      onAddItem={addItem}
                      onUploadImage={uploadImage}
                      onRemoveImage={removeImage}
                    />
                  ))}

                  {categories && !addingCategory && (
                    <button
                      type="button"
                      onClick={() => setAddingCategory(true)}
                      className="mt-5 cursor-pointer text-sm font-semibold text-gold hover:text-fire"
                    >
                      + Nueva categoría
                    </button>
                  )}

                  {categories && addingCategory && (
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
