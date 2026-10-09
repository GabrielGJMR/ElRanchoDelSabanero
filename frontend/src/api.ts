export interface MenuItem {
  id: number
  name: string
  description: string | null
  price: number
  available: boolean
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

/** Cabecera HTTP Basic (soporta acentos en usuario y clave). */
export function basicAuth(user: string, password: string): string {
  const bytes = new TextEncoder().encode(`${user}:${password}`)
  return 'Basic ' + btoa(String.fromCharCode(...bytes))
}

export async function adminRequest<T>(auth: string, path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch('/api/admin/' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (res.status === 401) throw new UnauthorizedError('No autorizado')
  return parse<T>(res)
}
