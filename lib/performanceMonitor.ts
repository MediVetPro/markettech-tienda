import { NextRequest, NextResponse } from 'next/server'

interface PerformanceMetric {
  id: string
  endpoint: string
  method: string
  duration: number
  statusCode: number
  timestamp: Date
  memoryUsage: NodeJS.MemoryUsage
  userAgent?: string
  ip?: string
}

interface PerformanceStats {
  totalRequests: number
  averageResponseTime: number
  slowestEndpoints: Array<{
    endpoint: string
    averageDuration: number
    requestCount: number
  }>
  errorRate: number
  memoryUsage: {
    current: number
    peak: number
    average: number
  }
  topEndpoints: Array<{
    endpoint: string
    requestCount: number
    averageDuration: number
  }>
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private readonly MAX_METRICS = 1000 // Mantener solo los últimos 1000 registros

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Registra una métrica de rendimiento
   */
  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) {
    const fullMetric: PerformanceMetric = {
      ...metric,
      id: `perf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    }

    this.metrics.push(fullMetric)

    // Mantener solo los últimos MAX_METRICS registros
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }

    // Log métricas lentas
    if (metric.duration > 2000) { // Más de 2 segundos
      console.warn(`🐌 [PERFORMANCE] Endpoint lento detectado: ${metric.method} ${metric.endpoint} - ${metric.duration}ms`)
    }

    // Log errores
    if (metric.statusCode >= 400) {
      console.error(`❌ [PERFORMANCE] Error en endpoint: ${metric.method} ${metric.endpoint} - ${metric.statusCode}`)
    }
  }

  /**
   * Middleware para medir el rendimiento de las APIs
   */
  withPerformanceMonitoring(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
      const startTime = Date.now()
      const startMemory = process.memoryUsage()
      const endpoint = req.nextUrl.pathname
      const method = req.method

      try {
        const response = await handler(req)
        const duration = Date.now() - startTime
        const endMemory = process.memoryUsage()

        this.recordMetric({
          endpoint,
          method,
          duration,
          statusCode: response.status,
          memoryUsage: endMemory,
          userAgent: req.headers.get('user-agent') || undefined,
          ip: req.ip || req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
        })

        return response
      } catch (error) {
        const duration = Date.now() - startTime
        const endMemory = process.memoryUsage()

        this.recordMetric({
          endpoint,
          method,
          duration,
          statusCode: 500,
          memoryUsage: endMemory,
          userAgent: req.headers.get('user-agent') || undefined,
          ip: req.ip || req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
        })

        throw error
      }
    }
  }

  /**
   * Obtiene estadísticas de rendimiento
   */
  getPerformanceStats(timeWindow?: number): PerformanceStats {
    const now = Date.now()
    const windowMs = timeWindow || 60 * 60 * 1000 // 1 hora por defecto
    const cutoffTime = new Date(now - windowMs)

    const recentMetrics = this.metrics.filter(
      metric => metric.timestamp >= cutoffTime
    )

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowestEndpoints: [],
        errorRate: 0,
        memoryUsage: {
          current: process.memoryUsage().heapUsed,
          peak: process.memoryUsage().heapUsed,
          average: process.memoryUsage().heapUsed
        },
        topEndpoints: []
      }
    }

    // Calcular métricas básicas
    const totalRequests = recentMetrics.length
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length
    const errorRate = (errorCount / totalRequests) * 100

    // Endpoints más lentos
    const endpointDurations = new Map<string, { totalDuration: number; count: number }>()
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`
      const existing = endpointDurations.get(key) || { totalDuration: 0, count: 0 }
      existing.totalDuration += metric.duration
      existing.count += 1
      endpointDurations.set(key, existing)
    })

    const slowestEndpoints = Array.from(endpointDurations.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        averageDuration: data.totalDuration / data.count,
        requestCount: data.count
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10)

    // Uso de memoria
    const memoryUsages = recentMetrics.map(m => m.memoryUsage.heapUsed)
    const currentMemory = process.memoryUsage().heapUsed
    const peakMemory = Math.max(...memoryUsages, currentMemory)
    const averageMemory = memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length

    // Endpoints más utilizados
    const endpointCounts = new Map<string, { count: number; totalDuration: number }>()
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`
      const existing = endpointCounts.get(key) || { count: 0, totalDuration: 0 }
      existing.count += 1
      existing.totalDuration += metric.duration
      endpointCounts.set(key, existing)
    })

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        requestCount: data.count,
        averageDuration: data.totalDuration / data.count
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10)

    return {
      totalRequests,
      averageResponseTime,
      slowestEndpoints,
      errorRate,
      memoryUsage: {
        current: currentMemory,
        peak: peakMemory,
        average: averageMemory
      },
      topEndpoints
    }
  }

  /**
   * Obtiene métricas detalladas
   */
  getDetailedMetrics(limit: number = 100) {
    return this.metrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Limpia métricas antiguas
   */
  cleanupOldMetrics(maxAge: number = 24 * 60 * 60 * 1000) { // 24 horas por defecto
    const cutoffTime = new Date(Date.now() - maxAge)
    this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoffTime)
  }

  /**
   * Obtiene alertas de rendimiento
   */
  getPerformanceAlerts(): Array<{
    type: 'SLOW_RESPONSE' | 'HIGH_ERROR_RATE' | 'HIGH_MEMORY_USAGE'
    message: string
    severity: 'WARNING' | 'CRITICAL'
    value: number
    threshold: number
  }> {
    const alerts: Array<{
      type: 'SLOW_RESPONSE' | 'HIGH_ERROR_RATE' | 'HIGH_MEMORY_USAGE'
      message: string
      severity: 'WARNING' | 'CRITICAL'
      value: number
      threshold: number
    }> = []

    const stats = this.getPerformanceStats()

    // Alerta de respuesta lenta
    if (stats.averageResponseTime > 1000) {
      alerts.push({
        type: 'SLOW_RESPONSE',
        message: `Tiempo de respuesta promedio alto: ${stats.averageResponseTime.toFixed(2)}ms`,
        severity: stats.averageResponseTime > 2000 ? 'CRITICAL' : 'WARNING',
        value: stats.averageResponseTime,
        threshold: 1000
      })
    }

    // Alerta de alta tasa de errores
    if (stats.errorRate > 5) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: `Tasa de errores alta: ${stats.errorRate.toFixed(2)}%`,
        severity: stats.errorRate > 10 ? 'CRITICAL' : 'WARNING',
        value: stats.errorRate,
        threshold: 5
      })
    }

    // Alerta de alto uso de memoria
    const memoryUsageMB = stats.memoryUsage.current / 1024 / 1024
    if (memoryUsageMB > 100) {
      alerts.push({
        type: 'HIGH_MEMORY_USAGE',
        message: `Uso de memoria alto: ${memoryUsageMB.toFixed(2)}MB`,
        severity: memoryUsageMB > 200 ? 'CRITICAL' : 'WARNING',
        value: memoryUsageMB,
        threshold: 100
      })
    }

    return alerts
  }
}

// Exportar instancia singleton
export const performanceMonitor = PerformanceMonitor.getInstance()

// Función helper para usar en las APIs
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return performanceMonitor.withPerformanceMonitoring(handler)
}
