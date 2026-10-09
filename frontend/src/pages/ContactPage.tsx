import PageHeader from '../components/PageHeader.tsx'
import { SITE } from '../config.ts'
import { usePageTitle } from '../usePageTitle.ts'

const link =
  'flex items-center justify-between gap-4 border-b border-paper-line py-4 text-paper-ink no-underline hover:text-brasa'

export default function ContactPage() {
  usePageTitle('Contacto')

  return (
    <>
      <PageHeader title="Contacto" />

      <div className="paper min-h-[60vh]">
        <section className="mx-auto grid max-w-5xl gap-12 px-4 py-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-bold tracking-widest text-paper-muted uppercase">Llámenos</p>
            <a
              href={`tel:${SITE.phoneTel}`}
              className="mt-2 block font-display text-5xl text-brasa no-underline hover:underline sm:text-6xl"
            >
              {SITE.phone}
            </a>
            <p className="mt-4 max-w-sm text-paper-muted">{SITE.address}</p>
          </div>

          <div className="border-t-2 border-paper-ink">
            <a className={link} href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <span>
                <span className="block text-sm text-paper-muted">WhatsApp</span>
                <span className="font-display text-xl">Escríbanos un mensaje</span>
              </span>
              <span aria-hidden="true">→</span>
            </a>
            <a className={link} href={SITE.instagram} target="_blank" rel="noopener noreferrer">
              <span>
                <span className="block text-sm text-paper-muted">Instagram</span>
                <span className="font-display text-xl break-all">{SITE.instagramHandle}</span>
              </span>
              <span aria-hidden="true">→</span>
            </a>
            <a className={link} href={SITE.facebook} target="_blank" rel="noopener noreferrer">
              <span>
                <span className="block text-sm text-paper-muted">Facebook</span>
                <span className="font-display text-xl">El Rancho del Sabanero</span>
              </span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
