import { useCallback, useEffect, useState } from 'react'
import {
  adminRequest, basicAuth, ForbiddenError, UnauthorizedError,
  type AppUser, type Category, type GalleryPhoto, type GallerySection, type ItemInput, type MenuItem, type MenuType, type Role,
} from '../lib/api.ts'
import Brand from '../components/Brand.tsx'
import Calculator from '../components/Calculator.tsx'
import GalleryEditor from '../components/GalleryEditor.tsx'
import Loader from '../components/Loader.tsx'
import MenuCategoriesPanel from '../components/MenuCategoriesPanel.tsx'
import MenuPicker from '../components/MenuPicker.tsx'
import UsersPanel from '../components/UsersPanel.tsx'
import { resizeImage } from '../lib/image.ts'
import LoginForm from '../components/LoginForm.tsx'
import Toast from '../components/Toast.tsx'

// Las credenciales viven solo en esta pestaña (sessionStorage) y se envían como HTTP Basic.
const STORAGE_KEY = 'adminAuth'
// Qué tipo de menú se eligió en el panel (también por pestaña, para que sobreviva un refresh).
const SELECTED_MENU_KEY = 'adminSelectedMenu'

type Tab = 'menu' | 'eventos' | 'gallery' | 'users'

// Reutilizado por el resumen de cada pestaña y por las pantallas que esperan su primera carga.
const LOADING_INLINE = (
  <span className="inline-flex items-center gap-2">
    <Loader label="Cargando..." size="sm" />
    Cargando...
  </span>
)

