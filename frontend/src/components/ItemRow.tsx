import { useState } from 'react'
import type { MenuItem } from '../api.ts'

interface Props {
  item: MenuItem
  onSave: (id: number, data: { name: string; description: string; price: number; available: boolean }) => Promise<boolean>
  onDelete: (item: MenuItem) => Promise<void>
}

export default function ItemRow({ item, onSave, onDelete }: Props) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description ?? '')
  const [price, setPrice] = useState(String(item.price))
  const [available, setAvailable] = useState(item.available)
  const [saved, setSaved] = useState(false)

  async function save() {
    if (await onSave(item.id, { name, description, price: parseInt(price, 10), available })) {
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    }
  }

  return (
    <div className="my-1.5 grid grid-cols-2 items-center gap-2 lg:grid-cols-[1.2fr_1.4fr_110px_auto_auto_auto]">
      <input className="field" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nombre del platillo" />
      <input
        className="field"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        aria-label="Descripción"
      />
      <input
        className="field"
        type="number"
        min={0}
        step={100}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        aria-label="Precio"
      />
      <label className="flex items-center gap-1.5 text-sm whitespace-nowrap text-muted">
        <input
          type="checkbox"
          className="accent-fire"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
        />
        visible
      </label>
      <button className="btn btn-sm" onClick={save}>{saved ? '✓' : 'Guardar'}</button>
      <button className="btn btn-sm" onClick={() => onDelete(item)}>Borrar</button>
    </div>
  )
}
