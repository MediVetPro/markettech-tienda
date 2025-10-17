'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Star, ShoppingCart, Eye } from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string
  price: number
  condition: string
  aestheticCondition: number
  specifications: string
  images: Array<{ url: string; alt?: string }>
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCondition, setFilterCondition] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    // Simular carga de productos
    const mockProducts: Product[] = [
      {
        id: '1',
        title: 'iPhone 15 Pro Max 256GB',
        description: 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla 6.7", A17 Pro, 256GB, iOS 17',
        images: [{ url: '/placeholder-phone.jpg', alt: 'iPhone 15 Pro Max' }]
      },
      {
        id: '2',
        title: 'MacBook Pro M3 14"',
        description: 'Laptop profesional con chip M3 y pantalla Liquid Retina XDR',
        price: 1999.99,
        condition: 'USED',
        aestheticCondition: 9,
        specifications: 'Chip M3, 16GB RAM, 512GB SSD, macOS Sonoma',
        images: [{ url: '/placeholder-laptop.jpg', alt: 'MacBook Pro M3' }]
      },
      {
        id: '3',
        title: 'AirPods Pro 2da Gen',
        description: 'Auriculares inalámbricos con cancelación activa de ruido',
        price: 249.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Cancelación de ruido, resistencia al agua IPX4',
        images: [{ url: '/placeholder-headphones.jpg', alt: 'AirPods Pro' }]
      },
      {
        id: '4',
        title: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone Android con S Pen y cámara de 200MP',
        price: 1199.99,
        condition: 'USED',
        aestheticCondition: 8,
        specifications: 'Pantalla 6.8", Snapdragon 8 Gen 3, 256GB',
        images: [{ url: '/placeholder-phone2.jpg', alt: 'Samsung Galaxy S24' }]
      },
      {
        id: '5',
        title: 'iPad Pro 12.9" M2',
        description: 'Tablet profesional con chip M2 y pantalla Liquid Retina XDR',
        price: 1099.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M2, 128GB, WiFi + Cellular',
        images: [{ url: '/placeholder-tablet.jpg', alt: 'iPad Pro' }]
      },
      {
        id: '6',
        title: 'Sony WH-1000XM5',
        description: 'Auriculares over-ear con cancelación de ruido líder en la industria',
        price: 399.99,
        condition: 'USED',
        aestheticCondition: 9,
        specifications: 'Cancelación de ruido, 30h batería, carga rápida',
        images: [{ url: '/placeholder-headphones2.jpg', alt: 'Sony WH-1000XM5' }]
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCondition = filterCondition === 'all' || product.condition === filterCondition
    return matchesSearch && matchesCondition
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'condition':
        return b.aestheticCondition - a.aestheticCondition
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Productos</h1>
          <p className="text-gray-600">Encuentra la tecnología que necesitas</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Condition Filter */}
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todas las condiciones</option>
              <option value="NEW">Nuevo</option>
              <option value="USED">Usado</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Más recientes</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
              <option value="condition">Mejor condición</option>
            </select>

            {/* Results count */}
            <div className="flex items-center text-gray-600">
              <Filter className="w-5 h-5 mr-2" />
              <span>{sortedProducts.length} productos encontrados</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
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
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
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

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
            <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
