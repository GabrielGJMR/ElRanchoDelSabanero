import { useMemo, useState } from 'react'
import type { Category } from '../api.ts'
import { colones } from '../format.ts'

interface Props {
  menu: Category[]
}

/** Calcula el total de una cuenta con los precios actuales del menú. Todo ocurre en el navegador. */
export default function Calculator({ menu }: Props) {
  const [qty, setQty] = useState<Record<number, number>>({})
  const [paid, setPaid] = useState('')

  const items = useMemo(() => menu.flatMap((c) => c.items.filter((i) => i.available)), [menu])
  const lines = items.filter((i) => (qty[i.id] ?? 0) > 0)
  const total = lines.reduce((sum, i) => sum + i.price * qty[i.id], 0)
  const change = paid === '' ? null : parseInt(paid, 10) - total

  const setQuantity = (id: number, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, n) }))

  function clear() {
    setQty({})
    setPaid('')
  }

  return (
    <section className="mb-8 rounded-lg border border-gold/40 p-4">
      <h2 className="mb-3 text-lg text-gold">Calculadora de cuenta</h2>

      {menu.map((c) => {
        const visible = c.items.filter((i) => i.available)
        if (visible.length === 0) return null
        return (
          <div key={c.id} className="mb-3">
            <h3 className="mb-1 text-sm text-muted">{c.name}</h3>
            {visible.map((i) => (
              <div key={i.id} className="my-1 flex items-center gap-2">
                <span className="flex-1">{i.name}</span>
                <span className="w-20 text-right text-sm text-muted">{colones(i.price)}</span>
                <button className="btn btn-sm" aria-label={`Quitar ${i.name}`} onClick={() => setQuantity(i.id, (qty[i.id] ?? 0) - 1)}>−</button>
                <input
                  className="field w-14 text-center"
                  type="number"
                  min={0}
                  value={qty[i.id] ?? 0}
                  onChange={(e) => setQuantity(i.id, parseInt(e.target.value, 10) || 0)}
                  aria-label={`Cantidad de ${i.name}`}
                />
                <button className="btn btn-sm" aria-label={`Agregar ${i.name}`} onClick={() => setQuantity(i.id, (qty[i.id] ?? 0) + 1)}>+</button>
              </div>
            ))}
          </div>
        )
      })}

      <div className="mt-4 border-t border-gold/40 pt-3">
        {lines.length === 0 && <p className="text-sm text-muted">Agregue platillos para calcular la cuenta.</p>}
        {lines.map((i) => (
          <div key={i.id} className="flex justify-between text-sm">
            <span>{qty[i.id]} × {i.name}</span>
            <span>{colones(i.price * qty[i.id])}</span>
          </div>
        ))}
        <p className="mt-2 flex justify-between text-xl text-gold">
          <span>Total</span>
          <span>{colones(total)}</span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted" htmlFor="paid">Paga con</label>
          <input
            id="paid"
            className="field w-32"
            type="number"
            min={0}
            step={1000}
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
          />
          {change !== null && (
            <span className={change < 0 ? 'text-fire' : ''}>
              {change < 0 ? `Faltan ${colones(-change)}` : `Vuelto: ${colones(change)}`}
            </span>
          )}
          <button className="btn btn-sm ml-auto" onClick={clear}>Limpiar</button>
        </div>
      </div>
    </section>
  )
}
