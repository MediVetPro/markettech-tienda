import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyJWT(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const period = searchParams.get('period') || '30d'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Calcular fechas según el período
    let startDate: Date
    let endDate: Date = new Date()

    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom)
      endDate = new Date(dateTo)
    } else {
      switch (period) {
        case '7d':
          startDate = new Date()
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate = new Date()
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate = new Date()
          startDate.setDate(startDate.getDate() - 90)
          break
        case '1y':
          startDate = new Date()
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
        default:
          startDate = new Date('2020-01-01') // Desde el inicio
      }
    }

    // Obtener pedidos del período - Solo pedidos con pago confirmado
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        paymentStatus: 'PAID' // Solo pedidos realmente pagados
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular métricas básicas
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Obtener datos del período anterior para calcular crecimiento
    const previousStartDate = new Date(startDate)
    const previousEndDate = new Date(startDate)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff)

    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate
        },
        paymentStatus: 'PAID' // Solo pedidos realmente pagados
      }
    })

    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0)
    const previousOrdersCount = previousOrders.length

    // Calcular crecimiento
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0
    const ordersGrowth = previousOrdersCount > 0 
      ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100 
      : 0

    // Obtener ingresos mensuales (últimos 6 meses)
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i, 1)
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0)

      const monthOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          },
          paymentStatus: 'PAID' // Solo pedidos realmente pagados
        }
      })

      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0)
      const monthName = monthStart.toLocaleDateString('pt-BR', { month: 'short' })

      monthlyRevenue.push({
        month: monthName,
        revenue: monthRevenue,
        orders: monthOrders.length
      })
    }

    // Obtener productos más vendidos
    const productSales = new Map()
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId
        const revenue = item.price * item.quantity
        
        if (productSales.has(productId)) {
          const existing = productSales.get(productId)
          productSales.set(productId, {
            ...existing,
            revenue: existing.revenue + revenue,
            sales: existing.sales + item.quantity
          })
        } else {
          productSales.set(productId, {
            id: productId,
            title: item.product.title,
            revenue: revenue,
            sales: item.quantity
          })
        }
      })
    })

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Obtener configuraciones de comisiones
    const commissionConfigs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            'commission_total_percentage',
            'commission_owner_percentage', 
            'commission_worker_percentage',
            'commission_store_percentage'
          ]
        }
      }
    })

    // Crear mapa de configuraciones
    const configMap = new Map()
    commissionConfigs.forEach(config => {
      configMap.set(config.key, parseFloat(config.value) || 0)
    })

    // Valores por defecto si no existen configuraciones
    const totalCommissionPercentage = configMap.get('commission_total_percentage') || 50
    const ownerPercentage = configMap.get('commission_owner_percentage') || 20
    const workerPercentage = configMap.get('commission_worker_percentage') || 20
    const storePercentage = configMap.get('commission_store_percentage') || 10

    // Obtener transacciones recientes
    const recentTransactions: Array<{
      id: string
      type: 'sale' | 'commission' | 'payout'
      amount: number
      description: string
      date: string
    }> = []
    
    // Agregar ventas
    orders.slice(0, 10).forEach(order => {
      recentTransactions.push({
        id: `sale-${order.id}`,
        type: 'sale',
        amount: order.total,
        description: `Venta #${order.id}`,
        date: order.createdAt.toISOString().split('T')[0]
      })
    })

    // Calcular comisiones reales basadas en la configuración
    orders.slice(0, 10).forEach(order => {
      // Calcular el lucro total (50% del precio de compra al proveedor)
      // Asumiendo que el precio de venta incluye el lucro
      const profitAmount = order.total * (totalCommissionPercentage / 100)
      
      // Comisión del dueño (20% del lucro)
      const ownerCommission = profitAmount * (ownerPercentage / 100)
      recentTransactions.push({
        id: `commission-owner-${order.id}`,
        type: 'commission',
        amount: -ownerCommission,
        description: 'Tu comisión',
        date: order.createdAt.toISOString().split('T')[0]
      })

      // Comisión del trabajador (20% del lucro)
      const workerCommission = profitAmount * (workerPercentage / 100)
      recentTransactions.push({
        id: `commission-worker-${order.id}`,
        type: 'commission',
        amount: -workerCommission,
        description: 'Comisión trabajador',
        date: order.createdAt.toISOString().split('T')[0]
      })

      // Fondo de la tienda (10% del lucro)
      const storeFund = profitAmount * (storePercentage / 100)
      recentTransactions.push({
        id: `commission-store-${order.id}`,
        type: 'commission',
        amount: -storeFund,
        description: 'Fondo de la tienda',
        date: order.createdAt.toISOString().split('T')[0]
      })
    })

    // Ordenar transacciones por fecha
    recentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const accountingData = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      ordersGrowth: Math.round(ordersGrowth * 100) / 100,
      monthlyRevenue,
      topProducts,
      recentTransactions: recentTransactions.slice(0, 20)
    }

    return NextResponse.json(accountingData)

  } catch (error) {
    console.error('Error fetching accounting data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
