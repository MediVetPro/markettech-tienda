'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
interface OrderItem {
  id: string
  quantity: number
  price: number
  sellerId?: string
  sellerName?: string
  sellerCommission?: number
  product: {
    id: string
    title: string
    images: string[]
    user?: {
      id: string
      name: string
    }
  }
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  updatedAt: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  notes?: string
  paymentMethod: string
  commissionRate: number
  platformFee?: number
  globalPaymentProfile?: {
    companyName: string
    email: string
    bankName: string
  }
  items: OrderItem[]
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isAuthenticated, loading, isInitialized } = useAuth()
    
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      router.push('/login?redirect=/orders')
      return
    }
    
    if (isAuthenticated) {
      fetchOrder()
    }
  }, [isAuthenticated, isInitialized, router, params.id])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch order')
      }
      
      const data = await response.json()
      setOrder(data.order)
      
      console.log('✅ Order details loaded successfully')
    } catch (error) {
      console.error('❌ Error fetching order details:', error)
      router.push('/orders')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING_NO_PAYMENT':
        return 'bg-orange-100 text-orange-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800'
      case 'IN_TRANSIT':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'DEVOLUCION':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente'
      case 'PENDING_NO_PAYMENT':
        return 'Sem Pagamento'
      case 'CONFIRMED':
        return 'Confirmado'
      case 'PREPARING':
        return 'Preparando'
      case 'IN_TRANSIT':
        return 'Em Trânsito'
      case 'DELIVERED':
        return 'Entregue'
      case 'COMPLETED':
        return 'Completado'
      case 'DEVOLUCION':
        return 'Devolução'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'PENDING_NO_PAYMENT':
        return <AlertCircle className="w-4 h-4" />
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />
      case 'PREPARING':
        return <Package className="w-4 h-4" />
      case 'IN_TRANSIT':
        return <Truck className="w-4 h-4" />
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'DEVOLUCION':
        return <XCircle className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Seu pedido está sendo processado. Te notificaremos quando for confirmado.'
      case 'PENDING_NO_PAYMENT':
        return 'Seu pedido está pendente de pagamento. Entre em contato com o vendedor para coordenar o pagamento. De qualquer forma, o vendedor entrará em contato caso não o faça.'
      case 'CONFIRMED':
        return 'Seu pedido foi confirmado e está sendo preparado.'
      case 'PREPARING':
        return 'Seu pedido está sendo preparado para o envio.'
      case 'IN_TRANSIT':
        return 'Seu pedido está em trânsito com a empresa de envio.'
      case 'DELIVERED':
        return 'Seu pedido foi entregue com sucesso.'
      case 'COMPLETED':
        return 'Seu pedido foi completado com sucesso.'
      case 'DEVOLUCION':
        return 'Seu pedido está em processo de devolução.'
      case 'CANCELLED':
        return 'Seu pedido foi cancelado.'
      default:
        return 'Estado desconhecido'
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'pix':
        return 'PIX'
      case 'direct_seller':
      case 'direct-seller':
        return 'Direto com o vendedor'
      case 'credit_card':
      case 'credit-card':
        return 'Cartão de Crédito'
      case 'debit_card':
      case 'debit-card':
        return 'Cartão de Débito'
      case 'bank_transfer':
      case 'bank-transfer':
        return 'Transferência bancária'
      case 'boleto':
        return 'Boleto Bancário'
      case 'no_payment':
      case 'no-payment':
        return 'Pagamento direto com vendedor'
      default:
        return method
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'pix':
        return <CreditCard className="w-5 h-5 text-blue-500" />
      case 'direct_seller':
      case 'direct-seller':
        return <User className="w-5 h-5 text-green-500" />
      case 'credit_card':
      case 'credit-card':
        return <CreditCard className="w-5 h-5 text-blue-500" />
      case 'debit_card':
      case 'debit-card':
        return <CreditCard className="w-5 h-5 text-blue-500" />
      case 'bank_transfer':
      case 'bank-transfer':
        return <Building className="w-5 h-5 text-purple-500" />
      case 'boleto':
        return <CreditCard className="w-5 h-5 text-orange-500" />
      case 'no_payment':
      case 'no-payment':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />
    }
  }

  // Agrupar items por vendedor
  const getSellerGroups = () => {
    if (!order) return []
    
    const sellerGroups = new Map()
    
    order.items.forEach(item => {
      const sellerName = item.sellerName || item.product.user?.name || 'Vendedor no disponible'
      const sellerId = item.sellerId || item.product.user?.id
      
      if (!sellerGroups.has(sellerName)) {
        sellerGroups.set(sellerName, {
          sellerName,
          sellerId,
          items: [],
          total: 0,
          commission: 0
        })
      }
      
      const group = sellerGroups.get(sellerName)
      group.items.push(item)
      group.total += item.price * item.quantity
      group.commission += item.sellerCommission || 0
    })
    
    return Array.from(sellerGroups.values())
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del pedido...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido no encontrado</h1>
          <p className="text-gray-600 mb-6">El pedido que buscas no existe o no tienes acceso a él</p>
          <Link
            href="/orders"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Volver a Mis Pedidos
          </Link>
        </div>
      </div>
    )
  }

  const sellerGroups = getSellerGroups()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pedido #{order.id.slice(-8)}
              </h1>
              <p className="text-gray-600 mt-2">
                Realizado el {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2">{getStatusText(order.status)}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informação Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado do Pedido */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado do Pedido</h2>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{getStatusText(order.status)}</h3>
                  <p className="text-sm text-gray-600">{getStatusDescription(order.status)}</p>
                </div>
              </div>
            </div>

            {/* Produtos por Vendedor */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Produtos por Vendedor</h2>
              <div className="space-y-6">
                {sellerGroups.map((group, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{group.sellerName}</h3>
                          <p className="text-sm text-gray-500">Vendedor</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-500">{group.items.length} producto(s)</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {group.items.map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <img
                            src={item.product.images && item.product.images[0] ? 
                              (item.product.images[0].path.startsWith('http') ? 
                                item.product.images[0].path : 
                                `/api/images${item.product.images[0].path}`) : 
                              '/placeholder.jpg'}
                            alt={item.product.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{item.product.title}</h4>
                            <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-gray-500">
                              R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} c/u
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informação do Cliente */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informação de Envio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">E-mail</p>
                    <p className="font-medium text-gray-900">{order.customerEmail}</p>
                  </div>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium text-gray-900">{order.customerPhone}</p>
                    </div>
                  </div>
                )}
                {order.customerAddress && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Endereço</p>
                      <p className="font-medium text-gray-900">{order.customerAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
              
              {/* Informação de Pagamento */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Informação de Pagamento</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    {getPaymentMethodIcon(order.paymentMethod)}
                    <div>
                      <p className="text-sm text-gray-500">Método de Pagamento</p>
                      <p className="font-medium text-gray-900">{getPaymentMethodText(order.paymentMethod)}</p>
                    </div>
                  </div>
                  
                  {order.globalPaymentProfile && (
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Empresa</p>
                        <p className="font-medium text-gray-900">{order.globalPaymentProfile.companyName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desglose de Vendedores */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Desglose por Vendedor</h3>
                <div className="space-y-2">
                  {sellerGroups.map((group, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{group.sellerName}</span>
                      <span className="font-medium text-gray-900">
                        R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-primary-600">
                    R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Informação de Envio */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <p className="text-gray-600 font-medium">
                    O custo do envio é conversado com o vendedor quando o contactarem
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}