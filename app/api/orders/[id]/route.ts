import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'
import { createOrderNotification } from '@/lib/notifications'

// Función para determinar si se debe restaurar stock al eliminar un pedido
function shouldRestoreStockOnDelete(
  orderStatus: string, 
  paymentStatus?: string, 
  shippingStatus?: string
): boolean {
  // Estados que indican que el producto NO debe ser restaurado (ya fue entregado/confirmado)
  const noRestoreStates = [
    'COMPLETED', // Pedido completado
    'DELIVERED'  // Pedido entregado
  ]
  
  // Estados de pago que indican que el producto ya fue pagado y no debe restaurarse
  const paidPaymentStatuses = ['PAID']
  
  // Estados de envío que indican que el producto ya está en proceso de entrega
  const shippedStatuses = ['PREPARING', 'IN_TRANSIT', 'DELIVERED']
  
  // Si el pedido está en un estado que indica que ya fue completado/entregado
  if (noRestoreStates.includes(orderStatus)) {
    return false
  }
  
  // Si el pago fue confirmado Y el envío ya comenzó, no restaurar stock
  if (paymentStatus && paidPaymentStatuses.includes(paymentStatus) && 
      shippingStatus && shippedStatuses.includes(shippingStatus)) {
    return false
  }
  
  // Si el pago fue confirmado Y el pedido está en proceso, no restaurar stock
  if (paymentStatus && paidPaymentStatuses.includes(paymentStatus) && 
      ['CONFIRMED', 'PREPARING', 'IN_TRANSIT'].includes(orderStatus)) {
    return false
  }
  
  // En todos los demás casos, restaurar stock
  return true
}

