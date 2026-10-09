interface Props {
  title: string
  subtitle?: string
}

/** Encabezado común de las páginas internas (Menú, Ubicación, Contacto). */
export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="bg-[radial-gradient(ellipse_at_50%_160%,#5a2210_0%,var(--color-page)_70%)] px-4 pt-12 pb-10 text-center">
      <h1 className="font-display text-4xl tracking-wide sm:text-5xl">{title}</h1>
      <span className="mx-auto mt-4 block h-0.5 w-14 bg-ember" aria-hidden="true" />
      {subtitle && <p className="mx-auto mt-4 max-w-xl text-muted">{subtitle}</p>}
    </header>
  )
}
