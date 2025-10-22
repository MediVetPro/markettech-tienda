import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { confirmPayment } from '@/lib/paymentGateways'

// POST - Confirmar pago
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

    const { gateway, transactionId } = await request.json()

    if (!gateway || !transactionId) {
      return NextResponse.json(
        { error: 'gateway y transactionId son requeridos' },
        { status: 400 }
      )
    }

    console.log('💳 [CONFIRM] Confirmando pago:', transactionId)

    const result = await confirmPayment(gateway, transactionId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error confirmando pago' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Pago confirmado exitosamente',
      ...result
    })

  } catch (error) {
    console.error('Error confirming payment:', error)
    return handleError(error)
  }
}
