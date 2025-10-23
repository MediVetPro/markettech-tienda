import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL, clearUserCache } from '@/lib/cache'

// GET - Obtener preferencias de notificaciones del usuario
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

    console.log('🔔 [NOTIFICATION_PREFS] Obteniendo preferencias para usuario:', userId)

    // Usar caché para preferencias
    const cacheKey = `notification_preferences:${userId}`
    
    const preferences = await getCachedData(
      cacheKey,
      async () => {
        const prefs = await prisma.notificationPreference.findMany({
          where: { userId },
          orderBy: [
            { type: 'asc' },
            { category: 'asc' }
          ]
        })

        // Agrupar por tipo
        const grouped = prefs.reduce((acc, pref) => {
          if (!acc[pref.type]) {
            acc[pref.type] = {}
          }
          acc[pref.type][pref.category] = {
            id: pref.id,
            isEnabled: pref.isEnabled,
            frequency: pref.frequency,
            quietHoursStart: pref.quietHoursStart,
            quietHoursEnd: pref.quietHoursEnd
          }
          return acc
        }, {} as Record<string, any>)

        return grouped
      },
      CACHE_TTL.USER_PROFILE
    )

    return NextResponse.json({
      preferences
    })

  } catch (error) {
    console.error('Error getting notification preferences:', error)
    return handleError(error)
  }
}

// PUT - Actualizar preferencias de notificaciones
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
    
    if (!decoded.user || decoded.error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.user.userId
    const { preferences } = await request.json()

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Preferencias inválidas' },
        { status: 400 }
      )
    }

    console.log('🔔 [NOTIFICATION_PREFS] Actualizando preferencias para usuario:', userId)

    // Validar y actualizar preferencias
    const updates = []
    
    for (const [type, categories] of Object.entries(preferences)) {
      if (typeof categories !== 'object') continue
      
      for (const [category, settings] of Object.entries(categories as any)) {
        if (typeof settings !== 'object' || settings === null) continue

        const { isEnabled, frequency, quietHoursStart, quietHoursEnd } = settings as any

        // Validar valores
        if (typeof isEnabled !== 'boolean') continue
        if (frequency && !['IMMEDIATE', 'DAILY', 'WEEKLY'].includes(frequency)) continue
        if (quietHoursStart && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(quietHoursStart)) continue
        if (quietHoursEnd && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(quietHoursEnd)) continue

        updates.push({
          where: {
            userId_type_category: {
              userId,
              type,
              category
            }
          },
          update: {
            isEnabled,
            frequency: frequency || 'IMMEDIATE',
            quietHoursStart: quietHoursStart || null,
            quietHoursEnd: quietHoursEnd || null,
            updatedAt: new Date()
          },
          create: {
            userId,
            type,
            category,
            isEnabled,
            frequency: frequency || 'IMMEDIATE',
            quietHoursStart: quietHoursStart || null,
            quietHoursEnd: quietHoursEnd || null
          }
        })
      }
    }

    // Ejecutar actualizaciones
    await Promise.all(
      updates.map(update => 
        prisma.notificationPreference.upsert(update)
      )
    )

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`✅ [NOTIFICATION_PREFS] Preferencias actualizadas: ${updates.length} cambios`)

    return NextResponse.json({
      message: 'Preferencias actualizadas exitosamente',
      updated: updates.length
    })

  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return handleError(error)
  }
}

// POST - Crear preferencias por defecto
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

    console.log('🔔 [NOTIFICATION_PREFS] Creando preferencias por defecto para usuario:', userId)

    // Verificar si ya tiene preferencias
    const existingPrefs = await prisma.notificationPreference.count({
      where: { userId }
    })

    if (existingPrefs > 0) {
      return NextResponse.json(
        { error: 'El usuario ya tiene preferencias configuradas' },
        { status: 400 }
      )
    }

    // Crear preferencias por defecto
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

    await prisma.notificationPreference.createMany({
      data: defaultPreferences.map(pref => ({
        userId,
        ...pref
      }))
    })

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`✅ [NOTIFICATION_PREFS] Preferencias por defecto creadas: ${defaultPreferences.length}`)

    return NextResponse.json({
      message: 'Preferencias por defecto creadas exitosamente',
      created: defaultPreferences.length
    })

  } catch (error) {
    console.error('Error creating default notification preferences:', error)
    return handleError(error)
  }
}
