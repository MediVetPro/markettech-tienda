'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  title: string
  description: string
  price: number
  condition: string
  stock: number
  manufacturer?: string
  model?: string
  images: Array<{ path: string; filename: string; alt?: string }>
}

interface ProductDetailClientProps {
  productId: string
}

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('🔍 [CLIENT] Cargando producto:', productId)
        const response = await fetch(`/api/products/${productId}`)
        console.log('🔍 [CLIENT] Respuesta:', response.status)
        
        if (response.ok) {
          const productData = await response.json()
          console.log('✅ [CLIENT] Producto cargado:', productData.title)
          setProduct(productData)
        } else {
          console.error('❌ [CLIENT] Error:', response.status)
          const errorData = await response.json().catch(() => ({}))
          setError(`Error al cargar el producto: ${errorData.error || response.statusText}`)
        }
      } catch (error) {
        console.error('❌ [CLIENT] Error:', error)
        setError(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar produto</h1>
          <p className="text-gray-600 mb-6">{error || 'Produto não encontrado'}</p>
          <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Voltar aos produtos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              ← Voltar aos produtos
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Informações do Produto</h2>
              <div className="space-y-2">
                <p><strong>Preço:</strong> R$ {product.price}</p>
                <p><strong>Condição:</strong> {product.condition}</p>
                <p><strong>Estoque:</strong> {product.stock}</p>
                {product.manufacturer && <p><strong>Fabricante:</strong> {product.manufacturer}</p>}
                {product.model && <p><strong>Modelo:</strong> {product.model}</p>}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Imagens</h2>
              {product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {product.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image.path}
                      alt={image.alt || `Imagem ${index + 1}`}
                      width={200}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma imagem disponível</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
