import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getAvailableGateways, getRecommendedGateway, processPayment, getGatewayStats } from '@/lib/paymentGateways'

// GET - Obtener pasarelas disponibles
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
    const country = searchParams.get('country') || 'US'
    const currency = searchParams.get('currency') || 'USD'
    const includeStats = searchParams.get('includeStats') === 'true'

    console.log('💳 [GATEWAYS] Obteniendo pasarelas disponibles')

    const gateways = getAvailableGateways()
    const recommended = getRecommendedGateway(country, currency)

    let stats = null
    if (includeStats && decoded.user.role === 'ADMIN') {
      const statsResult = await getGatewayStats()
      if (statsResult.success) {
        stats = statsResult.stats
      }
    }

    return NextResponse.json({
      gateways,
      recommended,
      country,
      currency,
      stats
    })

  } catch (error) {
    console.error('Error getting payment gateways:', error)
    return handleError(error)
  }
}

// POST - Procesar pago
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

    const { 
      amount, 
      currency, 
      orderId, 
      gateway, 
      customerInfo, 
      metadata 
    } = await request.json()

    if (!amount || !currency || !orderId || !gateway || !customerInfo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: amount, currency, orderId, gateway, customerInfo' },
        { status: 400 }
      )
    }

    console.log('💳 [PAYMENT] Procesando pago:', orderId)

    const paymentRequest = {
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      orderId,
      userId: decoded.userId!,
      gateway,
      customerInfo,
      metadata
    }

    const result = await processPayment(paymentRequest)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error procesando pago' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Pago procesado exitosamente',
      ...result
    })

  } catch (error) {
    console.error('Error processing payment:', error)
    return handleError(error)
  }
}
