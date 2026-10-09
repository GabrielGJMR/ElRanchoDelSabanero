import { Link } from 'react-router-dom'

// Sale del menú. Edite los textos aquí.
const DISHES = [
  { title: 'Platos de la casa', text: 'Patacones La Burrita, Tayuya y la Ensalada La Patrona.' },
  { title: 'Hamburguesas', text: 'Criolla, Juanita, Smash Burger Tajona y la Carreta sin Bueyes.' },
  { title: 'Pollo', text: 'Gordon Blue, filete al ajillo, al grill o a la plancha, y fajitas clásicas o jalapeñas.' },
  { title: 'Surtidos', text: 'El Peón, para 5 personas. El Gamonal, para 8.' },
]

export default function Specialties() {
  return (
    <section className="paper" aria-labelledby="que-se-come">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-3 border-b-2 border-paper-ink pb-3">
          <h2 id="que-se-come" className="font-display text-3xl md:text-4xl">Qué se come aquí</h2>
          <Link to="/menu" className="text-sm font-bold tracking-wider text-brasa uppercase hover:underline">
            Ver la carta completa →
          </Link>
        </div>

        <ol className="grid gap-x-14 md:grid-cols-2">
          {DISHES.map((d, i) => (
            <li key={d.title} className="flex gap-5 border-b border-paper-line py-6">
              <span className="font-display text-4xl leading-none text-brasa" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display text-xl">{d.title}</h3>
                <p className="mt-1 text-paper-muted">{d.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
