import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { trackEvent, trackPageView } from '@/lib/analytics'

// POST - Registrar evento de analytics
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const decoded = token ? verifyToken(token) : null

    const { 
      sessionId, 
      eventType, 
      eventName, 
      category, 
      action, 
      label, 
      value, 
      properties, 
      page, 
      referrer,
      userAgent,
      ipAddress,
      country,
      city,
      device,
      browser,
      os
    } = await request.json()

    if (!sessionId || !eventType || !eventName) {
      return NextResponse.json(
        { error: 'sessionId, eventType y eventName son requeridos' },
        { status: 400 }
      )
    }

    console.log('📊 [ANALYTICS_TRACK] Registrando evento:', eventName)

    const eventData = {
      eventType,
      eventName,
      category,
      action,
      label,
      value: value ? parseFloat(value) : undefined,
      properties,
      page,
      referrer,
      userAgent,
      ipAddress,
      country,
      city,
      device,
      browser,
      os
    }

    const result = await trackEvent(sessionId, eventData, decoded?.user?.userId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error registrando evento' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Evento registrado exitosamente',
      success: true
    })

  } catch (error) {
    console.error('Error tracking event:', error)
    return handleError(error)
  }
}

// PUT - Registrar vista de página
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const decoded = token ? verifyToken(token) : null

    const { 
      sessionId, 
      page, 
      referrer,
      userAgent,
      ipAddress,
      country,
      city,
      device,
      browser,
      os
    } = await request.json()

    if (!sessionId || !page) {
      return NextResponse.json(
        { error: 'sessionId y page son requeridos' },
        { status: 400 }
      )
    }

    console.log('📊 [ANALYTICS_TRACK] Registrando vista de página:', page)

    const result = await trackPageView(sessionId, page, decoded?.user?.userId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error registrando vista de página' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Vista de página registrada exitosamente',
      success: true
    })

  } catch (error) {
    console.error('Error tracking page view:', error)
    return handleError(error)
  }
}
