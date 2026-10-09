import { useRef, useState } from 'react'
import type { MenuItem } from '../api.ts'

interface Props {
  item: MenuItem
  onSave: (id: number, data: { name: string; description: string; price: number; available: boolean }) => Promise<boolean>
  onDelete: (item: MenuItem) => Promise<void>
  onUploadImage: (id: number, file: File) => Promise<boolean>
  onRemoveImage: (id: number) => Promise<boolean>
}

export default function ItemRow({ item, onSave, onDelete, onUploadImage, onRemoveImage }: Props) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description ?? '')
  const [price, setPrice] = useState(String(item.price))
  const [available, setAvailable] = useState(item.available)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function save() {
    if (await onSave(item.id, { name, description, price: parseInt(price, 10), available })) {
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    }
  }

  async function pickFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    await onUploadImage(item.id, file)
    setUploading(false)
    if (fileInput.current) fileInput.current.value = '' // permite elegir la misma foto otra vez
  }

  return (
    <div className="my-1.5 grid grid-cols-2 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-line-soft/40 lg:grid-cols-[64px_1.2fr_1.4fr_110px_auto_auto_auto]">
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="size-14 cursor-pointer overflow-hidden rounded-lg border border-line bg-[#120e0b] text-2xl text-muted transition-colors hover:border-fire disabled:opacity-50"
          title={item.imageUrl ? 'Cambiar foto' : 'Agregar foto'}
          aria-label={item.imageUrl ? `Cambiar foto de ${item.name}` : `Agregar foto a ${item.name}`}
        >
          {uploading ? '…' : item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : '+'}
        </button>
        {item.imageUrl && !uploading && (
          <button
            type="button"
            onClick={() => onRemoveImage(item.id)}
            className="cursor-pointer text-[11px] text-muted underline hover:text-fire"
          >
            Quitar
          </button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </div>

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
      <button
        type="button"
        onClick={() => setAvailable((v) => !v)}
        aria-pressed={available}
        className="flex items-center gap-2 text-sm whitespace-nowrap text-muted"
      >
        <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${available ? 'bg-fire' : 'bg-line'}`}>
          <span
            className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${available ? 'translate-x-4' : ''}`}
          />
        </span>
        {available ? 'Visible' : 'Oculto'}
      </button>
      <button className="btn btn-sm" onClick={save}>{saved ? '✓' : 'Guardar'}</button>
      <button className="btn btn-sm btn-ghost" onClick={() => onDelete(item)}>Borrar</button>
    </div>
  )
}
