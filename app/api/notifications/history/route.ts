import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'

// GET - Obtener historial de notificaciones del usuario
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
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('📋 [NOTIFICATION_HISTORY] Obteniendo historial para usuario:', userId)

    // Construir filtros
    const where: any = { userId }

    if (type) {
      where.type = type
    }

    if (category) {
      where.category = category
    }

    if (status) {
      where.status = status
    }

    // Usar caché para historial
    const cacheKey = `notification_history:${userId}:${type || 'all'}:${category || 'all'}:${status || 'all'}:${page}:${limit}`
    
    const result = await getCachedData(
      cacheKey,
      async () => {
        const [notifications, total] = await Promise.all([
          prisma.notificationLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
              id: true,
              type: true,
              category: true,
              title: true,
              message: true,
              status: true,
              sentAt: true,
              deliveredAt: true,
              error: true,
              createdAt: true
            }
          }),
          prisma.notificationLog.count({ where })
        ])

        return { notifications, total }
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
    console.error('Error getting notification history:', error)
    return handleError(error)
  }
}

// DELETE - Limpiar historial de notificaciones
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
    const olderThan = searchParams.get('olderThan') // Días

    console.log('🗑️ [NOTIFICATION_HISTORY] Limpiando historial para usuario:', userId)

    let whereClause: any = { userId }

    if (olderThan) {
      const days = parseInt(olderThan)
      if (days > 0) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        whereClause.createdAt = { lt: cutoffDate }
      }
    }

    const deletedCount = await prisma.notificationLog.deleteMany({
      where: whereClause
    })

    console.log(`✅ [NOTIFICATION_HISTORY] Historial limpiado: ${deletedCount.count} notificaciones eliminadas`)

    return NextResponse.json({
      message: 'Historial limpiado exitosamente',
      deleted: deletedCount.count
    })

  } catch (error) {
    console.error('Error clearing notification history:', error)
    return handleError(error)
  }
}
