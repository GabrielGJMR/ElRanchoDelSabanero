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
      <header className="hero">
        <h1 className="script">Rancho del Sabanero</h1>
        <p className="tagline">Nuestra especialidad es hacerlos felices.</p>
        <a className="btn" href="#menu">Ver el menú</a>
      </header>

      <nav className="tabs" aria-label="Categorías del menú">
        {categories.map((c) => (
          <a key={c.id} href={`#cat${c.id}`}>{c.name}</a>
        ))}
      </nav>

      <main id="menu" className="wrap">
        <p className="note">
          Elija 2 acompañamientos: ensalada criolla, arroz blanco, papas fritas, patacones, yuca frita,
          vegetales salteados o papas mini.
        </p>

        {failed && <p className="note">No se pudo cargar el menú. Intente de nuevo en unos minutos.</p>}
        {!menu && !failed && <p className="note">Cargando menú...</p>}

        {categories.map((c) => (
          <section key={c.id} id={`cat${c.id}`} className="cat">
            <h2>{c.name}</h2>
            {c.note && <p className="catnote">{c.note}</p>}
            {c.items.map((it) => (
              <div key={it.id} className="item">
                <span className="name">
                  {it.name}
                  {it.description && <span className="desc">{it.description}</span>}
                </span>
                <span className="price">{colones(it.price)}</span>
              </div>
            ))}
          </section>
        ))}

        <p className="note small">Los precios no incluyen I.V.A.</p>
      </main>

      <section className="wrap info" id="contacto">
        <h2>Visítenos</h2>
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
