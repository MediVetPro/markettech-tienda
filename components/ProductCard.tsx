'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ShoppingCart, Eye, Plus, Minus, Check } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { StarRating } from './StarRating'
import { formatPriceChange } from '@/lib/discount'

interface Product {
  id: string
  title: string
  price: number
  supplierPrice: number
  marginPercentage: number
  previousPrice?: number
  condition: string
  aestheticCondition: number
  images: Array<{ path: string; filename: string; alt?: string }>
  stock?: number
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

interface ProductCardProps {
  product: Product
  showQuantitySelector?: boolean
  className?: string
}

export function ProductCard({ product, showQuantitySelector = false, className = '' }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const { addToCart, isInCart } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProductRating()
  }, [product.id])

  const fetchProductRating = async () => {
    try {
      const response = await fetch(`/api/products/rating?productId=${product.id}`)
      if (response.ok) {
        const data = await response.json()
        setAverageRating(data.averageRating || 0)
        setTotalRatings(data.totalRatings || 0)
      }
    } catch (error) {
      console.error('Error fetching product rating:', error)
    }
  }

  const getConditionText = (condition: string) => {
    return condition === 'NEW' ? 'Novo' : 'Usado'
  }

  const getConditionColor = (condition: string) => {
    return condition === 'NEW' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'smartphones': 'Smartphones',
      'laptops': 'Laptops',
      'audio': 'Áudio',
      'cameras': 'Câmeras',
      'gaming': 'Gaming',
      'wearables': 'Wearables',
      'chargers': 'Carregadores',
      'cables': 'Cabos',
      'gadgets': 'Gadgets',
      'motherboards': 'Placas Mãe',
      'monitors': 'Monitores',
      'storage': 'Armazenamento',
      'graphics': 'Placas de Vídeo',
      'processors': 'Processadores',
      'memory': 'Memória RAM',
      'powerSupplies': 'Fontes de Alimentação',
      'cooling': 'Refrigeração',
      'drones': 'Drones',
      'backpacks': 'Mochilas e Bolsos',
      'defense': 'Defesa Pessoal',
      'tools': 'Ferramentas',
      'health': 'Saúde',
      'sports': 'Esporte',
      'portable_batteries': 'Baterias Portáteis',
      'retro': 'Retro',
      'stands': 'Suportes',
      'usb_hubs': 'HUB USB',
      'peripherals': 'Periféricos',
      'lighting': 'Iluminação',
      'adapters': 'Adaptadores',
      'robotics': 'Robótica',
      'iot': 'IoT',
      'vr_ar': 'VR/AR',
      'smart_home': 'Casa Inteligente',
      'automotive': 'Automotivo',
      'security': 'Segurança',
      'networking': 'Rede',
      'desktop': 'PC de Escritório'
    }
    return categoryMap[category] || capitalizeFirstLetter(category)
  }

  const formatCategories = (categories: string) => {
    if (!categories) return ''
    return categories.split(',').map(cat => getCategoryDisplayName(cat.trim())).join(', ')
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Você precisa fazer login para adicionar produtos ao carrinho')
      return
    }

    // Verificar si el producto está fuera de stock
    if ((product.stock || 0) <= 0) {
      alert('Produto fora de estoque')
      return
    }

    if (product.stock && quantity > product.stock) {
      alert(`Estoque insuficiente. Disponível: ${product.stock} unidades`)
      return
    }

    // Agregar la cantidad especificada al carrito de una vez
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0]?.path ? (product.images[0].path.startsWith('http') ? product.images[0].path : `/api/images${product.images[0].path}`) : '/placeholder.jpg',
      condition: product.condition,
      aestheticCondition: product.aestheticCondition
    }, quantity)

    alert(`${quantity} unidades adicionadas ao carrinho`)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (product.stock && newQuantity > product.stock) {
      alert(`Estoque insuficiente. Disponível: ${product.stock} unidades`)
      return
    }
    setQuantity(Math.max(1, newQuantity))
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <div className="relative">
        <img
          src={product.images[0]?.path ? (product.images[0].path.startsWith('http') ? product.images[0].path : `/api/images${product.images[0].path}`) : '/placeholder.jpg'}
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
        
        {/* Categoría */}
        {product.categories && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {formatCategories(product.categories)}
            </span>
          </div>
        )}
        
        {/* Fabricante y Modelo */}
        {(product.manufacturer || product.model) && (
          <div className="mb-2 flex flex-wrap gap-1">
            {product.manufacturer && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                {product.manufacturer}
              </span>
            )}
            {product.model && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                {product.model}
              </span>
            )}
          </div>
        )}
        
        {(product.user || product.publishedAt) && (
          <div className="mb-2 text-xs text-gray-500">
            {product.user && <span>Publicado por: {product.user.name}</span>}
            {product.user && product.publishedAt && <span> • </span>}
            {product.publishedAt && <span>{new Date(product.publishedAt).toLocaleDateString()}</span>}
          </div>
        )}
        
        <div className="flex items-center mb-3">
          <StarRating 
            rating={averageRating} 
            size="sm" 
            showValue={true}
          />
          <span className="text-gray-500 text-sm ml-2">
            ({totalRatings} {totalRatings === 1 ? 'avaliação' : 'avaliações'})
          </span>
        </div>

        <div className="mb-4">
          {product.stock !== undefined && (
            <div className="mb-2">
              <span className={`text-sm ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.stock > 0 ? `${product.stock} disponível` : 'Fora de estoque'}
              </span>
            </div>
          )}
          
          <div className="flex flex-col">
            {product.previousPrice && product.previousPrice > 0 && product.previousPrice !== product.price ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-400 line-through">
                    R$ {product.previousPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {(() => {
                    const priceChange = formatPriceChange(product.previousPrice, product.price)
                    return priceChange.text ? (
                      <span className={`text-sm px-2 py-1 rounded ${priceChange.className}`}>
                        {priceChange.text}
                      </span>
                    ) : null
                  })()}
                </div>
                <span className="text-2xl font-bold text-primary-600">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>

        {showQuantitySelector && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade
            </label>
            <div className={`flex items-center border rounded-lg w-fit ${
              (product.stock || 0) <= 0 
                ? 'border-gray-200 bg-gray-50' 
                : 'border-gray-300'
            }`}>
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1 || (product.stock || 0) <= 0}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className={`px-4 py-2 border-x min-w-[3rem] text-center ${
                (product.stock || 0) <= 0 
                  ? 'border-gray-200 text-gray-400' 
                  : 'border-gray-300'
              }`}>
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={product.stock ? quantity >= product.stock : false || (product.stock || 0) <= 0}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {(product.stock || 0) <= 0 && (
              <p className="text-sm text-gray-500 mt-1">Produto fora de estoque</p>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg text-center hover:bg-primary-700 transition-colors flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver
          </Link>
          <button 
            onClick={handleAddToCart}
            className={`py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
              !isAuthenticated
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isInCart(product.id) 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={!isAuthenticated}
          >
            {!isAuthenticated ? (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Entrar
              </>
            ) : isInCart(product.id) ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                No Carrinho
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
