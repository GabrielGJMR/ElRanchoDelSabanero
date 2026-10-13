import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader.tsx'
import { SITE } from '../config.ts'
import { usePageTitle } from '../usePageTitle.ts'

const link =
  'flex items-center justify-between gap-4 border-b border-paper-line py-4 text-paper-ink no-underline hover:text-brasa'

export default function ContactPage() {
  const { t } = useTranslation()
  usePageTitle(t('contactPage.pageTitle'))

  return (
    <>
      <PageHeader title={t('contactPage.title')} />

      <div className="paper min-h-[60vh]">
        <section className="mx-auto grid max-w-5xl gap-12 px-4 py-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-bold tracking-widest text-paper-muted uppercase">{t('contactPage.callUs')}</p>
            <a
              href={`tel:${SITE.phoneTel}`}
              className="group mt-3 inline-flex items-center gap-3 text-brasa no-underline sm:gap-4"
            >
              <svg
                viewBox="0 0 24 24" fill="none" aria-hidden="true"
                className="size-8 shrink-0 transition-transform group-hover:scale-110 sm:size-10"
              >
                <path
                  d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z"
                  stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round"
                />
              </svg>
              <span className="border-b-2 border-dotted border-brasa/40 pb-1 font-script text-6xl font-normal transition-colors group-hover:border-brasa sm:text-7xl">
                {SITE.phone}
              </span>
            </a>
            <p className="mt-4 max-w-sm text-paper-muted">{SITE.address}</p>
          </div>

          <div className="border-t-2 border-paper-ink">
            <a className={link} href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <span>
                <span className="block text-sm text-paper-muted">{t('contactPage.whatsappLabel')}</span>
                <span className="font-display text-xl">{t('contactPage.whatsappCta')}</span>
              </span>
              <span aria-hidden="true">→</span>
            </a>
            <a className={link} href={SITE.instagram} target="_blank" rel="noopener noreferrer">
              <span>
                <span className="block text-sm text-paper-muted">{t('contactPage.instagramLabel')}</span>
                <span className="font-display text-xl break-all">{SITE.instagramHandle}</span>
              </span>
              <span aria-hidden="true">→</span>
            </a>
            <a className={link} href={SITE.facebook} target="_blank" rel="noopener noreferrer">
              <span>
                <span className="block text-sm text-paper-muted">{t('contactPage.facebookLabel')}</span>
                <span className="font-display text-xl">{t('contactPage.facebookName')}</span>
              </span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
