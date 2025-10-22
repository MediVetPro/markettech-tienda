'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'
import { useSiteConfig } from '@/hooks/useSiteConfig'

export function Footer() {
  const { getConfigValue } = useSiteConfig()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
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
              <span className="text-xl font-bold">{getConfigValue('site_title') || 'Smartesh'}</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              {getConfigValue('footer_description') || 'Sua loja de tecnologia de confiança com os melhores produtos, garantia e atendimento especializado.'}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <span className="text-gray-300">{getConfigValue('contact_email') || 'info@smartesh.com'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <div>
                  <div className="text-sm text-gray-400">Telefone</div>
                  <span className="text-gray-300">{getConfigValue('contact_phone') || '+55 (11) 99999-9999'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400" />
                <div>
                  <div className="text-sm text-gray-400">Endereço</div>
                  <span className="text-gray-300">{getConfigValue('contact_address') || 'São Paulo, Brasil'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 {getConfigValue('site_title') || 'Smartesh'}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
