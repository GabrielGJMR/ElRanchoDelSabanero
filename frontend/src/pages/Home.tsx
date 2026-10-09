import { Link } from 'react-router-dom'
import Gallery from '../components/Gallery.tsx'
import Hero from '../components/Hero.tsx'
import Specialties from '../components/Specialties.tsx'
import { usePageTitle } from '../usePageTitle.ts'

export default function Home() {
  usePageTitle()

  return (
    <>
      <Hero />
      <Specialties />
      <Gallery />

      <section className="border-t border-line-soft bg-[radial-gradient(ellipse_at_50%_130%,#4a1d0a_0%,var(--color-page)_70%)] px-4 py-16 text-center">
        <p className="font-script text-4xl md:text-5xl">Lo esperamos en Liberia</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="btn" to="/ubicacion">Cómo llegar</Link>
          <Link className="btn btn-ghost" to="/contacto">Contacto</Link>
        </div>
      </section>
    </>
  )
}
