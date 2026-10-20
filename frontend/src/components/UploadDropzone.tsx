import { useRef } from 'react'
import Loader from './Loader.tsx'

interface Props {
  /** Si ya hay foto, se muestra como preview llenando la zona punteada. */
  imageUrl?: string | null
  uploading: boolean
  onPick: (file: File | undefined) => void
  label?: string
  /** Oculta los textos y deja solo los íconos, para usarlo en espacios chicos (ej. una fila). */
  compact?: boolean
  className?: string
  'aria-label': string
}

/**
 * Zona de subida con dos partes: arriba la "dropzone" punteada (o la foto ya subida),
 * abajo una franja que abre el explorador de archivos. Mismo gesto en ambas: un click
 * dispara el <input type="file"> oculto y sube la imagen al elegirla (sin paso de "confirmar").
 */
export default function UploadDropzone({ imageUrl, uploading, onPick, label = 'Elegí una foto', compact = false, className = '', 'aria-label': ariaLabel }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)

  function open() {
    fileInput.current?.click()
  }

  return (
    <div className={`well flex flex-col overflow-hidden rounded-lg border border-line-soft ${className}`}>
      <button
        type="button"
        onClick={open}
        disabled={uploading}
        aria-label={ariaLabel}
        className={`group flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 p-2 text-center transition-colors disabled:cursor-default disabled:opacity-60 ${
          imageUrl ? '' : 'border-2 border-dashed border-line hover:border-fire'
        }`}
      >
        {uploading ? (
          <Loader label="Subiendo..." size="sm" />
        ) : imageUrl ? (
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" className={`${compact ? 'size-5' : 'size-9'} shrink-0 stroke-muted transition-colors group-hover:stroke-fire`}>
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15"
              />
            </svg>
            {!compact && <span className="text-[11px] text-muted">{label}</span>}
          </>
        )}
      </button>

      <label
        className={`flex shrink-0 cursor-pointer items-center justify-center gap-1.5 border-t border-line-soft bg-line-soft/60 text-muted transition-colors hover:text-gold ${
          compact ? 'h-5' : 'h-7 px-2 text-[11px]'
        }`}
      >
        {!compact && <span className="truncate">{imageUrl ? 'Cambiar foto' : 'Elegir archivo'}</span>}
        <svg viewBox="0 0 32 32" fill="currentColor" className={compact ? 'size-3' : 'size-3.5'}>
          <path d="M15.331 6H8.5v20h15V14.154h-8.169z" />
          <path d="M18.153 6h-.009v5.342H23.5v-.002z" />
        </svg>
        <input ref={fileInput} type="file" accept="image/*" hidden disabled={uploading} onChange={(e) => onPick(e.target.files?.[0])} />
      </label>
    </div>
  )
}
