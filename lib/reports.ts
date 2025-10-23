import { prisma } from './prisma'
import { handleError, CommonErrors } from './errorHandler'

export interface SalesReport {
  period: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topProducts: Array<{
    productId: string
    title: string
    quantitySold: number
    revenue: number
  }>
  salesByDay: Array<{
    date: string
    sales: number
    orders: number
  }>
  salesByCategory: Array<{
    category: string
    sales: number
    orders: number
  }>
}

export interface InventoryReport {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  topSellingProducts: Array<{
    productId: string
    title: string
    quantitySold: number
    revenue: number
  }>
  categoryBreakdown: Array<{
    category: string
    products: number
    value: number
  }>
  stockAlerts: Array<{
    productId: string
    title: string
    currentStock: number
    minStock: number
    status: 'LOW' | 'OUT'
  }>
}

export interface UserReport {
  totalUsers: number
  newUsers: number
  activeUsers: number
  userGrowth: Array<{
    date: string
    newUsers: number
    totalUsers: number
  }>
  userRoles: Array<{
    role: string
    count: number
  }>
  topCustomers: Array<{
    userId: string
    name: string
    email: string
    totalSpent: number
    orders: number
  }>
}

export interface FinancialReport {
  totalRevenue: number
  totalCosts: number
  grossProfit: number
  profitMargin: number
  averageOrderValue: number
  revenueByMonth: Array<{
    month: string
    revenue: number
    costs: number
    profit: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
}

/**
 * Genera un reporte de ventas para un período específico
 */
export async function generateSalesReport(
  startDate: Date,
  endDate: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<SalesReport> {
  try {
    console.log('📊 [REPORTS] Generando reporte de ventas...')

    // Obtener órdenes del período
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Calcular métricas básicas
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Productos más vendidos
    const productSales = new Map<string, { quantity: number; revenue: number; title: string }>()
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.productId
        const existing = productSales.get(key) || { quantity: 0, revenue: 0, title: item.product.title }
        existing.quantity += item.quantity
        existing.revenue += item.price * item.quantity
        productSales.set(key, existing)
      })
    })

    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        title: data.title,
        quantitySold: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Ventas por día/semana/mes
    const salesByPeriod = new Map<string, { sales: number; orders: number }>()
    
    orders.forEach(order => {
      let periodKey: string
      const date = new Date(order.createdAt)
      
      switch (groupBy) {
        case 'day':
          periodKey = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          periodKey = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        default:
          periodKey = date.toISOString().split('T')[0]
      }
      
      const existing = salesByPeriod.get(periodKey) || { sales: 0, orders: 0 }
      existing.sales += order.total
      existing.orders += 1
      salesByPeriod.set(periodKey, existing)
    })

    const salesByDay = Array.from(salesByPeriod.entries())
      .map(([date, data]) => ({ date, sales: data.sales, orders: data.orders }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Ventas por categoría
    const categorySales = new Map<string, { sales: number; orders: number }>()
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const categories = item.product.categories?.split(',') || ['Sin categoría']
        categories.forEach(category => {
          const trimmedCategory = category.trim()
          const existing = categorySales.get(trimmedCategory) || { sales: 0, orders: 0 }
          existing.sales += item.price * item.quantity
          existing.orders += 1
          categorySales.set(trimmedCategory, existing)
        })
      })
    })

    const salesByCategory = Array.from(categorySales.entries())
      .map(([category, data]) => ({ category, sales: data.sales, orders: data.orders }))
      .sort((a, b) => b.sales - a.sales)

    return {
      period: `${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`,
      totalSales,
      totalOrders,
      averageOrderValue,
      topProducts,
      salesByDay,
      salesByCategory
    }

  } catch (error: any) {
    throw CommonErrors.DB_OPERATION_FAILED('Error generating sales report.')
  }
}

/**
 * Genera un reporte de inventario
 */
