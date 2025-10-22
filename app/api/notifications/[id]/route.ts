import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔔 [API] PUT /api/notifications/[id] - Marcando como leída...')
    console.log('🔔 [API] Notification ID:', params.id)
    
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

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findFirst({
      where: { 
        id: params.id,
        userId 
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Marcar como leída
    const updatedNotification = await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
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

    console.log('✅ [API] Notificación marcada como leída:', params.id)

    return NextResponse.json(updatedNotification, { headers: corsHeaders })
  } catch (error) {
    console.error('❌ [API] Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔔 [API] DELETE /api/notifications/[id] - Eliminando notificación...')
    console.log('🔔 [API] Notification ID:', params.id)
    
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

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findFirst({
      where: { 
        id: params.id,
        userId 
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Eliminar la notificación
    await prisma.notification.delete({
      where: { id: params.id }
    })

    console.log('✅ [API] Notificación eliminada:', params.id)

    return NextResponse.json({ message: 'Notification deleted successfully' }, { headers: corsHeaders })
  } catch (error) {
    console.error('❌ [API] Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500, headers: corsHeaders }
    )
  }
}
