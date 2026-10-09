import { useEffect } from 'react'

const BASE = 'El Rancho del Sabanero'

/** Cambia el título de la pestaña (y lo que muestra Google) según la página. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : `${BASE} | Restaurante en Liberia, Guanacaste`
  }, [title])
}