export async function generateInventoryReport(): Promise<InventoryReport> {
  try {
    console.log('📦 [REPORTS] Generando reporte de inventario...')

    // Obtener todos los productos (inventory system removed)
    const products = await prisma.product.findMany()

    // Calcular métricas básicas
    const totalProducts = products.length
    const totalValue = 0 // No inventory system

    // Productos con stock bajo o agotado
    let lowStockItems = 0
    let outOfStockItems = 0
    const stockAlerts: Array<{
      productId: string
      title: string
      currentStock: number
      minStock: number
      status: 'LOW' | 'OUT'
    }> = []

    // No inventory tracking available - inventory system removed

    // Productos más vendidos - obtener datos de ventas por separado
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: true
      }
    })
    
    const productSales = new Map<string, { quantity: number; revenue: number; title: string }>()
    
    orderItems.forEach(item => {
      const existing = productSales.get(item.productId) || { quantity: 0, revenue: 0, title: item.product.title }
      existing.quantity += item.quantity
      existing.revenue += item.price * item.quantity
      productSales.set(item.productId, existing)
    })

    const topSellingProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        title: data.title,
        quantitySold: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Desglose por categoría
    const categoryBreakdown = new Map<string, { products: number; value: number }>()
    
    products.forEach(product => {
      const categories = product.categories?.split(',') || ['Sin categoría']
      const inventory = product.inventory[0]
      const value = inventory ? inventory.quantity * inventory.cost.toNumber() : 0
      
      categories.forEach(category => {
        const trimmedCategory = category.trim()
        const existing = categoryBreakdown.get(trimmedCategory) || { products: 0, value: 0 }
        existing.products += 1
        existing.value += value
        categoryBreakdown.set(trimmedCategory, existing)
      })
    })

    const categoryBreakdownArray = Array.from(categoryBreakdown.entries())
      .map(([category, data]) => ({ category, products: data.products, value: data.value }))
      .sort((a, b) => b.value - a.value)

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      topSellingProducts,
      categoryBreakdown: categoryBreakdownArray,
      stockAlerts
    }

  } catch (error: any) {
    throw CommonErrors.DB_OPERATION_FAILED('Error generating inventory report.')
  }
}

/**
 * Genera un reporte de usuarios
 */
export async function generateUserReport(
  startDate?: Date,
  endDate?: Date
): Promise<UserReport> {
  try {
    console.log('👥 [REPORTS] Generando reporte de usuarios...')

    const whereClause: any = {}
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate
      }
    }

    // Obtener usuarios
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        orders: {
          where: { status: 'COMPLETED' }
        }
      }
    })

    const totalUsers = users.length
    const newUsers = startDate ? users.length : await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      }
    })

    // Usuarios activos (que han hecho al menos una compra)
    const activeUsers = users.filter(user => user.orders.length > 0).length

    // Crecimiento de usuarios por día
    const userGrowth = new Map<string, { newUsers: number; totalUsers: number }>()
    
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0]
      const existing = userGrowth.get(date) || { newUsers: 0, totalUsers: 0 }
      existing.newUsers += 1
      userGrowth.set(date, existing)
    })

    // Calcular total acumulado
    let runningTotal = 0
    const userGrowthArray = Array.from(userGrowth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => {
        runningTotal += data.newUsers
        return {
          date,
          newUsers: data.newUsers,
          totalUsers: runningTotal
        }
      })

    // Distribución por roles
    const roleCounts = new Map<string, number>()
    users.forEach(user => {
      const count = roleCounts.get(user.role) || 0
      roleCounts.set(user.role, count + 1)
    })

    const userRoles = Array.from(roleCounts.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)

    // Mejores clientes
    const topCustomers = users
      .map(user => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
        orders: user.orders.length
      }))
      .filter(customer => customer.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    return {
      totalUsers,
      newUsers,
      activeUsers,
      userGrowth: userGrowthArray,
      userRoles,
      topCustomers
    }

  } catch (error: any) {
    throw CommonErrors.DB_OPERATION_FAILED('Error generating user report.')
  }
}

/**
 * Genera un reporte financiero
 */
/**
 * Calcula el costo de un item usando lógica híbrida inteligente
 */
function calculateItemCost(
  item: any, 
  product: any, 
  defaultMargin: number | undefined
): { cost: number; method: string } {
  const inventory = product.inventory[0]
  const itemRevenue = item.price * item.quantity
  let itemCost = 0
  let costMethod = ''

  // 1. PRIORIDAD: Costo real del inventario (más preciso)
  if (inventory && inventory.cost && typeof inventory.cost.toNumber === 'function') {
    itemCost = inventory.cost.toNumber() * item.quantity
    costMethod = 'inventory_cost'
  }
  // 2. FALLBACK: Precio del proveedor (confiable)
  else if (product.supplierPrice && typeof product.supplierPrice.toNumber === 'function') {
    itemCost = product.supplierPrice.toNumber() * item.quantity
    costMethod = 'supplier_price'
  }
  // 3. FALLBACK: Margen individual del producto (configurable)
  else if (product.marginPercentage && typeof product.marginPercentage.toNumber === 'function') {
    const margin = product.marginPercentage.toNumber()
    itemCost = itemRevenue * (1 - (margin / 100))
    costMethod = 'margin_percentage'
  }
  // 4. FALLBACK FINAL: Margen global del sitio (estándar)
  else if (defaultMargin && !isNaN(defaultMargin)) {
    itemCost = itemRevenue * (1 - (defaultMargin / 100))
    costMethod = 'default_margin'
  }
  // 5. SIN COSTO: Producto sin información de costo
  else {
    costMethod = 'no_cost'
  }

  return { cost: itemCost, method: costMethod }
}

