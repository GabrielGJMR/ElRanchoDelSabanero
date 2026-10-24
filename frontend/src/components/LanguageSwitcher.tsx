import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../lib/i18n.ts'

const LABEL = 'Idioma / Language / Langue / 语言'

/**
 * Selector de idioma (es/en/fr/zh) con bandera. La elección se guarda en localStorage (ver i18n.ts).
 * Las banderas van en public/images/flags/ (el archivo de cada idioma se indica en LANGUAGES, en
 * i18n.ts) — un <select> nativo no puede mostrar imágenes dentro de las opciones, por eso este es un
 * menú propio en vez de un <select>.
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ?? LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
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

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={LABEL}
        className="flex min-h-11 items-center gap-1 rounded-sm border border-line-soft bg-page px-1.5 text-xs font-semibold text-muted hover:text-ember focus-visible:outline-none sm:gap-1.5 sm:px-2 sm:text-sm"
      >
        <img src={`/images/flags/${current.flag}`} alt="" width={20} height={14} className="rounded-[2px] object-cover" />
        <span className="hidden sm:inline">{current.label}</span>
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={LABEL}
          className="absolute right-0 z-30 mt-1 min-w-36 animate-[fade-in_.15s_ease-out] overflow-hidden rounded-sm border border-line-soft bg-card shadow-lg"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === current.code}>
              <button
                type="button"
                onClick={() => {
                  i18n.changeLanguage(l.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold hover:bg-line-soft hover:text-ember ${
                  l.code === current.code ? 'text-ember' : 'text-muted'
                }`}
              >
                <img src={`/images/flags/${l.flag}`} alt="" width={20} height={14} className="rounded-[2px] object-cover" />
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
