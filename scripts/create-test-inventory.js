const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestInventory() {
  try {
    console.log('📦 Creando datos de inventario de prueba...')
    
    // Obtener productos existentes
    const products = await prisma.product.findMany({
      take: 3
    })
    
    if (products.length === 0) {
      console.log('❌ No hay productos para crear inventario')
      return
    }
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      
      // Verificar si ya existe inventario para este producto
      const existingInventory = await prisma.inventory.findFirst({
        where: { productId: product.id }
      })
      
      if (!existingInventory) {
        const inventory = await prisma.inventory.create({
          data: {
            productId: product.id,
            sku: `SKU-${product.id.substring(0, 8).toUpperCase()}`,
            quantity: Math.floor(Math.random() * 50) + 10, // 10-60 unidades
            reserved: 0,
            available: Math.floor(Math.random() * 50) + 10,
            minStock: 5,
            maxStock: 100,
            reorderPoint: 10,
            cost: parseFloat(product.supplierPrice) || parseFloat(product.price) * 0.6, // 60% del precio
            price: parseFloat(product.price),
            location: `A${i + 1}-B${Math.floor(Math.random() * 5) + 1}`,
            supplier: `Proveedor ${i + 1}`,
            supplierSku: `SUP-${product.id.substring(0, 6).toUpperCase()}`,
            lastRestocked: new Date(),
            isActive: true
          }
        })
        
        console.log(`✅ Inventario creado para ${product.title}: ${inventory.quantity} unidades`)
        
        // Crear algunos movimientos de inventario
        const movements = [
          {
            inventoryId: inventory.id,
            type: 'IN',
            quantity: inventory.quantity,
            reason: 'Stock inicial',
            notes: 'Inventario inicial del producto'
          },
          {
            inventoryId: inventory.id,
            type: 'OUT',
            quantity: Math.floor(Math.random() * 5) + 1,
            reason: 'Venta',
            notes: 'Venta de prueba'
          }
        ]
        
        for (const movementData of movements) {
          await prisma.inventoryMovement.create({
            data: movementData
          })
        }
        
        console.log(`   📝 Movimientos de inventario creados`)
      } else {
        console.log(`⚠️  Inventario ya existe para: ${product.title}`)
      }
    }
    
    console.log('🎉 Datos de inventario de prueba creados exitosamente!')
    
  } catch (error) {
    console.error('❌ Error creando inventario de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestInventory()
