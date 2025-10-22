'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Package, Mail, Phone, ArrowRight, Home, ShoppingBag, User, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Función para traducir métodos de pago al portugués
function getPaymentMethodText(paymentMethod: string) {
  switch (paymentMethod?.toLowerCase()) {
    case 'direct_seller':
    case 'direct-seller':
      return 'Direto com o vendedor'
    case 'pix':
      return 'PIX'
    case 'credit_card':
    case 'credit-card':
      return 'Cartão de crédito'
    case 'debit_card':
    case 'debit-card':
      return 'Cartão de débito'
    case 'bank_transfer':
    case 'bank-transfer':
      return 'Transferência bancária'
    case 'boleto':
      return 'Boleto bancário'
    case 'no_payment':
    case 'no-payment':
      return 'Pagamento direto com vendedor'
    default:
      return paymentMethod
  }
}

interface OrderData {
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  total: number
  paymentMethod: string
  createdAt: string
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
    const { user } = useAuth()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNoPaymentOrder, setIsNoPaymentOrder] = useState(false)
  const [pixPaymentStatus, setPixPaymentStatus] = useState<string | null>(null)
  const [isPixPaymentVerified, setIsPixPaymentVerified] = useState(false)

  useEffect(() => {
    // Obter dados da ordem do localStorage ou sessionStorage
    const storedOrderData = localStorage.getItem('lastOrderData')
    if (storedOrderData) {
      try {
        const order = JSON.parse(storedOrderData)
        console.log('🔍 Debug Success Page - order data:', order)
        console.log('🔍 Debug Success Page - paymentMethod:', order.paymentMethod)
        console.log('🔍 Debug Success Page - isNoPaymentOrder:', order.paymentMethod === 'NO_PAYMENT' || order.paymentMethod === 'direct-seller')
        setOrderData(order)
        setIsNoPaymentOrder(order.paymentMethod === 'NO_PAYMENT' || order.paymentMethod === 'direct-seller')
        
        // Si es un pago PIX, verificar el estado real del pago
        if (order.paymentMethod === 'PIX') {
          verifyPixPaymentStatus(order.id)
        } else {
          setIsPixPaymentVerified(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error parsing order data:', error)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyPixPaymentStatus = async (orderId: string) => {
    try {
      console.log('🔍 Verificando estado del pago PIX para orden:', orderId)
      
      // Buscar el pago PIX asociado a esta orden
      const response = await fetch(`/api/pix/check-payment-by-order?orderId=${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('smartesh_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Estado del pago PIX:', data.payment?.status)
        setPixPaymentStatus(data.payment?.status || 'UNKNOWN')
        
        // Si el pago no está confirmado, mostrar mensaje de error
        if (data.payment?.status !== 'PAID') {
          console.warn('⚠️ Pago PIX no confirmado:', data.payment?.status)
        }
      } else {
        console.error('❌ Error verificando estado del pago PIX')
        setPixPaymentStatus('ERROR')
      }
    } catch (error) {
      console.error('❌ Error verificando pago PIX:', error)
      setPixPaymentStatus('ERROR')
    } finally {
      setIsPixPaymentVerified(true)
      setIsLoading(false)
    }
  }

  if (isLoading || (orderData?.paymentMethod === 'PIX' && !isPixPaymentVerified)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {orderData?.paymentMethod === 'PIX' ? 'Verificando estado del pago...' : 'Carregando detalhes do pedido...'}
          </p>
        </div>
      </div>
    )
  }

  // Si es un pago PIX y no está confirmado, mostrar error
  if (orderData?.paymentMethod === 'PIX' && pixPaymentStatus !== 'PAID') {
    // Limpiar localStorage cuando hay error de PIX
    useEffect(() => {
      localStorage.removeItem('lastOrderData')
    }, [])

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Error en el Pago
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              El pago PIX no se ha completado correctamente
            </p>
            <p className="text-gray-500">
              Estado del pago: <span className="font-semibold text-red-600">{pixPaymentStatus || 'Desconocido'}</span>
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-red-800 mb-4">¿Qué pasó?</h2>
            <div className="space-y-3 text-red-700">
              <p>• El pago PIX no se procesó correctamente</p>
              <p>• Puede que el pago haya expirado o haya habido un error</p>
              <p>• Tu pedido no se ha confirmado</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                localStorage.removeItem('lastOrderData')
                router.push('/checkout')
              }}
              className="flex items-center justify-center bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Intentar Nuevamente
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('lastOrderData')
                router.push('/')
              }}
              className="flex items-center justify-center bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          {isNoPaymentOrder ? (
            <>
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-yellow-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Pedido Enviado ao Vendedor
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Seu pedido foi enviado com sucesso
              </p>
              <p className="text-gray-500">
                ID do Pedido: <span className="font-semibold text-gray-900">{orderData?.id || 'N/A'}</span>
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Pedido Confirmado
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Seu pedido foi processado com sucesso
              </p>
              <p className="text-gray-500">
                ID do Pedido: <span className="font-semibold text-gray-900">{orderData?.id || 'N/A'}</span>
              </p>
            </>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Package className="w-6 h-6 mr-2 text-primary-600" />
            Detalhes do Pedido
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Informação do Cliente</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Nome:</strong> {orderData?.customerName || user?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {orderData?.customerEmail || user?.email || 'N/A'}</p>
                <p><strong>Telefone:</strong> {orderData?.customerPhone || user?.phone || 'N/A'}</p>
                <p><strong>Endereço:</strong> {orderData?.customerAddress || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                {isNoPaymentOrder ? 'Informação do Pedido' : 'Informação de Pagamento'}
              </h3>
              <div className="space-y-2 text-gray-600">
                {isNoPaymentOrder ? (
                  <>
                    <p><strong>Estado:</strong> <span className="text-yellow-600 font-semibold">Enviado ao Vendedor</span></p>
                    <p><strong>Pagamento:</strong> <span className="text-orange-600 font-semibold">Nenhum dinheiro foi cobrado</span></p>
                    <p><strong>Total:</strong> R$ {orderData?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'}</p>
                    <p><strong>Data:</strong> {orderData?.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Método:</strong> {getPaymentMethodText(orderData?.paymentMethod || 'PIX')}</p>
                    <p><strong>Estado:</strong> <span className="text-green-600 font-semibold">Confirmado</span></p>
                    <p><strong>Total:</strong> R$ {orderData?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'}</p>
                    <p><strong>Data:</strong> {orderData?.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                    
                    {/* Mensaje especial para pagos directos con vendedor */}
                    {orderData?.paymentMethod === 'DIRECT_SELLER' && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Pagamento não processado
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Nenhum valor foi cobrado do seu cartão ou conta. O vendedor entrará em contato 
                                para acordar a forma de pagamento mais conveniente para ambas as partes.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {isNoPaymentOrder ? 'O que vem a seguir?' : 'Próximos Passos'}
          </h2>
          
          <div className="space-y-4">
            {isNoPaymentOrder ? (
              <>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">O vendedor receberá seu pedido</h3>
                    <p className="text-gray-600">Seu pedido foi enviado ao vendedor e aparecerá em seu painel de administração.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Eles entrarão em contato em breve</h3>
                    <p className="text-gray-600">O vendedor entrará em contato com você para coordenar a forma de pagamento mais conveniente.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Nenhum dinheiro foi cobrado</h3>
                    <p className="text-gray-600">Nenhum pagamento foi processado. Apenas as informações do seu pedido foram enviadas ao vendedor.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Você receberá um e-mail de confirmação</h3>
                    <p className="text-gray-600">Enviaremos todos os detalhes do seu pedido por e-mail.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Processaremos seu pedido</h3>
                    <p className="text-gray-600">Nossa equipe preparará seu pedido para o envio.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Notificaremos você quando estiver pronto</h3>
                    <p className="text-gray-600">Você receberá uma notificação quando seu pedido estiver pronto para envio.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className={`rounded-xl p-8 mb-8 ${isNoPaymentOrder ? 'bg-yellow-50' : 'bg-primary-50'}`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isNoPaymentOrder ? 'Precisa de ajuda?' : 'Precisa de ajuda?'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isNoPaymentOrder 
              ? 'Se você tiver alguma pergunta sobre seu pedido ou precisar modificar algo, pode entrar em contato conosco diretamente.'
              : 'Se você tiver alguma pergunta sobre seu pedido ou precisar modificar algo, pode entrar em contato conosco diretamente.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:info@markettech.com"
              className="flex items-center justify-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-100 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email
            </a>
            <a
              href="tel:+5511999999999"
              className="flex items-center justify-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-100 transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Ligar Agora
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </button>
          
          <button
            onClick={() => router.push('/products')}
            className="flex items-center justify-center bg-white text-primary-600 border border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continuar Comprando
          </button>
        </div>
      </div>
    </div>
  )
}
