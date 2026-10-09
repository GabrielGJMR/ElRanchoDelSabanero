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
    <div className="row item-row">
      <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Nombre del platillo" />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        aria-label="Descripción"
      />
      <input
        type="number"
        min={0}
        step={100}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        aria-label="Precio"
      />
      <label>
        <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> visible
      </label>
      <button className="btn sm" onClick={save}>{saved ? '✓' : 'Guardar'}</button>
      <button className="btn sm" onClick={() => onDelete(item)}>Borrar</button>
    </div>
  )
}