export default function Admin() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '')
  const [menus, setMenus] = useState<MenuType[] | null>(null)
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(() => {
    const saved = sessionStorage.getItem(SELECTED_MENU_KEY)
    return saved ? Number(saved) : null
  })
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [eventosCategories, setEventosCategories] = useState<Category[] | null>(null)
  const [gallerySections, setGallerySections] = useState<GallerySection[] | null>(null)
  const [me, setMe] = useState<AppUser | null>(null)
  const [users, setUsers] = useState<AppUser[] | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('menu')

  // "Eventos" es un menú más en la base de datos, pero con página pública propia (ver Menu.slug);
  // no se muestra junto a los menús de comida ni se puede borrar por accidente desde aquí. Los 3
  // menús de comida (Menú Principal, Casados, Desayunos) también tienen slug propio (para sus
  // pestañas públicas en /menu), así que lo que los distingue de Eventos es el slug exacto.
  const foodMenus = menus?.filter((m) => m.slug !== 'eventos') ?? null
  const eventosMenu = menus?.find((m) => m.slug === 'eventos') ?? null
  const eventosMenuId = eventosMenu?.id ?? null
  const selectedMenu = foodMenus?.find((m) => m.id === selectedMenuId) ?? null
  // Editor: solo contenido del día a día (platillos/fotos). Admin: también estructura y usuarios.
  const isAdmin = me?.role === 'ADMIN'

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(SELECTED_MENU_KEY)
    setAuth('')
    setMenus(null)
    setSelectedMenuId(null)
    setCategories(null)
    setEventosCategories(null)
    setGallerySections(null)
    setMe(null)
    setUsers(null)
  }, [])

  function selectMenu(menu: MenuType) {
    sessionStorage.setItem(SELECTED_MENU_KEY, String(menu.id))
    setSelectedMenuId(menu.id)
    setCategories(null)
  }

  function backToMenus() {
    sessionStorage.removeItem(SELECTED_MENU_KEY)
    setSelectedMenuId(null)
    setCategories(null)
  }

  const loadMenuCategories = useCallback(async (menuId: number) => {
    try {
      setCategories(await adminRequest<Category[]>(auth, `menus/${menuId}/categories`))
    } catch (e) {
      if (e instanceof UnauthorizedError) logout()
      else if (!(e instanceof ForbiddenError)) {
        setError((e as Error).message)
        backToMenus()
      }
    }
  }, [auth, logout])

  const loadEventosCategories = useCallback(async (menuId: number) => {
    try {
      setEventosCategories(await adminRequest<Category[]>(auth, `menus/${menuId}/categories`))
    } catch (e) {
      if (e instanceof UnauthorizedError) logout()
      else if (e instanceof ForbiddenError) setError(e.message)
      else setError((e as Error).message)
    }
  }, [auth, logout])

  const reloadMenus = useCallback(async () => {
    setMenus(await adminRequest<MenuType[]>(auth, 'menus'))
  }, [auth])

  const reloadGallerySections = useCallback(async () => {
    setGallerySections(await adminRequest<GallerySection[]>(auth, 'gallery/sections'))
  }, [auth])

  const reloadUsers = useCallback(async () => {
    setUsers(await adminRequest<AppUser[]>(auth, 'users'))
  }, [auth])

  // Al iniciar sesión: carga los tipos de menú, la galería y quién soy (para saber mi rol).
  useEffect(() => {
    if (!auth) return
    let cancelled = false
    void (async () => {
      try {
        const [menusData, galleryData, meData] = await Promise.all([
          adminRequest<MenuType[]>(auth, 'menus'),
          adminRequest<GallerySection[]>(auth, 'gallery/sections'),
          adminRequest<AppUser>(auth, 'me'),
        ])
        if (cancelled) return
        setMenus(menusData)
        setGallerySections(galleryData)
        setMe(meData)
      } catch (e) {
        if (cancelled) return
        if (e instanceof UnauthorizedError) logout()
        else if (e instanceof ForbiddenError) setError(e.message)
        else setError((e as Error).message)
      }
    })()
    return () => { cancelled = true }
  }, [auth, logout])

  // La lista de usuarios es solo para Admin (la pestaña "Usuarios" ni se muestra a un Editor).
  useEffect(() => {
    if (!auth || !isAdmin) return
    void reloadUsers()
  }, [auth, isAdmin, reloadUsers])

  // Al elegir un menú de comida (o restaurar la elección guardada): carga sus categorías.
  useEffect(() => {
    if (!auth || selectedMenuId == null) return
    void loadMenuCategories(selectedMenuId)
  }, [auth, selectedMenuId, loadMenuCategories])

  // "Eventos" no pasa por el selector: se carga solo (como la galería) en cuanto se conoce su id.
  useEffect(() => {
    if (!auth || eventosMenuId == null) return
    void loadEventosCategories(eventosMenuId)
  }, [auth, eventosMenuId, loadEventosCategories])

  /** Ejecuta una acción de escritura: muestra el error si falla y recarga si sale bien. Devuelve si tuvo éxito. */
  async function run(action: () => Promise<unknown>, reload?: () => Promise<void>): Promise<boolean> {
    setError('')
    try {
      await action()
      if (reload) await reload()
      return true
    } catch (e) {
      if (e instanceof UnauthorizedError) logout()
      else if (e instanceof ForbiddenError) setError(e.message)
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

  const createMenuType = (name: string) => run(() => adminRequest(auth, 'menus', 'POST', { name }), reloadMenus)
  const renameMenuType = (menu: MenuType, name: string) => run(() => adminRequest(auth, `menus/${menu.id}`, 'PUT', { name }), reloadMenus)
  const deleteMenuType = async (menu: MenuType) => {
    await run(() => adminRequest(auth, `menus/${menu.id}`, 'DELETE'), reloadMenus)
    if (selectedMenuId === menu.id) backToMenus()
  }

  const saveCategory = (id: number, menuId: number, data: { name: string; note: string }) =>
    run(() => adminRequest(auth, `categories/${id}`, 'PUT', { ...data, menuId }))

  const saveItem = (id: number, data: ItemInput) => run(() => adminRequest(auth, `items/${id}`, 'PUT', data))

  /**
   * Agrupa las acciones de categorías/platillos de un menú, recargando sus categorías (no las de
   * otro menú) al escribir. Los platillos siempre se pueden editar; renombrar/borrar categorías
   * (o crear nuevas) solo si canManageCategories (rol Admin) — ver MenuCategoriesPanel/CategoryEditor.
   */
  function categoryActions(menuId: number, reload: () => Promise<void>, canManageCategories: boolean) {
    return {
      onSaveCategory: canManageCategories
        ? (id: number, data: { name: string; note: string }) => saveCategory(id, menuId, data)
        : undefined,
      onDeleteCategory: canManageCategories
        ? async (c: Category) => {
            if (!window.confirm(`¿Borrar la categoría "${c.name}" y todos sus platillos?`)) return
            await run(() => adminRequest(auth, `categories/${c.id}`, 'DELETE'), reload)
          }
        : undefined,
      onSaveItem: saveItem,
      onDeleteItem: async (item: MenuItem) => {
        if (!window.confirm(`¿Borrar "${item.name}"?`)) return
        await run(() => adminRequest(auth, `items/${item.id}`, 'DELETE'), reload)
      },
      onAddItem: (data: ItemInput) => run(() => adminRequest(auth, 'items', 'POST', data), reload),
      onUploadImage: (id: number, file: File) =>
        run(async () => {
          const form = new FormData()
          form.append('file', await resizeImage(file), 'foto.jpg')
          await adminRequest(auth, `items/${id}/image`, 'POST', form)
        }, reload),
      onRemoveImage: (id: number) => run(() => adminRequest(auth, `items/${id}/image`, 'DELETE'), reload),
      onAddCategory: canManageCategories
        ? (data: { name: string; note: string }) => run(() => adminRequest(auth, 'categories', 'POST', { ...data, menuId }), reload)
        : undefined,
    }
  }

  const createGallerySection = (data: { name: string; note: string }) =>
    run(() => adminRequest(auth, 'gallery/sections', 'POST', data), reloadGallerySections)

  const renameGallerySection = (section: GallerySection, data: { name: string; note: string }) =>
    run(() => adminRequest(auth, `gallery/sections/${section.id}`, 'PUT', data), reloadGallerySections)

  const deleteGallerySection = async (section: GallerySection) => {
    await run(() => adminRequest(auth, `gallery/sections/${section.id}`, 'DELETE'), reloadGallerySections)
  }

  const uploadGalleryPhoto = (sectionId: number, file: File) =>
    run(async () => {
      const form = new FormData()
      form.append('file', await resizeImage(file), 'foto.jpg')
      await adminRequest(auth, `gallery/sections/${sectionId}/photos`, 'POST', form)
    }, reloadGallerySections)

  const deleteGalleryPhoto = async (photo: GalleryPhoto) => {
    await run(() => adminRequest(auth, `gallery/photos/${photo.id}`, 'DELETE'), reloadGallerySections)
  }

  const createUser = (data: { username: string; password: string; role: Role }) =>
    run(() => adminRequest(auth, 'users', 'POST', data), reloadUsers)

  const updateUser = (user: AppUser, data: { password: string; role: Role }) =>
    run(() => adminRequest(auth, `users/${user.id}`, 'PUT', data), reloadUsers)

  const deleteUser = async (user: AppUser) => {
    await run(() => adminRequest(auth, `users/${user.id}`, 'DELETE'), reloadUsers)
  }

  const itemCount = categories?.reduce((n, c) => n + c.items.length, 0) ?? 0
  const eventosItemCount = eventosCategories?.reduce((n, c) => n + c.items.length, 0) ?? 0

  const tabs: [Tab, string][] = [
    ['menu', 'Menú'],
    ['eventos', 'Eventos'],
    ['gallery', 'Fotos del local'],
  ]
  if (isAdmin) tabs.push(['users', 'Usuarios'])

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-5">
        <Brand />
        {auth && me ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-card px-3.5 py-1.5 text-xs text-muted">
            <span className="size-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
            <span className="text-ink">{me.username}</span>
            <span className="text-muted/50">·</span>
            {isAdmin ? 'Administrador' : 'Editor'}
          </span>
        ) : (
          <span className="text-xs tracking-[.14em] text-muted uppercase">Administración</span>
        )}
      </div>

      {!auth && <LoginForm onLogin={login} />}

      {auth && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="count-pill inline-flex items-center rounded-full px-3.5 py-1.5 text-xs text-muted">
              {tab === 'menu' && selectedMenu && (categories ? `${categories.length} categorías · ${itemCount} platillos` : LOADING_INLINE)}
              {tab === 'menu' && !selectedMenu && (foodMenus ? `${foodMenus.length} ${foodMenus.length === 1 ? 'menú' : 'menús'}` : LOADING_INLINE)}
              {tab === 'eventos' && (eventosCategories ? `${eventosCategories.length} categorías · ${eventosItemCount} paquetes` : LOADING_INLINE)}
              {tab === 'gallery' && (gallerySections ? `${gallerySections.length} ${gallerySections.length === 1 ? 'sección' : 'secciones'} de fotos` : LOADING_INLINE)}
              {tab === 'users' && (users ? `${users.length} ${users.length === 1 ? 'usuario' : 'usuarios'}` : LOADING_INLINE)}
            </span>
            <button className="btn btn-sm btn-ghost" onClick={logout}>Cerrar sesión</button>
          </div>

          {/* Mismas pestañas "selladas" con muesca que el resto del sitio usa para sus botones,
              en vez del típico subrayado plano de cualquier panel genérico. */}
          <div role="tablist" aria-label="Secciones del panel" className="mb-6 flex flex-wrap gap-2.5">
            {tabs.map(([value, label]) => (
              <button
                key={value}
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={tab === value ? 'btn btn-sm' : 'btn btn-sm btn-ghost'}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'menu' && (
            <div role="tabpanel">
              {!foodMenus && <p className="py-6 text-sm text-muted">{LOADING_INLINE}</p>}

              {foodMenus && foodMenus.length > 0 && (
                <Calculator
                  key={selectedMenu?.id ?? 'none'}
                  auth={auth}
                  menus={foodMenus}
                  currentMenuId={selectedMenu?.id ?? foodMenus[0].id}
                  currentCategories={selectedMenu ? categories : null}
                />
              )}

              {foodMenus && !selectedMenu && (
                <MenuPicker
                  menus={foodMenus}
                  onSelect={selectMenu}
                  onCreate={isAdmin ? createMenuType : undefined}
                  onRename={isAdmin ? renameMenuType : undefined}
                  onDelete={isAdmin ? deleteMenuType : undefined}
                />
              )}

              {foodMenus && selectedMenu && (
                <>
                  <MenuCategoriesPanel
                    key={selectedMenu.id}
                    menu={selectedMenu}
                    categories={categories}
                    onBack={backToMenus}
                    {...categoryActions(selectedMenu.id, () => loadMenuCategories(selectedMenu.id), isAdmin)}
                  />
                </>
              )}
            </div>
          )}

          {tab === 'eventos' && (
            <div role="tabpanel">
              {!eventosMenu && <p className="py-6 text-sm text-muted">{LOADING_INLINE}</p>}

              {eventosMenu && (
                <MenuCategoriesPanel
                  key={eventosMenu.id}
                  menu={eventosMenu}
                  categories={eventosCategories}
                  onRename={isAdmin ? (name) => renameMenuType(eventosMenu, name) : undefined}
                  {...categoryActions(eventosMenu.id, () => loadEventosCategories(eventosMenu.id), isAdmin)}
                />
              )}
            </div>
          )}

          {tab === 'gallery' && (
            <div role="tabpanel">
              <GalleryEditor
                sections={gallerySections}
                onRenameSection={isAdmin ? renameGallerySection : undefined}
                onDeleteSection={isAdmin ? deleteGallerySection : undefined}
                onAddSection={isAdmin ? createGallerySection : undefined}
                onUploadPhoto={uploadGalleryPhoto}
                onDeletePhoto={deleteGalleryPhoto}
              />
            </div>
          )}

          {tab === 'users' && isAdmin && me && (
            <div role="tabpanel">
              <UsersPanel users={users} currentUsername={me.username} onCreate={createUser} onUpdate={updateUser} onDelete={deleteUser} />
            </div>
          )}
        </>
      )}

      {error && <Toast key={error} message={error} onDismiss={() => setError('')} />}
    </main>
  )
}
