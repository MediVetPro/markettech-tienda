'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Package, Clock, CheckCircle, XCircle, Truck, RotateCcw } from 'lucide-react'

interface Order {
  id: string
  status: string
  total: number
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      title: string
      images: {
        path: string
      }[]
    }
  }[]
}

export default function OrdersPage() {
  const { user, isAuthenticated, isInitialized } = useAuth()
    const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      router.push('/login')
      return
    }
    
    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated, isInitialized, router])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('smartesh_token')
      
      if (!token) {
        setError('Não há token de autenticação')
        return
      }

      const response = await fetch('/api/orders?user=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setError(null) // Limpiar cualquier error previo
        console.log('📦 Pedidos carregados:', data.orders)
      } else {
        const errorData = await response.json()
        console.error('❌ [API] Error cargando pedidos:', response.status, errorData)
        
        if (response.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.')
          // Redirigir al login después de un breve delay
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          setError(errorData.message || 'Erro ao carregar os pedidos')
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setError('Erro ao carregar os pedidos')
    } finally {
      setLoading(false)
    }
  }


  const canCancelOrder = (order: Order) => {
    // Só é possível cancelar pedidos que ainda não foram pagos
    return order.status === 'PENDING' || order.status === 'PENDING_NO_PAYMENT'
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este pedido? O vendedor será notificado sobre o cancelamento.')) {
      return
    }

    try {
      setCancellingOrder(orderId)
      const token = localStorage.getItem('smartesh_token')
      
      if (!token) {
        alert('Não há token de autenticação')
        return
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'CANCELLED'
        })
      })

      if (response.ok) {
        alert('Pedido cancelado com sucesso. O vendedor foi notificado.')
        // Recargar los pedidos
        loadOrders()
      } else {
        const errorData = await response.json()
        alert(`Erro ao cancelar pedido: ${errorData.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Erro ao cancelar pedido')
    } finally {
      setCancellingOrder(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'PENDING_NO_PAYMENT':
        return <Clock className="w-5 h-5 text-orange-500" />
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'PREPARING':
        return <Package className="w-5 h-5 text-purple-500" />
      case 'IN_TRANSIT':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'DEVOLUCION':
        return <RotateCcw className="w-5 h-5 text-red-500" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
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
      case 'DEVOLUCION':
        return 'Devolução'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
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
        return 'bg-blue-100 text-blue-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'DEVOLUCION':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodText = (paymentMethod: string) => {
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
      case 'no_payment':
      case 'no-payment':
        return 'Pagamento direto com vendedor'
      default:
        return paymentMethod
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
            <p className="text-gray-600">Gerencie e revise o status dos seus pedidos</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Você não tem pedidos</h2>
            <p className="text-gray-600 mb-6">Você ainda não fez nenhum pedido. Explore nossos produtos!</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Ver Produtos
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    {canCancelOrder(order) && (
                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={() => cancelOrder(order.id)}
                          disabled={cancellingOrder === order.id}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {cancellingOrder === order.id ? 'Cancelando...' : 'Cancelar Pedido'}
                        </button>
                        <div className="text-xs text-gray-500 text-right max-w-xs">
                          <p className="font-medium text-green-600">✓ Pedido pode ser cancelado</p>
                          <p>Você pode cancelar pedidos que ainda não foram pagos ou processados.</p>
                        </div>
                      </div>
                    )}
                    
                    {!canCancelOrder(order) && (
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-xs text-gray-500 text-right max-w-xs">
                          <p className="font-medium text-red-600">✗ Cancelamento não permitido</p>
                          <p>
                            {order.status === 'CONFIRMED' && 'Pedido já foi confirmado e não pode ser cancelado.'}
                            {order.status === 'PREPARING' && 'Pedido está sendo preparado e não pode ser cancelado.'}
                            {order.status === 'IN_TRANSIT' && 'Pedido está em trânsito e não pode ser cancelado.'}
                            {order.status === 'DELIVERED' && 'Pedido já foi entregue e não pode ser cancelado.'}
                            {order.status === 'CANCELLED' && 'Este pedido já foi cancelado.'}
                            {order.status === 'DEVOLUCION' && 'Este pedido está em processo de devolução.'}
                            {!['CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DEVOLUCION'].includes(order.status) && 
                              'Este pedido não pode ser cancelado no momento.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Informações do Pedido</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Método de Pagamento:</strong> {getPaymentMethodText(order.paymentMethod)}</p>
                      <p><strong>Cliente:</strong> {order.customerName}</p>
                      <p><strong>Email:</strong> {order.customerEmail}</p>
                      {order.customerPhone && (
                        <p><strong>Telefone:</strong> {order.customerPhone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Endereço de Entrega</h4>
                    <p className="text-sm text-gray-600">{order.customerAddress || 'Não especificado'}</p>
                  </div>
                </div>

                {order.status === 'PENDING_NO_PAYMENT' && (
                  <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Pagamento Direto com Vendedor
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Este pedido será pago diretamente com o vendedor. Entre em contato para acordar a forma e momento do pagamento.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {order.notes}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Produtos</h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-shrink-0">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0].path.startsWith('http') ? 
                                item.product.images[0].path : 
                                `/api/images${item.product.images[0].path}`}
                              alt={item.product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-lg">{item.product.title}</h5>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              Qtd: {item.quantity}
                            </span>
                            <span>Preço unitário: R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            R$ {(item.quantity * item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-gray-500">Total do item</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}