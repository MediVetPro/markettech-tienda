'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, User, LogIn, Package, Settings, ChevronDown, MessageCircle, Home, Info, Phone, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import NotificationSystem from './NotificationSystem'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, isAdmin, isAnyAdmin, logout } = useAuth()
  const { totalItems } = useCart()
  const { getConfigValue } = useSiteConfig()

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {getConfigValue('site_icon') ? (
              <img 
                src={getConfigValue('site_icon')} 
                alt="Logo da loja"
                className="w-8 h-8 object-cover rounded-lg"
                onError={(e) => {
                  // Fallback al logo por defecto si la imagen falla
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
            ) : null}
            <div 
              className={`w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center ${getConfigValue('site_icon') ? 'hidden' : ''}`}
            >
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {getConfigValue('site_title') || 'Smartesh'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Home className="w-4 h-4" />
              <span>Início</span>
            </Link>
            <Link href="/products" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Package className="w-4 h-4" />
              <span>Produtos</span>
            </Link>
            <Link href="/about" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Info className="w-4 h-4" />
              <span>Sobre</span>
            </Link>
            <Link href="/contact" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Phone className="w-4 h-4" />
              <span>Contato</span>
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <NotificationSystem userId={user?.id} />
                <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </>
            )}
            
            {isAuthenticated ? (
              <>
                <Link href="/orders" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                  <Package className="w-5 h-5" />
                  <span className="text-sm">Meus Pedidos</span>
                </Link>
                     {isAnyAdmin && (
                       <Link href="/admin" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                         <Settings className="w-5 h-5" />
                         <span className="text-sm">Gerenciar</span>
                       </Link>
                     )}
                {/* Menú desplegable del usuario */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-sm py-1 z-50 border">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Meu Perfil
                      </Link>
                      {isAnyAdmin && (
                        <Link 
                          href="/messages" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Mensagens
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                     <Link href="/login" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                       <LogIn className="w-5 h-5" />
                       <span>Entrar</span>
                     </Link>
                     <Link href="/register" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                       <User className="w-5 h-5" />
                       <span>Criar Conta</span>
                     </Link>
              </>
            )}
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
              <Link href="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                <Home className="w-4 h-4 mr-2" />
                Início
              </Link>
              <Link href="/products/static" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                <Package className="w-4 h-4 mr-2" />
                Produtos
              </Link>
              <Link href="/about" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                <Info className="w-4 h-4 mr-2" />
                Sobre
              </Link>
              <Link href="/contact" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                <Phone className="w-4 h-4 mr-2" />
                Contato
              </Link>
              <div className="border-t pt-3 mt-3">
                {isAuthenticated && (
                  <Link href="/cart" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Carrinho
                  </Link>
                )}
                
                {isAuthenticated ? (
                  <>
                    {/* Menú desplegable del usuario en móvil */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600 w-full text-left"
                      >
                        <User className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">{user?.name}</span>
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      </button>
                      
                      {isUserMenuOpen && (
                        <div className="bg-gray-50 border-t">
                          <Link 
                            href="/profile" 
                            className="flex items-center px-6 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Meu Perfil
                          </Link>
                          {isAnyAdmin && (
                            <Link 
                              href="/messages" 
                              className="flex items-center px-6 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Mensagens
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              logout()
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair
                          </button>
                        </div>
                      )}
                    </div>
                    {isAnyAdmin && (
                      <Link href="/admin" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                        <Settings className="w-5 h-5 mr-2" />
                        <span className="text-sm">Gerenciar</span>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/login-static" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                      <LogIn className="w-5 h-5 mr-2" />
                      Entrar
                    </Link>
                    <Link href="/register-static" className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600">
                      <User className="w-5 h-5 mr-2" />
                      Criar Conta
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
