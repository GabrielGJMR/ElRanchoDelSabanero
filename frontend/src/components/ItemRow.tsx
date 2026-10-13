import { useRef, useState } from 'react'
import type { MenuItem } from '../api.ts'
import DeleteButton from './DeleteButton.tsx'

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
    // En celular/tablet: tarjeta apilada en 4 filas (foto+nombre / descripción / precio+visible / botones).
    // Desde lg: las mismas piezas se acomodan en una sola fila de 7 columnas (los "lg:contents" dejan de agrupar).
    <div className="my-2 flex flex-col gap-2 rounded-lg border border-line-soft/60 p-3 transition-colors hover:bg-line-soft/40 lg:my-1.5 lg:grid lg:grid-cols-[64px_1.2fr_1.4fr_110px_auto_auto_auto] lg:items-center lg:gap-2 lg:rounded-none lg:border-0 lg:p-0">
      <div className="flex items-center gap-3 lg:contents">
        <div className="flex shrink-0 flex-col items-center gap-1">
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

        <input
          className="field flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nombre del platillo"
        />
      </div>

      <input
        className="field"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        aria-label="Descripción"
      />

      <div className="flex items-center gap-3 lg:contents">
        <input
          className="field flex-1 lg:flex-initial"
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
          className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap text-muted"
        >
          <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${available ? 'bg-fire' : 'bg-line'}`}>
            <span
              className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${available ? 'translate-x-4' : ''}`}
            />
          </span>
          {available ? 'Visible' : 'Oculto'}
        </button>
      </div>

      <div className="flex items-center gap-2 lg:contents">
        <button className="btn btn-sm flex-1 lg:flex-initial" onClick={save}>{saved ? '✓' : 'Guardar'}</button>
        <DeleteButton onClick={() => onDelete(item)} description={`Borrar ${item.name}`} />
      </div>
    </div>
  )
}
