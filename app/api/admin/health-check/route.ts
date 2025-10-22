import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyJWT(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Ejecutar verificación de salud
    const healthCheck = await performHealthCheck()
    
    return NextResponse.json({ healthCheck })
  } catch (error) {
    console.error('Error en verificación de salud:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

async function performHealthCheck() {
  const startTime = Date.now()
  
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`
    
    // Obtener métricas básicas
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    
    // Obtener órdenes activas
    const allOrders = await prisma.order.findMany()
    const activeOrders = allOrders.filter(order => order.status === 'PENDING').length
    
    // Obtener pagos pendientes
    const allPayments = await prisma.payment.findMany()
    const pendingPayments = allPayments.filter(payment => payment.status === 'PENDING').length
    
    // Obtener productos con stock bajo
    const allProducts = await prisma.product.findMany()
    const lowStockProducts = allProducts.filter(product => product.stock > 0 && product.stock <= 5).length
    const outOfStockProducts = allProducts.filter(product => product.stock === 0).length

    // Verificar problemas críticos
    const criticalIssues = []
    
    // Verificar si hay órdenes muy antiguas pendientes
    const oldPendingOrders = allOrders.filter(order => {
      if (order.status !== 'PENDING') return false
      const orderDate = new Date(order.createdAt)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      return orderDate < threeDaysAgo
    })

    if (oldPendingOrders.length > 0) {
      criticalIssues.push({
        type: 'OLD_PENDING_ORDERS',
        count: oldPendingOrders.length,
        message: `${oldPendingOrders.length} órdenes pendientes por más de 3 días`
      })
    }

    if (outOfStockProducts > 0) {
      criticalIssues.push({
        type: 'OUT_OF_STOCK',
        count: outOfStockProducts,
        message: `${outOfStockProducts} productos sin stock`
      })
    }

    // Verificar usuarios con datos incompletos
    const incompleteUsers = allOrders.filter(order => 
      !order.customerName || order.customerName.trim() === '' ||
      !order.customerEmail || order.customerEmail.trim() === ''
    )

    if (incompleteUsers.length > 0) {
      criticalIssues.push({
        type: 'INCOMPLETE_ORDERS',
        count: incompleteUsers.length,
        message: `${incompleteUsers.length} órdenes con datos de cliente incompletos`
      })
    }

    const responseTime = Date.now() - startTime

    return {
      status: criticalIssues.length === 0 ? 'HEALTHY' : 'WARNING',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      metrics: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        activeOrders,
        pendingPayments,
        lowStockProducts,
        outOfStockProducts
      },
      criticalIssues,
      recommendations: generateRecommendations(criticalIssues, {
        userCount,
        productCount,
        orderCount,
        activeOrders,
        pendingPayments,
        lowStockProducts,
        outOfStockProducts
      })
    }
  } catch (error) {
    return {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Error desconocido',
      criticalIssues: [{
        type: 'DATABASE_ERROR',
        message: 'Error de conexión a la base de datos'
      }]
    }
  }
}

function generateRecommendations(issues: any[], metrics: any) {
  const recommendations = []

  if (issues.some(issue => issue.type === 'OLD_PENDING_ORDERS')) {
    recommendations.push({
      priority: 'HIGH',
      category: 'ORDERS',
      title: 'Revisar órdenes pendientes',
      description: 'Hay órdenes pendientes por más de 3 días. Revisar y procesar o cancelar según corresponda.',
      action: 'Ir a gestión de órdenes'
    })
  }

  if (issues.some(issue => issue.type === 'OUT_OF_STOCK')) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'INVENTORY',
      title: 'Reponer stock de productos',
      description: 'Hay productos sin stock. Considerar reabastecimiento o desactivar temporalmente.',
      action: 'Ir a gestión de productos'
    })
  }

  if (issues.some(issue => issue.type === 'INCOMPLETE_ORDERS')) {
    recommendations.push({
      priority: 'LOW',
      category: 'ORDERS',
      title: 'Completar datos de órdenes',
      description: 'Hay órdenes con datos de cliente incompletos. Considerar solicitar información faltante.',
      action: 'Ir a gestión de órdenes'
    })
  }

  if (metrics.pendingPayments > 10) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'PAYMENTS',
      title: 'Revisar pagos pendientes',
      description: `Hay ${metrics.pendingPayments} pagos pendientes. Verificar estado de transacciones.`,
      action: 'Revisar pagos'
    })
  }

  if (metrics.lowStockProducts > 5) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'INVENTORY',
      title: 'Productos con stock bajo',
      description: `Hay ${metrics.lowStockProducts} productos con stock bajo. Considerar reabastecimiento.`,
      action: 'Revisar inventario'
    })
  }

  return recommendations
}