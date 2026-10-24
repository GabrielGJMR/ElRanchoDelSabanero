interface Props {
  src?: string | null
  alt: string
  className?: string
  /** Texto del recuadro vacío (cuando todavía no hay foto). */
  placeholder?: string
  /** Fondo donde se muestra: oscuro (carbón) o papel crema. */
  tone?: 'dark' | 'paper'
}

const EMPTY = {
  dark: 'border-gold/30 bg-card text-muted',
  paper: 'border-paper-line bg-paper-2 text-paper-muted',
}

/** Foto con tamaño fijo. Si no hay foto, muestra un recuadro con el escudo para reservar el espacio. */
export default function PhotoFrame({ src, alt, className = '', placeholder, tone = 'dark' }: Props) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />
  }
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 border border-dashed ${EMPTY[tone]} ${className}`}
      role="img"
      aria-label={alt}
    >
      <img src="/images/logo-mark.png" alt="" className="size-1/3 max-w-16 rounded-full opacity-40" />
      {placeholder && <span className="px-2 text-center text-xs">{placeholder}</span>}
    </div>
  )
}
