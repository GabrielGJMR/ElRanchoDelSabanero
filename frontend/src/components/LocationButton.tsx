import { Link } from 'react-router-dom'

interface Props {
  to: string
  label: string
  className?: string
}

/** Botón de ubicación con un pin que gira al pasar el mouse. */
export default function LocationButton({ to, label, className = '' }: Props) {
  return (
    <Link
      to={to}
      className={`group inline-flex h-10 items-center gap-2.5 rounded-full bg-gold pr-5 pl-3 text-sm font-bold text-page no-underline shadow-[5px_5px_10px_rgba(0,0,0,0.2)] transition-colors duration-500 hover:bg-ember ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        className="h-[22px] w-[22px] shrink-0 fill-page transition-transform duration-[1.5s] ease-out group-hover:rotate-[250deg]"
      >
        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
      </svg>
      {label}
    </Link>
  )
}
