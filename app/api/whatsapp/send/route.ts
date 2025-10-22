import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { whatsappService } from '@/lib/whatsapp'

// POST - Enviar mensaje de WhatsApp
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

    // Solo administradores pueden enviar mensajes
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden enviar mensajes de WhatsApp' },
        { status: 403 }
      )
    }

    const { 
      phoneNumber, 
      content, 
      type = 'TEXT', 
      mediaUrl,
      metadata 
    } = await request.json()

    if (!phoneNumber || !content) {
      return NextResponse.json(
        { error: 'phoneNumber y content son requeridos' },
        { status: 400 }
      )
    }

    console.log('📱 [WHATSAPP_SEND] Enviando mensaje a:', phoneNumber)

    const result = await whatsappService.sendMessage({
      phoneNumber,
      content,
      type: type as any,
      mediaUrl,
      metadata
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error enviando mensaje' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Mensaje enviado exitosamente',
      messageId: result.messageId,
      savedMessage: result.savedMessage
    })

  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return handleError(error)
  }
}

// POST - Enviar mensaje masivo
export async function PUT(request: NextRequest) {
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

    // Solo administradores pueden enviar mensajes masivos
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden enviar mensajes masivos' },
        { status: 403 }
      )
    }

    const { 
      phoneNumbers, 
      content, 
      type = 'TEXT' 
    } = await request.json()

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || !content) {
      return NextResponse.json(
        { error: 'phoneNumbers (array) y content son requeridos' },
        { status: 400 }
      )
    }

    if (phoneNumbers.length > 100) {
      return NextResponse.json(
        { error: 'Máximo 100 números por envío masivo' },
        { status: 400 }
      )
    }

    console.log('📱 [WHATSAPP_BULK] Enviando mensaje masivo a:', phoneNumbers.length, 'números')

    const results = await whatsappService.sendBulkMessage(phoneNumbers, content, type)

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      message: `Mensaje masivo enviado: ${successful} exitosos, ${failed} fallidos`,
      results: {
        successful,
        failed,
        details: results
      }
    })

  } catch (error) {
    console.error('Error sending bulk WhatsApp message:', error)
    return handleError(error)
  }
}
