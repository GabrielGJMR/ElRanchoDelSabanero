interface Props {
  onClick: () => void
  label: string
  className?: string
}

/** Botón de "agregar": un + en círculo que gira al pasar el mouse. */
export default function AddButton({ onClick, label, className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`group inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-gold outline-none hover:text-fire ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-6 shrink-0 fill-none stroke-gold transition-transform duration-300 group-hover:rotate-90 group-hover:fill-fire/20 group-hover:stroke-fire group-active:fill-fire group-active:stroke-ember group-active:duration-0"
      >
        <path strokeWidth="1.5" d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" />
        <path strokeWidth="1.5" d="M8 12H16" />
        <path strokeWidth="1.5" d="M12 16V8" />
      </svg>
      {label}
    </button>
  )
}
