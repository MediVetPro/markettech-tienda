'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductCard } from './ProductCard'

interface Product {
  id: string
  title: string
  price: number
  supplierPrice: number
  marginPercentage: number
  condition: string
  aestheticCondition: number
  images: Array<{ path: string; filename: string; alt?: string }>
  stock?: number
  manufacturer?: string
  model?: string
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log('🔄 [FEATURED] Cargando productos destacados...')
        const response = await fetch('/api/products?limit=4')
        if (response.ok) {
          const data = await response.json()
          console.log('✅ [FEATURED] Productos cargados:', data.products?.length || 0)
          setProducts(data.products || [])
        } else {
          console.error('❌ [FEATURED] Error cargando productos:', response.status)
          setProducts([])
        }
      } catch (error) {
        console.error('❌ [FEATURED] Error cargando productos:', error)
        setProducts([])
      }
    }

    fetchFeaturedProducts()
  }, [])

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {'Produtos'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {'Descubra nossa seleção de produtos tecnológicos'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              showQuantitySelector={true}
            />
          ))}
        </div>

        <div className="text-center mt-12">
            <Link
              href="/products"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              Ver Todos os Produtos
            </Link>
        </div>
      </div>
    </section>
  )
}