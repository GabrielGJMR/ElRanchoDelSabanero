import { useState } from 'react'
import type { Category, CategoryInput, ItemInput, MenuItem } from '../api.ts'
import ItemRow from './ItemRow.tsx'

interface Props {
  category: Category
  onSaveCategory: (id: number, data: CategoryInput) => Promise<boolean>
  onDeleteCategory: (category: Category) => Promise<void>
  onSaveItem: (id: number, data: ItemInput) => Promise<boolean>
  onDeleteItem: (item: MenuItem) => Promise<void>
  onAddItem: (data: ItemInput) => Promise<boolean>
  onUploadImage: (id: number, file: File) => Promise<boolean>
  onRemoveImage: (id: number) => Promise<boolean>
}

export default function CategoryEditor({
  category, onSaveCategory, onDeleteCategory, onSaveItem, onDeleteItem, onAddItem, onUploadImage, onRemoveImage,
}: Props) {
  const [name, setName] = useState(category.name)
  const [note, setNote] = useState(category.note ?? '')
  const [saved, setSaved] = useState(false)

  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPrice, setNewPrice] = useState('')

  async function saveCategory() {
    if (await onSaveCategory(category.id, { name, note })) {
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    }
  }

  async function addItem() {
    const ok = await onAddItem({
      categoryId: category.id,
      name: newName,
      description: newDescription,
      price: parseInt(newPrice, 10),
    })
    if (ok) {
      setNewName('')
      setNewDescription('')
      setNewPrice('')
    }
  }

  return (
    <section>
      <div className="mt-7 grid grid-cols-2 items-center gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          className="field font-bold text-gold"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nombre de la categoría"
        />
        <input
          className="field"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota (opcional)"
          aria-label="Nota"
        />
        <button className="btn btn-sm" onClick={saveCategory}>{saved ? '✓' : 'Guardar'}</button>
        <button className="btn btn-sm" onClick={() => onDeleteCategory(category)}>Borrar</button>
      </div>

      {category.items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onSave={onSaveItem}
          onDelete={onDeleteItem}
          onUploadImage={onUploadImage}
          onRemoveImage={onRemoveImage}
        />
      ))}

      <div className="my-1.5 grid grid-cols-2 items-center gap-2 lg:grid-cols-[64px_1.2fr_1.4fr_110px_auto]">
        <span className="hidden lg:block" />
        <input className="field" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nuevo platillo" />
        <input
          className="field"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Descripción (opcional)"
        />
        <input
          className="field"
          type="number"
          min={0}
          step={100}
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          placeholder="Precio"
        />
        <button className="btn btn-sm" onClick={addItem}>Agregar</button>
      </div>
    </section>
  )
}
