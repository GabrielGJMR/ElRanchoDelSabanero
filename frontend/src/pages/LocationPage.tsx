import { useTranslation } from 'react-i18next'
import MapAppButton from '../components/MapAppButton.tsx'
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
        <section className="mx-auto max-w-4xl px-4 py-14">
          <div className="relative">
            {/* Marco del mapa: esquina recortada a juego con los botones del sitio, y un tinte cálido
                para que los colores de Google Maps no choquen con el papel crema. */}
            <div className="overflow-hidden border-2 border-paper-ink bg-paper-2 shadow-[8px_10px_0_0_var(--color-paper-line)] [clip-path:polygon(0_0,100%_0,100%_100%,28px_100%,0_calc(100%-28px))]">
              <iframe
                title={t('locationPage.mapTitle', { name: SITE.name })}
                src={SITE.mapsEmbed}
                className="h-96 w-full saturate-[.8] sepia-[.25] contrast-[1.05] sm:h-128"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Tarjeta de dirección, como una nota prendida sobre el mapa. */}
            <div className="relative z-10 mx-auto -mt-8 w-fit max-w-sm rounded-lg border border-paper-line bg-paper px-5 py-4 text-center shadow-[5px_6px_0_0_var(--color-paper-line)] sm:absolute sm:top-6 sm:right-6 sm:mx-0 sm:mt-0 sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5 shrink-0 text-brasa">
                  <path
                    d="M12 21s7-7.58 7-12.5A7 7 0 0 0 5 8.5C5 13.42 12 21 12 21Z"
                    stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round"
                  />
                  <circle cx="12" cy="8.5" r="2.3" stroke="currentColor" strokeWidth={1.6} />
                </svg>
                <p className="font-display text-sm tracking-wide text-paper-ink">{SITE.name}</p>
              </div>
              <p className="mt-1 text-sm text-paper-muted">{SITE.address}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <MapAppButton
              href={SITE.mapsLink}
              label={t('locationPage.openInMaps')}
              logoSrc="/images/logogooglemaps.png"
              pillColorClass="bg-[#ea4335]"
            />
            <MapAppButton
              href={SITE.wazeLink}
              label={t('locationPage.openInWaze')}
              logoSrc="/images/logowaze.png"
              pillColorClass="bg-[#33ccff]"
            />
          </div>
        </section>
      </div>
    </>
  )
}
