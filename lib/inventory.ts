import { prisma } from './prisma'
import { getCachedData, cacheHelpers, CACHE_TTL, clearProductCache } from './cache'

export interface InventoryMovement {
  inventoryId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER'
  quantity: number
  reason?: string
  reference?: string
  notes?: string
  userId?: string
}

export interface InventoryAlert {
  inventoryId: string
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER' | 'EXPIRY'
  message: string
}

// Crear o actualizar inventario
export async function createOrUpdateInventory(
  productId: string,
  data: {
    sku?: string
    quantity?: number
    minStock?: number
    maxStock?: number
    reorderPoint?: number
    cost?: number
    price?: number
    location?: string
    supplier?: string
    supplierSku?: string
  }
) {
  try {
    console.log('📦 [INVENTORY] Creando/actualizando inventario para producto:', productId)

    // Generar SKU si no se proporciona
    const sku = data.sku || `SKU-${productId.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

    const inventory = await prisma.inventory.upsert({
      where: { sku },
      update: {
        ...data,
        available: data.quantity ? data.quantity - 0 : undefined // Restar reservado
      },
      create: {
        productId,
        sku,
        quantity: data.quantity || 0,
        available: data.quantity || 0,
        minStock: data.minStock || 5,
        maxStock: data.maxStock,
        reorderPoint: data.reorderPoint || 10,
        cost: data.cost || 0,
        price: data.price || 0,
        location: data.location,
        supplier: data.supplier,
        supplierSku: data.supplierSku
      }
    })

    // Limpiar caché del producto
    clearProductCache(productId)

    console.log(`✅ [INVENTORY] Inventario ${inventory.id} creado/actualizado`)

    return {
      success: true,
      inventory
    }

  } catch (error) {
    console.error('❌ [INVENTORY] Error creando/actualizando inventario:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Registrar movimiento de inventario
export async function recordInventoryMovement(movementData: InventoryMovement) {
  try {
    console.log('📦 [INVENTORY_MOVEMENT] Registrando movimiento:', movementData.type)

    // Obtener inventario actual
    const inventory = await prisma.inventory.findUnique({
      where: { id: movementData.inventoryId },
      select: {
        id: true,
        quantity: true,
        reserved: true,
        available: true,
        productId: true
      }
    })

    if (!inventory) {
      return {
        success: false,
        error: 'Inventario no encontrado'
      }
    }

    // Calcular nueva cantidad
    let newQuantity = inventory.quantity
    let newReserved = inventory.reserved

    switch (movementData.type) {
      case 'IN':
        newQuantity += movementData.quantity
        break
      case 'OUT':
        newQuantity -= movementData.quantity
        break
      case 'ADJUSTMENT':
        newQuantity = movementData.quantity
        break
      case 'TRANSFER':
        // Para transferencias, podrías implementar lógica específica
        newQuantity += movementData.quantity
        break
    }

    // Verificar que no se vaya a negativo
    if (newQuantity < 0) {
      return {
        success: false,
        error: 'La cantidad no puede ser negativa'
      }
    }

    const newAvailable = newQuantity - newReserved

    // Actualizar inventario
    const updatedInventory = await prisma.inventory.update({
      where: { id: movementData.inventoryId },
      data: {
        quantity: newQuantity,
        available: newAvailable,
        lastRestocked: movementData.type === 'IN' ? new Date() : undefined,
        lastSold: movementData.type === 'OUT' ? new Date() : undefined
      }
    })

    // Crear movimiento
    const movement = await prisma.inventoryMovement.create({
      data: {
        inventoryId: movementData.inventoryId,
        type: movementData.type,
        quantity: movementData.quantity,
        reason: movementData.reason,
        reference: movementData.reference,
        notes: movementData.notes,
        userId: movementData.userId
      }
    })

    // Verificar alertas de stock
    await checkInventoryAlerts(movementData.inventoryId)

    // Limpiar caché del producto
    clearProductCache(inventory.productId)

    console.log(`✅ [INVENTORY_MOVEMENT] Movimiento registrado: ${movement.id}`)

    return {
      success: true,
      movement,
      inventory: updatedInventory
    }

  } catch (error) {
    console.error('❌ [INVENTORY_MOVEMENT] Error registrando movimiento:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Reservar stock
export async function reserveStock(inventoryId: string, quantity: number, orderId: string) {
  try {
    console.log('📦 [INVENTORY_RESERVE] Reservando stock:', quantity)

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId }
    })

    if (!inventory) {
      return {
        success: false,
        error: 'Inventario no encontrado'
      }
    }

    if (inventory.available < quantity) {
      return {
        success: false,
        error: 'Stock insuficiente'
      }
    }

    // Actualizar inventario
    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        reserved: { increment: quantity },
        available: { decrement: quantity }
      }
    })

    // Registrar movimiento
    await recordInventoryMovement({
      inventoryId,
      type: 'OUT',
      quantity: -quantity, // Negativo para reserva
      reason: 'RESERVA',
      reference: orderId,
      notes: `Reserva para orden ${orderId}`
    })

    console.log(`✅ [INVENTORY_RESERVE] Stock reservado: ${quantity}`)

    return {
      success: true,
      inventory: updatedInventory
    }

  } catch (error) {
    console.error('❌ [INVENTORY_RESERVE] Error reservando stock:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Liberar stock reservado
export async function releaseStock(inventoryId: string, quantity: number, orderId: string) {
  try {
    console.log('📦 [INVENTORY_RELEASE] Liberando stock:', quantity)

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId }
    })

    if (!inventory) {
      return {
        success: false,
        error: 'Inventario no encontrado'
      }
    }

    // Actualizar inventario
    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        reserved: { decrement: quantity },
        available: { increment: quantity }
      }
    })

    // Registrar movimiento
    await recordInventoryMovement({
      inventoryId,
      type: 'IN',
      quantity: quantity,
      reason: 'LIBERACION',
      reference: orderId,
      notes: `Liberación de reserva para orden ${orderId}`
    })

    console.log(`✅ [INVENTORY_RELEASE] Stock liberado: ${quantity}`)

    return {
      success: true,
      inventory: updatedInventory
    }

  } catch (error) {
    console.error('❌ [INVENTORY_RELEASE] Error liberando stock:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Obtener inventario de un producto
export async function getProductInventory(productId: string) {
  try {
    console.log('📦 [INVENTORY] Obteniendo inventario para producto:', productId)

    const inventory = await prisma.inventory.findFirst({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true
          }
        },
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        alerts: {
          where: { isResolved: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return {
      success: true,
      inventory
    }

  } catch (error) {
    console.error('❌ [INVENTORY] Error obteniendo inventario:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Obtener reporte de inventario
export async function getInventoryReport(filters: {
  lowStock?: boolean
  outOfStock?: boolean
  category?: string
  supplier?: string
  page?: number
  limit?: number
} = {}) {
  try {
    console.log('📦 [INVENTORY_REPORT] Generando reporte de inventario')

    const page = filters.page || 1
    const limit = filters.limit || 20
    const skip = (page - 1) * limit

    const where: any = { isActive: true }

    if (filters.lowStock) {
      where.available = { lte: prisma.inventory.fields.minStock }
    }

    if (filters.outOfStock) {
      where.available = 0
    }

    if (filters.supplier) {
      where.supplier = filters.supplier
    }

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              categories: true
            }
          },
          alerts: {
            where: { isResolved: false }
          }
        },
        orderBy: { available: 'asc' },
        skip,
        take: limit
      }),
      prisma.inventory.count({ where })
    ])

    // Filtrar por categoría si se especifica
    let filteredInventory = inventory
    if (filters.category) {
      filteredInventory = inventory.filter(item => 
        item.product.categories?.includes(filters.category!)
      )
    }

    // Calcular estadísticas
    const stats = await calculateInventoryStats()

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      success: true,
      inventory: filteredInventory,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNextPage,
        hasPrevPage
      }
    }

  } catch (error) {
    console.error('❌ [INVENTORY_REPORT] Error generando reporte:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Verificar alertas de inventario
async function checkInventoryAlerts(inventoryId: string) {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId }
    })

    if (!inventory) return

    const alerts = []

    // Verificar stock bajo
    if (inventory.available <= inventory.minStock && inventory.available > 0) {
      alerts.push({
        inventoryId,
        type: 'LOW_STOCK',
        message: `Stock bajo: ${inventory.available} unidades disponibles (mínimo: ${inventory.minStock})`
      })
    }

    // Verificar stock agotado
    if (inventory.available === 0) {
      alerts.push({
        inventoryId,
        type: 'OUT_OF_STOCK',
        message: `Stock agotado: 0 unidades disponibles`
      })
    }

    // Verificar punto de reorden
    if (inventory.available <= inventory.reorderPoint) {
      alerts.push({
        inventoryId,
        type: 'REORDER',
        message: `Punto de reorden alcanzado: ${inventory.available} unidades (reorden: ${inventory.reorderPoint})`
      })
    }

    // Crear alertas
    for (const alert of alerts) {
      await prisma.inventoryAlert.create({
        data: alert
      })
    }

    if (alerts.length > 0) {
      console.log(`⚠️ [INVENTORY_ALERTS] ${alerts.length} alertas creadas para inventario ${inventoryId}`)
    }

  } catch (error) {
    console.error('❌ [INVENTORY_ALERTS] Error verificando alertas:', error)
  }
}

// Calcular estadísticas de inventario
async function calculateInventoryStats() {
  try {
    const [
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      totalMovements
    ] = await Promise.all([
      prisma.inventory.count({ where: { isActive: true } }),
      prisma.inventory.aggregate({
        where: { isActive: true },
        _sum: { quantity: true }
      }),
      prisma.inventory.count({
        where: {
          isActive: true,
          available: { 
            lte: prisma.inventory.fields.minStock,
            gt: 0 
          }
        }
      }),
      prisma.inventory.count({
        where: {
          isActive: true,
          available: 0
        }
      }),
      prisma.inventoryMovement.count()
    ])

    return {
      totalProducts,
      totalValue: totalValue._sum.quantity || 0,
      lowStockCount,
      outOfStockCount,
      totalMovements
    }

  } catch (error) {
    console.error('❌ [INVENTORY_STATS] Error calculando estadísticas:', error)
    return {
      totalProducts: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalMovements: 0
    }
  }
}

// Obtener alertas de inventario
export async function getInventoryAlerts(resolved: boolean = false) {
  try {
    console.log('📦 [INVENTORY_ALERTS] Obteniendo alertas de inventario')

    const alerts = await prisma.inventoryAlert.findMany({
      where: { isResolved: resolved },
      include: {
        inventory: {
          include: {
            product: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      alerts
    }

  } catch (error) {
    console.error('❌ [INVENTORY_ALERTS] Error obteniendo alertas:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Marcar alerta como resuelta
export async function resolveInventoryAlert(alertId: string, resolvedBy: string) {
  try {
    console.log('📦 [INVENTORY_ALERT] Resolviendo alerta:', alertId)

    const alert = await prisma.inventoryAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy
      }
    })

    console.log(`✅ [INVENTORY_ALERT] Alerta resuelta: ${alertId}`)

    return {
      success: true,
      alert
    }

  } catch (error) {
    console.error('❌ [INVENTORY_ALERT] Error resolviendo alerta:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}
