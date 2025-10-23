import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL, clearUserCache } from '@/lib/cache'

// GET - Obtener salas de chat
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
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('💬 [CHAT_ROOMS] Obteniendo salas de chat')

    // Usar caché para salas de chat
    const cacheKey = `chat_rooms:${category || 'all'}:${type || 'all'}:${page}:${limit}`
    
    const result = await getCachedData(
      cacheKey,
      async () => {
        const where: any = {
          isActive: true
        }

        if (category) {
          where.category = category
        }

        if (type) {
          where.type = type
        }

        const [rooms, total] = await Promise.all([
          prisma.chatRoom.findMany({
            where,
            include: {
              participants: {
                where: { userId },
                select: { role: true, lastSeen: true }
              },
              _count: {
                select: {
                  participants: true,
                  messages: true
                }
              },
              creator: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
          }),
          prisma.chatRoom.count({ where })
        ])

        return { rooms, total }
      },
      CACHE_TTL.USER_PROFILE
    )

    // Agregar información de participación del usuario
    const roomsWithParticipation = result.rooms.map(room => ({
      ...room,
      isParticipant: room.participants.length > 0,
      userRole: room.participants[0]?.role || null,
      lastSeen: room.participants[0]?.lastSeen || null,
      participantCount: room._count.participants,
      messageCount: room._count.messages
    }))

    const totalPages = Math.ceil(result.total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      rooms: roomsWithParticipation,
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
    console.error('Error fetching chat rooms:', error)
    return handleError(error)
  }
}

// POST - Crear sala de chat
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
    const { name, description, type, category, isPrivate } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre de la sala es requerido' },
        { status: 400 }
      )
    }

    console.log('💬 [CREATE_ROOM] Creando sala de chat:', name)

    // Crear sala de chat
    const room = await prisma.chatRoom.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        type: type || (isPrivate ? 'PRIVATE' : 'PUBLIC'),
        category: category?.trim(),
        createdBy: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            participants: true,
            messages: true
          }
        }
      }
    })

    // Agregar creador como participante con rol de admin
    await prisma.chatParticipant.create({
      data: {
        roomId: room.id,
        userId,
        role: 'ADMIN'
      }
    })

    // Limpiar caché
    clearUserCache(userId)

    console.log(`✅ [CREATE_ROOM] Sala creada: ${room.name}`)

    return NextResponse.json({
      message: 'Sala de chat creada exitosamente',
      room: {
        ...room,
        isParticipant: true,
        userRole: 'ADMIN',
        participantCount: 1,
        messageCount: 0
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating chat room:', error)
    return handleError(error)
  }
}
