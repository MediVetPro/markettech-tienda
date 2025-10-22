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
    console.log('🧪 [TEST] POST /api/test-notifications - Creando notificación de prueba...')
    
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

    const userId = payload.userId
    console.log('✅ [TEST] Valid JWT token for user:', userId)

    // Crear una notificación de prueba (sin orderId para evitar foreign key constraint)
    const testNotification = await prisma.notification.create({
      data: {
        type: 'ORDER_CREATED',
        title: 'Notificación de Prueba',
        message: 'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.',
        userId,
        orderId: null // Sin referencia a pedido para evitar foreign key constraint
      }
    })

    console.log('✅ [TEST] Notificación de prueba creada:', testNotification.id)

    return NextResponse.json({ 
      message: 'Test notification created successfully',
      notification: testNotification
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('❌ [TEST] Error creating test notification:', error)
    return NextResponse.json(
      { error: 'Failed to create test notification' },
      { status: 500, headers: corsHeaders }
    )
  }
}
