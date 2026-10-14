import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Gallery from '../components/Gallery.tsx'
import Hero from '../components/Hero.tsx'
import LocationButton from '../components/LocationButton.tsx'
import Reveal from '../components/Reveal.tsx'
import Specialties from '../components/Specialties.tsx'
import { usePageTitle } from '../hooks/usePageTitle.ts'

export default function Home() {
  const { t } = useTranslation()
  usePageTitle()

  return (
    <>
      <Hero />
      <Specialties />
      <Gallery />

      <section className="border-t border-line-soft bg-[radial-gradient(ellipse_at_50%_130%,#4a1d0a_0%,var(--color-page)_70%)] px-4 py-20 text-center">
        <Reveal>
          {/* Adorno: una muesca de rancho, para no dejar el texto solo en tanto espacio. */}
          <div className="mb-5 flex items-center justify-center gap-3 text-gold/50" aria-hidden="true">
            <span className="h-px w-12 bg-current" />
            <span className="size-1.5 rotate-45 bg-current" />
            <span className="h-px w-12 bg-current" />
          </div>
          <p className="font-script text-4xl md:text-5xl">{t('home.closing')}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <LocationButton to="/ubicacion" label={t('home.ctaLocation')} />
            <Link className="btn btn-ghost btn-display" to="/contacto">{t('home.ctaContact')}</Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
