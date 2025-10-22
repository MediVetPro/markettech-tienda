import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getUserPaymentMethods, createPaymentMethod } from '@/lib/payments'

// GET - Obtener métodos de pago del usuario
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
    
    if (!decoded.user || decoded.error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    console.log('💳 [PAYMENT_METHODS] Obteniendo métodos de pago para usuario:', userId)

    const result = await getUserPaymentMethods(userId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error obteniendo métodos de pago' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      paymentMethods: result.paymentMethods
    })

  } catch (error) {
    console.error('Error getting payment methods:', error)
    return handleError(error)
  }
}

// POST - Crear método de pago
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
    const { 
      provider, 
      providerId, 
      type, 
      last4, 
      brand, 
      expMonth, 
      expYear, 
      isDefault 
    } = await request.json()

    if (!provider || !providerId || !type) {
      return NextResponse.json(
        { error: 'provider, providerId y type son requeridos' },
        { status: 400 }
      )
    }

    console.log('💳 [PAYMENT_METHOD] Creando método de pago para usuario:', userId)

    const result = await createPaymentMethod({
      userId,
      provider,
      providerId,
      type,
      last4,
      brand,
      expMonth,
      expYear,
      metadata: { isDefault }
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error creando método de pago' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Método de pago creado exitosamente',
      paymentMethod: result.paymentMethod
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating payment method:', error)
    return handleError(error)
  }
}
