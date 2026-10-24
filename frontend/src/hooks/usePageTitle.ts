import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const BASE = 'El Rancho del Sabanero'

/** Cambia el título de la pestaña (y lo que muestra Google) según la página y el idioma elegido. */
export function usePageTitle(title?: string) {
  const { t, i18n } = useTranslation()
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : `${BASE} | ${t('meta.homeTagline')}`
  }, [title, t, i18n.language])
}
