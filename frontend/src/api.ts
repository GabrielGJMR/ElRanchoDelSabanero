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
  name: string
  note: string
}

export interface GalleryPhoto {
  id: number
  url: string
}

export class UnauthorizedError extends Error {}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? 'Ocurrió un error')
  return data as T
}

export async function fetchMenu(): Promise<Category[]> {
  return parse(await fetch('/api/menu'))
}

export async function fetchGallery(): Promise<GalleryPhoto[]> {
  return parse(await fetch('/api/gallery'))
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
