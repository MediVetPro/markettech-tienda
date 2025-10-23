import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { createOrderNotification } from '@/lib/notifications'
import { createOrderWithItems, executeTransaction } from '@/lib/transactions'
import { handleError, CommonErrors } from '@/lib/errorHandler'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const adminOnly = searchParams.get('admin') === 'true'
    const userOnly = searchParams.get('user') === 'true'
    
    let whereClause = {}
    
    // Si es una consulta de administración, verificar el rol del usuario
    if (adminOnly) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Token de autorización requerido' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      let decoded: any
      
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!)
      } catch (error) {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        )
      }

      // Obtener información del usuario para verificar su rol
      const user = await prisma.user.findUnique({
        where: { id: decoded.user.userId },
        select: { role: true }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }

      // Si es ADMIN o ADMIN_VENDAS, puede ver todas las órdenes
      if (user.role === 'ADMIN' || user.role === 'ADMIN_VENDAS') {
        // No aplicar filtros, mostrar todas las órdenes
        whereClause = {}
        console.log('🔍 [API] Acceso completo a todas las órdenes para:', user.role)
      } else {
        // Si no es admin, no puede acceder
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        )
      }
    }
    
    // Si es una consulta de usuario autenticado, mostrar solo sus órdenes
    if (userOnly) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Token de autorización requerido' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      let decoded: any
      
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!)
      } catch (error) {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        )
      }

      // Filtrar solo las órdenes del usuario autenticado
      whereClause = {
        userId: decoded.user.userId
      }
      console.log('🔍 [API] Filtrando órdenes para usuario:', decoded.user.userId)
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        }
      }
    })

    console.log('✅ [API] Órdenes devueltas:', orders.length)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ [API] Eliminando orden...')
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Obtener la orden para verificar el método de pago
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentMethod: true }
    })

    // Obtener los items de la orden antes de eliminarlos para restaurar el stock
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      select: {
        productId: true,
        quantity: true
      }
    })

    console.log('📦 [API] Items encontrados para restaurar stock:', orderItems.length)

    // Solo restaurar stock si NO era pago directo con vendedor
    // (porque para DIRECT_SELLER el stock ya se actualizó al crear la orden)
    if (order?.paymentMethod !== 'DIRECT_SELLER') {
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { 
            stock: { 
              increment: item.quantity 
            } 
          }
        })
        console.log(`📦 [API] Stock restaurado para producto ${item.productId}: +${item.quantity}`)
      }
    } else {
      console.log('📦 [API] No se restaura stock - era pago directo con vendedor')
    }

    // Eliminar items de la orden
    await prisma.orderItem.deleteMany({
      where: { orderId }
    })

    // Eliminar la orden
    await prisma.order.delete({
      where: { id: orderId }
    })

    console.log('✅ [API] Orden eliminada y stock restaurado:', orderId)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ [API] Error eliminando orden:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [API] Iniciando creación de orden...')
    const body = await request.json()
    console.log('📝 [API] Datos recibidos:', { customerName: body.customerName, customerEmail: body.customerEmail, items: body.items?.length })
    const { customerName, customerEmail, customerPhone, customerAddress, items, total, notes, userId, paymentMethod, commissionRate } = body

    // Obtener perfil de pago global activo
    console.log('🔍 [API] Buscando perfil de pago global...')
    const globalPaymentProfile = await prisma.globalPaymentProfile.findFirst({
      where: { isActive: true }
    })

    if (!globalPaymentProfile) {
      console.error('❌ [API] No hay perfil de pago global configurado')
      return NextResponse.json(
        { error: 'No hay perfil de pago global configurado' },
        { status: 400 }
      )
    }
    
    console.log('✅ [API] Perfil de pago global encontrado:', globalPaymentProfile.id)

    // Preparar datos de la orden
    const orderData = {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      total: parseFloat(total),
      status: paymentMethod === 'DIRECT_SELLER' ? 'PENDING_NO_PAYMENT' : 'PENDING',
      paymentMethod: paymentMethod || 'DIRECT_SELLER',
      notes: paymentMethod === 'DIRECT_SELLER' 
        ? 'Pedido directo com vendedor - requer contato para coordenar pagamento'
        : (notes || `Método de pagamento: ${getPaymentMethodText(paymentMethod || 'No especificado')}`),
      userId: userId || null,
      globalPaymentProfileId: globalPaymentProfile.id,
      commissionRate: commissionRate || 0.05
    }

    // Preparar items de la orden
    const orderItems = items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: parseFloat(item.price),
      sellerId: null, // Se determinará en la transacción
      sellerName: 'Vendedor no disponible', // Se determinará en la transacción
      sellerCommission: parseFloat(item.price) * (commissionRate || 0.05)
    }))

    // Crear orden directamente
    console.log('🔄 [API] Creando orden...')
    const order = await prisma.order.create({
      data: orderData
    })
    console.log('✅ [API] Orden creada:', order.id)
    
    // Crear items de orden
    console.log('🔄 [API] Creando items de orden...')
    const createdItems = await Promise.all(
      orderItems.map(async (item: any) => {
        // Obtener información del producto
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { user: { select: { id: true, name: true } } }
        })
        
        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productId}`)
        }
        
        // Verificar stock
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para "${product.title}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`)
        }
        
        // Crear item de orden
        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            sellerId: product.user?.id || null,
            sellerName: product.user?.name || 'Vendedor no disponible',
            sellerCommission: item.sellerCommission
          }
        })
        
        // Actualizar stock solo para pagos directos con vendedor
        // Para PIX, el stock se actualizará cuando el pago sea confirmado
        if (paymentMethod === 'DIRECT_SELLER') {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          })
          console.log(`📦 [API] Stock actualizado para producto ${item.productId}: -${item.quantity} (DIRECT_SELLER)`)
        } else {
          console.log(`📦 [API] Stock NO actualizado para producto ${item.productId} - esperando confirmación de pago PIX`)
        }
        
        return orderItem
      })
    )
    console.log('✅ [API] Items de orden creados:', createdItems.length)

    console.log('✅ [API] Orden creada exitosamente con perfil global:', order.id)
    console.log('✅ [API] Items de orden creados:', createdItems.length)

    // Crear payouts para vendedores
    console.log('🔄 [API] Creando payouts para vendedores...')
    const sellerPayouts = []
    
    for (const orderItem of createdItems) {
      if (orderItem.sellerId) {
        const sellerAmount = orderItem.price * orderItem.quantity * (1 - (commissionRate || 0.05))
        const platformCommission = orderItem.price * orderItem.quantity * (commissionRate || 0.05)
        
        const payout = await prisma.sellerPayout.create({
          data: {
            orderId: order.id,
            sellerId: orderItem.sellerId,
            amount: sellerAmount,
            commission: platformCommission,
            status: 'PENDING'
          }
        })
        
        sellerPayouts.push(payout)
      }
    }

    console.log('✅ [API] Payouts creados para vendedores:', sellerPayouts.length)

    // Crear notificación para el usuario si está autenticado
    console.log('🔔 [API] Verificando si crear notificación para userId:', userId)
    if (userId) {
      try {
        console.log('🔔 [API] Creando notificación de pedido creado...')
        await createOrderNotification(
          userId,
          order.id,
          'ORDER_CREATED',
          {
            status: order.status,
            total: order.total,
            customerName: order.customerName
          }
        )
        console.log('✅ [API] Notificación de pedido creado enviada')
      } catch (error) {
        console.error('❌ [API] Error creating order notification:', error)
        // No fallar la creación del pedido por error en notificación
      }
    } else {
      console.log('⚠️ [API] No hay userId, no se creará notificación de pedido creado')
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('❌ [API] Error creating order:', error)
    console.error('❌ [API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    })
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
