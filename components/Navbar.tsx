'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, User, LogIn } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSelector } from './LanguageSelector'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Smartesh</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t.nav.home}
            </Link>
            <Link href="/products/static" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t.nav.products}
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t.nav.about}
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t.nav.contact}
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>
            <Link href="/login-static" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <LogIn className="w-5 h-5" />
              <span>{t.nav.login}</span>
            </Link>
            <Link href="/admin-static" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              {t.nav.admin}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-600"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                {t.nav.home}
              </Link>
              <Link href="/products/static" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                {t.nav.products}
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                {t.nav.about}
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                {t.nav.contact}
              </Link>
              <div className="border-t pt-3 mt-3">
                <div className="px-3 py-2">
                  <LanguageSelector />
                </div>
                <Link href="/cart" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t.nav.cart}
                </Link>
                <Link href="/login-static" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                  <LogIn className="w-5 h-5 mr-2" />
                  {t.nav.login}
                </Link>
                <Link href="/admin-static" className="block px-3 py-2 bg-primary-600 text-white rounded-lg mx-3 mt-2 text-center">
                  {t.nav.admin}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
