const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateOrderStates() {
  console.log('🔄 Iniciando migración de estados de pedidos...')
  
  try {
    // Obtener todos los pedidos
    const orders = await prisma.order.findMany()
    console.log(`📊 Encontrados ${orders.length} pedidos para migrar`)
    
    let migrated = 0
    
    for (const order of orders) {
      let paymentStatus = 'PENDING'
      let shippingStatus = 'PENDING'
      
      // Mapear estados antiguos a nuevos estados separados
      switch (order.status) {
        case 'PENDING':
          paymentStatus = 'PENDING'
          shippingStatus = 'PENDING'
          break
        case 'PENDING_NO_PAYMENT':
          paymentStatus = 'PENDING'
          shippingStatus = 'PENDING'
          break
        case 'CONFIRMED':
          paymentStatus = 'PAID'
          shippingStatus = 'CONFIRMED'
          break
        case 'PREPARING':
          paymentStatus = 'PAID'
          shippingStatus = 'PREPARING'
          break
        case 'IN_TRANSIT':
          paymentStatus = 'PAID'
          shippingStatus = 'IN_TRANSIT'
          break
        case 'DELIVERED':
          paymentStatus = 'PAID'
          shippingStatus = 'DELIVERED'
          break
        case 'COMPLETED':
          paymentStatus = 'PAID'
          shippingStatus = 'DELIVERED'
          break
        case 'DEVOLUCION':
          paymentStatus = 'REFUNDED'
          shippingStatus = 'RETURNED'
          break
        case 'CANCELLED':
          paymentStatus = 'FAILED'
          shippingStatus = 'PENDING'
          break
        default:
          paymentStatus = 'PENDING'
          shippingStatus = 'PENDING'
      }
      
      // Actualizar el pedido con los nuevos estados
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus,
          shippingStatus,
          // Mantener el status original para compatibilidad
          status: order.status
        }
      })
      
      migrated++
      console.log(`✅ Pedido ${order.id}: ${order.status} → Pago: ${paymentStatus}, Envío: ${shippingStatus}`)
    }
    
    console.log(`🎉 Migración completada: ${migrated} pedidos actualizados`)
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateOrderStates()
    .then(() => {
      console.log('✅ Migración completada exitosamente')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error)
      process.exit(1)
    })
}

module.exports = { migrateOrderStates }
