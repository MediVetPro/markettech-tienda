'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, Package, User, Mail, Phone, MapPin, CreditCard, Calendar, CheckCircle, XCircle, Truck, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    title: string
    images?: Array<{
      path: string
      filename: string
      alt?: string
    }>
  }
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  total: number
  status: string
  paymentStatus?: string
  shippingStatus?: string
  createdAt: string
  updatedAt?: string
  items: OrderItem[]
  notes?: string
}

export default function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
    const { isAdmin, isAdminVendas, isAnyAdmin } = useAuth()

  useEffect(() => {
    if (!isAnyAdmin) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      return
    }
    
    fetchOrder()
  }, [isAnyAdmin, params.id])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      
      console.log('🔍 [ADMIN] Cargando pedido con ID:', params.id)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('❌ [ADMIN] No hay token de autenticación')
        alert('No hay token de autenticación')
        return
      }
      
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('🔍 [ADMIN] Respuesta del servidor:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [ADMIN] Pedido cargado:', data)
        console.log('✅ [ADMIN] Estructura de datos:', {
          hasOrder: !!data.order,
          orderKeys: data.order ? Object.keys(data.order) : [],
          directKeys: Object.keys(data)
        })
        // La API retorna { order: {...} }, necesitamos extraer el objeto order
        const orderData = data.order || data
        console.log('✅ [ADMIN] Datos del pedido extraídos:', {
          id: orderData.id,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          total: orderData.total,
          items: orderData.items?.length || 0
        })
        setOrder(orderData)
      } else {
        const errorData = await response.json()
        console.error('❌ [ADMIN] Error cargando pedido:', errorData.error)
        if (response.status === 403) {
          alert('No tienes permisos para ver este pedido')
          window.location.href = '/admin/orders'
        } else {
          alert('Erro ao carregar pedido. Tente novamente.')
        }
      }
    } catch (error) {
      console.error('❌ [ADMIN] Error fetching order:', error)
      alert('Erro ao carregar pedido. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        alert('No hay token de autenticación')
        return
      }

      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Estado actualizado a: ${getStatusText(newStatus)}`
        })
      })

      if (response.ok) {
        setOrder(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null)
        
        // Mensaje especial para devoluciones
        if (newStatus === 'DEVOLUCION') {
          alert(`Estado del pedido actualizado a: ${getStatusText(newStatus)}\n\n✅ El stock de los productos ha sido restaurado automáticamente.`)
        } else {
          alert(`Estado del pedido actualizado a: ${getStatusText(newStatus)}`)
        }
      } else {
        const errorData = await response.json()
        alert(`Error al actualizar el estado: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado del pedido')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!order) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        alert('No hay token de autenticación')
        return
      }

      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentStatus: newPaymentStatus,
          notes: `Estado de pago actualizado a: ${getPaymentStatusText(newPaymentStatus)}`
        })
      })

      if (response.ok) {
        setOrder(prev => prev ? { ...prev, paymentStatus: newPaymentStatus, updatedAt: new Date().toISOString() } : null)
        alert(`Estado de pago actualizado a: ${getPaymentStatusText(newPaymentStatus)}`)
      } else {
        const errorData = await response.json()
        alert(`Error al actualizar el estado de pago: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error changing payment status:', error)
      alert('Error al actualizar el estado de pago del pedido')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleShippingStatusChange = async (newShippingStatus: string) => {
    if (!order) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        alert('No hay token de autenticación')
        return
      }

      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingStatus: newShippingStatus,
          notes: `Estado de envío actualizado a: ${getShippingStatusText(newShippingStatus)}`
        })
      })

      if (response.ok) {
        setOrder(prev => prev ? { ...prev, shippingStatus: newShippingStatus, updatedAt: new Date().toISOString() } : null)
        alert(`Estado de envío actualizado a: ${getShippingStatusText(newShippingStatus)}`)
      } else {
        const errorData = await response.json()
        alert(`Error al actualizar el estado de envío: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error changing shipping status:', error)
      alert('Error al actualizar el estado de envío del pedido')
    } finally {
      setIsUpdating(false)
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

  // Funciones para estados de pago
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente'
      case 'PAID':
        return 'Pago'
      case 'FAILED':
        return 'Falhou'
      case 'REFUNDED':
        return 'Reembolsado'
      default:
        return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Funciones para estados de envío
  const getShippingStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente'
      case 'CONFIRMED':
        return 'Confirmado'
      case 'PREPARING':
        return 'Preparando'
      case 'IN_TRANSIT':
        return 'Em Trânsito'
      case 'DELIVERED':
        return 'Entregue'
      case 'RETURNED':
        return 'Devolvido'
      default:
        return status
    }
  }

  const getShippingStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800'
      case 'IN_TRANSIT':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'RETURNED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'PENDING_NO_PAYMENT':
        return <Clock className="w-4 h-4" />
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />
      case 'PREPARING':
        return <Package className="w-4 h-4" />
      case 'IN_TRANSIT':
        return <Truck className="w-4 h-4" />
      case 'DELIVERED':
        return <Package className="w-4 h-4" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'DEVOLUCION':
        return <XCircle className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedido...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h1>
          <p className="text-gray-600 mb-8">O pedido que você está procurando não existe.</p>
          <Link
            href="/admin/orders"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Voltar aos Pedidos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/orders" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Pedidos
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Detalhes do Pedido #{order.id || 'N/A'}</h1>
              <p className="text-gray-600">Visualizar e gerenciar pedido</p>
            </div>
            <div className="mt-4 sm:mt-0 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus || 'PENDING')}`}>
                  <CreditCard className="w-4 h-4" />
                  <span className="ml-2">Pago: {getPaymentStatusText(order.paymentStatus || 'PENDING')}</span>
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getShippingStatusColor(order.shippingStatus || 'PENDING')}`}>
                  <Package className="w-4 h-4" />
                  <span className="ml-2">Envío: {getShippingStatusText(order.shippingStatus || 'PENDING')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium text-gray-900">{order.customerName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{order.customerEmail || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium text-gray-900">{order.customerPhone || 'N/A'}</p>
                  </div>
                </div>
                {order.customerAddress && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Endereço</p>
                      <p className="font-medium text-gray-900">{order.customerAddress || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0].path.startsWith('http') ? 
                          item.product.images[0].path : 
                          `/api/images${item.product.images[0].path}`}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                      <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-sm text-gray-600">Total: R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum item encontrado neste pedido.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Observações</h2>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R$ {order.total ? order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-medium">Grátis</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">R$ {order.total ? order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status Management */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de Pago</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentStatusChange('PENDING')}
                  disabled={isUpdating || order.paymentStatus === 'PENDING'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.paymentStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Pendente
                </button>
                <button
                  onClick={() => handlePaymentStatusChange('PAID')}
                  disabled={isUpdating || order.paymentStatus === 'PAID'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pago
                </button>
                <button
                  onClick={() => handlePaymentStatusChange('FAILED')}
                  disabled={isUpdating || order.paymentStatus === 'FAILED'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.paymentStatus === 'FAILED'
                      ? 'bg-red-100 text-red-800 cursor-not-allowed'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Falhou
                </button>
                <button
                  onClick={() => handlePaymentStatusChange('REFUNDED')}
                  disabled={isUpdating || order.paymentStatus === 'REFUNDED'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.paymentStatus === 'REFUNDED'
                      ? 'bg-orange-100 text-orange-800 cursor-not-allowed'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reembolsado
                </button>
              </div>
            </div>

            {/* Shipping Status Management */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de Envío</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleShippingStatusChange('PENDING')}
                  disabled={isUpdating || order.shippingStatus === 'PENDING'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.shippingStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Pendente
                </button>
                <button
                  onClick={() => handleShippingStatusChange('CONFIRMED')}
                  disabled={isUpdating || order.shippingStatus === 'CONFIRMED'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.shippingStatus === 'CONFIRMED'
                      ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmado
                </button>
                <button
                  onClick={() => handleShippingStatusChange('PREPARING')}
                  disabled={isUpdating || order.shippingStatus === 'PREPARING'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.shippingStatus === 'PREPARING'
                      ? 'bg-purple-100 text-purple-800 cursor-not-allowed'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Preparando
                </button>
                <button
                  onClick={() => handleShippingStatusChange('IN_TRANSIT')}
                  disabled={isUpdating || order.shippingStatus === 'IN_TRANSIT'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.shippingStatus === 'IN_TRANSIT'
                      ? 'bg-indigo-100 text-indigo-800 cursor-not-allowed'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Em Trânsito
                </button>
                <button
                  onClick={() => handleShippingStatusChange('DELIVERED')}
                  disabled={isUpdating || order.shippingStatus === 'DELIVERED'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.shippingStatus === 'DELIVERED'
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Entregue
                </button>
                <button
                  onClick={() => handleShippingStatusChange('RETURNED')}
                  disabled={isUpdating || order.shippingStatus === 'RETURNED'}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.shippingStatus === 'RETURNED'
                      ? 'bg-red-100 text-red-800 cursor-not-allowed'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Devolvido
                </button>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pedido criado</p>
                    <p className="text-xs text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Última atualização</p>
                      <p className="text-xs text-gray-600">{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
