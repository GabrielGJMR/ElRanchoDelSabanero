import { useId, useState } from 'react'
import type { Category, CategoryInput, ItemInput, MenuItem } from '../api.ts'
import ItemRow from './ItemRow.tsx'

interface Props {
  category: Category
  /** Platillos a mostrar (ya filtrados); por defecto todos los de la categoría. */
  items?: MenuItem[]
  open: boolean
  onToggle: () => void
  onSaveCategory: (id: number, data: CategoryInput) => Promise<boolean>
  onDeleteCategory: (category: Category) => Promise<void>
  onSaveItem: (id: number, data: ItemInput) => Promise<boolean>
  onDeleteItem: (item: MenuItem) => Promise<void>
  onAddItem: (data: ItemInput) => Promise<boolean>
  onUploadImage: (id: number, file: File) => Promise<boolean>
  onRemoveImage: (id: number) => Promise<boolean>
}

export default function CategoryEditor({
  category, items, open, onToggle, onSaveCategory, onDeleteCategory, onSaveItem, onDeleteItem, onAddItem,
  onUploadImage, onRemoveImage,
}: Props) {
  const panelId = useId()
  const [name, setName] = useState(category.name)
  const [note, setNote] = useState(category.note ?? '')
  const [saved, setSaved] = useState(false)
  const [addingItem, setAddingItem] = useState(false)

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
      setAddingItem(false)
    }
  }

  const shownItems = items ?? category.items
  const itemCount = shownItems.length
  const filtered = items !== undefined && items.length !== category.items.length

  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-line-soft bg-card/40">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left hover:bg-card"
      >
        <svg
          viewBox="0 0 20 20" fill="none" aria-hidden="true"
          className={`size-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        >
          <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="flex-1 font-bold text-gold">{name || 'Sin nombre'}</span>
        <span className="rounded-full bg-line-soft px-2.5 py-0.5 text-xs text-muted">
          {filtered ? `${itemCount} de ${category.items.length}` : `${itemCount} ${itemCount === 1 ? 'platillo' : 'platillos'}`}
        </span>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-line-soft px-4 pt-4 pb-1">
            <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
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
              <button className="btn btn-sm" onClick={saveCategory}>{saved ? '✓ Guardado' : 'Guardar'}</button>
              <button className="btn btn-sm btn-ghost" onClick={() => onDeleteCategory(category)}>Borrar</button>
            </div>

            {shownItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onSave={onSaveItem}
                onDelete={onDeleteItem}
                onUploadImage={onUploadImage}
                onRemoveImage={onRemoveImage}
              />
            ))}

            {!addingItem && (
              <button
                type="button"
                onClick={() => setAddingItem(true)}
                className="my-3 cursor-pointer text-sm font-semibold text-gold hover:text-fire"
              >
                + Agregar platillo
              </button>
            )}

            {addingItem && (
              <div className="my-3 grid grid-cols-2 items-center gap-2 rounded-lg border border-dashed border-line p-2.5 lg:grid-cols-[1.2fr_1.4fr_110px_auto_auto]">
                <input
                  className="field"
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nuevo platillo"
                />
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
                <button className="btn btn-sm btn-ghost" onClick={() => setAddingItem(false)}>Cancelar</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
