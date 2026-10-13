import { useEffect, useState } from 'react'
import type { Category, ItemInput, MenuItem, MenuType } from '../api.ts'
import { normalize } from '../format.ts'
import AddButton from './AddButton.tsx'
import CategoryEditor from './CategoryEditor.tsx'

interface Props {
  menu: MenuType
  categories: Category[] | null
  /** Si se da, muestra "← Cambiar menú" arriba (para los menús genéricos de comida). */
  onBack?: () => void
  /** Si se da, el nombre del menú se puede editar en el lugar (ej. "Eventos", que no pasa por el selector de menús). */
  onRename?: (name: string) => Promise<boolean>
  /** Si se omiten (rol Editor), las categorías quedan de solo lectura: no se renombran/borran ni se agregan nuevas. */
  onSaveCategory?: (id: number, data: { name: string; note: string }) => Promise<boolean>
  onDeleteCategory?: (category: Category) => Promise<void>
  onSaveItem: (id: number, data: ItemInput) => Promise<boolean>
  onDeleteItem: (item: MenuItem) => Promise<void>
  onAddItem: (data: ItemInput) => Promise<boolean>
  onUploadImage: (id: number, file: File) => Promise<boolean>
  onRemoveImage: (id: number) => Promise<boolean>
  onAddCategory?: (data: { name: string; note: string }) => Promise<boolean>
}

/** Categorías y platillos de un menú (ya sea uno de comida o "Eventos"); se reinicia al cambiar de menú (ver `key` en quien la usa). */
export default function MenuCategoriesPanel({
  menu, categories, onBack, onRename, onSaveCategory, onDeleteCategory, onSaveItem, onDeleteItem, onAddItem,
  onUploadImage, onRemoveImage, onAddCategory,
}: Props) {
  const [renaming, setRenaming] = useState(false)
  const [menuName, setMenuName] = useState(menu.name)
  const [query, setQuery] = useState('')
  const [openCategories, setOpenCategories] = useState<Set<number> | null>(null)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', note: '' })

  useEffect(() => {
    if (categories && openCategories === null) {
      setOpenCategories(new Set(categories[0] ? [categories[0].id] : []))
    }
  }, [categories, openCategories])

  async function saveRename() {
    if (await onRename?.(menuName)) setRenaming(false)
  }

  async function addCategory() {
    if (await onAddCategory?.(newCategory)) {
      setNewCategory({ name: '', note: '' })
      setAddingCategory(false)
    }
  }

  const toggleCategory = (id: number) =>
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const q = normalize(query)
  const visibleCategories = (categories ?? []).flatMap((c) => {
    if (!q) return [{ category: c, items: c.items }]
    const categoryMatches = normalize(c.name).includes(q)
    const items = categoryMatches ? c.items : c.items.filter(
      (it) => normalize(it.name).includes(q) || normalize(it.description ?? '').includes(q),
    )
    return categoryMatches || items.length > 0 ? [{ category: c, items }] : []
  })

  return (
    <div>
      {onBack && (
        <button type="button" onClick={onBack} className="mb-4 cursor-pointer text-sm font-semibold text-muted hover:text-gold">
          ← Cambiar menú
        </button>
      )}

      {!renaming && (
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-bold text-gold">{menu.name}</h2>
          {onRename && (
            <button type="button" onClick={() => { setMenuName(menu.name); setRenaming(true) }} className="cursor-pointer text-xs font-semibold text-muted hover:text-gold">
              Renombrar
            </button>
          )}
        </div>
      )}

      {renaming && (
        <div className="mb-4 flex items-center gap-2 sm:w-96">
          <input
            className="field"
            autoFocus
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            aria-label="Nombre del menú"
          />
          <button className="btn btn-sm" onClick={saveRename}>Guardar</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setRenaming(false)}>Cancelar</button>
        </div>
      )}

      {!categories && <p className="text-sm text-muted">Cargando...</p>}

      {categories && categories.length > 0 && (
        <div className="relative mb-4">
          <svg
            viewBox="0 0 20 20" fill="none" aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          >
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth={2} />
            <path d="M14 14l4 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar categoría o platillo..."
            aria-label="Buscar en el menú"
            className="field pl-9"
          />
        </div>
      )}

      {categories && q && visibleCategories.length === 0 && (
        <p className="text-sm text-muted italic">No encontramos nada con "{query}".</p>
      )}

      {visibleCategories.map(({ category: c, items }) => (
        <CategoryEditor
          key={c.id}
          category={c}
          items={items}
          open={q ? true : (openCategories?.has(c.id) ?? false)}
          onToggle={() => toggleCategory(c.id)}
          onSaveCategory={onSaveCategory}
          onDeleteCategory={onDeleteCategory}
          onSaveItem={onSaveItem}
          onDeleteItem={onDeleteItem}
          onAddItem={onAddItem}
          onUploadImage={onUploadImage}
          onRemoveImage={onRemoveImage}
        />
      ))}

      {onAddCategory && categories && !addingCategory && (
        <AddButton onClick={() => setAddingCategory(true)} label="Nueva categoría" className="mt-5" />
      )}

      {onAddCategory && categories && addingCategory && (
        <div className="mt-5 grid grid-cols-2 items-center gap-2 rounded-lg border border-dashed border-line p-2.5 sm:grid-cols-[1fr_1fr_auto_auto]">
          <input
            className="field"
            autoFocus
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="Nombre (ej. Postres)"
          />
          <input
            className="field"
            value={newCategory.note}
            onChange={(e) => setNewCategory({ ...newCategory, note: e.target.value })}
            placeholder="Nota (opcional)"
          />
          <button className="btn btn-sm" onClick={addCategory}>Agregar</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setAddingCategory(false)}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
