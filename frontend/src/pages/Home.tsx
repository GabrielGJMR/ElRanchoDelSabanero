import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Gallery from '../components/Gallery.tsx'
import Hero from '../components/Hero.tsx'
import Specialties from '../components/Specialties.tsx'
import { usePageTitle } from '../usePageTitle.ts'

export default function Home() {
  const { t } = useTranslation()
  usePageTitle()

  return (
    <>
      <Hero />
      <Specialties />
      <Gallery />

      <section className="border-t border-line-soft bg-[radial-gradient(ellipse_at_50%_130%,#4a1d0a_0%,var(--color-page)_70%)] px-4 py-16 text-center">
        <p className="font-script text-4xl md:text-5xl">{t('home.closing')}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-display" to="/ubicacion">{t('home.ctaLocation')}</Link>
          <Link className="btn btn-ghost btn-display" to="/contacto">{t('home.ctaContact')}</Link>
        </div>
      </section>
    </>
  )
}
