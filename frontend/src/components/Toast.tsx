import { useEffect, useState } from 'react'

interface Props {
  message: string
  onDismiss: () => void
}

/** Aviso de error flotante. Se anuncia a lectores de pantalla y se puede cerrar o esperar a que desaparezca solo. */
export default function Toast({ message, onDismiss }: Props) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const leave = setTimeout(() => setLeaving(true), 5000)
    const dismiss = setTimeout(onDismiss, 5300)
    return () => {
      clearTimeout(leave)
      clearTimeout(dismiss)
    }
  }, [message, onDismiss])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`toast fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-lg border border-fire px-4 py-3 text-sm text-ink shadow-lg transition-all duration-300 ${leaving ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex-1">{message}</span>
        <button
          type="button"
          onClick={() => {
            setLeaving(true)
            setTimeout(onDismiss, 300)
          }}
          aria-label="Cerrar aviso"
          className="cursor-pointer text-muted hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
