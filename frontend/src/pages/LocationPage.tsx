import { useTranslation } from 'react-i18next'
import MapAppButton from '../components/MapAppButton.tsx'
import PageHeader from '../components/PageHeader.tsx'
import { SITE } from '../lib/config.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'

export default function LocationPage() {
  const { t } = useTranslation()
  usePageTitle(t('locationPage.pageTitle'))

  return (
    <>
      <PageHeader title={t('locationPage.title')} subtitle={SITE.address} />

      <div className="paper min-h-[60vh]">
        <section className="mx-auto max-w-5xl px-4 py-14">
          <div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
            {/* Marco del mapa: esquina recortada a juego con los botones del sitio, y un tinte cálido
                para que los colores de Google Maps no choquen con el papel crema. Proporción fija
                (en vez de una altura enorme) para que no se trague toda la pantalla. */}
            <div className="aspect-4/3 overflow-hidden border-2 border-paper-ink bg-paper-2 shadow-[8px_10px_0_0_var(--color-paper-line)] [clip-path:polygon(0_0,100%_0,100%_100%,28px_100%,0_calc(100%-28px))] sm:aspect-16/10">
              <iframe
                title={t('locationPage.mapTitle', { name: SITE.name })}
                src={SITE.mapsEmbed}
                className="h-full w-full saturate-[.8] sepia-[.25] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Panel lateral: dirección y botones de apps, junto al mapa en vez de encima. */}
            <div className="flex flex-col items-center gap-6 lg:items-start">
              <div className="w-fit max-w-sm rounded-lg border border-paper-line bg-paper px-5 py-4 text-center shadow-[5px_6px_0_0_var(--color-paper-line)] lg:text-left">
                <div className="flex items-center justify-center gap-2 lg:justify-start">
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

              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <MapAppButton
                  href={SITE.mapsLink}
                  label={t('locationPage.openInMaps')}
                  logoSrc="/images/logogooglemaps.png"
                  pillColorClass="pill-maps"
                />
                <MapAppButton
                  href={SITE.wazeLink}
                  label={t('locationPage.openInWaze')}
                  logoSrc="/images/logowaze.png"
                  pillColorClass="pill-waze"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
