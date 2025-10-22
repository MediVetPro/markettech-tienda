'use client'

import Link from 'next/link'
import { ArrowRight, Smartphone, Laptop, Headphones } from 'lucide-react'

export function Hero() {

  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Tecnologia de
              <span className="text-primary-600"> Qualidade</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Descubra os melhores produtos tecnológicos com garantia, preços competitivos e o melhor atendimento ao cliente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/products"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Ver Produtos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors"
              >
                Contatar
              </Link>
            </div>
          </div>

          {/* Visual Elements */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/products?category=smartphones"
                className="bg-white p-6 rounded-2xl shadow-sm transform rotate-3 hover:rotate-0 transition-all duration-300 hover:shadow-md cursor-pointer group"
              >
                <Smartphone className="w-12 h-12 text-primary-600 mb-4 group-hover:text-primary-700 transition-colors" />
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">Smartphones</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">Os últimos modelos</p>
              </Link>
              <Link 
                href="/products?category=laptops"
                className="bg-white p-6 rounded-2xl shadow-sm transform -rotate-3 hover:rotate-0 transition-all duration-300 hover:shadow-md cursor-pointer group mt-8"
              >
                <Laptop className="w-12 h-12 text-primary-600 mb-4 group-hover:text-primary-700 transition-colors" />
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">Laptops</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">Alto desempenho</p>
              </Link>
              <Link 
                href="/products?category=audio"
                className="bg-white p-6 rounded-2xl shadow-sm transform rotate-2 hover:rotate-0 transition-all duration-300 hover:shadow-md cursor-pointer group -mt-4"
              >
                <Headphones className="w-12 h-12 text-primary-600 mb-4 group-hover:text-primary-700 transition-colors" />
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">Áudio</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">Qualidade premium</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
