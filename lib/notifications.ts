import { prisma } from './prisma'

export interface CreateNotificationData {
  userId: string
  type: string
  title: string
  message: string
  data?: any
  orderId?: string
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
  orderId
}: CreateNotificationData) {
  try {
    console.log('🔔 [NOTIFICATIONS] Creating notification:', { userId, type, title })
    console.log('🔔 [NOTIFICATIONS] Full data:', { userId, type, title, message, data, orderId })
    
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        userId,
        orderId: orderId || null
      }
    })

    console.log('✅ [NOTIFICATIONS] Notification created successfully:', notification.id)
    console.log('✅ [NOTIFICATIONS] Notification details:', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      userId: notification.userId,
      orderId: notification.orderId
    })
    return notification
  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Error creating notification:', error)
    console.error('❌ [NOTIFICATIONS] Error details:', error)
    throw error
  }
}

export async function createOrderNotification(
  userId: string,
  orderId: string,
  type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'PAYMENT_RECEIVED' | 'PAYMENT_STATUS_CHANGED' | 'SHIPPING_STATUS_CHANGED' | 'ORDER_DEVOLUCION' | 'ORDER_CANCELLED',
  orderData: {
    status: string
    paymentStatus?: string
    shippingStatus?: string
    total: number
    customerName: string
    items?: Array<{
      product: {
        title: string
        images: Array<{ path: string }>
      }
      quantity: number
      price: number
    }>
  }
) {
  console.log('🔔 [NOTIFICATIONS] createOrderNotification called:', {
    userId,
    orderId,
    type,
    orderData
  })

  const notificationTemplates = {
    ORDER_CREATED: {
      title: 'Pedido Criado',
      message: `Seu pedido #${orderId} foi criado com sucesso por R$ ${orderData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
    },
    ORDER_STATUS_CHANGED: {
      title: 'Status do Pedido Atualizado',
      message: `O status do seu pedido #${orderId} mudou para: ${getStatusText(orderData.status)}.`
    },
    PAYMENT_RECEIVED: {
      title: 'Pagamento Recebido',
      message: `Recebemos o pagamento do seu pedido #${orderId} no valor de R$ ${orderData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
    },
    PAYMENT_STATUS_CHANGED: {
      title: 'Status de Pagamento Atualizado',
      message: `O status de pagamento do seu pedido #${orderId} foi atualizado para: ${getPaymentStatusText(orderData.paymentStatus || 'PENDING')}.`
    },
    SHIPPING_STATUS_CHANGED: {
      title: 'Status de Envío Atualizado',
      message: `O status de envío do seu pedido #${orderId} foi atualizado para: ${getShippingStatusText(orderData.shippingStatus || 'PENDING')}.`
    },
    ORDER_DEVOLUCION: {
      title: 'Pedido em Devolução',
      message: `Seu pedido #${orderId} foi marcado como devolução. O estoque foi restaurado.`
    },
    ORDER_CANCELLED: {
      title: 'Pedido Cancelado',
      message: `Seu pedido #${orderId} foi cancelado.`
    }
  }

  const template = notificationTemplates[type]
  console.log('🔔 [NOTIFICATIONS] Template selected:', template)
  
  const notificationData = {
    userId,
    type,
    title: template.title,
    message: template.message,
    data: {
      orderId,
      status: orderData.status,
      total: orderData.total,
      customerName: orderData.customerName
    },
    orderId
  }
  
  console.log('🔔 [NOTIFICATIONS] Notification data:', notificationData)
  
  return createNotification(notificationData)
}

function getStatusText(status: string): string {
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

function getPaymentStatusText(status: string): string {
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

function getShippingStatusText(status: string): string {
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
