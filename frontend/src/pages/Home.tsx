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

      <section className="home-visit paper" aria-labelledby="home-visit-title">
        <Reveal className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto] md:py-20">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[.28em] text-brasa uppercase">Liberia · Guanacaste</p>
            <h2 id="home-visit-title" className="font-script text-4xl leading-tight sm:text-5xl">{t('home.closing')}</h2>
            <p className="mt-3 max-w-lg text-paper-muted">Un buen plato sabe mejor cuando se comparte. Pase a visitarnos y disfrute el sabor de la casa.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <LocationButton to="/ubicacion" label={t('home.ctaLocation')} />
            <Link className="btn btn-ghost btn-display" to="/contacto">{t('home.ctaContact')}</Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
