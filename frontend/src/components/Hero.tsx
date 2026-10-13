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

export default function Hero() {
  const { t } = useTranslation()

  return (
    <header className="relative overflow-hidden bg-[radial-gradient(ellipse_at_80%_100%,#7a2a0c_0%,#2a120a_40%,var(--color-page)_75%)]">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 md:grid-cols-[1.15fr_.85fr] md:py-20">
        <div className="text-center md:text-left">
          <p className="mb-4 text-xs font-semibold tracking-[.3em] text-gold uppercase">{t('hero.locationTag')}</p>
          <h1 className="font-script text-[clamp(3rem,10vw,5.5rem)] leading-[1.05] font-normal">Rancho del Sabanero</h1>
          <p className="mt-3 font-display text-lg tracking-wide text-gold">{t('hero.tagline')}</p>
          <div className="mt-4 flex items-center justify-center gap-3 text-gold/50 md:justify-start" aria-hidden="true">
            <span className="h-px w-10 bg-current" />
            <span className="size-1.5 rotate-45 bg-current" />
            <span className="h-px w-10 bg-current" />
          </div>
          <p className="mx-auto mt-5 max-w-md text-muted md:mx-0">{t('hero.description')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link className="btn btn-display" to="/menu">{t('hero.ctaMenu')}</Link>
            <LocationButton to="/ubicacion" label={t('hero.ctaLocation')} />
          </div>
        </div>

        {/* Marco en arco, como la puerta de un rancho. Sin foto muestra el escudo. */}
        <div className="relative mx-auto w-full max-w-xs md:max-w-sm">
          {heroPhoto ? (
            <>
              {/* Resplandor cálido detrás del marco, difuminado. */}
              <div className="absolute inset-4 -z-10 rounded-t-full bg-gold/30 blur-2xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-t-full border-2 border-gold/50 shadow-[0_0_55px_-12px_rgba(224,185,122,.6)]">
                <img
                  src={heroPhoto}
                  alt="El Rancho del Sabanero"
                  className="aspect-4/5 w-full origin-center animate-[ken-burns_22s_ease-in-out_infinite_alternate] object-cover"
                />
                {/* Doble marco: un filo dorado fino, hacia adentro del borde exterior. */}
                <div className="pointer-events-none absolute inset-0 rounded-t-full ring-1 ring-inset ring-gold/40" aria-hidden="true" />
              </div>
            </>
          ) : (
            <img
              src="/images/logo-mark.png"
              alt={t('hero.logoAlt')}
              width={220}
              height={220}
              className="mx-auto w-3/5 drop-shadow-[0_0_28px_rgba(240,113,61,.35)]"
            />
          )}
        </div>
      </div>
    </header>
  )
}
