import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchMenuBySlug, fetchMenuTypes, type Category, type MenuType } from '../lib/api.ts'
import Loader from '../components/Loader.tsx'
import PageHeader from '../components/PageHeader.tsx'
import PhotoFrame from '../components/PhotoFrame.tsx'
import { colones, normalize } from '../lib/format.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'

export default function MenuPage() {
  const { t, i18n } = useTranslation()
  usePageTitle(t('menuPage.pageTitle'))
  const [menuTypes, setMenuTypes] = useState<MenuType[] | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [menu, setMenu] = useState<Category[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')

  // La pestaña activa es la que el visitante eligió, o si no ha elegido ninguna, la primera
  // (Menú Principal) en cuanto se sepa cuáles menús hay.
  const activeSlug = selectedSlug ?? menuTypes?.[0]?.slug ?? null

  useEffect(() => {
    let active = true
    fetchMenuTypes().then((types) => {
      if (active) setMenuTypes(types)
    }).catch(() => {
      if (active) setMenuTypes([])
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!activeSlug) return
    let active = true
    setMenu(null)
    fetchMenuBySlug(activeSlug, i18n.language).then((data) => {
      if (active) {
        setMenu(data)
        setFailed(false)
      }
    }).catch(() => {
      if (active) setFailed(true)
    })
    return () => {
      active = false
    }
  }, [activeSlug, i18n.language])

  const q = normalize(query)
  const categories = (menu ?? [])
    .map((c) => ({
      ...c,
      items: q ? c.items.filter((it) => normalize(it.name).includes(q) || normalize(it.description ?? '').includes(q)) : c.items,
    }))
    .filter((c) => c.items.length > 0)

  return (
    <>
      <PageHeader title={t('menuPage.title')} subtitle={t('menuPage.subtitle')} />

      <div className="paper min-h-[60vh]">
        {menuTypes && menuTypes.length > 1 && (
          <div className="border-b border-paper-line bg-paper-2/40">
            <div
              role="tablist"
              aria-label={t('menuPage.tabsAria')}
              className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4"
            >
              {menuTypes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={m.slug === activeSlug}
                  onClick={() => {
                    setSelectedSlug(m.slug)
                    setQuery('')
                  }}
                  className={
                    'min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold whitespace-nowrap ' +
                    (m.slug === activeSlug
                      ? 'border-brasa text-brasa'
                      : 'border-transparent text-paper-muted hover:text-paper-ink')
                  }
                >
                  {m.slug ? t(`menuPage.tabs.${m.slug}`, { defaultValue: m.name }) : m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sticky top-[65px] z-10 border-b border-paper-line bg-paper/95 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-2.5">
            <div className="relative">
              <svg
                viewBox="0 0 20 20" fill="none" aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-paper-muted"
              >
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth={2} />
                <path d="M14 14l4 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('menuPage.searchPlaceholder')}
                aria-label={t('menuPage.searchAria')}
                className="min-h-9 w-full rounded-sm border border-paper-line bg-paper-2/60 py-1.5 pr-3 pl-9 text-sm text-paper-ink placeholder:text-paper-muted focus-visible:outline-none"
              />
            </div>

            {!q && (
              <div
                className="mt-2 flex gap-2 overflow-x-auto sm:justify-center"
                aria-label={t('menuPage.categoriesAria')}
              >
                {categories.map((c) => (
                  <a
                    key={c.id}
                    href={`#cat${c.id}`}
                    className="inline-flex min-h-9 items-center rounded-sm border border-paper-line px-3.5 text-sm font-semibold whitespace-nowrap text-paper-ink no-underline hover:border-brasa hover:text-brasa"
                  >
                    {c.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 pt-6 pb-16">
          {failed && <p className="py-10 text-center text-paper-muted">{t('menuPage.loadFailed')}</p>}
          {!menu && !failed && (
            <div className="flex justify-center py-10">
              <Loader label={t('menuPage.loading')} showLabel labelClassName="text-paper-muted" />
            </div>
          )}
          {menu && !failed && q && categories.length === 0 && (
            <p className="py-10 text-center text-paper-muted">{t('menuPage.noResults', { query })}</p>
          )}
          {menu && !failed && !q && categories.length === 0 && (
            <p className="py-10 text-center text-paper-muted">{t('menuPage.menuComingSoon')}</p>
          )}

          {categories.map((c) => (
            <section key={c.id} id={`cat${c.id}`} className="mt-10 scroll-mt-36">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-2xl text-brasa">{c.name}</h2>
                <span className="h-px flex-1 bg-paper-line" aria-hidden="true" />
              </div>
              {c.note && <p className="mt-1 text-sm text-paper-muted">{c.note}</p>}

              <ul>
                {c.items.map((it) => (
                  <li key={it.id} className="flex gap-4 border-b border-paper-line/70 py-4">
                    <PhotoFrame
                      src={it.imageUrl}
                      alt={it.imageUrl ? it.name : t('menuPage.photoComingSoon', { name: it.name })}
                      tone="paper"
                      className="size-20 shrink-0 rounded-sm sm:size-24"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-display text-lg leading-snug">{it.name}</h3>
                        <span className="mb-1 flex-1 self-end border-b-2 border-dotted border-paper-line" aria-hidden="true" />
                        <span className="font-display text-lg whitespace-nowrap text-brasa">{colones(it.price)}</span>
                      </div>
                      {it.description && <p className="mt-0.5 text-sm text-paper-muted">{it.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="mt-10 text-center text-sm text-paper-muted">{t('menuPage.priceNote')}</p>
        </div>
      </div>
    </>
  )
}
