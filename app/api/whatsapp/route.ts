import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { whatsappService } from '@/lib/whatsapp'

// GET - Obtener estado de WhatsApp
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

    // Solo administradores pueden ver el estado de WhatsApp
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver el estado de WhatsApp' },
        { status: 403 }
      )
    }

    console.log('📱 [WHATSAPP] Obteniendo estado de WhatsApp')

    const status = whatsappService.getStatus()
    const sessions = await whatsappService.getActiveSessions()

    return NextResponse.json({
      status,
      sessions: sessions.success ? sessions.sessions : [],
      message: 'Estado de WhatsApp obtenido exitosamente'
    })

  } catch (error) {
    console.error('Error getting WhatsApp status:', error)
    return handleError(error)
  }
}

// POST - Conectar/Desconectar WhatsApp
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

    // Solo administradores pueden conectar/desconectar WhatsApp
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden conectar/desconectar WhatsApp' },
        { status: 403 }
      )
    }

    const { action } = await request.json()

    if (!action || !['connect', 'disconnect'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Use "connect" o "disconnect"' },
        { status: 400 }
      )
    }

    console.log('📱 [WHATSAPP] Ejecutando acción:', action)

    let result
    if (action === 'connect') {
      result = await whatsappService.connect()
    } else {
      result = await whatsappService.disconnect()
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error ejecutando acción' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: (result as any).message || 'Acción ejecutada exitosamente',
      success: true
    })

  } catch (error) {
    console.error('Error executing WhatsApp action:', error)
    return handleError(error)
  }
}
