import { useRef, useState } from 'react'
import type { GalleryPhoto, GallerySection } from '../api.ts'
import AddButton from './AddButton.tsx'
import DeleteButton from './DeleteButton.tsx'

interface PhotoGridProps {
  section: GallerySection
  onUpload: (sectionId: number, file: File) => Promise<boolean>
  onDelete: (photo: GalleryPhoto) => Promise<void>
}

/** La grilla de fotos de una sola sección: subir no reemplaza, cada foto es independiente. */
function SectionPhotoGrid({ section, onUpload, onDelete }: PhotoGridProps) {
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function pickFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    await onUpload(section.id, file)
    setUploading(false)
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {section.photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-square animate-[fade-in_.25s_ease-out] overflow-hidden rounded-lg border border-line"
        >
          <img src={photo.url} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <DeleteButton
            onClick={() => onDelete(photo)}
            description="Borrar foto"
            size="sm"
            className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={uploading}
        className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-2xl text-muted transition-colors hover:border-fire hover:text-fire disabled:opacity-50"
        aria-label={`Agregar foto a ${section.name}`}
      >
        {uploading ? '…' : '+'}
      </button>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
    </div>
  )
}

interface SectionData {
  name: string
  note: string
}

interface Props {
  sections: GallerySection[] | null
  /** Si se omiten (rol Editor), las secciones quedan de solo lectura: no se renombran/borran ni se agregan nuevas. */
  onRenameSection?: (section: GallerySection, data: SectionData) => Promise<boolean>
  onDeleteSection?: (section: GallerySection) => Promise<void>
  onAddSection?: (data: SectionData) => Promise<boolean>
  onUploadPhoto: (sectionId: number, file: File) => Promise<boolean>
  onDeletePhoto: (photo: GalleryPhoto) => Promise<void>
}

/** Fotos del local para Inicio, agrupadas en secciones (ej. "Así es el rancho", "Nuestros platillos"). */
export default function GalleryEditor({ sections, onRenameSection, onDeleteSection, onAddSection, onUploadPhoto, onDeletePhoto }: Props) {
  const canManageSections = Boolean(onRenameSection && onDeleteSection && onAddSection)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<SectionData>({ name: '', note: '' })
  const [adding, setAdding] = useState(false)
  const [newSection, setNewSection] = useState<SectionData>({ name: '', note: '' })

  function startRename(section: GallerySection) {
    setEditingId(section.id)
    setEditingData({ name: section.name, note: section.note ?? '' })
  }

  async function saveRename(section: GallerySection) {
    if (await onRenameSection?.(section, editingData)) setEditingId(null)
  }

  async function deleteSection(section: GallerySection) {
    if (!window.confirm(`¿Borrar la sección "${section.name}" y todas sus fotos?`)) return
    await onDeleteSection?.(section)
  }

  async function addSection() {
    if (await onAddSection?.(newSection)) {
      setNewSection({ name: '', note: '' })
      setAdding(false)
    }
  }

  if (!sections) return <p className="text-sm text-muted">Cargando...</p>

  return (
    <section className="space-y-8">
      {sections.map((section) => (
        <div key={section.id}>
          <div className="mb-3">
            {editingId === section.id ? (
              <div className="flex flex-col gap-2 sm:max-w-md">
                <input
                  className="field font-bold text-gold"
                  autoFocus
                  value={editingData.name}
                  onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                  aria-label="Nombre de la sección"
                />
                <input
                  className="field"
                  value={editingData.note}
                  onChange={(e) => setEditingData({ ...editingData, note: e.target.value })}
                  placeholder="Nota (opcional): un par de líneas sobre esta sección"
                  aria-label="Nota de la sección"
                />
                <div className="flex gap-2">
                  <button className="btn btn-sm" onClick={() => saveRename(section)}>Guardar</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-bold text-gold">{section.name}</h3>
                {canManageSections && (
                  <>
                    <button type="button" className="cursor-pointer text-xs font-semibold text-muted hover:text-gold" onClick={() => startRename(section)}>
                      Renombrar
                    </button>
                    <DeleteButton onClick={() => deleteSection(section)} description={`Borrar sección ${section.name}`} size="sm" />
                  </>
                )}
              </div>
            )}
            {editingId !== section.id && section.note && (
              <p className="mt-1 max-w-xl text-sm text-muted italic">"{section.note}"</p>
            )}
          </div>

          <SectionPhotoGrid section={section} onUpload={onUploadPhoto} onDelete={onDeletePhoto} />
        </div>
      ))}

      {canManageSections && !adding && <AddButton onClick={() => setAdding(true)} label="Nueva sección" />}

      {canManageSections && adding && (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-line p-2.5 sm:w-96">
          <input
            className="field"
            autoFocus
            value={newSection.name}
            onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
            placeholder="Nombre (ej. Nuestros platillos)"
          />
          <input
            className="field"
            value={newSection.note}
            onChange={(e) => setNewSection({ ...newSection, note: e.target.value })}
            placeholder="Nota (opcional): un par de líneas sobre esta sección"
          />
          <p className="text-xs text-muted">
            Si le pone una nota, en Inicio esta sección sale con una foto grande y el texto al lado, en vez de la grilla.
          </p>
          <div className="flex gap-2">
            <button className="btn btn-sm" onClick={addSection}>Agregar</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setAdding(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </section>
  )
}
