import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔔 [API] PUT /api/notifications/mark-all-read - Marcando todas como leídas...')
    
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
    console.log('✅ [API] Valid JWT token for user:', userId)

    // Marcar todas las notificaciones del usuario como leídas
    const result = await prisma.notification.updateMany({
      where: { 
        userId,
        read: false 
      },
      data: { read: true }
    })

    console.log(`✅ [API] ${result.count} notificaciones marcadas como leídas`)

    return NextResponse.json({ 
      message: 'All notifications marked as read',
      count: result.count
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('❌ [API] Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500, headers: corsHeaders }
    )
  }
}
