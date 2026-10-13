import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Fotos del carrusel (opcional): copie varias imágenes en src/assets/specialties
// (ej. plato-1.jpg, plato-2.jpg, plato-3.jpg...) y van pasando solas, en orden alfabético.
const files = import.meta.glob('../assets/specialties/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const photos = Object.keys(files)
  .sort()
  .map((key) => files[key])

/** Para que Specialties.tsx sepa si debe reservar la columna del carrusel. */
export const hasSpecialtyPhotos = photos.length > 0

const INTERVAL_MS = 4500

/** Carrusel con cruce de fotos (fade) que avanza solo; se detiene con el mouse, el teclado o fuera de pantalla. */
export default function SpecialtyCarousel() {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [hiddenTab, setHiddenTab] = useState(document.hidden)
  const [onscreen, setOnscreen] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => setOnscreen(entry.isIntersecting))
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onVisibility = () => setHiddenTab(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (photos.length < 2 || hovered || hiddenTab || !onscreen) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % photos.length), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [hovered, hiddenTab, onscreen])

  if (photos.length === 0) return null

  const go = (i: number) => setIndex(((i % photos.length) + photos.length) % photos.length)

  return (
    <div
      ref={rootRef}
      className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-sm shadow-[0_0_40px_-15px_rgba(184,56,15,.5)]"
      role="group"
      aria-label={t('specialties.carouselLabel')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {photos.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden={i !== index}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {photos.length > 1 && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/60 to-transparent"
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t('specialties.carouselPrev')}
            className="absolute inset-y-0 left-0 flex w-10 items-center justify-center text-ink/0 transition-colors hover:text-ink focus-visible:text-ink"
          >
            <span aria-hidden="true" className="text-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,.8)]">‹</span>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={t('specialties.carouselNext')}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink/0 transition-colors hover:text-ink focus-visible:text-ink"
          >
            <span aria-hidden="true" className="text-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,.8)]">›</span>
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={t('specialties.carouselGoTo', { n: i + 1 })}
                aria-current={i === index}
                className={`size-2 rounded-full transition-colors ${i === index ? 'bg-gold' : 'bg-ink/40 hover:bg-ink/70'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
