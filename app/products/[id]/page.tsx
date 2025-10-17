'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react'
import Link from 'next/link'

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

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    // Simular carga del producto
    const mockProduct: Product = {
      id: params.id as string,
      title: 'iPhone 15 Pro Max 256GB',
      description: 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP. Diseño premium en titanio con pantalla Super Retina XDR de 6.7 pulgadas. Perfecto para fotografía profesional y gaming intensivo.',
      price: 1299.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Pantalla 6.7" Super Retina XDR, Chip A17 Pro, 256GB almacenamiento, iOS 17, Cámara principal 48MP, Cámara ultra gran angular 12MP, Cámara teleobjetivo 12MP, Resistencia al agua IP68',
      images: [
        { url: '/placeholder-phone.jpg', alt: 'iPhone 15 Pro Max frontal' },
        { url: '/placeholder-phone2.jpg', alt: 'iPhone 15 Pro Max trasera' },
        { url: '/placeholder-phone3.jpg', alt: 'iPhone 15 Pro Max lateral' }
      ]
    }
    setProduct(mockProduct)
  }, [params.id])

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  const getConditionText = (condition: string) => {
    return condition === 'NEW' ? 'Nuevo' : 'Usado'
  }

  const getConditionColor = (condition: string) => {
    return condition === 'NEW' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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
          Volver a Productos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]?.url || '/placeholder.jpg'}
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
                    src={image.url}
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
                  Condición estética: {product.aestheticCondition}/10
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600 ml-2">(4.8) - 127 reseñas</span>
              </div>

              <div className="text-4xl font-bold text-gray-900 mb-6">
                ${product.price.toLocaleString()}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Especificaciones</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{product.specifications}</p>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Agregar al Carrito
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Tienes preguntas?</h3>
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
                  Llamar
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
      </div>
    </div>
  )
}
