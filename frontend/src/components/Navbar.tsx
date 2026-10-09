import { NavLink } from 'react-router-dom'
import Brand from './Brand.tsx'

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/menu', label: 'Carta', end: false },
  { to: '/ubicacion', label: 'Ubicación', end: false },
  { to: '/contacto', label: 'Contacto', end: false },
]

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-20 border-b border-line-soft bg-page/95 backdrop-blur"
      aria-label="Páginas del sitio"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5">
        {/* En celular solo se ve el escudo, para que quepan los enlaces */}
        <Brand size={34} className="min-h-11 shrink-0 [&>span]:hidden sm:[&>span]:inline" />
        <ul className="flex flex-1 items-center justify-between gap-3 text-sm font-semibold sm:flex-none sm:justify-end sm:gap-7">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center border-b-2 no-underline hover:text-ember ${
                    isActive ? 'border-ember text-ink' : 'border-transparent text-muted'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
