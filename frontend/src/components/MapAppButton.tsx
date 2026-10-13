import { useId } from 'react'
import './MapAppButton.css'

interface Props {
  href: string
  label: string
  logoSrc: string
  /** Color de marca de la app (ej. el rojo de Google Maps, el celeste de Waze). */
  pillColorClass: string
}

/**
 * Botón "Abrir en [app]" con el logo real de la app y, al pasar el mouse, un mapa de papel
 * doblado que se despliega detrás (ver MapAppButton.css). Adaptado de un diseño de Uiverse.io.
 */
export default function MapAppButton({ href, label, logoSrc, pillColorClass }: Props) {
  const rawId = useId()
  const filterId = `map-land-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="map-app-btn group relative isolate inline-flex items-center overflow-hidden rounded-full shadow-[0_-1px_2px_rgba(3,7,18,.01),0_-5px_6px_rgba(3,7,18,.015),0_-12px_12px_rgba(3,7,18,.02),0_-20px_22px_rgba(3,7,18,.03),0_-32px_32px_rgba(3,7,18,.08)] transition-transform duration-300 ease-out hover:scale-110 active:translate-y-0.5 active:scale-[1.02]"
      style={{ ['--map-land-filter' as string]: `url(#${filterId})` }}
    >
      <svg height="0" width="0" aria-hidden="true" className="absolute">
        <filter id={filterId}>
          <feTurbulence result="turb" numOctaves={7} baseFrequency={0.006} type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={700} in="SourceGraphic" in2="turb" />
        </filter>
      </svg>

      <span
        className={`relative z-2 rounded-full py-2 pr-4 pl-9 text-xs font-semibold text-white transition-colors duration-300 ease-in-out group-hover:bg-white group-hover:text-[#00000025] sm:pl-10 sm:text-sm ${pillColorClass}`}
      >
        {label}
      </span>

      <img
        src={logoSrc}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2 z-3 h-5 w-auto -translate-y-1/2 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,.35)] transition-transform duration-300 ease-in-out group-hover:scale-110 sm:h-6"
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
