import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { SITE } from '../lib/config.ts'
import SocialLinks from './SocialLinks.tsx'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-line-soft bg-page">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <img src="/images/logo-mark.png" alt="" width={44} height={44} className="rounded-full" />
          <div>
            <p className="font-script text-xl text-ink">Rancho del Sabanero</p>
            <p className="text-sm text-muted">{SITE.address}</p>
          </div>
        </div>
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold">
          <li><Link to="/menu" className="text-muted no-underline hover:text-ember">{t('footer.menu')}</Link></li>
          <li><Link to="/eventos" className="text-muted no-underline hover:text-ember">{t('footer.events')}</Link></li>
          <li><Link to="/ubicacion" className="text-muted no-underline hover:text-ember">{t('footer.location')}</Link></li>
          <li><Link to="/contacto" className="text-muted no-underline hover:text-ember">{t('footer.contact')}</Link></li>
        </ul>
        <SocialLinks />
      </div>
      <p className="border-t border-line-soft py-4 text-center text-xs text-muted">© {YEAR} {SITE.name}</p>
    </footer>
  )
}
