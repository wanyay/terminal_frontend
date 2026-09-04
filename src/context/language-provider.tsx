import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import {
  type LanguageCode,
  type TranslationKey,
  buildTranslator,
  setI18nLanguage,
} from '@/lib/i18n'

const DEFAULT_LANGUAGE: LanguageCode = 'en'
const LANGUAGE_COOKIE_NAME = 'lang'
const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type LanguageContextType = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  resetLanguage: () => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, _setLanguage] = useState<LanguageCode>(() => {
    const saved = getCookie(LANGUAGE_COOKIE_NAME)
    return saved === 'en' || saved === 'my' ? saved : DEFAULT_LANGUAGE
  })

  useEffect(() => {
    document.documentElement.lang = language
    setI18nLanguage(language)
  }, [language])

  const setLanguage = (lang: LanguageCode) => {
    setCookie(LANGUAGE_COOKIE_NAME, lang, LANGUAGE_COOKIE_MAX_AGE)
    _setLanguage(lang)
  }

  const resetLanguage = () => {
    removeCookie(LANGUAGE_COOKIE_NAME)
    _setLanguage(DEFAULT_LANGUAGE)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      resetLanguage,
      t: buildTranslator(language),
    }),
    [language]
  )

  return <LanguageContext value={value}>{children}</LanguageContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation() {
  const { t } = useLanguage()
  return { t }
}
