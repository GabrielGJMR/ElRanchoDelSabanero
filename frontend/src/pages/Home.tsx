import { useEffect, useState } from 'react'
import { fetchMenu, type Category } from '../api.ts'
import { colones } from '../format.ts'

export default function Home() {
  const [menu, setMenu] = useState<Category[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchMenu().then(setMenu).catch(() => setFailed(true))
  }, [])

  const categories = (menu ?? []).filter((c) => c.items.length > 0)

  return (
    <>
      <header className="bg-[radial-gradient(ellipse_at_50%_120%,#7a2a0c_0%,#2a120a_45%,var(--color-page)_80%)] px-4 pt-18 pb-14 text-center">
        <h1 className="mb-2 font-script text-[clamp(2.6rem,11vw,4.5rem)] font-normal">Rancho del Sabanero</h1>
        <p className="mb-7 text-sm tracking-[.18em] text-gold uppercase">Nuestra especialidad es hacerlos felices.</p>
        <a className="btn" href="#menu">Ver el menú</a>
      </header>

      <nav
        className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-line-soft bg-page/95 px-4 py-2.5 backdrop-blur"
        aria-label="Categorías del menú"
      >
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#cat${c.id}`}
            className="rounded-full border border-line px-3.5 py-1.5 text-sm whitespace-nowrap text-ink no-underline hover:border-fire"
          >
            {c.name}
          </a>
        ))}
      </nav>

      <main id="menu" className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-muted">
          Elija 2 acompañamientos: ensalada criolla, arroz blanco, papas fritas, patacones, yuca frita,
          vegetales salteados o papas mini.
        </p>

        {failed && <p className="text-sm text-muted">No se pudo cargar el menú. Intente de nuevo en unos minutos.</p>}
        {!menu && !failed && <p className="text-sm text-muted">Cargando menú...</p>}

        {categories.map((c) => (
          <section key={c.id} id={`cat${c.id}`} className="mt-7 mb-2 scroll-mt-16">
            <h2 className="text-lg tracking-wider text-gold uppercase">{c.name}</h2>
            {c.note && <p className="mb-2 text-sm text-muted">{c.note}</p>}
            {c.items.map((it) => (
              <div key={it.id} className="my-2 flex items-center gap-3 rounded-xl bg-card px-3.5 py-3">
                <span className="flex-1 font-bold">
                  {it.name}
                  {it.description && <span className="block text-xs font-normal text-muted">{it.description}</span>}
                </span>
                <span className="font-bold whitespace-nowrap text-gold">{colones(it.price)}</span>
              </div>
            ))}
          </section>
        ))}

        <p className="mt-4 text-xs text-muted">Los precios no incluyen I.V.A.</p>
      </main>

      <section id="contacto" className="mx-auto mt-8 max-w-3xl border-t border-line-soft px-4 pt-6 pb-12 text-center">
        <h2 className="mb-2 text-xl text-gold">Visítenos</h2>
        <p>Liberia, Guanacaste, Costa Rica</p>
        <p>Tel: <a href="tel:+50663837649">6383 7649</a></p>
        <p>
          <a href="https://instagram.com/elrancho_del_sabanero2023" target="_blank" rel="noopener noreferrer">
            @elrancho_del_sabanero2023
          </a>{' '}
          ·{' '}
          <a href="https://www.facebook.com/OkisGrillHouse/" target="_blank" rel="noopener noreferrer">Facebook</a>
        </p>
      </section>
    </>
  )
}
