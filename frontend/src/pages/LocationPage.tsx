import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader.tsx'
import { SITE } from '../config.ts'
import { usePageTitle } from '../usePageTitle.ts'

export default function LocationPage() {
  const { t } = useTranslation()
  usePageTitle(t('locationPage.pageTitle'))

  return (
    <>
      <PageHeader title={t('locationPage.title')} subtitle={SITE.address} />

      <div className="paper min-h-[60vh]">
        <section className="mx-auto max-w-5xl px-4 py-12">
          <iframe
            title={t('locationPage.mapTitle', { name: SITE.name })}
            src={SITE.mapsEmbed}
            className="h-96 w-full rounded-sm border-2 border-paper-ink bg-paper-2 sm:h-[30rem]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <p className="mt-6 text-center">
            <a className="btn btn-display" href={SITE.mapsLink} target="_blank" rel="noopener noreferrer">
              {t('locationPage.openInMaps')}
            </a>
          </p>
        </section>
      </div>
    </>
  )
}
