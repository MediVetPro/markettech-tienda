'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Package, User, Calendar, Star, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: string
  title: string
  description: string
  price: number
  supplierPrice: number
  marginPercentage: number
  condition: string
  aestheticCondition: number
  specifications: string
  stock: number
  status: string
  images: Array<{ path: string; filename: string; alt?: string }>
  productCode?: string
  manufacturerCode?: string
  manufacturer?: string
  model?: string
  categories?: string
  publishedAt?: string
  publishedBy?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface AdminProductViewPageProps {
  params: {
    id: string
  }
}

export default function AdminProductViewPage({ params }: AdminProductViewPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const { isAnyAdmin } = useAuth()

  useEffect(() => {
    if (!isAnyAdmin) {
      window.location.href = '/'
      return
    }
    
    fetchProduct()
  }, [isAnyAdmin, params.id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch(`/api/products/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al obtener el producto')
      }
      
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Produto não encontrado</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-red-100 text-red-800'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo'
      case 'INACTIVE': return 'Inativo'
      case 'DRAFT': return 'Rascunho'
      default: return status
    }
  }

  const getConditionText = (condition: string) => {
    return condition === 'NEW' ? 'Novo' : 'Usado'
  }

  const getConditionColor = (condition: string) => {
    return condition === 'NEW' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vista de Producto - Administración</h1>
              <p className="text-sm text-gray-600 mt-1">
                Vista administrativa del producto (incluye productos inactivos)
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/admin/products/${params.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Producto
              </Link>
              <button
                onClick={() => window.history.back()}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-white rounded-xl shadow-sm overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]?.path ? (product.images[selectedImage].path.startsWith('http') ? product.images[selectedImage].path : `/api/images${product.images[selectedImage].path}`) : '/placeholder.jpg'}
                alt={product.images[selectedImage]?.alt || product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.path.startsWith('http') ? image.path : `/api/images${image.path}`}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`}>
                  {getStatusText(product.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(product.condition)}`}>
                  {getConditionText(product.condition)}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                  Condição Estética: {product.aestheticCondition}/10
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="mb-4 flex flex-wrap gap-3">
                {product.productCode && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    Código do Produto: {product.productCode}
                  </span>
                )}
                {product.manufacturerCode && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    Código do Fabricante: {product.manufacturerCode}
                  </span>
                )}
                {product.manufacturer && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
                    Fabricante: {product.manufacturer}
                  </span>
                )}
                {product.model && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-orange-100 text-orange-800">
                    Modelo: {product.model}
                  </span>
                )}
                {product.categories && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    Categoria: {product.categories}
                  </span>
                )}
              </div>
              
              {(product.user || product.publishedAt) && (
                <div className="mb-4 text-sm text-gray-600">
                  {product.user && <span>Publicado por: <strong>{product.user.name}</strong></span>}
                  {product.user && product.publishedAt && <span> • </span>}
                  {product.publishedAt && <span>Publicado em: <strong>{new Date(product.publishedAt).toLocaleDateString()}</strong></span>}
                </div>
              )}
              
              <div className="text-4xl font-bold text-gray-900 mb-4">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>

              <div className="mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 
                    ? `Disponível: ${product.stock} unidades` 
                    : 'Fora de estoque'
                  }
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Especificações</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{product.specifications}</p>
              </div>
            </div>

            {/* Admin Info */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Informações Administrativas</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Preço de Fornecedor:</span>
                  <p className="text-blue-700">R$ {product.supplierPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Margem de Lucro:</span>
                  <p className="text-blue-700">{product.marginPercentage}%</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">ID do Produto:</span>
                  <p className="text-blue-700 font-mono text-xs">{product.id}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Status:</span>
                  <p className="text-blue-700">{getStatusText(product.status)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}