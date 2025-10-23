import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { confirmPaymentIntent } from '@/lib/payments'

// POST - Confirmar Payment Intent
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
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { paymentIntentId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'ID de Payment Intent es requerido' },
        { status: 400 }
      )
    }

    console.log('💳 [CONFIRM_PAYMENT] Confirmando Payment Intent:', paymentIntentId)

    // Verificar que el pago pertenece al usuario
    const payment = await prisma.payment.findFirst({
      where: {
        providerId: paymentIntentId,
        userId: decoded.user.userId
      },
      select: {
        id: true,
        orderId: true,
        status: true
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'El pago ya ha sido procesado' },
        { status: 400 }
      )
    }

    // Confirmar Payment Intent
    const result = await confirmPaymentIntent(paymentIntentId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error confirmando pago' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Pago confirmado exitosamente',
      status: result.status,
      paymentIntent: result.paymentIntent
    })

  } catch (error) {
    console.error('Error confirming payment:', error)
    return handleError(error)
  }
}
