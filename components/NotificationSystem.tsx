'use client'

import { useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, Bell, Package, CreditCard, Truck, RotateCcw, MessageCircle, Reply } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationPolling } from '@/hooks/useNotificationPolling'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: string
  read: boolean
  createdAt: string
  order?: {
    id: string
    status: string
    total: number
    customerName: string
    items?: any[]
  }
}

interface NotificationSystemProps {
  userId?: string
}

export default function NotificationSystem({ userId }: NotificationSystemProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  
  // Usar el hook de polling para notificaciones
  const {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead
  } = useNotificationPolling(60000) // Polling cada 60 segundos (1 minuto)

  const handleNotificationClick = (notification: Notification) => {
    console.log('🔔 [UI] Notification clicked:', notification)
    console.log('🔔 [UI] Current user:', user)
    console.log('🔔 [UI] Is authenticated:', isAuthenticated)
    
    // Marcar como leída si no lo está
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Cerrar el dropdown de notificaciones
    setIsOpen(false)

    // Verificar autenticación antes de navegar
    if (!isAuthenticated) {
      console.log('🔔 [UI] User not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    // Navegar según el tipo de notificación
    if (notification.type === 'MESSAGE_RECEIVED' || notification.type === 'MESSAGE_REPLY') {
      console.log('🔔 [UI] Navigating to messages page')
      router.push('/messages')
    } else if (notification.order && notification.order.id) {
      console.log('🔔 [UI] Navigating to order:', notification.order.id)
      router.push(`/orders/${notification.order.id}`)
    } else {
      console.log('🔔 [UI] Navigating to orders page (default)')
      router.push('/orders')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'ORDER_STATUS_CHANGED':
        return <Truck className="w-5 h-5 text-orange-500" />
      case 'PAYMENT_RECEIVED':
        return <CreditCard className="w-5 h-5 text-green-500" />
      case 'MESSAGE_RECEIVED':
      case 'MESSAGE_REPLY':
        return <MessageCircle className="w-5 h-5 text-purple-500" />
      case 'ORDER_CANCELLED':
        return <RotateCcw className="w-5 h-5 text-red-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
        return 'bg-blue-50 border-blue-200'
      case 'ORDER_STATUS_CHANGED':
        return 'bg-orange-50 border-orange-200'
      case 'PAYMENT_RECEIVED':
        return 'bg-green-50 border-green-200'
      case 'MESSAGE_RECEIVED':
      case 'MESSAGE_REPLY':
        return 'bg-purple-50 border-purple-200'
      case 'ORDER_CANCELLED':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const notificationDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d atrás`
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notificações"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-sm border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p>Carregando notificações...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Eliminar notificação"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${
                          !notification.read ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Informações adicionais para pedidos */}
                        {notification.order && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Pedido #{notification.order.id}</p>
                            <p>Cliente: {notification.order.customerName}</p>
                            <p>Total: R$ {notification.order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                        )}
                        
                        {/* Indicador de não lida */}
                        {!notification.read && (
                          <div className="mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/orders')
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}