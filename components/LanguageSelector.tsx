'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { locales, localeNames, localeFlags } from '@/lib/i18n'
import { Globe } from 'lucide-react'

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors">
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium">
          {localeFlags[locale]} {localeNames[locale]}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                locale === loc ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
              {locale === loc && (
                <span className="ml-auto text-primary-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
