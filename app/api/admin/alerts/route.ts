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

    // Obtener alertas del sistema
    const alerts = await getSystemAlerts()
    
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error al obtener alertas:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

async function getSystemAlerts() {
  const alerts = []

  try {
    // Obtener todos los productos
    const allProducts = await prisma.product.findMany()
    
    // Alertas de inventario
    const outOfStockProducts = allProducts.filter(product => product.stock === 0)

    if (outOfStockProducts.length > 0) {
      alerts.push({
        id: 'out-of-stock',
        type: 'INVENTORY',
        severity: 'HIGH',
        title: 'Produtos sem estoque',
        message: `${outOfStockProducts.length} produtos estão sem estoque`,
        count: outOfStockProducts.length,
        createdAt: new Date(),
        details: outOfStockProducts.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          stock: p.stock
        }))
      })
    }

    // Obtener todas las órdenes
    const allOrders = await prisma.order.findMany()
    
    // Alertas de órdenes pendientes
    const oldPendingOrders = allOrders.filter(order => {
      if (order.status !== 'PENDING') return false
      const orderDate = new Date(order.createdAt)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return orderDate < oneDayAgo
    })

    if (oldPendingOrders.length > 0) {
      alerts.push({
        id: 'old-pending-orders',
        type: 'ORDERS',
        severity: 'MEDIUM',
        title: 'Pedidos pendentes antigos',
        message: `${oldPendingOrders.length} pedidos estão pendentes há mais de 24 horas`,
        count: oldPendingOrders.length,
        createdAt: new Date(),
        details: oldPendingOrders.slice(0, 5).map(o => ({
          id: o.id,
          customerName: o.customerName,
          createdAt: o.createdAt,
          status: o.status
        }))
      })
    }

    // Obtener todos los pagos
    const allPayments = await prisma.payment.findMany()
    
    // Alertas de pagos fallidos
    const failedPayments = allPayments.filter(payment => {
      if (payment.status !== 'FAILED') return false
      const paymentDate = new Date(payment.createdAt)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return paymentDate >= weekAgo
    })

    if (failedPayments.length > 0) {
      alerts.push({
        id: 'failed-payments',
        type: 'PAYMENTS',
        severity: 'HIGH',
        title: 'Pagamentos falhados recentes',
        message: `${failedPayments.length} pagamentos falharam nos últimos 7 dias`,
        count: failedPayments.length,
        createdAt: new Date(),
        details: failedPayments.slice(0, 5).map(p => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          createdAt: p.createdAt,
          failureReason: p.failureReason
        }))
      })
    }

    // Obtener todos los usuarios
    const allUsers = await prisma.user.findMany()
    
    // Alertas de usuarios con datos incompletos
    const incompleteUsers = allUsers.filter(user => 
      !user.name || user.name.trim() === '' ||
      !user.email || user.email.trim() === '' ||
      !user.phone
    )

    if (incompleteUsers.length > 0) {
      alerts.push({
        id: 'incomplete-users',
        type: 'USERS',
        severity: 'LOW',
        title: 'Usuários com dados incompletos',
        message: `${incompleteUsers.length} usuários têm dados faltantes`,
        count: incompleteUsers.length,
        createdAt: new Date(),
        details: incompleteUsers.slice(0, 5).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone
        }))
      })
    }

    // Alertas de productos sin imágenes
    const productsWithImages = await prisma.product.findMany({
      include: {
        images: true
      }
    })

    const productsWithoutImages = productsWithImages.filter(product => product.images.length === 0)

    if (productsWithoutImages.length > 0) {
      alerts.push({
        id: 'products-without-images',
        type: 'PRODUCTS',
        severity: 'MEDIUM',
        title: 'Produtos sem imagens',
        message: `${productsWithoutImages.length} produtos não têm imagens`,
        count: productsWithoutImages.length,
        createdAt: new Date(),
        details: productsWithoutImages.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title
        }))
      })
    }

    // Alertas de stock bajo
    const lowStockProducts = allProducts.filter(product => 
      product.stock > 0 && product.stock <= 5
    )

    if (lowStockProducts.length > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'INVENTORY',
        severity: 'MEDIUM',
        title: 'Produtos com estoque baixo',
        message: `${lowStockProducts.length} produtos têm estoque baixo (≤5 unidades)`,
        count: lowStockProducts.length,
        createdAt: new Date(),
        details: lowStockProducts.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          stock: p.stock
        }))
      })
    }

    // Ordenar alertas por severidad
    const severityOrder: { [key: string]: number } = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
    alerts.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0))

    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'HIGH').length,
      warnings: alerts.filter(a => a.severity === 'MEDIUM').length,
      info: alerts.filter(a => a.severity === 'LOW').length,
      alerts
    }
  } catch (error) {
    console.error('Error al obtener alertas:', error)
    return {
      total: 0,
      critical: 0,
      warnings: 0,
      info: 0,
      alerts: [],
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}