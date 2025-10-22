import { prisma } from './prisma'
import { getCachedData, cacheHelpers, CACHE_TTL } from './cache'

export interface EventData {
  eventType: string
  eventName: string
  category?: string
  action?: string
  label?: string
  value?: number
  properties?: any
  page?: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
  country?: string
  city?: string
  device?: string
  browser?: string
  os?: string
}

export interface SessionData {
  sessionId: string
  userId?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  country?: string
  city?: string
  device?: string
  browser?: string
  os?: string
  screen?: string
  language?: string
}

// Registrar evento de usuario
export async function trackEvent(
  sessionId: string,
  eventData: EventData,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📊 [ANALYTICS] Registrando evento:', eventData.eventName)

    // Crear o actualizar sesión
    await upsertSession(sessionId, { sessionId, userId })

    // Crear evento
    await prisma.userEvent.create({
      data: {
        userId,
        sessionId,
        ...eventData,
        properties: eventData.properties ? JSON.stringify(eventData.properties) : null
      }
    })

    // Actualizar contador de eventos en la sesión
    await prisma.userSession.update({
      where: { sessionId },
      data: {
        eventCount: { increment: 1 },
        updatedAt: new Date()
      }
    })

    console.log(`✅ [ANALYTICS] Evento registrado: ${eventData.eventName}`)
    return { success: true }

  } catch (error) {
    console.error('❌ [ANALYTICS] Error registrando evento:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Registrar vista de página
export async function trackPageView(
  sessionId: string,
  page: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📊 [ANALYTICS] Registrando vista de página:', page)

    // Crear o actualizar sesión
    await upsertSession(sessionId, { sessionId, userId })

    // Crear evento de vista de página
    await prisma.userEvent.create({
      data: {
        userId,
        sessionId,
        eventType: 'PAGE_VIEW',
        eventName: 'page_view',
        page
      }
    })

    // Actualizar contador de vistas en la sesión
    await prisma.userSession.update({
      where: { sessionId },
      data: {
        pageViews: { increment: 1 },
        eventCount: { increment: 1 },
        updatedAt: new Date()
      }
    })

    console.log(`✅ [ANALYTICS] Vista de página registrada: ${page}`)
    return { success: true }

  } catch (error) {
    console.error('❌ [ANALYTICS] Error registrando vista de página:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Crear o actualizar sesión
async function upsertSession(sessionId: string, sessionData: SessionData) {
  const existingSession = await prisma.userSession.findUnique({
    where: { sessionId }
  })

  if (existingSession) {
    // Actualizar sesión existente
    await prisma.userSession.update({
      where: { sessionId },
      data: {
        isActive: true,
        updatedAt: new Date()
      }
    })
  } else {
    // Crear nueva sesión
    await prisma.userSession.create({
      data: {
        sessionId,
        userId: sessionData.userId,
        referrer: sessionData.referrer,
        utmSource: sessionData.utmSource,
        utmMedium: sessionData.utmMedium,
        utmCampaign: sessionData.utmCampaign,
        utmTerm: sessionData.utmTerm,
        utmContent: sessionData.utmContent,
        country: sessionData.country,
        city: sessionData.city,
        device: sessionData.device,
        browser: sessionData.browser,
        os: sessionData.os,
        screen: sessionData.screen,
        language: sessionData.language
      }
    })
  }
}

// Obtener métricas de analytics
export async function getAnalyticsMetrics(
  period: 'day' | 'week' | 'month' = 'day',
  startDate?: Date,
  endDate?: Date
) {
  try {
    console.log('📊 [ANALYTICS] Obteniendo métricas para período:', period)

    const now = new Date()
    const start = startDate || getPeriodStart(period, now)
    const end = endDate || now

    // Usar caché para métricas
    const cacheKey = `analytics_metrics:${period}:${start.toISOString()}:${end.toISOString()}`
    
    return await getCachedData(
      cacheKey,
      async () => {
        // Métricas básicas
        const [
          totalSessions,
          totalPageViews,
          totalEvents,
          uniqueUsers,
          avgSessionDuration,
          bounceRate,
          conversionRate
        ] = await Promise.all([
          getTotalSessions(start, end),
          getTotalPageViews(start, end),
          getTotalEvents(start, end),
          getUniqueUsers(start, end),
          getAvgSessionDuration(start, end),
          getBounceRate(start, end),
          getConversionRate(start, end)
        ])

        // Métricas por dispositivo
        const deviceMetrics = await getDeviceMetrics(start, end)

        // Métricas por país
        const countryMetrics = await getCountryMetrics(start, end)

        // Métricas de conversión
        const conversionMetrics = await getConversionMetrics(start, end)

        // Eventos más populares
        const topEvents = await getTopEvents(start, end)

        // Páginas más visitadas
        const topPages = await getTopPages(start, end)

        return {
          period: {
            start,
            end,
            type: period
          },
          overview: {
            totalSessions,
            totalPageViews,
            totalEvents,
            uniqueUsers,
            avgSessionDuration,
            bounceRate,
            conversionRate
          },
          devices: deviceMetrics,
          countries: countryMetrics,
          conversions: conversionMetrics,
          topEvents,
          topPages
        }
      },
      CACHE_TTL.ADMIN_STATS
    )

  } catch (error) {
    console.error('Error getting analytics metrics:', error)
    throw error
  }
}

// Funciones auxiliares para métricas
async function getTotalSessions(start: Date, end: Date): Promise<number> {
  return await prisma.userSession.count({
    where: {
      startTime: { gte: start, lte: end }
    }
  })
}

async function getTotalPageViews(start: Date, end: Date): Promise<number> {
  return await prisma.userEvent.count({
    where: {
      eventType: 'PAGE_VIEW',
      createdAt: { gte: start, lte: end }
    }
  })
}

async function getTotalEvents(start: Date, end: Date): Promise<number> {
  return await prisma.userEvent.count({
    where: {
      createdAt: { gte: start, lte: end }
    }
  })
}

async function getUniqueUsers(start: Date, end: Date): Promise<number> {
  const result = await prisma.userSession.groupBy({
    by: ['userId'],
    where: {
      startTime: { gte: start, lte: end },
      userId: { not: null }
    }
  })
  return result.length
}

async function getAvgSessionDuration(start: Date, end: Date): Promise<number> {
  const sessions = await prisma.userSession.findMany({
    where: {
      startTime: { gte: start, lte: end },
      duration: { not: null }
    },
    select: { duration: true }
  })

  if (sessions.length === 0) return 0

  const totalDuration = sessions.reduce((sum, session) => 
    sum + (session.duration || 0), 0
  )

  return Math.round(totalDuration / sessions.length)
}

async function getBounceRate(start: Date, end: Date): Promise<number> {
  const totalSessions = await prisma.userSession.count({
    where: {
      startTime: { gte: start, lte: end }
    }
  })

  const bouncedSessions = await prisma.userSession.count({
    where: {
      startTime: { gte: start, lte: end },
      pageViews: 1
    }
  })

  return totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0
}

async function getConversionRate(start: Date, end: Date): Promise<number> {
  const totalSessions = await prisma.userSession.count({
    where: {
      startTime: { gte: start, lte: end }
    }
  })

  const conversionEvents = await prisma.userEvent.count({
    where: {
      eventType: 'PURCHASE',
      createdAt: { gte: start, lte: end }
    }
  })

  return totalSessions > 0 ? Math.round((conversionEvents / totalSessions) * 100) : 0
}

async function getDeviceMetrics(start: Date, end: Date) {
  return await prisma.userSession.groupBy({
    by: ['device'],
    where: {
      startTime: { gte: start, lte: end },
      device: { not: null }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })
}

async function getCountryMetrics(start: Date, end: Date) {
  return await prisma.userSession.groupBy({
    by: ['country'],
    where: {
      startTime: { gte: start, lte: end },
      country: { not: null }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })
}

async function getConversionMetrics(start: Date, end: Date) {
  return await prisma.userEvent.groupBy({
    by: ['eventType'],
    where: {
      eventType: { in: ['PURCHASE', 'CART_ADD', 'WISHLIST_ADD'] },
      createdAt: { gte: start, lte: end }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  })
}

async function getTopEvents(start: Date, end: Date) {
  return await prisma.userEvent.groupBy({
    by: ['eventName'],
    where: {
      createdAt: { gte: start, lte: end }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })
}

async function getTopPages(start: Date, end: Date) {
  return await prisma.userEvent.groupBy({
    by: ['page'],
    where: {
      eventType: 'PAGE_VIEW',
      createdAt: { gte: start, lte: end },
      page: { not: null }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })
}

function getPeriodStart(period: 'day' | 'week' | 'month', date: Date): Date {
  const start = new Date(date)
  
  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(start.getDate() - start.getDay())
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
  }
  
  return start
}
