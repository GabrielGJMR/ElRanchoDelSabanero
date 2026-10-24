import { Link } from 'react-router-dom'

interface Props {
  /** Tamaño del escudo en px. */
  size?: number
  className?: string
}

/** Escudo + nombre del rancho, enlazado al inicio. Se usa en el nav de Home y en Admin. */
export default function Brand({ size = 30, className = '' }: Props) {
  return (
    <Link to="/" className={`flex items-center gap-2 no-underline ${className}`}>
      <img
        src="/images/logo-mark.png"
        alt="El Rancho del Sabanero"
        width={size}
        height={size}
        className="shrink-0 rounded-full"
      />
      <span className="font-script text-xl leading-none text-ink">Rancho del Sabanero</span>
    </Link>
  )
}
