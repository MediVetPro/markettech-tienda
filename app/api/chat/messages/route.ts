import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL, clearUserCache, invalidateRelatedCache } from '@/lib/cache'

// GET - Obtener mensajes de una sala
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
    const { searchParams } = request.nextUrl
    const roomId = searchParams.get('roomId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!roomId) {
      return NextResponse.json(
        { error: 'ID de sala es requerido' },
        { status: 400 }
      )
    }

    console.log('💬 [CHAT_MESSAGES] Obteniendo mensajes para sala:', roomId)

    // Verificar que el usuario es participante de la sala
    const participation = await prisma.chatParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId
        }
      }
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta sala' },
        { status: 403 }
      )
    }

    // Usar caché para mensajes
    const cacheKey = `chat_messages:${roomId}:${page}:${limit}`
    
    const result = await getCachedData(
      cacheKey,
      async () => {
        const [messages, total] = await Promise.all([
          prisma.chatMessage.findMany({
            where: { roomId },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
          }),
          prisma.chatMessage.count({ where: { roomId } })
        ])

        return { messages: messages.reverse(), total }
      },
      CACHE_TTL.USER_PROFILE
    )

    // Actualizar último visto del usuario
    await prisma.chatParticipant.update({
      where: {
        roomId_userId: {
          roomId,
          userId
        }
      },
      data: {
        lastSeen: new Date()
      }
    })

    const totalPages = Math.ceil(result.total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      messages: result.messages,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return handleError(error)
  }
}

// POST - Enviar mensaje
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
    const { roomId, content, type, metadata } = await request.json()

    if (!roomId || !content) {
      return NextResponse.json(
        { error: 'ID de sala y contenido son requeridos' },
        { status: 400 }
      )
    }

    console.log('💬 [SEND_MESSAGE] Enviando mensaje a sala:', roomId)

    // Verificar que el usuario es participante de la sala
    const participation = await prisma.chatParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId
        }
      }
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta sala' },
        { status: 403 }
      )
    }

    // Crear mensaje
    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        userId,
        content: content.trim(),
        type: type || 'TEXT',
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Actualizar timestamp de la sala
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() }
    })

    // Limpiar caché de mensajes
    invalidateRelatedCache(`chat_messages:${roomId}`)

    console.log(`✅ [SEND_MESSAGE] Mensaje enviado: ${message.id}`)

    return NextResponse.json({
      message: 'Mensaje enviado exitosamente',
      data: message
    }, { status: 201 })

  } catch (error) {
    console.error('Error sending message:', error)
    return handleError(error)
  }
}
