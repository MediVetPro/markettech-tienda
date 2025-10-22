'use client'

import { useState, useEffect } from 'react'
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Mail, Phone, MessageCircle, Check } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { StarRating } from './StarRating'
import { ProductRatingForm } from './ProductRatingForm'
import { formatPriceChange } from '@/lib/discount'

interface Product {
  id: string
  title: string
  description: string
  price: number
  supplierPrice: number
  marginPercentage: number
  previousPrice?: number
  condition: string
  aestheticCondition: number
  specifications: string
  stock: number
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

interface ProductDetailClientProps {
  productId: string
  isAdminView?: boolean
}

export function ProductDetailClient({ productId, isAdminView = false }: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [ratings, setRatings] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [userRating, setUserRating] = useState<any>(null)
  const { isAuthenticated, user } = useAuth()
  const { addToCart, isInCart } = useCart()
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Preparar headers para la consulta
        const headers: HeadersInit = {}
        
        // Si es vista de administración, agregar token de autorización
        if (isAdminView) {
          const token = localStorage.getItem('smartesh_token')
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
            console.log('🔍 [DETAIL] Cargando producto con token de administración')
          }
        }
        
        // Intentar obtener producto de la API real
        const response = await fetch(`/api/products/${productId}`, { headers })
        if (response.ok) {
          const productData = await response.json()
          setProduct(productData)
          console.log('✅ Producto cargado desde la API:', productData.title)
          return
        }
      } catch (apiError) {
        console.warn('⚠️ Error al cargar desde API, usando datos mock:', apiError)
      }
      
      // Fallback a datos mock si la API falla
      const mockProduct: Product = {
        id: productId,
        title: 'iPhone 15 Pro Max 256GB',
        description: 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP. Diseño premium en titanio con pantalla Super Retina XDR de 6.7 pulgadas. Perfecto para fotografía profesional y gaming intensivo.',
        price: 1299.99,
        supplierPrice: 1000,
        marginPercentage: 30,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla 6.7" Super Retina XDR, Chip A17 Pro, 256GB almacenamiento, iOS 17, Cámara principal 48MP, Cámara ultra gran angular 12MP, Cámara teleobjetivo 12MP, Resistencia al agua IP68',
        stock: 5, // Stock disponible
        images: [
          { path: '/uploads/products/product_1/iphone15_frontal.jpg', filename: 'iphone15_frontal.jpg', alt: 'iPhone 15 Pro Max frontal' },
          { path: '/uploads/products/product_1/iphone15_trasera.jpg', filename: 'iphone15_trasera.jpg', alt: 'iPhone 15 Pro Max trasera' },
          { path: '/uploads/products/product_1/iphone15_lateral.jpg', filename: 'iphone15_lateral.jpg', alt: 'iPhone 15 Pro Max lateral' }
        ]
      }
      setProduct(mockProduct)
      console.log('📦 Usando datos mock como fallback')
    }
    
    fetchProduct()
    fetchRatings()
  }, [productId])

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/products/rating?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setRatings(data.ratings || [])
        setAverageRating(data.averageRating || 0)
        setTotalRatings(data.totalRatings || 0)
        
        // Buscar la valoración del usuario actual
        if (user) {
          const userRatingData = data.ratings?.find((rating: any) => rating.userId === user.id)
          setUserRating(userRatingData)
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          href="/products" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar aos Produtos
        </Link>

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
                    Categoria: {formatCategories(product.categories)}
                  </span>
                )}
              </div>
              
              {(product.user || product.publishedAt) && (
                <div className="mb-4 text-sm text-gray-600">
                  {product.user && <span>{'Publicado por'}: <strong>{product.user.name}</strong></span>}
                  {product.user && product.publishedAt && <span> • </span>}
                    {product.publishedAt && <span>Publicado em: <strong>{new Date(product.publishedAt).toLocaleDateString()}</strong></span>}
                </div>
              )}
              
              <div className="flex items-center mb-4">
                <StarRating 
                  rating={averageRating} 
                  size="lg" 
                  showValue={true}
                />
                <span className="text-gray-600 ml-2">
                   ({totalRatings} {totalRatings === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>

              <div className="mb-4">
                {product.previousPrice && product.previousPrice !== product.price ? (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-2xl text-gray-400 line-through">
                        R$ {product.previousPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-4xl font-bold text-primary-600">
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {(() => {
                      const priceChange = formatPriceChange(product.previousPrice, product.price)
                      return priceChange.text ? (
                        <span className={`text-lg px-3 py-1 rounded font-medium ${priceChange.className}`}>
                          {priceChange.text}
                        </span>
                      ) : null
                    })()}
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-gray-900">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                )}
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


            {/* Quantity and Actions */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Quantidade:</label>
                <div className={`flex items-center border rounded-lg ${
                  (product?.stock || 0) <= 0 
                    ? 'border-gray-200 bg-gray-50' 
                    : 'border-gray-300'
                }`}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(product?.stock || 0) <= 0}
                  >
                    -
                  </button>
                  <span className={`px-4 py-2 border-x ${
                    (product?.stock || 0) <= 0 
                      ? 'border-gray-200 text-gray-400' 
                      : 'border-gray-300'
                  }`}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      if (product && quantity < product.stock) {
                        setQuantity(quantity + 1)
                      } else {
                        alert(`Estoque insuficiente. Disponível: ${product?.stock || 0} unidades`)
                      }
                    }}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={product && quantity >= product.stock || (product?.stock || 0) <= 0}
                  >
                    +
                  </button>
                </div>
                {(product?.stock || 0) <= 0 && (
                  <span className="text-sm text-gray-500">Produto fora de estoque</span>
                )}
              </div>

              <div className="flex space-x-4">
                <button 
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                    !isAuthenticated
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isInCart(product.id)
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                  disabled={!isAuthenticated}
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert('Faça login para adicionar produtos ao carrinho')
                      return
                    }

                    if (!product) return

                    if (quantity > product.stock) {
                      alert(`Estoque insuficiente. Disponível: ${product.stock} unidades`)
                      return
                    }

                    // Agregar la cantidad especificada al carrito
                    for (let i = 0; i < quantity; i++) {
                      addToCart({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.images[0]?.path ? (product.images[0].path.startsWith('http') ? product.images[0].path : `/api/images${product.images[0].path}`) : '/placeholder.jpg',
                        condition: product.condition,
                        aestheticCondition: product.aestheticCondition
                      })
                    }

                    alert(`Adicionado ao carrinho: ${quantity} unidades`)
                  }}
                >
                  {!isAuthenticated ? (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {'Entrar'}
                    </>
                  ) : isInCart(product.id) ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      {'No Carrinho'}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Adicionar ao Carrinho
                    </>
                  )}
                </button>
                <button className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tem dúvidas?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href="mailto:info@markettech.com"
                  className="flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email
                </a>
                <a
                  href="tel:+15551234567"
                  className="flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Ligar
                </a>
                <a
                  href="https://wa.me/15551234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Especificações</h2>
          <div className="bg-white border rounded-lg p-8 shadow-sm">
            <div className="w-full">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base break-words p-6 bg-gray-50 rounded-lg border">
                <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                  {product.specifications}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avaliações</h2>
          
          {/* Rating Form */}
          <div className="mb-8">
            <ProductRatingForm 
              productId={productId}
              onRatingSubmit={() => fetchRatings()}
              existingRating={userRating}
            />
          </div>

          {/* Ratings List */}
          {ratings.length > 0 ? (
            <div className="space-y-6">
              {ratings.map((rating) => (
                <div key={rating.id} className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-600 font-semibold">
                          {rating.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{rating.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={rating.rating} size="sm" />
                  </div>
                  
                  {rating.comment && (
                    <p className="text-gray-700">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">{'Nenhuma avaliação encontrada'}</p>
              <p className="text-gray-400 text-sm">{'Seja o primeiro a avaliar este produto'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
