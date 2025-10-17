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
              Tecnología de
              <span className="text-primary-600"> Calidad</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Descubre los mejores productos tecnológicos con garantía, 
              precios competitivos y el mejor servicio al cliente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/products" 
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Ver Productos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors"
              >
                Contactar
              </Link>
            </div>
          </div>

          {/* Visual Elements */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                <Smartphone className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Smartphones</h3>
                <p className="text-gray-600 text-sm">Los últimos modelos</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform mt-8">
                <Laptop className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Laptops</h3>
                <p className="text-gray-600 text-sm">Alto rendimiento</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform -mt-4">
                <Headphones className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Audio</h3>
                <p className="text-gray-600 text-sm">Calidad premium</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
