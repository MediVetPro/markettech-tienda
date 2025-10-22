'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, Search, Filter, Calendar, User, DollarSign, ShoppingCart, Phone, Mail, MessageCircle, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

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
  userId?: string
  user?: {
    name: string
    email: string
  }
  items: Array<{
    productTitle: string
    productCode?: string
    quantity: number
    price: number
  }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
    const { canViewAllOrders, canManageProducts, user } = useAuth()

  useEffect(() => {
    if (!canViewAllOrders && !canManageProducts) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      return
    }
    
    fetchOrders()
  }, [canViewAllOrders, canManageProducts])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        setOrders([])
        return
      }

      // Determinar si es admin completo o admin de ventas
      const isAdminFull = user?.role === 'ADMIN'
      const url = isAdminFull ? '/api/orders' : '/api/orders?admin=true'
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      
      const data = await response.json()
      setOrders(data.orders || [])
      
      console.log('✅ Orders loaded successfully from database:', data.orders?.length || 0)
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      
      // Solo usar datos reales de la base de datos
      setOrders([])
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        alert('No hay token de autenticación')
        return
      }

      const response = await fetch(`/api/orders/${orderId}`, {
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
        // Actualizar la lista local
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        
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
      console.error('Error changing status:', error)
      alert('Error al actualizar el estado del pedido')
    }
  }

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        alert('No hay token de autenticación')
        return
      }

      const response = await fetch(`/api/orders/${orderId}`, {
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
        // Actualizar la lista local
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        ))
        
        alert(`Estado de pago actualizado a: ${getPaymentStatusText(newPaymentStatus)}`)
      } else {
        const errorData = await response.json()
        alert(`Error al actualizar el estado de pago: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error changing payment status:', error)
      alert('Error al actualizar el estado de pago del pedido')
    }
  }

  const handleShippingStatusChange = async (orderId: string, newShippingStatus: string) => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        alert('No hay token de autenticación')
        return
      }

      const response = await fetch(`/api/orders/${orderId}`, {
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
        // Actualizar la lista local
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, shippingStatus: newShippingStatus } : order
        ))
        
        alert(`Estado de envío actualizado a: ${getShippingStatusText(newShippingStatus)}`)
      } else {
        const errorData = await response.json()
        alert(`Error al actualizar el estado de envío: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error changing shipping status:', error)
      alert('Error al actualizar el estado de envío del pedido')
    }
  }

  const handleContactCustomer = (order: Order, contactType: 'phone' | 'email' | 'whatsapp') => {
    switch (contactType) {
      case 'phone':
        if (order.customerPhone) {
          window.open(`tel:${order.customerPhone}`, '_self')
        } else {
          alert('No hay número de teléfono disponible para este cliente')
        }
        break
      case 'email':
        if (order.customerEmail) {
          window.open(`mailto:${order.customerEmail}?subject=Pedido #${order.id}`, '_self')
        } else {
          alert('No hay email disponible para este cliente')
        }
        break
      case 'whatsapp':
        if (order.customerPhone) {
          const message = `Hola ${order.customerName}, te contactamos sobre tu pedido #${order.id} por R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
          window.open(`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
        } else {
          alert('No hay número de teléfono disponible para WhatsApp')
        }
        break
    }
  }

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order)
    setDeleteModalOpen(true)
  }

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        alert('No hay token de autenticación')
        return
      }

      const response = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        
        // Remover el pedido de la lista local
        setOrders(prev => prev.filter(order => order.id !== orderToDelete.id))
        
        // Mostrar mensaje con información sobre el stock
        if (result.stockRestored > 0) {
          alert(`✅ Pedido eliminado exitosamente\n\n📦 Stock restaurado: ${result.stockRestored} productos\n\n${result.stockRestoreReason}`)
        } else {
          alert(`✅ Pedido eliminado exitosamente\n\n⚠️ Stock NO restaurado: ${result.stockRestoreReason}`)
        }
        
        setDeleteModalOpen(false)
        setOrderToDelete(null)
      } else {
        const errorData = await response.json()
        alert(`Error al eliminar el pedido: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Error al eliminar el pedido')
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteOrder = () => {
    setDeleteModalOpen(false)
    setOrderToDelete(null)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Pedidos</h1>
          <p className="text-gray-600">Visualize e gerencie todos os pedidos da sua loja</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Filter className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sin Pago</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'PENDING_NO_PAYMENT').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Devoluciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'DEVOLUCION').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Pedidos
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Buscar por cliente, email ou ID..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todos os Status</option>
                <option value="PENDING">Pendente</option>
                <option value="PENDING_NO_PAYMENT">Sin Pago</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="PREPARING">Preparando</option>
                <option value="IN_TRANSIT">Em Trânsito</option>
                <option value="DELIVERED">Entregue</option>
                <option value="COMPLETED">Completado</option>
                <option value="DEVOLUCION">Devolução</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Pedidos ({filteredOrders.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado de Envío
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerEmail}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus || 'PENDING')}`}>
                        {getPaymentStatusText(order.paymentStatus || 'PENDING')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShippingStatusColor(order.shippingStatus || 'PENDING')}`}>
                        {getShippingStatusText(order.shippingStatus || 'PENDING')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-4 text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        {/* Botones de acción principales */}
                        <div className="flex items-center justify-center space-x-1">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-primary-600 hover:text-primary-900 p-1"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          {/* Botones de contacto para pedidos sin pago */}
                          {order.status === 'PENDING_NO_PAYMENT' && (
                            <>
                              <button
                                onClick={() => handleContactCustomer(order, 'phone')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Llamar Cliente"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleContactCustomer(order, 'email')}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Enviar Email"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleContactCustomer(order, 'whatsapp')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {/* Botón de eliminar */}
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Eliminar Pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Selects de estado - más compactos */}
                        <div className="flex flex-col space-y-1">
                          <select
                            value={order.paymentStatus || 'PENDING'}
                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-1 py-1 text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 w-full"
                            title="Estado de Pago"
                          >
                            <option value="PENDING">Pendente</option>
                            <option value="PAID">Pago</option>
                            <option value="FAILED">Falhou</option>
                            <option value="REFUNDED">Reembolsado</option>
                          </select>
                          
                          <select
                            value={order.shippingStatus || 'PENDING'}
                            onChange={(e) => handleShippingStatusChange(order.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-1 py-1 text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 w-full"
                            title="Estado de Envío"
                          >
                            <option value="PENDING">Pendente</option>
                            <option value="CONFIRMED">Confirmado</option>
                            <option value="PREPARING">Preparando</option>
                            <option value="IN_TRANSIT">Em Trânsito</option>
                            <option value="DELIVERED">Entregue</option>
                            <option value="RETURNED">Devolvido</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'Nenhum pedido encontrado' : 'Nenhum pedido ainda'}
                </p>
                <p className="text-sm text-gray-500">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Os pedidos aparecerão aqui quando os clientes realizarem compras'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deleteModalOpen && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Pedido</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                ¿Estás seguro de que quieres eliminar este pedido?
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">Pedido #{orderToDelete.id}</p>
                <p className="text-sm text-gray-600">Cliente: {orderToDelete.customerName}</p>
                <p className="text-sm text-gray-600">Total: R$ {orderToDelete.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="mt-2 flex gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(orderToDelete.paymentStatus || 'PENDING')}`}>
                    Pago: {getPaymentStatusText(orderToDelete.paymentStatus || 'PENDING')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShippingStatusColor(orderToDelete.shippingStatus || 'PENDING')}`}>
                    Envío: {getShippingStatusText(orderToDelete.shippingStatus || 'PENDING')}
                  </span>
                </div>
              </div>
              
              {/* Información sobre restauración de stock */}
              {(() => {
                const isPaid = orderToDelete.paymentStatus === 'PAID'
                const isShipped = ['PREPARING', 'IN_TRANSIT', 'DELIVERED'].includes(orderToDelete.shippingStatus || '')
                const isCompleted = ['COMPLETED', 'DELIVERED'].includes(orderToDelete.status)
                
                if (isPaid && (isShipped || isCompleted)) {
                  return (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 font-medium">
                        ⚠️ Stock NO será restaurado
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Este pedido ya fue pagado y/o enviado. Los productos no volverán al stock.
                      </p>
                    </div>
                  )
                } else {
                  return (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        ✅ Stock será restaurado
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Los productos volverán al stock disponible.
                      </p>
                    </div>
                  )
                }
              })()}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteOrder}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteOrder}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Pedido'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
