import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { createPaymentIntent } from '@/lib/payments'

// POST - Crear Payment Intent
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded.user || decoded.error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.userId
    const { orderId, paymentMethodId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de orden es requerido' },
        { status: 400 }
      )
    }

    console.log('💳 [CREATE_INTENT] Creando Payment Intent para orden:', orderId)

    // Verificar que la orden existe y pertenece al usuario
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      select: {
        id: true,
        total: true,
        status: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'La orden ya ha sido procesada' },
        { status: 400 }
      )
    }

    // Crear Payment Intent
    const result = await createPaymentIntent({
      amount: order.total,
      currency: 'MXN',
      orderId: order.id,
      userId,
      paymentMethodId,
      metadata: {
        orderId: order.id,
        userId
      }
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error creando Payment Intent' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Payment Intent creado exitosamente',
      paymentIntent: result.paymentIntent,
      payment: result.payment
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return handleError(error)
  }
}
