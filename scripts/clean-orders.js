const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanOrders() {
  try {
    console.log('🧹 Iniciando limpieza de pedidos...')
    
    // Eliminar SellerPayouts primero (dependen de OrderItems)
    console.log('🗑️ Eliminando SellerPayouts...')
    const deletedSellerPayouts = await prisma.sellerPayout.deleteMany()
    console.log(`✅ Eliminados ${deletedSellerPayouts.count} SellerPayouts`)
    
    // Eliminar OrderItems
    console.log('🗑️ Eliminando OrderItems...')
    const deletedOrderItems = await prisma.orderItem.deleteMany()
    console.log(`✅ Eliminados ${deletedOrderItems.count} OrderItems`)
    
    // Eliminar Orders
    console.log('🗑️ Eliminando Orders...')
    const deletedOrders = await prisma.order.deleteMany()
    console.log(`✅ Eliminados ${deletedOrders.count} Orders`)
    
    console.log('🎉 Limpieza de pedidos completada exitosamente!')
    console.log('📊 Resumen:')
    console.log(`   - Orders eliminados: ${deletedOrders.count}`)
    console.log(`   - OrderItems eliminados: ${deletedOrderItems.count}`)
    console.log(`   - SellerPayouts eliminados: ${deletedSellerPayouts.count}`)
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanOrders()
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
