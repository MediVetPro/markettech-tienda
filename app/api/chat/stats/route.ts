import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'

// GET - Obtener estadísticas de chat
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

    console.log('📊 [CHAT_STATS] Obteniendo estadísticas de chat')

    // Usar caché para estadísticas
    const cacheKey = `chat_stats:${userId}:${roomId || 'all'}`
    
    const stats = await getCachedData(
      cacheKey,
      async () => {
        if (roomId) {
          // Estadísticas de una sala específica
          return await getRoomStats(roomId, userId)
        } else {
          // Estadísticas generales del usuario
          return await getUserChatStats(userId)
        }
      },
      CACHE_TTL.USER_PROFILE
    )

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error getting chat stats:', error)
    return handleError(error)
  }
}

// Función para obtener estadísticas de una sala específica
async function getRoomStats(roomId: string, userId: string) {
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
    throw CommonErrors.PRODUCT_NOT_FOUND('Sala no encontrada')
  }

  // Estadísticas de la sala
  const roomStats = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      _count: {
        select: {
          participants: true,
          messages: true
        }
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  // Mensajes por día (últimos 30 días)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const messagesByDay = await prisma.chatMessage.groupBy({
    by: ['createdAt'],
    where: {
      roomId,
      createdAt: { gte: thirtyDaysAgo }
    },
    _count: { id: true }
  })

  // Usuarios más activos
  const mostActiveUsers = await prisma.chatMessage.groupBy({
    by: ['userId'],
    where: { roomId },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })

  // Obtener información de usuarios
  const userIds = mostActiveUsers.map(u => u.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true }
  })

  const userMap = new Map(users.map(u => [u.id, u]))

  return {
    room: {
      id: roomStats!.id,
      name: roomStats!.name,
      description: roomStats!.description,
      type: roomStats!.type,
      category: roomStats!.category,
      participantCount: roomStats!._count.participants,
      messageCount: roomStats!._count.messages
    },
    participants: roomStats!.participants.map(p => ({
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
      role: p.role,
      joinedAt: p.joinedAt,
      lastSeen: p.lastSeen
    })),
    activity: {
      messagesByDay: messagesByDay.map(m => ({
        date: m.createdAt.toISOString().split('T')[0],
        count: m._count.id
      })),
      mostActiveUsers: mostActiveUsers.map(u => ({
        user: userMap.get(u.userId),
        messageCount: u._count.id
      }))
    }
  }
}

// Función para obtener estadísticas generales del usuario
async function getUserChatStats(userId: string) {
  // Salas del usuario
  const userRooms = await prisma.chatParticipant.findMany({
    where: { userId },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
          _count: {
            select: {
              participants: true,
              messages: true
            }
          }
        }
      }
    }
  })

  // Mensajes totales del usuario
  const totalMessages = await prisma.chatMessage.count({
    where: { userId }
  })

  // Mensajes por tipo
  const messagesByType = await prisma.chatMessage.groupBy({
    by: ['type'],
    where: { userId },
    _count: { id: true }
  })

  // Actividad reciente (últimos 7 días)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentActivity = await prisma.chatMessage.count({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo }
    }
  })

  // Salas más activas del usuario
  const mostActiveRooms = await prisma.chatMessage.groupBy({
    by: ['roomId'],
    where: { userId },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  })

  const roomIds = mostActiveRooms.map(r => r.roomId)
  const rooms = await prisma.chatRoom.findMany({
    where: { id: { in: roomIds } },
    select: { id: true, name: true, type: true, category: true }
  })

  const roomMap = new Map(rooms.map(r => [r.id, r]))

  return {
    summary: {
      totalRooms: userRooms.length,
      totalMessages,
      recentActivity,
      averageMessagesPerRoom: userRooms.length > 0 ? Math.round(totalMessages / userRooms.length) : 0
    },
    rooms: userRooms.map(ur => ({
      id: ur.room.id,
      name: ur.room.name,
      type: ur.room.type,
      category: ur.room.category,
      role: ur.role,
      participantCount: ur.room._count.participants,
      messageCount: ur.room._count.messages,
      joinedAt: ur.joinedAt,
      lastSeen: ur.lastSeen
    })),
    activity: {
      messagesByType: messagesByType.map(m => ({
        type: m.type,
        count: m._count.id
      })),
      mostActiveRooms: mostActiveRooms.map(r => ({
        room: roomMap.get(r.roomId),
        messageCount: r._count.id
      }))
    }
  }
}
