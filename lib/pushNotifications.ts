import webpush from 'web-push'
import { prisma } from './prisma'

// Configurar web-push solo si las claves están disponibles
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

let vapidConfigured = false

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@markettech.com',
      vapidPublicKey,
      vapidPrivateKey
    )
    vapidConfigured = true
    console.log('✅ [PUSH] Claves VAPID configuradas correctamente')
  } catch (error) {
    console.warn('⚠️ [PUSH] Error configurando claves VAPID:', error)
    vapidConfigured = false
  }
} else {
  console.warn('⚠️ [PUSH] Claves VAPID no configuradas. Las notificaciones push no funcionarán.')
}

export interface PushNotificationData {
  title: string
  message: string
  icon?: string
  badge?: string
  url?: string
  data?: any
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

// Enviar notificación push a un usuario específico
export async function sendPushNotification(
  userId: string,
  notification: PushNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📱 [PUSH] Enviando notificación a usuario:', userId)

    // Verificar si las claves VAPID están configuradas
    if (!vapidConfigured) {
      console.log('⚠️ [PUSH] VAPID no configurado, saltando envío')
      return { success: false, error: 'VAPID no configurado' }
    }

    // Obtener suscripciones activas del usuario
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true
      }
    })

    if (subscriptions.length === 0) {
      console.log('⚠️ [PUSH] No hay suscripciones activas para el usuario')
      return { success: false, error: 'No hay suscripciones activas' }
    }

    // Crear payload de notificación
    const payload: NotificationPayload = {
      title: notification.title,
      body: notification.message,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      url: notification.url || '/',
      data: notification.data || {},
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Descartar'
        }
      ]
    }

    // Enviar a todas las suscripciones
    const results = await Promise.allSettled(
      subscriptions.map(subscription => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }

        return webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        )
      })
    )

    // Verificar resultados
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`✅ [PUSH] Notificación enviada: ${successful} exitosas, ${failed} fallidas`)

    // Desactivar suscripciones que fallaron
    const failedSubscriptions = subscriptions.filter((_, index) => 
      results[index].status === 'rejected'
    )

    if (failedSubscriptions.length > 0) {
      await prisma.pushSubscription.updateMany({
        where: {
          id: { in: failedSubscriptions.map(s => s.id) }
        },
        data: { isActive: false }
      })
    }

    return { success: successful > 0 }

  } catch (error) {
    console.error('❌ [PUSH] Error enviando notificación:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Enviar notificación push a múltiples usuarios
export async function sendBulkPushNotification(
  userIds: string[],
  notification: PushNotificationData
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('📱 [PUSH_BULK] Enviando notificación a', userIds.length, 'usuarios')

  const results = await Promise.allSettled(
    userIds.map(userId => sendPushNotification(userId, notification))
  )

  const successful = results.filter(r => 
    r.status === 'fulfilled' && r.value.success
  ).length

  const failed = results.length - successful
  const errors = results
    .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
    .map(r => r.status === 'rejected' ? r.reason : r.value.error)
    .filter(Boolean)

  console.log(`✅ [PUSH_BULK] Resultado: ${successful} exitosas, ${failed} fallidas`)

  return { success: successful, failed, errors }
}

// Enviar notificación push por categoría
export async function sendCategoryPushNotification(
  category: string,
  notification: PushNotificationData
): Promise<{ success: number; failed: number }> {
  console.log('📱 [PUSH_CATEGORY] Enviando notificación por categoría:', category)

  // Obtener usuarios que tienen habilitadas las notificaciones push para esta categoría
  const preferences = await prisma.notificationPreference.findMany({
    where: {
      type: 'PUSH',
      category,
      isEnabled: true
    },
    select: { userId: true }
  })

  const userIds = preferences.map(p => p.userId)

  if (userIds.length === 0) {
    console.log('⚠️ [PUSH_CATEGORY] No hay usuarios con notificaciones habilitadas para esta categoría')
    return { success: 0, failed: 0 }
  }

  const result = await sendBulkPushNotification(userIds, notification)
  return { success: result.success, failed: result.failed }
}

// Registrar suscripción push
export async function registerPushSubscription(
  userId: string,
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📱 [PUSH_REGISTER] Registrando suscripción para usuario:', userId)

    // Verificar si ya existe
    const existing = await prisma.pushSubscription.findUnique({
      where: {
        userId_endpoint: {
          userId,
          endpoint: subscription.endpoint
        }
      }
    })

    if (existing) {
      // Actualizar suscripción existente
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          isActive: true,
          updatedAt: new Date()
        }
      })
    } else {
      // Crear nueva suscripción
      await prisma.pushSubscription.create({
        data: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      })
    }

    console.log('✅ [PUSH_REGISTER] Suscripción registrada exitosamente')
    return { success: true }

  } catch (error) {
    console.error('❌ [PUSH_REGISTER] Error registrando suscripción:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Desactivar suscripción push
export async function unregisterPushSubscription(
  userId: string,
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📱 [PUSH_UNREGISTER] Desactivando suscripción para usuario:', userId)

    await prisma.pushSubscription.updateMany({
      where: {
        userId,
        endpoint
      },
      data: { isActive: false }
    })

    console.log('✅ [PUSH_UNREGISTER] Suscripción desactivada exitosamente')
    return { success: true }

  } catch (error) {
    console.error('❌ [PUSH_UNREGISTER] Error desactivando suscripción:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Obtener estadísticas de notificaciones push
export async function getPushNotificationStats() {
  try {
    const stats = await prisma.pushSubscription.groupBy({
      by: ['isActive'],
      _count: { id: true }
    })

    const totalSubscriptions = await prisma.pushSubscription.count()
    const activeSubscriptions = stats.find(s => s.isActive)?._count.id || 0
    const inactiveSubscriptions = totalSubscriptions - activeSubscriptions

    return {
      total: totalSubscriptions,
      active: activeSubscriptions,
      inactive: inactiveSubscriptions
    }

  } catch (error) {
    console.error('Error getting push notification stats:', error)
    throw error
  }
}
