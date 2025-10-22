import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'
import { checkMercadoPagoPaymentStatus } from '@/lib/mercadoPago'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] GET /api/pix/check-payment - Iniciando...')
    
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

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ 
        error: 'Payment ID is required' 
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    console.log('📊 [API] Verificando pago PIX:', paymentId)

    // Buscar el pago PIX
    const pixPayment = await prisma.pixPayment.findUnique({
      where: { id: paymentId },
      include: {
        order: true
      }
    })

    if (!pixPayment) {
      return NextResponse.json({ 
        error: 'Pago PIX no encontrado' 
      }, { 
        status: 404,
        headers: corsHeaders
      })
    }

    // Verificar si el pago ha expirado
    const now = new Date()
    if (pixPayment.expiresAt < now && pixPayment.status === 'PENDING') {
      await prisma.pixPayment.update({
        where: { id: paymentId },
        data: { status: 'EXPIRED' }
      })
      
      return NextResponse.json({
        success: true,
        payment: {
          ...pixPayment,
          status: 'EXPIRED'
        }
      }, { 
        status: 200,
        headers: corsHeaders
      })
    }

    // Verificar estado del pago con el proveedor si es Mercado Pago
    if (pixPayment.externalId && pixPayment.pixProvider === 'MERCADO_PAGO') {
      console.log('🔍 [API] Verificando estado con Mercado Pago...')
      
      const paymentStatus = await checkMercadoPagoPaymentStatus(pixPayment.externalId)
      
      if (paymentStatus && paymentStatus.paid && paymentStatus.status === 'approved') {
        console.log('✅ [API] Pago confirmado por Mercado Pago, actualizando estado...')
        
        // Actualizar pago PIX
        await prisma.pixPayment.update({
          where: { id: paymentId },
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

        console.log('📦 [API] Actualizando stock para productos:', orderItems.length)
        
        for (const item of orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { 
              stock: { 
                decrement: item.quantity 
              } 
            }
          })
          console.log(`📦 [API] Stock actualizado para producto ${item.productId}: -${item.quantity}`)
        }

        // Recargar datos actualizados
        const updatedPixPayment = await prisma.pixPayment.findUnique({
          where: { id: paymentId }
        })

        return NextResponse.json({
          success: true,
          payment: {
            id: updatedPixPayment!.id,
            amount: updatedPixPayment!.amount,
            description: updatedPixPayment!.description,
            qrCode: updatedPixPayment!.qrCode,
            qrCodeText: updatedPixPayment!.qrCodeText,
            pixKey: updatedPixPayment!.pixKey,
            status: updatedPixPayment!.status,
            expiresAt: updatedPixPayment!.expiresAt,
            createdAt: updatedPixPayment!.createdAt
          }
        }, { 
          status: 200,
          headers: corsHeaders
        })
      }
    }

    console.log('✅ [API] Estado del pago PIX:', pixPayment.status)

    return NextResponse.json({
      success: true,
      payment: {
        id: pixPayment.id,
        amount: pixPayment.amount,
        description: pixPayment.description,
        qrCode: pixPayment.qrCode,
        qrCodeText: pixPayment.qrCodeText,
        pixKey: pixPayment.pixKey,
        status: pixPayment.status,
        expiresAt: pixPayment.expiresAt,
        createdAt: pixPayment.createdAt
      }
    }, { 
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('❌ [API] Error checking PIX payment:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}