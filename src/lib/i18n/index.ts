import { en } from './translations/en'
import { my } from './translations/my'

export type LanguageCode = 'en' | 'my'

export const languages: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'my', label: 'မြန်မာ' },
]

type EnDictionary = typeof en

// Union of all leaf string paths in the English dictionary, e.g. "nav.dashboard"
export type TranslationKey = {
  [K in keyof EnDictionary]: EnDictionary[K] extends string
    ? K
    : `${K & string}.${keyof EnDictionary[K] & string}`
}[keyof EnDictionary]

const dictionaries: Record<LanguageCode, typeof en> = {
  en,
  my: my as unknown as typeof en,
}

type Params = Record<string, string | number>

function interpolate(template: string, params?: Params): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    return key in params ? String(params[key]) : match
  })
}

export function buildTranslator(lang: LanguageCode) {
  const dictionary = dictionaries[lang] ?? en
  return (key: TranslationKey, params?: Params): string => {
    const getValue = (obj: unknown, path: string): string | undefined => {
      let current: unknown = obj
      for (const segment of path.split('.')) {
        if (current && typeof current === 'object') {
          current = (current as Record<string, unknown>)[segment]
        } else {
          return undefined
        }
      }
      return typeof current === 'string' ? current : undefined
    }
    const template = getValue(dictionary, key) ?? getValue(en, key) ?? key
    return interpolate(template, params)
  }
}

// Lightweight external store so the translator can be used outside React
// components (e.g. in API/query hooks and toast callbacks).
type Listener = () => void
let currentLang: LanguageCode = 'en'
let currentTranslate = buildTranslator(currentLang)
const listeners = new Set<Listener>()

export function setI18nLanguage(lang: LanguageCode) {
  currentLang = lang
  currentTranslate = buildTranslator(lang)
  listeners.forEach((listener) => listener())
}

export function getI18nLanguage(): LanguageCode {
  return currentLang
}

export function subscribeI18n(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Non-hook accessor for use outside React components. */
export function getT(key: TranslationKey, params?: Params): string {
  return currentTranslate(key, params)
}
