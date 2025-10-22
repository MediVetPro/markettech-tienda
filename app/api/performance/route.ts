import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { performanceMonitor } from '@/lib/performanceMonitor'
import { getCacheStats } from '@/lib/cache'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      throw CommonErrors.UNAUTHORIZED()
    }

    const auth = verifyAuth(token)
    if (!auth.user || auth.user.role !== 'ADMIN') {
      throw CommonErrors.FORBIDDEN()
    }

    const { searchParams } = new URL(req.url)
    const timeWindow = searchParams.get('timeWindow')
    const limit = searchParams.get('limit')

    const windowMs = timeWindow ? parseInt(timeWindow) * 60 * 1000 : undefined // Convertir minutos a ms
    const limitNum = limit ? parseInt(limit) : 100

    const stats = performanceMonitor.getPerformanceStats(windowMs)
    const alerts = performanceMonitor.getPerformanceAlerts()
    const detailedMetrics = performanceMonitor.getDetailedMetrics(limitNum)

    return NextResponse.json({
      stats,
      alerts,
      detailedMetrics,
      cacheStats: getCacheStats()
    }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      throw CommonErrors.UNAUTHORIZED()
    }

    const auth = verifyAuth(token)
    if (!auth.user || auth.user.role !== 'ADMIN') {
      throw CommonErrors.FORBIDDEN()
    }

    const { searchParams } = new URL(req.url)
    const maxAge = searchParams.get('maxAge')

    const maxAgeMs = maxAge ? parseInt(maxAge) * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // Convertir horas a ms
    performanceMonitor.cleanupOldMetrics(maxAgeMs)

    return NextResponse.json({ message: 'Métricas antiguas limpiadas exitosamente' }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
