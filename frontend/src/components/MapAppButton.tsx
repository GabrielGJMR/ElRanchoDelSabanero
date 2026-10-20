import { useId } from 'react'

interface Props {
  href: string
  label: string
  logoSrc: string
  /** Color de marca de la app (ej. el rojo de Google Maps, el celeste de Waze). */
  pillColorClass: string
}

/**
 * Botón "Abrir en [app]" con el logo real de la app y, al pasar el mouse, un mapa de papel
 * doblado que se despliega detrás (ver styles/map-app-button.css). Adaptado de un diseño de Uiverse.io.
 */
export default function MapAppButton({ href, label, logoSrc, pillColorClass }: Props) {
  const rawId = useId()
  const filterId = `map-land-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="map-app-btn group relative isolate inline-flex items-center overflow-hidden rounded-full transition-transform duration-300 ease-out hover:scale-110 active:translate-y-0.5"
      style={{ ['--map-land-filter' as string]: `url(#${filterId})` }}
    >
      <svg height="0" width="0" aria-hidden="true" className="absolute">
        <filter id={filterId}>
          <feTurbulence result="turb" numOctaves={7} baseFrequency={0.006} type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={700} in="SourceGraphic" in2="turb" />
        </filter>
      </svg>

      <span
        className={`map-app-pill-text relative z-2 rounded-full py-2 pr-4 pl-9 text-xs font-semibold text-white transition-colors duration-300 ease-in-out group-hover:bg-white sm:pl-10 sm:text-sm ${pillColorClass}`}
      >
        {label}
      </span>

      <img
        src={logoSrc}
        alt=""
        aria-hidden="true"
        className="map-app-icon pointer-events-none absolute top-1/2 left-2 z-3 h-5 w-auto -translate-y-1/2 object-contain transition-transform duration-300 ease-in-out group-hover:scale-110 sm:h-6"
      />

      <div className="map-app-btn__container" aria-hidden="true">
        <div className="map-app-btn__fold map-app-btn__fold--1" />
        <div className="map-app-btn__fold map-app-btn__fold--2" />
        <div className="map-app-btn__fold map-app-btn__fold--3" />
        <div className="map-app-btn__fold map-app-btn__fold--4" />
      </div>
    </a>
  )
}
