import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎭 [API] POST /api/pix/simulate-payment - Simulando pago...')
    
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

    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json({ 
        error: 'Payment ID is required' 
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    console.log('📊 [API] Simulando pago PIX:', paymentId)

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

    if (pixPayment.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'El pago ya fue procesado o expiró' 
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Simular pago exitoso
    const updatedPayment = await prisma.pixPayment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    })

    // Actualizar la orden
    await prisma.order.update({
      where: { id: pixPayment.orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID'  // Actualizar estado de pago a PAID
      }
    })

    console.log('✅ [API] Pago PIX simulado exitosamente')

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        paidAt: updatedPayment.paidAt
      }
    }, { 
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('❌ [API] Error simulating PIX payment:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}
