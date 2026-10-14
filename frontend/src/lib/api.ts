export interface MenuItem {
  id: number
  name: string
  description: string | null
  price: number
  available: boolean
  imageUrl: string | null
}

export interface Category {
  id: number
  name: string
  note: string | null
  items: MenuItem[]
}

export interface ItemInput {
  categoryId?: number
  name: string
  description: string
  price: number
  available?: boolean
}

export interface CategoryInput {
  menuId: number
  name: string
  note: string
}

/** Uno de los tipos de menú (p.ej. "Menú 1", "Menú 2", "Menú 3"); cada uno agrupa sus propias categorías. */
export interface MenuType {
  id: number
  name: string
  /** Identificador estable (ej. "eventos"); solo lo tienen los menús con página pública propia. */
  slug: string | null
}

export interface GalleryPhoto {
  id: number
  url: string
}

/** Una sección de fotos del local en Inicio (ej. "Así es el rancho", "Nuestros platillos"); cada una se administra como los menús. */
export interface GallerySection {
  id: number
  name: string
  /** Si está, Inicio muestra esta sección en formato editorial (foto + texto) en vez de la grilla simple. */
  note: string | null
  photos: GalleryPhoto[]
}

export type Role = 'ADMIN' | 'EDITOR'

/** Un usuario del panel de administración. ADMIN: todo. EDITOR: platillos, precios, disponibilidad y fotos; no borra categorías/menús ni gestiona usuarios. */
export interface AppUser {
  id: number
  username: string
  role: Role
  createdAt: string
}

export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (res.status === 403) throw new ForbiddenError(data?.error ?? 'No tiene permiso para realizar esta acción')
  if (!res.ok) throw new Error(data?.error ?? 'Ocurrió un error')
  return data as T
}

export async function fetchMenu(lang = 'es'): Promise<Category[]> {
  return parse(await fetch('/api/menu?lang=' + encodeURIComponent(lang)))
}

/** Menú con página propia (por ahora solo "eventos"). */
export async function fetchMenuBySlug(slug: string, lang = 'es'): Promise<Category[]> {
  return parse(await fetch(`/api/menu/${slug}?lang=${encodeURIComponent(lang)}`))
}

export async function fetchGallery(lang = 'es'): Promise<GallerySection[]> {
  return parse(await fetch('/api/gallery?lang=' + encodeURIComponent(lang)))
}

/** Cabecera HTTP Basic (soporta acentos en usuario y clave). */
export function basicAuth(user: string, password: string): string {
  const bytes = new TextEncoder().encode(`${user}:${password}`)
  return 'Basic ' + btoa(String.fromCharCode(...bytes))
}

/** body puede ser un objeto (se envía como JSON) o un FormData (para subir fotos). */
export async function adminRequest<T>(auth: string, path: string, method = 'GET', body?: unknown): Promise<T> {
  const isForm = body instanceof FormData
  const res = await fetch('/api/admin/' + path, {
    method,
    headers: isForm ? { Authorization: auth } : { 'Content-Type': 'application/json', Authorization: auth },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })
  if (res.status === 401) throw new UnauthorizedError('No autorizado')
  return parse<T>(res)
}
