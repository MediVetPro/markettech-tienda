import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'

// GET - Obtener reportes de ventas
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

    // Solo administradores pueden ver reportes de ventas
    if (decoded.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver reportes de ventas' },
        { status: 403 }
      )
    }

    const { searchParams } = request.nextUrl
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('📊 [SALES_REPORT] Obteniendo reporte de ventas para período:', period)

    const start = startDate ? new Date(startDate) : getPeriodStart(period)
    const end = endDate ? new Date(endDate) : new Date()

    // Usar caché para reportes de ventas
    const cacheKey = `sales_report:${period}:${start.toISOString()}:${end.toISOString()}`
    
    const report = await getCachedData(
      cacheKey,
      async () => {
        // Métricas de ventas
        const [
          totalRevenue,
          totalOrders,
          avgOrderValue,
          topProducts,
          salesByDay,
          salesByCategory,
          customerMetrics,
          refundMetrics
        ] = await Promise.all([
          getTotalRevenue(start, end),
          getTotalOrders(start, end),
          getAvgOrderValue(start, end),
          getTopProducts(start, end),
          getSalesByDay(start, end),
          getSalesByCategory(start, end),
          getCustomerMetrics(start, end),
          getRefundMetrics(start, end)
        ])

        return {
          period: {
            start,
            end,
            type: period
          },
          overview: {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            growthRate: await getGrowthRate(start, end)
          },
          topProducts,
          salesByDay,
          salesByCategory,
          customers: customerMetrics,
          refunds: refundMetrics
        }
      },
      CACHE_TTL.ADMIN_STATS
    )

    return NextResponse.json(report)

  } catch (error) {
    console.error('Error getting sales report:', error)
    return handleError(error)
  }
}

// Funciones auxiliares para reportes de ventas
async function getTotalRevenue(start: Date, end: Date): Promise<number> {
  const result = await prisma.order.aggregate({
    where: {
      paymentStatus: 'PAID', // Solo pedidos realmente pagados
      createdAt: { gte: start, lte: end }
    },
    _sum: { total: true }
  })

  return parseFloat(result._sum.total?.toString() || '0')
}

async function getTotalOrders(start: Date, end: Date): Promise<number> {
  return await prisma.order.count({
    where: {
      paymentStatus: 'PAID', // Solo pedidos realmente pagados
      createdAt: { gte: start, lte: end }
    }
  })
}

async function getAvgOrderValue(start: Date, end: Date): Promise<number> {
  const result = await prisma.order.aggregate({
    where: {
      paymentStatus: 'PAID', // Solo pedidos realmente pagados
      createdAt: { gte: start, lte: end }
    },
    _avg: { total: true }
  })

  return parseFloat(result._avg.total?.toString() || '0')
}

async function getTopProducts(start: Date, end: Date) {
  return await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        paymentStatus: 'PAID', // Solo pedidos realmente pagados
        createdAt: { gte: start, lte: end }
      }
    },
    _sum: { 
      quantity: true,
      price: true
    },
    _count: { id: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10
  })
}

async function getSalesByDay(start: Date, end: Date) {
  const sales = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      paymentStatus: 'PAID', // Solo pedidos realmente pagados
      createdAt: { gte: start, lte: end }
    },
    _sum: { total: true },
    _count: { id: true }
  })

  return sales.map(sale => ({
    date: sale.createdAt.toISOString().split('T')[0],
    revenue: parseFloat(sale._sum.total?.toString() || '0'),
    orders: sale._count.id
  }))
}

async function getSalesByCategory(start: Date, end: Date) {
  // Esta función requeriría una relación entre productos y categorías
  // Por ahora, retornamos datos simulados
  return [
    { category: 'drones', revenue: 15000, orders: 25 },
    { category: 'wearables', revenue: 8000, orders: 15 },
    { category: 'robotics', revenue: 12000, orders: 20 }
  ]
}

async function getCustomerMetrics(start: Date, end: Date) {
  const totalCustomers = await prisma.user.count({
    where: {
      role: 'CLIENT',
      createdAt: { gte: start, lte: end }
    }
  })

  const newCustomers = await prisma.user.count({
    where: {
      role: 'CLIENT',
      createdAt: { gte: start, lte: end }
    }
  })

  const repeatCustomers = await prisma.order.groupBy({
    by: ['customerEmail'],
    where: {
      paymentStatus: 'PAID', // Solo pedidos realmente pagados
      createdAt: { gte: start, lte: end }
    },
    _count: { id: true },
    having: {
      id: { _count: { gt: 1 } }
    }
  })

  return {
    totalCustomers,
    newCustomers,
    repeatCustomers: repeatCustomers.length,
    repeatRate: totalCustomers > 0 ? Math.round((repeatCustomers.length / totalCustomers) * 100) : 0
  }
}

async function getRefundMetrics(start: Date, end: Date) {
  const totalOrders = await prisma.order.count({
    where: {
      createdAt: { gte: start, lte: end }
    }
  })

  const refundedOrders = await prisma.order.count({
    where: {
      paymentStatus: 'REFUNDED', // Usar el estado de pago para reembolsos
      createdAt: { gte: start, lte: end }
    }
  })

  return {
    totalRefunds: refundedOrders,
    refundRate: totalOrders > 0 ? Math.round((refundedOrders / totalOrders) * 100) : 0
  }
}

async function getGrowthRate(start: Date, end: Date): Promise<number> {
  const currentPeriod = await getTotalRevenue(start, end)
  
  const previousStart = new Date(start)
  const previousEnd = new Date(end)
  const periodLength = end.getTime() - start.getTime()
  
  previousEnd.setTime(previousStart.getTime())
  previousStart.setTime(previousStart.getTime() - periodLength)
  
  const previousPeriod = await getTotalRevenue(previousStart, previousEnd)
  
  if (previousPeriod === 0) return 0
  
  return Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100)
}

function getPeriodStart(period: string): Date {
  const now = new Date()
  const start = new Date(now)
  
  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(start.getDate() - 7)
      break
    case 'month':
      start.setMonth(start.getMonth() - 1)
      break
    case 'year':
      start.setFullYear(start.getFullYear() - 1)
      break
    default:
      start.setMonth(start.getMonth() - 1)
  }
  
  return start
}
