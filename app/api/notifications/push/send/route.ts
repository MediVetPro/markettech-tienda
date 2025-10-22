import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { 
  sendPushNotification, 
  sendBulkPushNotification, 
  sendCategoryPushNotification 
} from '@/lib/pushNotifications'

// POST - Enviar notificación push
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

    // Solo administradores pueden enviar notificaciones
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden enviar notificaciones' },
        { status: 403 }
      )
    }

    const { 
      userIds, 
      category, 
      title, 
      message, 
      icon, 
      badge, 
      url, 
      data 
    } = await request.json()

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Título y mensaje son requeridos' },
        { status: 400 }
      )
    }

    console.log('📱 [PUSH_SEND] Enviando notificación push')

    const notification = {
      title,
      message,
      icon,
      badge,
      url,
      data
    }

    let result

    if (category) {
      // Enviar por categoría
      result = await sendCategoryPushNotification(category, notification)
    } else if (userIds && Array.isArray(userIds)) {
      // Enviar a usuarios específicos
      result = await sendBulkPushNotification(userIds, notification)
    } else {
      return NextResponse.json(
        { error: 'Debe especificar userIds o category' },
        { status: 400 }
      )
    }

    // Registrar en log
    await prisma.notificationLog.create({
      data: {
        userId: 'system', // Para notificaciones del sistema
        type: 'PUSH',
        category: category || 'SYSTEM',
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        status: result.success > 0 ? 'SENT' : 'FAILED',
        sentAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Notificación enviada exitosamente',
      result: {
        success: result.success,
        failed: result.failed,
        errors: (result as any).errors || []
      }
    })

  } catch (error) {
    console.error('Error sending push notification:', error)
    return handleError(error)
  }
}

// GET - Obtener estadísticas de notificaciones push
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

    // Solo administradores pueden ver estadísticas
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver estadísticas' },
        { status: 403 }
      )
    }

    console.log('📊 [PUSH_STATS] Obteniendo estadísticas de notificaciones push')

    // Estadísticas de suscripciones
    const subscriptionStats = await prisma.pushSubscription.groupBy({
      by: ['isActive'],
      _count: { id: true }
    })

    // Estadísticas de notificaciones enviadas
    const notificationStats = await prisma.notificationLog.groupBy({
      by: ['status'],
      where: {
        type: 'PUSH',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      },
      _count: { id: true }
    })

    // Notificaciones por categoría
    const categoryStats = await prisma.notificationLog.groupBy({
      by: ['category'],
      where: {
        type: 'PUSH',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: { id: true }
    })

    // Notificaciones recientes
    const recentNotifications = await prisma.notificationLog.findMany({
      where: {
        type: 'PUSH',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        message: true,
        category: true,
        status: true,
        sentAt: true,
        createdAt: true
      }
    })

    const totalSubscriptions = subscriptionStats.reduce((sum, stat) => sum + stat._count.id, 0)
    const activeSubscriptions = subscriptionStats.find(s => s.isActive)?._count.id || 0

    return NextResponse.json({
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        inactive: totalSubscriptions - activeSubscriptions
      },
      notifications: {
        byStatus: notificationStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id
          return acc
        }, {} as Record<string, number>),
        byCategory: categoryStats.reduce((acc, stat) => {
          acc[stat.category] = stat._count.id
          return acc
        }, {} as Record<string, number>)
      },
      recent: recentNotifications
    })

  } catch (error) {
    console.error('Error getting push notification stats:', error)
    return handleError(error)
  }
}
