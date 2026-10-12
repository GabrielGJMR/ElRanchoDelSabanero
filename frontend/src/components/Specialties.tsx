import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Specialties() {
  const { t } = useTranslation()
  // Sale del menú. Para editar los textos, vea src/locales/*.json (clave "specialties.dishes").
  const dishes = t('specialties.dishes', { returnObjects: true }) as { title: string; text: string }[]

  return (
    <section className="paper" aria-labelledby="que-se-come">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-3 border-b-2 border-paper-ink pb-3">
          <h2 id="que-se-come" className="font-display text-3xl md:text-4xl">{t('specialties.heading')}</h2>
          <Link to="/menu" className="text-sm font-bold tracking-wider text-brasa uppercase hover:underline">
            {t('specialties.viewFullMenu')}
          </Link>
        </div>

        <ol className="grid gap-x-14 md:grid-cols-2">
          {dishes.map((d, i) => (
            <li key={d.title} className="flex gap-5 border-b border-paper-line py-6">
              <span className="font-display text-4xl leading-none text-brasa" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display text-xl">{d.title}</h3>
                <p className="mt-1 text-paper-muted">{d.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
