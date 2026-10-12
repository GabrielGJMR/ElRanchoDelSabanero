import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import Brand from './Brand.tsx'
import LanguageSwitcher from './LanguageSwitcher.tsx'

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const LINKS = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/menu', label: t('nav.menu'), end: false },
    { to: '/eventos', label: t('nav.events'), end: false },
    { to: '/ubicacion', label: t('nav.location'), end: false },
    { to: '/contacto', label: t('nav.contact'), end: false },
  ]

  // Cierra el menú móvil al cambiar de página
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Transparente arriba del todo; al bajar, toma un fondo translúcido con desenfoque
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-11 items-center border-b-2 whitespace-nowrap no-underline hover:text-ember ${
      isActive ? 'border-ember text-ink' : 'border-transparent text-muted'
    }`

  return (
    <nav
      ref={panelRef}
      className={`sticky top-0 z-20 border-b transition-colors duration-300 ${
        scrolled ? 'border-line-soft bg-page/80 backdrop-blur' : 'border-transparent bg-transparent'
      }`}
      aria-label={t('nav.aria')}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <Brand size={32} className="min-h-11 shrink-0 [&>span]:hidden sm:[&>span]:inline" />

        <ul className="hidden flex-1 items-center justify-end gap-6 text-sm font-semibold md:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-line-soft text-ink hover:text-ember focus-visible:outline-none md:hidden"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
              {open ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line-soft bg-page/95 backdrop-blur md:hidden">
          <ul className="mx-auto flex max-w-5xl flex-col px-4 py-2 text-base font-semibold">
            {LINKS.map((l) => (
              <li key={l.to} className="border-b border-line-soft last:border-b-0">
                <NavLink to={l.to} end={l.end} className={({ isActive }) =>
                  `block min-h-11 py-3 no-underline hover:text-ember ${isActive ? 'text-ink' : 'text-muted'}`
                }>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
