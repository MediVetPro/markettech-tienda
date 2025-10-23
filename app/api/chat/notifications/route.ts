import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL, invalidateRelatedCache } from '@/lib/cache'

// GET - Obtener notificaciones de chat
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

    const userId = decoded.user.userId
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('🔔 [CHAT_NOTIFICATIONS] Obteniendo notificaciones de chat')

    // Usar caché para notificaciones
    const cacheKey = `chat_notifications:${userId}:${page}:${limit}`
    
    const result = await getCachedData(
      cacheKey,
      async () => {
        // Obtener salas donde el usuario es participante
        const userRooms = await prisma.chatParticipant.findMany({
          where: { userId },
          select: { roomId: true, lastSeen: true }
        })

        const roomIds = userRooms.map(ur => ur.roomId)
        const lastSeenMap = new Map(userRooms.map(ur => [ur.roomId, ur.lastSeen]))

        if (roomIds.length === 0) {
          return { notifications: [], total: 0 }
        }

        // Obtener mensajes no leídos
        const unreadMessages = await prisma.chatMessage.findMany({
          where: {
            roomId: { in: roomIds },
            userId: { not: userId }, // Excluir mensajes propios
            createdAt: {
              gt: new Date(Math.min(...userRooms.map(ur => ur.lastSeen.getTime())))
            }
          },
          include: {
            room: {
              select: {
                id: true,
                name: true,
                type: true,
                category: true
              }
            },
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        })

        // Agrupar notificaciones por sala
        const notificationsByRoom = new Map()
        
        unreadMessages.forEach(message => {
          const roomId = message.roomId
          if (!notificationsByRoom.has(roomId)) {
            notificationsByRoom.set(roomId, {
              room: message.room,
              unreadCount: 0,
              lastMessage: null,
              lastMessageTime: null,
              participants: new Set()
            })
          }
          
          const notification = notificationsByRoom.get(roomId)
          notification.unreadCount++
          
          if (!notification.lastMessage || message.createdAt > notification.lastMessageTime) {
            notification.lastMessage = message
            notification.lastMessageTime = message.createdAt
          }
          
          notification.participants.add(message.user.name)
        })

        // Convertir a array y agregar información adicional
        const notifications = Array.from(notificationsByRoom.values()).map(notification => ({
          room: notification.room,
          unreadCount: notification.unreadCount,
          lastMessage: {
            id: notification.lastMessage.id,
            content: notification.lastMessage.content,
            type: notification.lastMessage.type,
            createdAt: notification.lastMessage.createdAt,
            user: notification.lastMessage.user
          },
          participants: Array.from(notification.participants),
          lastSeen: lastSeenMap.get(notification.room.id)
        }))

        // Ordenar por último mensaje
        notifications.sort((a, b) => 
          new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
        )

        return {
          notifications,
          total: notifications.length
        }
      },
      CACHE_TTL.USER_PROFILE
    )

    const totalPages = Math.ceil(result.total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      notifications: result.notifications,
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
    console.error('Error fetching chat notifications:', error)
    return handleError(error)
  }
}

// POST - Marcar mensajes como leídos
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

    const userId = decoded.user.userId
    const { roomId } = await request.json()

    if (!roomId) {
      return NextResponse.json(
        { error: 'ID de sala es requerido' },
        { status: 400 }
      )
    }

    console.log('🔔 [MARK_READ] Marcando mensajes como leídos en sala:', roomId)

    // Verificar que el usuario es participante
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

    // Actualizar último visto
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

    // Limpiar caché de notificaciones
    invalidateRelatedCache(`chat_notifications:${userId}`)

    console.log(`✅ [MARK_READ] Mensajes marcados como leídos`)

    return NextResponse.json({
      message: 'Mensajes marcados como leídos'
    })

  } catch (error) {
    console.error('Error marking messages as read:', error)
    return handleError(error)
  }
}
