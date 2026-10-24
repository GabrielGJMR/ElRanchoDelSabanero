import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** Retraso en ms, para ir mostrando varios Reveal en cascada (ej. i * 60). */
  delay?: number
  /** Etiqueta HTML a usar en vez de "div" (ej. "li" dentro de un <ol>). */
  as?: ElementType
}

/**
 * Envuelve contenido y lo revela (aparece y sube un poco) la primera vez que entra en pantalla.
 * Con "reducir movimiento" activado, index.css ya acorta todas las transiciones a ~0, así que
 * aquí no hace falta nada especial: se muestra de inmediato.
 */
export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,transform] duration-700 ease-out ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </Tag>
  )
}
