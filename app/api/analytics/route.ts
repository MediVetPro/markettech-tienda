import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getAnalyticsMetrics } from '@/lib/analytics'

// GET - Obtener métricas de analytics
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

    // Solo administradores pueden ver analytics
    if (decoded.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver analytics' },
        { status: 403 }
      )
    }

    const { searchParams } = request.nextUrl
    const period = searchParams.get('period') as 'day' | 'week' | 'month' || 'day'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('📊 [ANALYTICS] Obteniendo métricas para período:', period)

    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    const metrics = await getAnalyticsMetrics(period, start, end)

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Error getting analytics metrics:', error)
    return handleError(error)
  }
}
