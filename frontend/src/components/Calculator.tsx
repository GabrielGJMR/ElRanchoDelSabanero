import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { adminRequest, type Category, type MenuItem, type MenuType } from '../lib/api.ts'
import { colones } from '../lib/format.ts'

interface Props {
  auth: string
  menus: MenuType[]
  currentMenuId: number
  currentCategories: Category[] | null
}

interface Line {
  item: MenuItem
  qty: number
}

/**
 * Calcula el total de una cuenta con los precios actuales del menú. Chica y colapsada por
 * defecto; al abrirla se elige el platillo de un selector agrupado por categoría. El filtro
 * de menú permite agregar platillos de otro menú (ej. Casados) a la misma cuenta sin perder
 * lo que ya se agregó de Principal. Estilo "recibo de caja": tarjeta de papel con una barra
 * de total aparte abajo, como un ticket.
 */
export default function Calculator({ auth, menus, currentMenuId, currentCategories }: Props) {
  const [open, setOpen] = useState(false)
  const [filterMenuId, setFilterMenuId] = useState(currentMenuId)
  const [cache, setCache] = useState<Record<number, Category[]>>(() => (currentCategories ? { [currentMenuId]: currentCategories } : {}))
  const [loading, setLoading] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState('')
  const [qty, setQty] = useState(1)
  const [lines, setLines] = useState<Line[]>([])
  const [paid, setPaid] = useState('')

  const loadMenu = useCallback(async (menuId: number) => {
    setLoading(true)
    try {
      const cats = await adminRequest<Category[]>(auth, `menus/${menuId}/categories`)
      setCache((c) => ({ ...c, [menuId]: cats }))
    } catch {
      // Si falla, el selector de platillos simplemente queda vacío para ese menú.
    } finally {
      setLoading(false)
    }
  }, [auth])

  function changeFilterMenu(menuId: number) {
    setFilterMenuId(menuId)
    setSelectedItemId('')
  }

  // Carga los platillos del menú activo en el filtro (incluido el que está seleccionado por
  // defecto al abrir: antes solo se pedían al servidor cuando el admin tocaba el selector a mano).
  useEffect(() => {
    if (!cache[filterMenuId]) loadMenu(filterMenuId)
  }, [filterMenuId, cache, loadMenu])

  const categories = cache[filterMenuId] ?? []
  const items = useMemo(() => categories.flatMap((c) => c.items.filter((i) => i.available)), [categories])

  function addLine() {
    const item = items.find((i) => String(i.id) === selectedItemId)
    if (!item || qty <= 0) return
    setLines((ls) => {
      const existing = ls.find((l) => l.item.id === item.id)
      if (existing) return ls.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + qty } : l))
      return [...ls, { item, qty }]
    })
    setSelectedItemId('')
    setQty(1)
  }

  function removeLine(id: number) {
    setLines((ls) => ls.filter((l) => l.item.id !== id))
  }

  function clear() {
    setLines([])
    setPaid('')
  }

  function close() {
    setOpen(false)
    clear()
    setSelectedItemId('')
  }

  const total = lines.reduce((sum, l) => sum + l.item.price * l.qty, 0)
  const change = paid === '' ? null : parseInt(paid, 10) - total

  if (!open) {
    return (
      <button type="button" className="btn btn-sm btn-ghost mb-4" onClick={() => setOpen(true)}>
        Calculadora de cuenta
      </button>
    )
  }

  return (
    <div className="mb-8 w-full max-w-sm">
      {/* Tarjeta de papel: filtro de menú, selector de platillos y detalle de la cuenta. */}
      <div className="rounded-t-2xl bg-paper text-paper-ink shadow-xl shadow-black/30">
        <div className="flex h-10 items-center border-b border-paper-line px-4 text-[11px] font-bold tracking-widest text-brasa uppercase">
          Calculadora de cuenta
          <button type="button" className="ml-auto text-[11px] font-bold tracking-widest text-paper-muted normal-case hover:text-brasa" onClick={close}>
            Cerrar
          </button>
        </div>

        <div className="grid gap-4 p-4">
          {menus.length > 1 && (
            <div>
              <span className="mb-2 block text-xs font-bold tracking-wide uppercase">Menú</span>
              <select
                className="h-9 w-full rounded-md border border-paper-line bg-paper-2 px-2.5 text-sm text-paper-ink outline-none focus:border-brasa"
                value={filterMenuId}
                onChange={(e) => changeFilterMenu(Number(e.target.value))}
              >
                {menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}

          <hr className="border-paper-line" />

          <div>
            <span className="mb-2 block text-xs font-bold tracking-wide uppercase">Agregar platillo</span>
            <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-[1fr_4.75rem_2.5rem]">
              <select
                className="h-9 w-full min-w-0 rounded-md border border-paper-line bg-paper-2 px-2.5 text-sm text-paper-ink outline-none focus:border-brasa disabled:opacity-60"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={loading || items.length === 0}
                aria-label="Platillo"
              >
                <option value="">{loading ? 'Cargando...' : items.length === 0 ? 'Sin platillos' : 'Elija un platillo'}</option>
                {categories.map((c) => {
                  const visible = c.items.filter((i) => i.available)
                  if (visible.length === 0) return null
                  return (
                    <optgroup key={c.id} label={c.name}>
                      {visible.map((i) => <option key={i.id} value={i.id}>{i.name} — {colones(i.price)}</option>)}
                    </optgroup>
                  )
                })}
              </select>
              <div className="flex gap-2.5 sm:contents">
                <div className="flex h-9 flex-1 items-center justify-between rounded-md border border-paper-line bg-paper-2 sm:flex-none">
                  <button type="button" className="h-full w-9 text-paper-muted hover:text-brasa sm:w-6" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Bajar cantidad">−</button>
                  <span className="text-center text-sm font-semibold tabular-nums">{qty}</span>
                  <button type="button" className="h-full w-9 text-paper-muted hover:text-brasa sm:w-6" onClick={() => setQty((q) => q + 1)} aria-label="Subir cantidad">+</button>
                </div>
                <button
                  type="button"
                  className="h-9 shrink-0 rounded-md border border-brasa bg-brasa/80 px-5 text-sm font-bold text-paper shadow-[0_1px_0_0_rgba(0,0,0,.25)] disabled:opacity-50 sm:w-full sm:px-0"
                  onClick={addLine}
                  disabled={!selectedItemId}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <hr className="border-paper-line" />

          <div>
            <span className="mb-2 block text-xs font-bold tracking-wide uppercase">Cuenta</span>
            {lines.length === 0 && <p className="text-xs text-paper-muted">Agregue platillos para calcular la cuenta.</p>}
            {lines.length > 0 && (
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1.5">
                {lines.map((l) => (
                  <Fragment key={l.item.id}>
                    <span className="truncate text-xs font-semibold">{l.qty} × {l.item.name}</span>
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      {colones(l.item.price * l.qty)}
                      <button type="button" aria-label={`Quitar ${l.item.name}`} className="text-paper-muted hover:text-fire" onClick={() => removeLine(l.item.id)}>×</button>
                    </span>
                  </Fragment>
                ))}
              </div>
            )}
          </div>

          <hr className="border-paper-line" />

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="text-xs font-bold tracking-wide uppercase" htmlFor="paid">Paga con</label>
            <input
              id="paid"
              className="h-9 w-24 rounded-md border border-paper-line bg-paper-2 px-2.5 text-sm text-paper-ink outline-none focus:border-brasa"
              type="number"
              min={0}
              step={1000}
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
            />
            {change !== null && (
              <span className={`text-sm font-semibold ${change < 0 ? 'text-fire' : 'text-brasa'}`}>
                {change < 0 ? `Faltan ${colones(-change)}` : `Vuelto: ${colones(change)}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Barra de total, como el total de un ticket: separada de la tarjeta de arriba, fondo
          sólido (no translúcido) para que el precio se lea bien sobre el fondo oscuro del Inicio. */}
      <div className="flex items-center justify-between rounded-b-2xl bg-brasa px-4 py-2.5">
        <span className="text-2xl font-black text-paper">{colones(total)}</span>
        <button
          type="button"
          className="h-9 rounded-lg bg-paper px-5 text-sm font-bold text-brasa shadow-[0_2px_0_0_rgba(0,0,0,.25)] transition-colors hover:bg-fire hover:text-paper"
          onClick={clear}
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
