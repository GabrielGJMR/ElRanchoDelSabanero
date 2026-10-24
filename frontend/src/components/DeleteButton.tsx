interface Props {
  onClick: () => void
  /** Para lectores de pantalla; más descriptivo que el texto visible (ej. "Borrar categoría Postres"). */
  description?: string
  /** Texto visible al abrir la pastilla. Corto, para que siempre quepa. */
  label?: string
  /** 'md' para filas normales, 'sm' donde el espacio es más ajustado (ej. tarjetas de menú). */
  size?: 'md' | 'sm'
  className?: string
}

const sizes = {
  md: {
    button: 'h-11 w-11 hover:w-36',
    icon: 'h-4 w-4',
    label: 'text-xs',
  },
  sm: {
    button: 'h-8 w-8 hover:w-28',
    icon: 'h-3.5 w-3.5',
    label: 'text-[11px]',
  },
}

/** Botón circular con basurero que se abre en una pastilla roja al pasar el mouse; el icono y el texto se cruzan en fundido, nunca se pisan. */
export default function DeleteButton({ onClick, description, label = 'Borrar', size = 'md', className = '' }: Props) {
  const s = sizes[size]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={description ?? label}
      className={`delete-btn group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-[width] duration-300 ease-out hover:bg-fire ${s.button} ${className}`}
    >
      <svg
        viewBox="0 0 448 512"
        className={`fill-white transition-opacity duration-150 ease-out group-hover:opacity-0 ${s.icon}`}
      >
        <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
      </svg>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center font-bold whitespace-nowrap text-white opacity-0 transition-opacity delay-150 duration-150 ease-out group-hover:opacity-100 ${s.label}`}
      >
        {label}
      </span>
    </button>
  )
}
