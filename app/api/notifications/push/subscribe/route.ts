import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { registerPushSubscription, unregisterPushSubscription } from '@/lib/pushNotifications'

// POST - Suscribirse a notificaciones push
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
    const { subscription } = await request.json()

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Datos de suscripción inválidos' },
        { status: 400 }
      )
    }

    console.log('📱 [PUSH_SUBSCRIBE] Registrando suscripción para usuario:', userId)

    // Registrar suscripción
    const result = await registerPushSubscription(userId, subscription)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error registrando suscripción' },
        { status: 400 }
      )
    }

    // Crear preferencias por defecto si no existen
    await createDefaultNotificationPreferences(userId)

    return NextResponse.json({
      message: 'Suscripción registrada exitosamente',
      success: true
    })

  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return handleError(error)
  }
}

// DELETE - Desuscribirse de notificaciones push
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
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint es requerido' },
        { status: 400 }
      )
    }

    console.log('📱 [PUSH_UNSUBSCRIBE] Desactivando suscripción para usuario:', userId)

    // Desactivar suscripción
    const result = await unregisterPushSubscription(userId, endpoint)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error desactivando suscripción' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Suscripción desactivada exitosamente',
      success: true
    })

  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    return handleError(error)
  }
}

// Función para crear preferencias por defecto
async function createDefaultNotificationPreferences(userId: string) {
  const defaultPreferences = [
    { type: 'PUSH', category: 'ORDERS', isEnabled: true },
    { type: 'PUSH', category: 'PROMOTIONS', isEnabled: true },
    { type: 'PUSH', category: 'CHAT', isEnabled: true },
    { type: 'PUSH', category: 'PRICE_ALERTS', isEnabled: true },
    { type: 'EMAIL', category: 'ORDERS', isEnabled: true },
    { type: 'EMAIL', category: 'PROMOTIONS', isEnabled: false },
    { type: 'EMAIL', category: 'CHAT', isEnabled: false },
    { type: 'EMAIL', category: 'PRICE_ALERTS', isEnabled: true }
  ]

  for (const pref of defaultPreferences) {
    await prisma.notificationPreference.upsert({
      where: {
        userId_type_category: {
          userId,
          type: pref.type,
          category: pref.category
        }
      },
      update: {},
      create: {
        userId,
        type: pref.type,
        category: pref.category,
        isEnabled: pref.isEnabled
      }
    })
  }
}
