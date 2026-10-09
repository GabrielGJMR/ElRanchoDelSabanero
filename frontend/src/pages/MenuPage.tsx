import { useEffect, useState } from 'react'
import { fetchMenu, type Category } from '../api.ts'
import PageHeader from '../components/PageHeader.tsx'
import PhotoFrame from '../components/PhotoFrame.tsx'
import { colones } from '../format.ts'
import { usePageTitle } from '../usePageTitle.ts'

export default function MenuPage() {
  usePageTitle('La carta')
  const [menu, setMenu] = useState<Category[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchMenu().then(setMenu).catch(() => setFailed(true))
  }, [])

  const categories = (menu ?? []).filter((c) => c.items.length > 0)

  return (
    <>
      <PageHeader
        title="La carta"
        subtitle="2 acompañamientos a elegir: ensalada criolla, arroz blanco, papas fritas, patacones, yuca frita, vegetales salteados o papas mini."
      />

      <div className="paper min-h-[60vh]">
        <div className="sticky top-[65px] z-10 border-b border-paper-line bg-paper/95 backdrop-blur">
          <div
            className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-2.5 sm:justify-center"
            aria-label="Categorías de la carta"
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
        </div>

        <div className="mx-auto max-w-3xl px-4 pt-6 pb-16">
          {failed && <p className="py-10 text-center text-paper-muted">No se pudo cargar la carta. Intente de nuevo en unos minutos.</p>}
          {!menu && !failed && <p className="py-10 text-center text-paper-muted">Cargando la carta...</p>}

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
                      alt={it.imageUrl ? it.name : `Foto de ${it.name} (próximamente)`}
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

          <p className="mt-10 text-center text-sm text-paper-muted">Los precios no incluyen I.V.A.</p>
        </div>
      </div>
    </>
  )
}
