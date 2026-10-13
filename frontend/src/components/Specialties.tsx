import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Reveal from './Reveal.tsx'
import SpecialtyCarousel, { hasSpecialtyPhotos } from './SpecialtyCarousel.tsx'

export default function Specialties() {
  const { t } = useTranslation()
  // Sale del menú. Para editar los textos, vea src/locales/*.json (clave "specialties.dishes").
  const dishes = t('specialties.dishes', { returnObjects: true }) as { title: string; text: string }[]

  return (
    <section className="paper" aria-labelledby="que-se-come">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-3 border-b-2 border-paper-ink pb-3">
          <h2 id="que-se-come" className="font-display text-3xl md:text-4xl">{t('specialties.heading')}</h2>
          <Link to="/menu" className="text-sm font-bold tracking-wider text-brasa uppercase hover:underline">
            {t('specialties.viewFullMenu')}
          </Link>
        </Reveal>

        <div className={`grid gap-10 ${hasSpecialtyPhotos ? 'md:grid-cols-[1.2fr_.8fr] md:items-start' : ''}`}>
          {/* Como en una carta impresa: nombre, línea de puntos y el número, a modo de referencia. */}
          <ol className={hasSpecialtyPhotos ? '' : 'sm:columns-2 sm:gap-x-14'}>
            {dishes.map((d, i) => (
              <Reveal key={d.title} as="li" delay={i * 70} className="break-inside-avoid border-b border-paper-line/70 py-6 first:pt-0 last:border-0">
                <div className="flex items-end gap-3">
                  <h3 className="shrink-0 font-display text-2xl">{d.title}</h3>
                  <span className="mb-1.5 min-w-8 flex-1 border-b border-dotted border-paper-muted/60" aria-hidden="true" />
                  <span className="shrink-0 font-display text-sm text-brasa/80">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="mt-2 max-w-md text-paper-muted italic">{d.text}</p>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={150}>
            <SpecialtyCarousel />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
