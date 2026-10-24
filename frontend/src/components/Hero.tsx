import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import LocationButton from './LocationButton.tsx'

// Foto del Inicio (opcional): copie una imagen llamada hero.jpg (o .png / .webp) en src/assets y se usa sola.
const heroFiles = import.meta.glob('../assets/hero.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const heroPhoto = Object.values(heroFiles)[0]

/** Título, lema, descripción y botones: igual en los dos layouts de abajo, cambia solo el fondo. */
function HeroCopy() {
  const { t } = useTranslation()
  return (
    <>
      <p className="mb-3 text-xs font-semibold tracking-[.3em] text-gold uppercase sm:mb-4">{t('hero.locationTag')}</p>
      <h1 className="hero-title font-script font-normal">Rancho del Sabanero</h1>
      <p className="mt-3 font-display text-base tracking-wide text-gold sm:text-lg">{t('hero.tagline')}</p>
      <div className="mt-4 flex items-center justify-center gap-3 text-gold/50 md:justify-start" aria-hidden="true">
        <span className="h-px w-10 bg-current" />
        <span className="size-1.5 rotate-45 bg-current" />
        <span className="h-px w-10 bg-current" />
      </div>
      <p className="mx-auto mt-5 max-w-md text-sm text-muted sm:text-base md:mx-0">{t('hero.description')}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3 sm:mt-8 md:justify-start">
        <Link className="btn btn-display" to="/menu">{t('hero.ctaMenu')}</Link>
        <LocationButton to="/ubicacion" label={t('hero.ctaLocation')} />
      </div>
    </>
  )
}

export default function Hero() {
  const { t } = useTranslation()

  if (!heroPhoto) {
    // Sin foto todavía: texto a un lado y el escudo del rancho al otro, como una puerta con su sello.
    return (
      <header className="hero-glow overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:gap-10 sm:py-20 md:grid-cols-[1.05fr_.95fr] md:py-24">
          <div className="text-center md:text-left">
            <HeroCopy />
          </div>
          <div className="relative mx-auto w-56 sm:w-72 md:w-full md:max-w-md">
            <img
              src="/images/logo-mark.png"
              alt={t('hero.logoAlt')}
              width={220}
              height={220}
              className="logo-glow mx-auto w-full md:w-3/5"
            />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="relative isolate overflow-hidden">
      {/* Foto a todo lo ancho, de fondo: el texto va montado encima, no al lado. */}
      <img
        src={heroPhoto}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 size-full origin-center animate-[ken-burns_22s_ease-in-out_infinite_alternate] object-cover"
      />
      {/* Velo oscuro parejo: deja leer el texto encima de cualquier foto. */}
      <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden="true" />

      <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center sm:py-20 md:min-h-160 md:items-start md:text-left">
        <HeroCopy />
      </div>
    </header>
  )
}
