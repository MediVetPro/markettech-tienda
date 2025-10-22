'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Smartphone, Banknote, Shield, ArrowLeft, Check, Clock, User, Mail, Phone, MapPin } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import PixPayment from '@/components/PixPayment'
// Removed direct Prisma imports - now using API routes
interface PaymentMethod {
  id: string
  type: string
  name: string
  description: string
  icon: React.ReactNode
  processingTime: string
  fee: string
  available: boolean
}

export default function CheckoutPage() {
  console.log('🚚 [DEBUG] CheckoutPage renderizado')
  const router = useRouter()
  const { items: cartItems, clearCart, getTotalPrice } = useCart()
  const { user, isAuthenticated, loading, isInitialized } = useAuth()
  console.log('🚚 [DEBUG] Estado inicial - isAuthenticated:', isAuthenticated, 'cartItems.length:', cartItems.length)
    
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true)
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false)
  const [error, setError] = useState<string>('')
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
    state: user?.state || ''
  })
  
  // Estado para datos de tarjeta
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  // Estado para pago PIX
  const [pixPayment, setPixPayment] = useState<any>(null)
  const [showPixPayment, setShowPixPayment] = useState(false)
  const [shippingMessage, setShippingMessage] = useState('Frete Grátis para Curitiba - Região Urbana')
  const [shippingCost, setShippingCost] = useState(0)
  const [shippingCostMessage, setShippingCostMessage] = useState('')

  // Função para carregar métodos de pagamento habilitados
  const fetchPaymentMethods = async () => {
    try {
      setIsLoadingPaymentMethods(true)
      const response = await fetch('/api/payment-methods')
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods')
      }
      
      const data = await response.json()
      
      // Mapear los métodos con sus iconos correspondientes
      const methodsWithIcons = data.paymentMethods.map((method: any) => ({
        ...method,
        icon: getPaymentMethodIcon(method.type)
      }))
      
      setPaymentMethods(methodsWithIcons)
      setHasPaymentMethods(methodsWithIcons.length > 0)
      
      // Selecionar automaticamente a opção "Direto com o vendedor" se estiver disponível
      const directSellerMethod = methodsWithIcons.find((m: any) => m.type === 'DIRECT_SELLER')
      if (directSellerMethod) {
        setSelectedPayment(directSellerMethod.id)
      }
      
      console.log('✅ Métodos de pagamento carregados:', methodsWithIcons.map((m: any) => m.type).join(', '))
    } catch (error) {
      console.error('❌ Erro ao carregar métodos de pagamento:', error)
      // Em caso de erro, não há métodos de pagamento disponíveis
      setPaymentMethods([])
      setHasPaymentMethods(false)
    } finally {
      setIsLoadingPaymentMethods(false)
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'DIRECT_SELLER':
        return <User className="w-6 h-6" />
      case 'PIX':
        return <Smartphone className="w-6 h-6" />
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard className="w-6 h-6" />
      case 'BOLETO':
      case 'BANK_TRANSFER':
        return <Banknote className="w-6 h-6" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

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

  const calculateShippingCost = async () => {
    try {
      console.log('🚚 [DEBUG] Iniciando calculateShippingCost...')
      const orderTotal = getTotalPrice()
      console.log('🚚 [DEBUG] Total del pedido:', orderTotal)
      // Por ahora asumimos que es Curitiba, pero esto debería venir del formulario del usuario
      const region = 'curitiba' // TODO: Obtener de customerInfo.city
      console.log('🚚 [DEBUG] Región:', region)
      console.log('🚚 [DEBUG] Llamando a API de envío...')
      
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderTotal, region }),
      })
      
      const shipping = await response.json()
      console.log('🚚 [DEBUG] Resultado del cálculo:', shipping)
      setShippingCost(shipping.cost)
      setShippingCostMessage(shipping.message)
      console.log('🚚 [DEBUG] Estados actualizados - Costo:', shipping.cost, 'Mensaje:', shipping.message)
    } catch (error) {
      console.error('❌ [ERROR] Error calculating shipping cost:', error)
      setShippingCost(0)
      setShippingCostMessage('Erro ao calcular frete')
    }
  }

  useEffect(() => {
    console.log('🚚 [DEBUG] useEffect principal - isAuthenticated:', isAuthenticated, 'isInitialized:', isInitialized, 'cartItems.length:', cartItems.length)
    
    // Solo redirigir si no está autenticado y el contexto ya se inicializó
    if (!isAuthenticated && isInitialized) {
      console.log('🚚 [DEBUG] Usuario no autenticado, redirigiendo a login...')
      router.push('/login?redirect=/checkout')
      return
    }
    
    if (cartItems.length === 0 && isAuthenticated) {
      console.log('🚚 [DEBUG] Carrito vacío, redirigiendo a cart...')
      router.push('/cart')
      return
    }
    
    // Carregar métodos de pagamento quando o usuário estiver autenticado
      if (isAuthenticated) {
        console.log('🚚 [DEBUG] Usuario autenticado, ejecutando funciones...')
        fetchPaymentMethods()
        loadShippingMessage()
        calculateShippingCost()
      }
  }, [isAuthenticated, isInitialized, cartItems.length, router])

  // Recalcular envío cuando cambien los items del carrito
  useEffect(() => {
    console.log('🚚 [DEBUG] useEffect cartItems - isAuthenticated:', isAuthenticated, 'cartItems.length:', cartItems.length)
    if (isAuthenticated && cartItems.length > 0) {
      console.log('🚚 [DEBUG] Recalculando envío por cambio en carrito...')
      calculateShippingCost()
    }
  }, [cartItems, isAuthenticated])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Função para formatar número de cartão
  const formatCardNumber = (value: string) => {
    // Remover todos los caracteres no numéricos
    const cleaned = value.replace(/\D/g, '')
    
    // Aplicar formato con espacios cada 4 dígitos
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
    
    return formatted.slice(0, 19) // Máximo 16 dígitos + 3 espacios
  }

  // Função para formatar data de vencimento
  const formatExpiry = (value: string) => {
    // Remover todos los caracteres no numéricos
    const cleaned = value.replace(/\D/g, '')
    
    // Aplicar formato MM/YY
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  // Função para formatar CVV
  const formatCVV = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4)
  }

  // Gerenciar mudanças nos dados do cartão
  const handleCardDataChange = (field: string, value: string) => {
    let formattedValue = value
    
    switch (field) {
      case 'number':
        formattedValue = formatCardNumber(value)
        break
      case 'expiry':
        formattedValue = formatExpiry(value)
        break
      case 'cvv':
        formattedValue = formatCVV(value)
        break
      default:
        formattedValue = value
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  // Función para validar datos de tarjeta
  const isCardDataValid = () => {
    return !!(cardData.number?.trim() && cardData.expiry?.trim() && cardData.cvv?.trim() && cardData.name?.trim())
  }

  const handlePaymentSubmit = async () => {
    console.log('Iniciando proceso de pago...')
    console.log('Método de pago seleccionado:', selectedPayment)
    console.log('Información del cliente:', customerInfo)
    console.log('Items del carrito:', cartItems)

    // Se houver métodos de pagamento disponíveis, verificar se foi selecionado um
    if (hasPaymentMethods && !selectedPayment) {
      alert('Por favor, selecione um método de pagamento')
      return
    }

    if (!customerInfo.name || !customerInfo.email) {
      alert('Por favor, complete pelo menos o nome e e-mail')
      return
    }

    setIsProcessing(true)

    try {
      console.log('Procesando pago...')
      
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Criar ordem com sistema de comissões e perfil global
      const orderData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone || '',
        customerAddress: `${customerInfo.address || ''}, ${customerInfo.city || ''}, ${customerInfo.state || ''} ${customerInfo.zipCode || ''}`.trim(),
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: getTotalPrice() + shippingCost,
        paymentMethod: hasPaymentMethods ? selectedPayment : 'DIRECT_SELLER',
        userId: user?.id || null,
        commissionRate: 0.05, // 5% por defecto
        // Incluir dados do cartão se necessário
        ...(selectedPayment && (selectedPayment === 'credit_card' || selectedPayment === 'debit_card') && {
          cardData: {
            number: cardData.number.replace(/\s/g, ''), // Remover espacios para envío
            expiry: cardData.expiry,
            cvv: cardData.cvv,
            name: cardData.name
          }
        })
      }

      console.log('Datos de la orden con perfil global:', orderData)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      console.log('Respuesta de la API:', response.status)

      if (response.ok) {
        console.log('Orden creada exitosamente')
        const orderResponse = await response.json()
        
        // Salvar dados da ordem para mostrar na página de sucesso
        const finalPaymentMethod = hasPaymentMethods ? selectedPayment : 'NO_PAYMENT'
        console.log('🔍 Debug - hasPaymentMethods:', hasPaymentMethods)
        console.log('🔍 Debug - selectedPayment:', selectedPayment)
        console.log('🔍 Debug - finalPaymentMethod:', finalPaymentMethod)
        
        const orderDataForSuccess = {
          id: orderResponse.id,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          customerAddress: `${customerInfo.address || ''}, ${customerInfo.city || ''}, ${customerInfo.state || ''} ${customerInfo.zipCode || ''}`.trim(),
          total: getTotalPrice() + shippingCost,
          paymentMethod: finalPaymentMethod,
          createdAt: new Date().toISOString()
        }
        
        console.log('🔍 Debug - orderDataForSuccess:', orderDataForSuccess)
        localStorage.setItem('lastOrderData', JSON.stringify(orderDataForSuccess))
        
        // Gerenciar diferentes tipos de pagamento
        const selectedMethod = paymentMethods.find(method => method.id === selectedPayment)
        const isPixPayment = selectedMethod?.type === 'PIX'
        const isDirectSeller = selectedMethod?.type === 'DIRECT_SELLER'
        
        if (isPixPayment) {
          // Criar pagamento PIX
          try {
            const pixResponse = await fetch('/api/pix/create-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('smartesh_token')}`
              },
              body: JSON.stringify({
                orderId: orderResponse.id,
                amount: getTotalPrice() + shippingCost,
                description: `Pedido #${orderResponse.id} - ${customerInfo.name}`
              })
            })

            if (pixResponse.ok) {
              const pixData = await pixResponse.json()
              console.log('✅ PIX Payment creado:', pixData.payment)
              
              // Guardar datos del pedido en localStorage para la pantalla de confirmación
              const orderData = {
                id: orderResponse.id,
                customerName: customerInfo.name,
                customerEmail: customerInfo.email,
                customerPhone: customerInfo.phone,
                customerAddress: customerInfo.address,
                total: getTotalPrice() + shippingCost,
                paymentMethod: 'PIX',
                createdAt: new Date().toISOString()
              }
              localStorage.setItem('lastOrderData', JSON.stringify(orderData))
              console.log('💾 [PIX] Datos del pedido guardados en localStorage:', orderData)
              
              console.log('🔧 Estableciendo pixPayment...')
              setPixPayment(pixData.payment)
              console.log('🔧 Estableciendo showPixPayment=true...')
              setShowPixPayment(true)
              console.log('✅ Modal PIX configurado - NO redirigiendo automáticamente')
              // NO redirigir automáticamente para PIX - el modal se mantiene abierto
            } else {
              const errorData = await pixResponse.json()
              console.error('❌ Error creando pago PIX:', errorData)
              
              // Si falla la creación del pago PIX, eliminar el pedido creado
              try {
                await fetch('/api/orders', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('smartesh_token')}`
                  },
                  body: JSON.stringify({ orderId: orderResponse.id })
                })
                console.log('🗑️ Pedido eliminado debido a error en PIX')
              } catch (deleteError) {
                console.error('❌ Error eliminando pedido:', deleteError)
              }
              
              setError(`Error al crear el pago PIX: ${errorData.error || 'Error desconocido'}`)
              return
            }
          } catch (error) {
            console.error('Error creating PIX payment:', error)
            
            // Si falla la creación del pago PIX, eliminar el pedido creado
            try {
              await fetch('/api/orders', {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('smartesh_token')}`
                },
                body: JSON.stringify({ orderId: orderResponse.id })
              })
              console.log('🗑️ Pedido eliminado debido a error en PIX')
            } catch (deleteError) {
              console.error('❌ Error eliminando pedido:', deleteError)
            }
            
            setError(`Error al crear el pago PIX: ${error instanceof Error ? error.message : 'Error desconocido'}`)
            return
          }
        } else {
          // Redirecionar para página de confirmação para todos los otros métodos
          // (DIRECT_SELLER, CREDIT_CARD, DEBIT_CARD, BOLETO, BANK_TRANSFER, etc.)
          console.log('Redirigiendo a /checkout/success para método:', selectedMethod?.type || 'desconocido')
          router.push('/checkout/success')
        }
        
        // Solo limpiar carrito si NO es PIX (para PIX se limpia después del pago)
        if (!isPixPayment) {
          setTimeout(() => {
            clearCart()
          }, 1000)
        }
      } else {
        const errorData = await response.json()
        console.error('Error de la API:', errorData)
        throw new Error(`Error al procesar el pedido: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      // Gerenciar erros específicos de estoque
      if (errorMessage.includes('Stock insuficiente')) {
        alert(`❌ Erro de Estoque:\n\n${errorMessage}\n\nPor favor, ajuste a quantidade no seu carrinho ou remova o produto.`)
      } else if (errorMessage.includes('Produto com ID')) {
        alert(`❌ Erro de Produto:\n\n${errorMessage}\n\nUm dos produtos não está mais disponível.`)
      } else {
        alert(`❌ Erro ao processar o pagamento:\n\n${errorMessage}`)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Debug PIX modal
  useEffect(() => {
    console.log('🔍 Estado PIX:', { showPixPayment, pixPayment: !!pixPayment })
    if (showPixPayment && pixPayment) {
      console.log('✅ Modal PIX debería estar visible')
    } else if (showPixPayment && !pixPayment) {
      console.log('❌ showPixPayment=true pero pixPayment=null')
    } else if (!showPixPayment && pixPayment) {
      console.log('❌ pixPayment existe pero showPixPayment=false')
    }
  }, [showPixPayment, pixPayment])

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    console.log('Checkout: Carrito vacío detectado')
    console.log('CartItems:', cartItems)
    console.log('User:', user)
    console.log('IsAuthenticated:', isAuthenticated)
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Carrinho Vazio</h1>
          <p className="text-gray-600 mb-6">Não há produtos no seu carrinho</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Ver Productos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Carrinho
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
          <p className="text-gray-600 mt-2">Complete seu pedido de forma segura</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error en el Proceso de Pago
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setError('')}
                    className="text-sm font-medium text-red-800 hover:text-red-900"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Cliente */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos del Cliente */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Informação do Cliente
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={customerInfo.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="00000-000"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Rua, número, complemento"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={customerInfo.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary-600" />
                Método de Pagamento
              </h2>
              
              {isLoadingPaymentMethods ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
                  <span className="text-gray-600">Carregando métodos de pagamento...</span>
                </div>
              ) : hasPaymentMethods ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? method.type === 'DIRECT_SELLER' 
                            ? 'border-green-500 bg-green-50'
                            : 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''} ${
                        method.type === 'DIRECT_SELLER' ? 'border-green-200 hover:border-green-300' : ''
                      }`}
                      onClick={() => method.available && setSelectedPayment(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            selectedPayment === method.id 
                              ? method.type === 'DIRECT_SELLER'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-primary-100 text-primary-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {method.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{method.processingTime}</p>
                          <p className="text-sm font-medium text-gray-700">{method.fee}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <User className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      Não há métodos de pagamento configurados
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      Seu pedido será enviado ao vendedor e eles entrarão em contato com você para coordenar o pagamento.
                    </p>
                    <div className="bg-yellow-100 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Processo:</strong> O vendedor receberá seu pedido e entrará em contato para combinar a forma de pagamento mais conveniente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              
              {/* Formulario de tarjeta - aparece cuando se selecciona tarjeta */}
              {selectedPayment && (selectedPayment === 'credit_card' || selectedPayment === 'debit_card') && (
                <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      Informação do Cartão
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número do Cartão *
                        </label>
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={(e) => handleCardDataChange('number', e.target.value)}
                          placeholder="4532 1234 5678 9010"
                          className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          maxLength={19}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Vencimento *
                        </label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => handleCardDataChange('expiry', e.target.value)}
                          placeholder="12/28"
                          className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          maxLength={5}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={cardData.cvv}
                          onChange={(e) => handleCardDataChange('cvv', e.target.value)}
                          placeholder="123"
                          className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          maxLength={4}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome no Cartão *
                        </label>
                        <input
                          type="text"
                          value={cardData.name}
                          onChange={(e) => handleCardDataChange('name', e.target.value)}
                          placeholder="JUAN PEREZ SILVA"
                          className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Shield className="w-4 h-4 inline mr-2" />
                        <strong>Segurança:</strong> Seus dados estão protegidos com criptografia SSL. Não armazenamos informações de cartões.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-gray-600 text-sm">Quantidade: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">R$ {getTotalPrice().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Envio:</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-semibold" : "text-gray-900 font-semibold"}>
                    {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                <div className={`text-xs mb-2 ${shippingCost === 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {shippingCostMessage || shippingMessage}
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-primary-600">R$ {(getTotalPrice() + shippingCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <button
                onClick={handlePaymentSubmit}
                disabled={isProcessing || (hasPaymentMethods && !selectedPayment) || (selectedPayment === 'credit_card' || selectedPayment === 'debit_card') && !isCardDataValid()}
                className="w-full mt-6 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : hasPaymentMethods ? (
                  selectedPayment === 'direct-seller' ? (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Enviar Pedido ao Vendedor
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Finalizar Pedido
                    </>
                  )
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Enviar Pedido ao Vendedor
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                {selectedPayment === 'direct-seller' ? (
                  <>
                    <User className="w-3 h-3 inline mr-1" />
                    Coordenação direta com o vendedor
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 inline mr-1" />
                    Pagamento 100% seguro e criptografado
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Componente PIX Payment */}
      {showPixPayment && pixPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pagamento PIX
                </h2>
                <button
                  onClick={() => setShowPixPayment(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <PixPayment
                paymentId={pixPayment.id}
                amount={pixPayment.amount}
                description={`Pedido #${pixPayment.id} - ${customerInfo.name}`}
                onPaymentConfirmed={() => {
                  setShowPixPayment(false)
                  router.push('/checkout/success')
                }}
                onCartClear={() => {
                  console.log('🧹 [Checkout] Limpiando carrito después de pago PIX...')
                  clearCart()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
