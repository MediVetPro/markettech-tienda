import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getAvailableGateways } from '@/lib/paymentGateways'

// GET - Obtener métodos de pago por pasarela
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
    const country = searchParams.get('country') || 'US'
    const currency = searchParams.get('currency') || 'USD'

    console.log('💳 [METHODS] Obteniendo métodos de pago para pasarela:', gateway)

    const availableGateways = getAvailableGateways()
    
    if (gateway) {
      const selectedGateway = availableGateways.find(g => g.name === gateway)
      if (!selectedGateway) {
        return NextResponse.json(
          { error: 'Pasarela no encontrada' },
          { status: 404 }
        )
      }

      const methods = getPaymentMethodsForGateway(gateway, country, currency)
      
      return NextResponse.json({
        gateway: selectedGateway,
        methods,
        country,
        currency
      })
    }

    // Retornar métodos para todas las pasarelas
    const allMethods = availableGateways.map(gateway => ({
      gateway: gateway.name,
      displayName: gateway.displayName,
      methods: getPaymentMethodsForGateway(gateway.name, country, currency),
      isEnabled: gateway.isEnabled
    }))

    return NextResponse.json({
      gateways: allMethods,
      country,
      currency
    })

  } catch (error) {
    console.error('Error getting payment methods:', error)
    return handleError(error)
  }
}

function getPaymentMethodsForGateway(gateway: string, country: string, currency: string) {
  const baseMethods = {
    stripe: [
      { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳', enabled: true },
      { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦', enabled: true },
      { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', enabled: true },
      { id: 'google_pay', name: 'Google Pay', icon: '📱', enabled: true }
    ],
    paypal: [
      { id: 'paypal', name: 'PayPal', icon: '💙', enabled: true },
      { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳', enabled: true },
      { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦', enabled: true }
    ],
    mercadopago: [
      { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳', enabled: true },
      { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦', enabled: true },
      { id: 'cash', name: 'Efectivo', icon: '💵', enabled: true },
      { id: 'digital_wallet', name: 'Billetera Digital', icon: '📱', enabled: true }
    ],
    square: [
      { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳', enabled: true },
      { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', enabled: true },
      { id: 'google_pay', name: 'Google Pay', icon: '📱', enabled: true },
      { id: 'gift_card', name: 'Tarjeta de Regalo', icon: '🎁', enabled: true }
    ],
    razorpay: [
      { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳', enabled: true },
      { id: 'netbanking', name: 'Banca en Línea', icon: '🏦', enabled: true },
      { id: 'upi', name: 'UPI', icon: '📱', enabled: true },
      { id: 'wallet', name: 'Billetera Digital', icon: '💰', enabled: true }
    ]
  }

  return baseMethods[gateway as keyof typeof baseMethods] || []
}