export async function generateFinancialReport(
  startDate: Date,
  endDate: Date
): Promise<FinancialReport> {
  try {
    console.log('💰 [REPORTS] Generando reporte financiero...')

    // Obtener configuración de margen por defecto (fallback)
    const defaultMarginConfig = await prisma.siteConfig.findUnique({
      where: { key: 'default_product_margin' }
    })
    const defaultMargin = defaultMarginConfig ? parseFloat(defaultMarginConfig.value) : undefined

    // Obtener órdenes del período - Solo pedidos con pago confirmado
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
            product: {
              include: {
                inventory: true
              }
            },
            // Ensure we have item price and quantity already loaded
          }
        }
      }
    })

    // Calcular ingresos y costos con lógica híbrida inteligente
    let totalRevenue = 0
    let totalCosts = 0
    let costCalculationStats = {
      inventoryCost: 0,
      supplierPrice: 0,
      marginPercentage: 0,
      defaultMargin: 0,
      noCost: 0
    }

    orders.forEach(order => {
      totalRevenue += order.total
      
      order.items.forEach(item => {
        const product = item.product
        const { cost: itemCost, method: costMethod } = calculateItemCost(item, product, defaultMargin)
        
        // Actualizar estadísticas
        costCalculationStats[costMethod as keyof typeof costCalculationStats]++
        
        // Log detallado del cálculo
        if (itemCost > 0) {
          const itemRevenue = item.price * item.quantity
          const actualMargin = ((itemRevenue - itemCost) / itemRevenue) * 100
          console.log(`💰 [COST] ${product.title}: R$ ${item.price} → R$ ${itemCost/item.quantity} (${actualMargin.toFixed(1)}% margen) [${costMethod}]`)
        } else if (costMethod === 'no_cost') {
          console.log(`⚠️ [COST] ${product.title}: Sin información de costo disponible`)
        }

        totalCosts += itemCost
      })
    })

    // Log de estadísticas de cálculo
    console.log('📈 [COST STATS] Métodos de cálculo utilizados:')
    console.log(`   - Costo de inventario: ${costCalculationStats.inventoryCost} productos`)
    console.log(`   - Precio del proveedor: ${costCalculationStats.supplierPrice} productos`)
    console.log(`   - Margen individual: ${costCalculationStats.marginPercentage} productos`)
    console.log(`   - Margen global: ${costCalculationStats.defaultMargin} productos`)
    console.log(`   - Sin costo: ${costCalculationStats.noCost} productos`)

    const grossProfit = totalRevenue - totalCosts
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    // Ingresos por mes usando la misma lógica híbrida
    const monthlyRevenue = new Map<string, { revenue: number; costs: number; profit: number }>()
    
    orders.forEach(order => {
      const month = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`
      const existing = monthlyRevenue.get(month) || { revenue: 0, costs: 0, profit: 0 }
      
      existing.revenue += order.total
      
      order.items.forEach(item => {
        const { cost: itemCost } = calculateItemCost(item, item.product, defaultMargin)
        existing.costs += itemCost
      })
      
      existing.profit = existing.revenue - existing.costs
      monthlyRevenue.set(month, existing)
    })

    const revenueByMonth = Array.from(monthlyRevenue.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Métodos de pago
    const paymentMethods = new Map<string, { count: number; amount: number }>()
    
    orders.forEach(order => {
      const method = order.paymentMethod || 'Desconocido'
      const existing = paymentMethods.get(method) || { count: 0, amount: 0 }
      existing.count += 1
      existing.amount += order.total
      paymentMethods.set(method, existing)
    })

    const paymentMethodsArray = Array.from(paymentMethods.entries())
      .map(([method, data]) => ({ method, count: data.count, amount: data.amount }))
      .sort((a, b) => b.amount - a.amount)

    return {
      totalRevenue,
      totalCosts,
      grossProfit,
      profitMargin,
      averageOrderValue,
      revenueByMonth,
      paymentMethods: paymentMethodsArray
    }

  } catch (error: any) {
    throw CommonErrors.DB_OPERATION_FAILED('Error generating financial report.')
  }
}
