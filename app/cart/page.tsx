'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
export default function CartPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const { user, isAuthenticated, loading, isInitialized } = useAuth()
  
  // Estados para el cálculo de envío
  const [shippingCost, setShippingCost] = useState(0)
  const [shippingMessage, setShippingMessage] = useState('Frete Grátis para Curitiba - Região Urbana')
  
  // Función para cargar el mensaje de envío
  const loadShippingMessage = async () => {
    try {
      const response = await fetch('/api/shipping')
      const config = await response.json()
      setShippingMessage(config.message)
    } catch (error) {
      console.error('Error loading shipping message:', error)
    }
  }

  // Función para calcular el costo de envío
  const calculateShippingCost = async () => {
    try {
      console.log('🚚 [CART] Calculando envío - Total:', totalPrice)
      const region = 'curitiba' // TODO: Obtener de customerInfo.city
      
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderTotal: totalPrice, region }),
      })
      
      const shipping = await response.json()
      console.log('🚚 [CART] Resultado del cálculo:', shipping)
      setShippingCost(shipping.cost)
      setShippingMessage(shipping.message)
    } catch (error) {
      console.error('Error calculating shipping cost:', error)
      setShippingCost(0)
      setShippingMessage('Erro ao calcular frete')
    }
  }
  
  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    // Verificar estoque antes de atualizar a quantidade
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const product = await response.json()
        if (newQuantity > product.stock) {
          alert(`❌ Estoque insuficiente\n\nHá apenas ${product.stock} unidades disponíveis de "${product.title}".\n\nQuantidade solicitada: ${newQuantity}`)
          return
        }
      }
    } catch (error) {
      console.warn('Error verificando stock:', error)
    }

    updateQuantity(productId, newQuantity)
  }

  // useEffect para cargar el mensaje de envío y calcular el costo
  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      loadShippingMessage()
      calculateShippingCost()
    }
  }, [isAuthenticated, items.length])

  // Recalcular envío cuando cambie el total del carrito
  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      calculateShippingCost()
    }
  }, [totalPrice, isAuthenticated])

  const handleCheckout = async () => {
    console.log('Iniciando checkout desde carrito...')
    console.log('Items en carrito:', items)
    console.log('Total items:', totalItems)
    console.log('Total price:', totalPrice)
    
    // Verificar estoque de todos os produtos antes de prosseguir para o checkout
    try {
      const stockChecks = await Promise.all(
        items.map(async (item) => {
          const response = await fetch(`/api/products/${item.id}`)
          if (response.ok) {
            const product = await response.json()
            return {
              product,
              item,
              hasStock: product.stock >= item.quantity
            }
          }
          return { product: null, item, hasStock: false }
        })
      )

      const outOfStock = stockChecks.filter(check => !check.hasStock)
      
      if (outOfStock.length > 0) {
        const outOfStockMessage = outOfStock.map(check => 
          `• ${check.product?.title || 'Produto'}: Disponível ${check.product?.stock || 0}, Solicitado ${check.item.quantity}`
        ).join('\n')
        
        alert(`❌ Estoque insuficiente\n\nOs seguintes produtos não têm estoque suficiente:\n\n${outOfStockMessage}\n\nPor favor, ajuste as quantidades no seu carrinho.`)
        return
      }
    } catch (error) {
      console.warn('Error verificando stock antes del checkout:', error)
    }
    
    // Redirecionar para a página de checkout usando o router do Next.js
    router.push('/checkout')
  }

  // Verificar autenticação
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login?redirect=/cart')
      return
    }
  }, [isAuthenticated, isInitialized, router])

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, não mostrar nada (já foi redirecionado)
  if (!isAuthenticated) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/products" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Produtos
          </Link>
          
          <div className="text-center py-12">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Carrinho Vazio</h1>
            <p className="text-gray-600 mb-8">Adicione produtos ao seu carrinho para continuar</p>
            <Link
              href="/products"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Ver Produtos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/products" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Produtos
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrinho de Compras</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Produtos ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">
                        Condição: {item.condition === 'NEW' ? 'Novo' : 'Usado'} | 
                        Estética: {item.aestheticCondition}/10
                      </p>
                      <p className="text-lg font-bold text-primary-600">
                        R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors flex items-center mt-2"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                
                {/* Mensaje informativo sobre el envío */}
                <div className={`text-xs ${shippingCost === 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {shippingMessage}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Impostos</span>
                  <span className="font-semibold">R$ 0,00</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">R$ {(totalPrice + shippingCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors mb-4"
              >
                Finalizar Compra
              </button>
              
              <button
                onClick={clearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Limpar Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}