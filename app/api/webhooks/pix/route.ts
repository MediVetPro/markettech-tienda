import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'
import { checkMercadoPagoPaymentStatus, validateMercadoPagoWebhook } from '@/lib/mercadoPago'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [WEBHOOK] POST /api/webhooks/pix - Notificación de pago recibida')
    
    const body = await request.text()
    const signature = request.headers.get('x-signature') || ''
    
    console.log('📊 [WEBHOOK] Datos recibidos:', {
      signature: signature.substring(0, 20) + '...',
      bodyLength: body.length
    })

    // Parsear el body como JSON
    let data
    try {
      data = JSON.parse(body)
    } catch (error) {
      console.error('❌ [WEBHOOK] Error parseando JSON:', error)
      return NextResponse.json({ error: 'Invalid JSON' }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    console.log('📊 [WEBHOOK] Datos del webhook:', {
      type: data.type,
      action: data.action,
      id: data.data?.id
    })

    // Verificar que es una notificación de pago
    if (data.type !== 'payment') {
      console.log('ℹ️ [WEBHOOK] No es una notificación de pago, ignorando')
      return NextResponse.json({ success: true }, { 
        status: 200,
        headers: corsHeaders
      })
    }

    const paymentId = data.data?.id
    if (!paymentId) {
      console.error('❌ [WEBHOOK] No se encontró ID de pago')
      return NextResponse.json({ error: 'Payment ID not found' }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Buscar el pago PIX en nuestra base de datos
    const pixPayment = await prisma.pixPayment.findFirst({
      where: { externalId: paymentId.toString() },
      include: {
        order: true
      }
    })

    if (!pixPayment) {
      console.log('ℹ️ [WEBHOOK] Pago PIX no encontrado en nuestra base de datos:', paymentId)
      return NextResponse.json({ success: true }, { 
        status: 200,
        headers: corsHeaders
      })
    }

    console.log('🔍 [WEBHOOK] Pago PIX encontrado:', pixPayment.id)

    // Verificar estado del pago en Mercado Pago
    const paymentStatus = await checkMercadoPagoPaymentStatus(paymentId.toString())
    
    if (!paymentStatus) {
      console.error('❌ [WEBHOOK] No se pudo verificar el estado del pago')
      return NextResponse.json({ error: 'Could not verify payment status' }, { 
        status: 500,
        headers: corsHeaders
      })
    }

    console.log('📊 [WEBHOOK] Estado del pago:', paymentStatus)

    // Si el pago fue aprobado
    if (paymentStatus.paid && paymentStatus.status === 'approved') {
      console.log('✅ [WEBHOOK] Pago aprobado, actualizando estado...')
      
      // Actualizar pago PIX
      await prisma.pixPayment.update({
        where: { id: pixPayment.id },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      })

      // Actualizar orden
      await prisma.order.update({
        where: { id: pixPayment.orderId },
        data: {
          status: 'CONFIRMED'
        }
      })

      // Actualizar stock de los productos ahora que el pago está confirmado
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: pixPayment.orderId },
        select: {
          productId: true,
          quantity: true
        }
      })

      console.log('📦 [WEBHOOK] Actualizando stock para productos:', orderItems.length)
      
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { 
            stock: { 
              decrement: item.quantity 
            } 
          }
        })
        console.log(`📦 [WEBHOOK] Stock actualizado para producto ${item.productId}: -${item.quantity}`)
      }

      console.log('✅ [WEBHOOK] Pago y orden actualizados exitosamente')
    } else {
      console.log('ℹ️ [WEBHOOK] Pago no aprobado aún, estado:', paymentStatus.status)
    }

    return NextResponse.json({ success: true }, { 
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('❌ [WEBHOOK] Error procesando webhook:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

// Endpoint para verificar que el webhook está funcionando
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Webhook PIX funcionando correctamente',
    timestamp: new Date().toISOString()
  }, { 
    status: 200,
    headers: corsHeaders
  })
}