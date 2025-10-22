import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getPaymentHistoryByGateway } from '@/lib/paymentGateways'

// GET - Obtener historial de pagos por pasarela
export async function GET(request: NextRequest) {
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

    const { searchParams } = request.nextUrl
    const gateway = searchParams.get('gateway')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!gateway) {
      return NextResponse.json(
        { error: 'gateway es requerido' },
        { status: 400 }
      )
    }

    console.log('💳 [HISTORY] Obteniendo historial de pagos para pasarela:', gateway)

    const result = await getPaymentHistoryByGateway(gateway, decoded.userId!)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error obteniendo historial' },
        { status: 400 }
      )
    }

    // Paginación
    const skip = (page - 1) * limit
    const paginatedPayments = result.payments?.slice(skip, skip + limit) || []
    const total = result.payments?.length || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      payments: paginatedPayments,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      gateway: result.gateway
    })

  } catch (error) {
    console.error('Error getting payment history:', error)
    return handleError(error)
  }
}