// Función para determinar si se debe restaurar stock al cambiar el estado de un pedido
function shouldRestoreStockOnStatusUpdate(
  currentStatus: string,
  newStatus: string,
  currentPaymentStatus?: string,
  newPaymentStatus?: string,
  currentShippingStatus?: string,
  newShippingStatus?: string
): boolean {
  // Solo restaurar stock si hay un cambio real de estado
  if (currentStatus === newStatus && currentPaymentStatus === newPaymentStatus && currentShippingStatus === newShippingStatus) {
    return false
  }

  // Estados que requieren restauración de stock
  const stockRestoreStates = ['DEVOLUCION', 'CANCELLED', 'PENDING_NO_PAYMENT']
  
  // Estados de pago que requieren restauración de stock
  const stockRestorePaymentStates = ['FAILED']
  
  // Estados de envío que requieren restauración de stock
  const stockRestoreShippingStates = ['PENDING', 'RETURNED']
  
  // Si el nuevo estado requiere restauración de stock
  if (stockRestoreStates.includes(newStatus)) {
    return true
  }
  
  // Si el nuevo estado de pago requiere restauración de stock
  if (newPaymentStatus && stockRestorePaymentStates.includes(newPaymentStatus)) {
    return true
  }
  
  // Si el nuevo estado de envío requiere restauración de stock
  // PERO solo si hay un cambio real de estado de envío
  if (newShippingStatus && stockRestoreShippingStates.includes(newShippingStatus) && 
      currentShippingStatus !== newShippingStatus) {
    return true
  }
  
  // Casos especiales: si se cambia de un estado pagado a uno no pagado
  if (currentPaymentStatus === 'PAID' && newPaymentStatus && stockRestorePaymentStates.includes(newPaymentStatus)) {
    return true
  }
  
  // Casos especiales: si se cambia de un estado enviado a uno no enviado
  if (currentShippingStatus && ['PREPARING', 'IN_TRANSIT', 'DELIVERED'].includes(currentShippingStatus) && 
      newShippingStatus && stockRestoreShippingStates.includes(newShippingStatus)) {
    return true
  }
  
  // En todos los demás casos, no restaurar stock
  return false
}

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [API] GET /api/orders/[id] - Iniciando...')
    console.log('🔍 [API] Order ID:', params.id)
    
    // Verificar autenticación JWT
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders
      })
    }

    const userId = payload.userId
    console.log('✅ [API] Valid JWT token for user:', userId)

    // Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                user: {
                  select: { id: true, name: true }
                }
              }
            },
            seller: {
              select: { id: true, name: true }
            }
          }
        },
        globalPaymentProfile: {
          select: {
            companyName: true,
            email: true,
            bankName: true
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Verificar que el usuario tenga acceso a esta orden
    // Solo el cliente que hizo la orden o un admin puede verla
    if (order.userId !== userId) {
      // Verificar si el usuario es admin o admin de ventas
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_VENDAS')) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403, headers: corsHeaders }
        )
      }

      // Los administradores de ventas ahora pueden ver todos los pedidos
      // No se requiere validación adicional de productos
    }

    console.log('✅ [API] Order found and access granted')
    console.log('✅ [API] Order data structure:', {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: order.total,
      items: order.items?.length || 0,
      hasItems: !!order.items
    })
    return NextResponse.json({ order }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 [API] PUT /api/orders/[id] - Iniciando...')
    console.log('🔄 [API] Order ID:', params.id)
    
    // Verificar autenticación JWT
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders
      })
    }

    const userId = payload.userId

    // Verificar que el usuario sea admin o el propietario del pedido
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Buscar la orden para verificar el propietario
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      select: { userId: true, status: true }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Verificar permisos: admin o propietario del pedido
    const isAdmin = user.role === 'ADMIN' || user.role === 'ADMIN_VENDAS'
    const isOwner = existingOrder.userId === userId

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { status, paymentStatus, shippingStatus, notes } = body

    // Si es cliente (no admin), solo puede cancelar pedidos pendientes
    if (!isAdmin && isOwner) {
      if (status !== 'CANCELLED') {
        return NextResponse.json(
          { error: 'Clients can only cancel orders' },
          { status: 403, headers: corsHeaders }
        )
      }
      
      // Solo permitir cancelar pedidos que no han sido pagados
      if (existingOrder.status !== 'PENDING' && existingOrder.status !== 'PENDING_NO_PAYMENT') {
        return NextResponse.json(
          { error: 'Only pending orders can be cancelled by clients' },
          { status: 403, headers: corsHeaders }
        )
      }
    }

    // Verificar si se debe restaurar stock basado en el cambio de estado
    const shouldRestoreStockOnStatusChange = shouldRestoreStockOnStatusUpdate(
      existingOrder.status, 
      status, 
      existingOrder.paymentStatus, 
      paymentStatus,
      existingOrder.shippingStatus,
      shippingStatus
    )
    
    if (shouldRestoreStockOnStatusChange) {
      console.log(`🔄 [API] Cambiando a ${status} - restaurando stock...`)
      
      // Buscar la orden con sus items
      const orderWithItems = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      if (orderWithItems) {
        // Restaurar stock de los productos
        for (const item of orderWithItems.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          })
          console.log(`✅ [API] Stock restaurado para producto ${item.productId}: +${item.quantity}`)
        }
        console.log(`✅ [API] Stock restaurado para ${status.toLowerCase()}`)
      }
    } else {
      console.log(`ℹ️ [API] No se restaura stock para cambio a ${status} - no es necesario`)
    }

    // Actualizar la orden
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        shippingStatus: shippingStatus || undefined,
        notes: notes || undefined
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                user: {
                  select: { id: true, name: true }
                }
              }
            },
            seller: {
              select: { id: true, name: true }
            }
          }
        },
        globalPaymentProfile: {
          select: {
            companyName: true,
            email: true,
            bankName: true
          }
        }
      }
    })

    console.log('✅ [API] Order updated successfully')

    // Crear notificaciones para el usuario del pedido si existe
    if (order.userId) {
      try {
        console.log('🔔 [API] Creando notificaciones para usuario:', order.userId)
        
        // Notificación de cambio de estado general (mantener compatibilidad)
        if (status) {
          console.log('🔔 [API] Estado del pedido:', status)
          console.log('🔔 [API] Datos del pedido:', {
            id: order.id,
            status: order.status,
            total: order.total,
            customerName: order.customerName
          })
          
          let notificationType: 'ORDER_STATUS_CHANGED' | 'ORDER_DEVOLUCION' | 'ORDER_CANCELLED' = 'ORDER_STATUS_CHANGED'
          
          if (status === 'DEVOLUCION') {
            notificationType = 'ORDER_DEVOLUCION'
          } else if (status === 'CANCELLED') {
            notificationType = 'ORDER_CANCELLED'
          }

          console.log('🔔 [API] Tipo de notificación general:', notificationType)

          const notification = await createOrderNotification(
            order.userId,
            order.id,
            notificationType,
            {
              status: order.status,
              total: order.total,
              customerName: order.customerName
            }
          )
          console.log('✅ [API] Notificación de cambio de estado general enviada:', notification.id)
        }

        // Notificación de cambio de estado de pago
        if (paymentStatus) {
          console.log('🔔 [API] Creando notificación de cambio de estado de pago:', paymentStatus)

          const notification = await createOrderNotification(
            order.userId,
            order.id,
            'PAYMENT_STATUS_CHANGED',
            {
              status: order.status,
              paymentStatus: order.paymentStatus,
              total: order.total,
              customerName: order.customerName
            }
          )
          console.log('✅ [API] Notificación de cambio de estado de pago enviada:', notification.id)
        }

        // Notificación de cambio de estado de envío
        if (shippingStatus) {
          console.log('🔔 [API] Creando notificación de cambio de estado de envío:', shippingStatus)

          const notification = await createOrderNotification(
            order.userId,
            order.id,
            'SHIPPING_STATUS_CHANGED',
            {
              status: order.status,
              shippingStatus: order.shippingStatus,
              total: order.total,
              customerName: order.customerName
            }
          )
          console.log('✅ [API] Notificación de cambio de estado de envío enviada:', notification.id)
        }
      } catch (error) {
        console.error('❌ [API] Error creating notifications:', error)
        // No fallar la actualización del pedido por error en notificación
      }
    } else {
      console.log('⚠️ [API] No hay userId en el pedido, no se creará notificación')
    }

    return NextResponse.json({ order }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ [API] DELETE /api/orders/[id] - Iniciando...')
    console.log('🗑️ [API] Order ID:', params.id)
    
    // Verificar autenticación JWT
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders
      })
    }

    const userId = payload.userId

    // Verificar que el usuario sea admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_VENDAS')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403, headers: corsHeaders }
      )
    }

    // Buscar la orden con sus items para restaurar stock
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    console.log('🔍 [API] Order found, checking if stock should be restored...')
    console.log('🔍 [API] Order status:', order.status)
    console.log('🔍 [API] Payment status:', order.paymentStatus)
    console.log('🔍 [API] Shipping status:', order.shippingStatus)

    // Determinar si se debe restaurar el stock basado en los estados
    const shouldRestoreStock = shouldRestoreStockOnDelete(order.status, order.paymentStatus, order.shippingStatus)
    
    if (shouldRestoreStock) {
      console.log('📦 [API] Restaurando stock para', order.items.length, 'items')
      
      // Restaurar stock de los productos
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
        console.log(`✅ [API] Stock restored for product ${item.productId}: +${item.quantity}`)
      }
    } else {
      console.log('⚠️ [API] NO se restaura stock - el pedido ya fue pagado y/o enviado')
    }

    // Eliminar payouts relacionados
    await prisma.sellerPayout.deleteMany({
      where: { orderId: params.id }
    })
    console.log('✅ [API] Seller payouts deleted')

    // Eliminar items de la orden
    await prisma.orderItem.deleteMany({
      where: { orderId: params.id }
    })
    console.log('✅ [API] Order items deleted')

    // Eliminar la orden
    await prisma.order.delete({
      where: { id: params.id }
    })
    console.log('✅ [API] Order deleted successfully')

    return NextResponse.json({ 
      message: 'Order deleted successfully',
      stockRestored: shouldRestoreStock ? order.items.length : 0,
      stockRestoreReason: shouldRestoreStock 
        ? 'Stock restored because order was not paid or shipped' 
        : 'Stock NOT restored because order was already paid and/or shipped'
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500, headers: corsHeaders }
    )
  }
}