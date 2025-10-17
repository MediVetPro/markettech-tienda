'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ShoppingCart, Eye } from 'lucide-react'

interface Product {
  id: string
  title: string
  price: number
  condition: string
  aestheticCondition: number
  images: Array<{ url: string; alt?: string }>
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    // Simular carga de productos
    const mockProducts: Product[] = [
      {
        id: '1',
        title: 'iPhone 15 Pro Max 256GB',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 10,
        images: [{ url: '/placeholder-phone.jpg', alt: 'iPhone 15 Pro Max' }]
      },
      {
        id: '2',
        title: 'MacBook Pro M3 14"',
        price: 1999.99,
        condition: 'USED',
        aestheticCondition: 9,
        images: [{ url: '/placeholder-laptop.jpg', alt: 'MacBook Pro M3' }]
      },
      {
        id: '3',
        title: 'AirPods Pro 2da Gen',
        price: 249.99,
        condition: 'NEW',
        aestheticCondition: 10,
        images: [{ url: '/placeholder-headphones.jpg', alt: 'AirPods Pro' }]
      },
      {
        id: '4',
        title: 'Samsung Galaxy S24 Ultra',
        price: 1199.99,
        condition: 'USED',
        aestheticCondition: 8,
        images: [{ url: '/placeholder-phone2.jpg', alt: 'Samsung Galaxy S24' }]
      }
    ]
    setProducts(mockProducts)
  }, [])

  const getConditionText = (condition: string) => {
    return condition === 'NEW' ? 'Nuevo' : 'Usado'
  }

  const getConditionColor = (condition: string) => {
    return condition === 'NEW' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Productos Destacados
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros productos más populares y mejor valorados
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={product.images[0]?.url || '/placeholder.jpg'}
                  alt={product.images[0]?.alt || product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
                    {getConditionText(product.condition)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                    {product.aestheticCondition}/10
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm ml-2">(4.8)</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg text-center hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Link>
                  <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
            <Link
              href="/products/static"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              Ver Todos los Productos
            </Link>
        </div>
      </div>
    </section>
  )
}
