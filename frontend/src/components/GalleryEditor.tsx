import { useRef, useState } from 'react'
import type { GalleryPhoto } from '../api.ts'

interface Props {
  photos: GalleryPhoto[]
  onUpload: (file: File) => Promise<boolean>
  onDelete: (photo: GalleryPhoto) => Promise<void>
}

/** Fotos del local que salen en "Así es el rancho" (portada). Subir no reemplaza: cada foto es independiente. */
export default function GalleryEditor({ photos, onUpload, onDelete }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function pickFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    await onUpload(file)
    setUploading(false)
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <section>
      <p className="mb-4 text-sm text-muted">Salen en "Así es el rancho", en la portada. Suba o borre las que quiera.</p>

      {photos.length === 0 && (
        <p className="mb-4 text-sm text-muted italic">Todavía no hay fotos. Agregue la primera.</p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square animate-[fade-in_.25s_ease-out] overflow-hidden rounded-lg border border-line"
          >
            <img src={photo.url} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <button
              type="button"
              onClick={() => onDelete(photo)}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Borrar foto"
            >
              Borrar
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-2xl text-muted transition-colors hover:border-fire hover:text-fire disabled:opacity-50"
          aria-label="Agregar foto del local"
        >
          {uploading ? '…' : '+'}
        </button>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
      </div>
    </section>
  )
}
