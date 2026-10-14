import './Loader.css'

interface Props {
  /** Para quien usa lector de pantalla (y, si showLabel, se ve escrito debajo del loader). */
  label: string
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
  /** Color del texto cuando showLabel: 'text-muted' (fondo oscuro) o 'text-paper-muted' (papel). */
  labelClassName?: string
}

/** Loader de cuatro círculos (ver Loader.css) para cualquier carga desde el backend o internet. */
export default function Loader({ label, showLabel = false, size = 'md', className = '', labelClassName = 'text-muted' }: Props) {
  return (
    // <span>, no <div>: el Loader a veces va dentro de un <p> (ej. "Cargando..." en Admin),
    // y un <div> ahí rompe el HTML (el navegador cierra el <p> solo y React lo marca como error).
    <span role="status" className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <span className={`loader ${size === 'sm' ? 'loader--sm' : ''}`} aria-hidden="true">
        <span className="loader__circle bg-fire" />
        <span className="loader__circle bg-ember" />
        <span className="loader__circle bg-ember" />
        <span className="loader__circle bg-fire" />
      </span>
      {showLabel ? <span className={`text-sm ${labelClassName}`}>{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  )
}
