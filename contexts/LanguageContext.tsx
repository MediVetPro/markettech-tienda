'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, defaultLocale, locales } from '@/lib/i18n'
import { getTranslations } from '@/lib/translations'

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslations>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  useEffect(() => {
    // Cargar idioma guardado en localStorage
    const savedLocale = localStorage.getItem('smartesh-locale') as Locale
    if (savedLocale && locales.includes(savedLocale)) {
      setLocale(savedLocale)
    }
  }, [])

  useEffect(() => {
    // Guardar idioma en localStorage
    localStorage.setItem('smartesh-locale', locale)
  }, [locale])

  const t = getTranslations(locale)

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
