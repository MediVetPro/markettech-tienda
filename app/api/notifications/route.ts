import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔔 [API] GET /api/notifications - Obteniendo notificaciones...')
    
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

    // Obtener parámetros de consulta
    const { searchParams } = request.nextUrl
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Obtener notificaciones del usuario
    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            total: true,
            customerName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Contar notificaciones no leídas
    const unreadCount = await prisma.notification.count({
      where: { 
        userId,
        read: false 
      }
    })

    console.log(`✅ [API] Notificaciones encontradas: ${notifications.length}, No leídas: ${unreadCount}`)

    return NextResponse.json({ 
      notifications,
      unreadCount,
      total: notifications.length
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('❌ [API] Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [API] POST /api/notifications - Creando notificación...')
    
    const body = await request.json()
    const { type, title, message, data, userId, orderId } = body

    if (!type || !title || !message || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Crear la notificación
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        userId,
        orderId: orderId || null
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            total: true,
            customerName: true
          }
        }
      }
    })

    console.log('✅ [API] Notificación creada:', notification.id)

    return NextResponse.json(notification, { 
      status: 201,
      headers: corsHeaders 
    })
  } catch (error) {
    console.error('❌ [API] Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500, headers: corsHeaders }
    )
  }
}
