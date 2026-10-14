import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import es from '../locales/es.json'
import fr from '../locales/fr.json'
import zh from '../locales/zh.json'

export const LANGUAGES = [
  { code: 'es', label: 'Español', flag: 'es.png' },
  { code: 'en', label: 'English', flag: 'en.svg' },
  { code: 'fr', label: 'Français', flag: 'fr.png' },
  { code: 'zh', label: '中文', flag: 'zh.png' },
] as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
      zh: { translation: zh },
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'fr', 'zh'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  })

export default i18n
