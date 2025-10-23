import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { clearUserCache } from '@/lib/cache'

// POST - Unirse a sala de chat
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

    console.log('💬 [JOIN_ROOM] Usuario uniéndose a sala:', roomId)

    // Verificar que la sala existe y está activa
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Sala no encontrada' },
        { status: 404 }
      )
    }

    if (!room.isActive) {
      return NextResponse.json(
        { error: 'La sala no está activa' },
        { status: 400 }
      )
    }

    // Verificar si ya es participante
    const existingParticipation = await prisma.chatParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId
        }
      }
    })

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'Ya eres participante de esta sala' },
        { status: 400 }
      )
    }

    // Verificar límites de participantes para salas privadas
    if (room.type === 'PRIVATE' && room._count.participants >= 10) {
      return NextResponse.json(
        { error: 'La sala privada ha alcanzado su límite de participantes' },
        { status: 400 }
      )
    }

    // Unirse a la sala
    const participation = await prisma.chatParticipant.create({
      data: {
        roomId,
        userId,
        role: 'MEMBER'
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            category: true
          }
        }
      }
    })

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`✅ [JOIN_ROOM] Usuario unido a sala: ${room.name}`)

    return NextResponse.json({
      message: 'Te has unido a la sala exitosamente',
      room: participation.room,
      participation: {
        role: participation.role,
        joinedAt: participation.joinedAt
      }
    })

  } catch (error) {
    console.error('Error joining room:', error)
    return handleError(error)
  }
}

// DELETE - Salir de sala de chat
export async function DELETE(request: NextRequest) {
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
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json(
        { error: 'ID de sala es requerido' },
        { status: 400 }
      )
    }

    console.log('💬 [LEAVE_ROOM] Usuario saliendo de sala:', roomId)

    // Verificar que es participante
    const participation = await prisma.chatParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId
        }
      },
      include: {
        room: {
          select: {
            name: true,
            createdBy: true
          }
        }
      }
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'No eres participante de esta sala' },
        { status: 404 }
      )
    }

    // Verificar si es el creador de la sala
    if (participation.room.createdBy === userId) {
      return NextResponse.json(
        { error: 'No puedes salir de la sala que creaste. Transfiere la propiedad o elimina la sala.' },
        { status: 400 }
      )
    }

    // Salir de la sala
    await prisma.chatParticipant.delete({
      where: {
        roomId_userId: {
          roomId,
          userId
        }
      }
    })

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`✅ [LEAVE_ROOM] Usuario salió de sala: ${participation.room.name}`)

    return NextResponse.json({
      message: 'Has salido de la sala exitosamente'
    })

  } catch (error) {
    console.error('Error leaving room:', error)
    return handleError(error)
  }
}
