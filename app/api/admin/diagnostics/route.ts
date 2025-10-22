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

    // Ejecutar diagnósticos
    const diagnostics = await runSystemDiagnostics()
    
    return NextResponse.json({ diagnostics })
  } catch (error) {
    console.error('Error en diagnóstico del sistema:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

async function runSystemDiagnostics() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      database: await checkDatabaseHealth(),
      dataIntegrity: await checkDataIntegrity(),
      userData: await validateUserData(),
      systemPerformance: await checkSystemPerformance(),
      inconsistencies: await detectInconsistencies()
    }

    return diagnostics
  } catch (error) {
    console.error('Error en runSystemDiagnostics:', error)
    return {
      timestamp: new Date().toISOString(),
      database: { status: 'ERROR', error: error instanceof Error ? error.message : 'Error desconocido' },
      dataIntegrity: { status: 'ERROR', issues: [] },
      userData: { status: 'ERROR', issues: [] },
      systemPerformance: { status: 'ERROR', issues: [] },
      inconsistencies: { status: 'ERROR', issues: [] }
    }
  }
}

async function checkDatabaseHealth() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`
    
    // Obtener estadísticas básicas
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const paymentCount = await prisma.payment.count()
    const notificationCount = await prisma.notification.count()

    return {
      status: 'HEALTHY',
      connection: 'OK',
      tables: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        payments: paymentCount,
        notifications: notificationCount
      },
      issues: []
    }
  } catch (error) {
    return {
      status: 'ERROR',
      connection: 'FAILED',
      error: error instanceof Error ? error.message : 'Error desconocido',
      issues: ['Conexión a la base de datos fallida']
    }
  }
}

async function checkDataIntegrity() {
  const issues = []

  try {
    // Verificar órdenes sin items
    const allOrders = await prisma.order.findMany({
      include: {
        items: true
      }
    })

    const ordersWithoutItems = allOrders.filter(order => order.items.length === 0)

    if (ordersWithoutItems.length > 0) {
      issues.push({
        type: 'DATA_INTEGRITY',
        severity: 'HIGH',
        message: `${ordersWithoutItems.length} órdenes sin items`,
        details: ordersWithoutItems.slice(0, 5).map(o => ({ id: o.id, status: o.status }))
      })
    }

    // Verificar productos sin imágenes
    const allProducts = await prisma.product.findMany({
      include: {
        images: true
      }
    })

    const productsWithoutImages = allProducts.filter(product => product.images.length === 0)

    if (productsWithoutImages.length > 0) {
      issues.push({
        type: 'DATA_INTEGRITY',
        severity: 'MEDIUM',
        message: `${productsWithoutImages.length} productos sin imágenes`,
        details: productsWithoutImages.slice(0, 5).map(p => ({ id: p.id, title: p.title }))
      })
    }

    // Verificar usuarios con datos faltantes
    const allUsers = await prisma.user.findMany()

    const usersWithMissingData = allUsers.filter(user => 
      !user.name || user.name.trim() === '' || 
      !user.email || user.email.trim() === '' ||
      !user.phone
    )

    if (usersWithMissingData.length > 0) {
      issues.push({
        type: 'DATA_INTEGRITY',
        severity: 'MEDIUM',
        message: `${usersWithMissingData.length} usuarios con datos faltantes`,
        details: usersWithMissingData.slice(0, 5).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone
        }))
      })
    }

    return {
      status: issues.length === 0 ? 'HEALTHY' : 'ISSUES_FOUND',
      issues
    }
  } catch (error) {
    return {
      status: 'ERROR',
      issues: [{
        type: 'SYSTEM_ERROR',
        severity: 'CRITICAL',
        message: 'Error al verificar integridad de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }]
    }
  }
}

async function validateUserData() {
  const issues = []

  try {
    const allUsers = await prisma.user.findMany()

    // Verificar usuarios con datos faltantes críticos
    const usersWithMissingData = allUsers.filter(user => 
      !user.name || user.name.trim() === '' || 
      !user.email || user.email.trim() === '' ||
      !user.phone
    )

    if (usersWithMissingData.length > 0) {
      issues.push({
        type: 'USER_DATA',
        severity: 'MEDIUM',
        message: `${usersWithMissingData.length} usuarios con datos faltantes`,
        details: usersWithMissingData.slice(0, 5).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          address: u.address
        }))
      })
    }

    // Verificar CPFs inválidos (formato básico)
    const usersWithCPF = allUsers.filter(user => user.cpf && user.cpf.trim() !== '')
    const usersWithInvalidCPF = usersWithCPF.filter(user => 
      user.cpf && (user.cpf.length !== 11 || !/^\d+$/.test(user.cpf))
    )

    if (usersWithInvalidCPF.length > 0) {
      issues.push({
        type: 'USER_DATA',
        severity: 'HIGH',
        message: `${usersWithInvalidCPF.length} usuarios con CPF inválido`,
        details: usersWithInvalidCPF.slice(0, 5).map(u => ({
          id: u.id,
          name: u.name,
          cpf: u.cpf
        }))
      })
    }

    // Verificar fechas de nacimiento inválidas
    const usersWithBirthDate = allUsers.filter(user => user.birthDate)
    const usersWithInvalidBirthDate = usersWithBirthDate.filter(user => {
      if (!user.birthDate) return false
      const birthDate = new Date(user.birthDate)
      const now = new Date()
      const minDate = new Date('1900-01-01')
      return birthDate > now || birthDate < minDate
    })

    if (usersWithInvalidBirthDate.length > 0) {
      issues.push({
        type: 'USER_DATA',
        severity: 'MEDIUM',
        message: `${usersWithInvalidBirthDate.length} usuarios con fecha de nacimiento inválida`,
        details: usersWithInvalidBirthDate.slice(0, 5).map(u => ({
          id: u.id,
          name: u.name,
          birthDate: u.birthDate
        }))
      })
    }

    return {
      status: issues.length === 0 ? 'HEALTHY' : 'ISSUES_FOUND',
      issues
    }
  } catch (error) {
    return {
      status: 'ERROR',
      issues: [{
        type: 'SYSTEM_ERROR',
        severity: 'CRITICAL',
        message: 'Error al validar datos de usuarios',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }]
    }
  }
}

async function checkSystemPerformance() {
  const issues = []

  try {
    const allOrders = await prisma.order.findMany()

    // Verificar órdenes pendientes por mucho tiempo
    const oldPendingOrders = allOrders.filter(order => {
      if (order.status !== 'PENDING') return false
      const orderDate = new Date(order.createdAt)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return orderDate < weekAgo
    })

    if (oldPendingOrders.length > 0) {
      issues.push({
        type: 'PERFORMANCE',
        severity: 'MEDIUM',
        message: `${oldPendingOrders.length} órdenes pendientes por más de 7 días`,
        details: oldPendingOrders.slice(0, 5).map(o => ({
          id: o.id,
          createdAt: o.createdAt,
          status: o.status
        }))
      })
    }

    // Verificar productos sin stock
    const allProducts = await prisma.product.findMany()
    const productsOutOfStock = allProducts.filter(product => product.stock === 0)

    if (productsOutOfStock.length > 0) {
      issues.push({
        type: 'INVENTORY',
        severity: 'LOW',
        message: `${productsOutOfStock.length} productos sin stock`,
        details: productsOutOfStock.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          stock: p.stock
        }))
      })
    }

    return {
      status: issues.length === 0 ? 'HEALTHY' : 'ISSUES_FOUND',
      issues
    }
  } catch (error) {
    return {
      status: 'ERROR',
      issues: [{
        type: 'SYSTEM_ERROR',
        severity: 'CRITICAL',
        message: 'Error al verificar rendimiento del sistema',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }]
    }
  }
}

async function detectInconsistencies() {
  const issues = []

  try {
    // Verificar órdenes con totales inconsistentes
    const ordersWithItems = await prisma.order.findMany({
      include: {
        items: true
      }
    })

    const inconsistentOrders = ordersWithItems.filter(order => {
      const calculatedTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      return Math.abs(order.total - calculatedTotal) > 0.01
    })

    if (inconsistentOrders.length > 0) {
      issues.push({
        type: 'INCONSISTENCY',
        severity: 'HIGH',
        message: `${inconsistentOrders.length} órdenes con totales inconsistentes`,
        details: inconsistentOrders.slice(0, 5).map(o => ({
          id: o.id,
          storedTotal: o.total,
          calculatedTotal: o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }))
      })
    }

    return {
      status: issues.length === 0 ? 'HEALTHY' : 'ISSUES_FOUND',
      issues
    }
  } catch (error) {
    return {
      status: 'ERROR',
      issues: [{
        type: 'SYSTEM_ERROR',
        severity: 'CRITICAL',
        message: 'Error al detectar inconsistencias',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }]
    }
  }
}