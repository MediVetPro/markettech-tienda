const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('🧹 Limpiando base de datos...')

    // Eliminar todas las imágenes de productos
    console.log('📸 Eliminando imágenes de productos...')
    const productImages = await prisma.productImage.findMany()
    console.log(`📊 Encontradas ${productImages.length} imágenes`)

    for (const image of productImages) {
      try {
        const imagePath = path.join(process.cwd(), 'public', image.path)
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
          console.log(`🗑️ Eliminada: ${image.path}`)
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo eliminar ${image.path}:`, error.message)
      }
    }

    // Eliminar registros de imágenes de la base de datos
    await prisma.productImage.deleteMany()
    console.log('✅ Registros de imágenes eliminados')

    // Eliminar productos
    console.log('📦 Eliminando productos...')
    const deletedProducts = await prisma.product.deleteMany()
    console.log(`✅ ${deletedProducts.count} productos eliminados`)

    // Eliminar carritos
    console.log('🛒 Eliminando carritos...')
    const deletedCartItems = await prisma.cartItem.deleteMany()
    console.log(`✅ ${deletedCartItems.count} items de carrito eliminados`)

    const deletedUserCarts = await prisma.userCart.deleteMany()
    console.log(`✅ ${deletedUserCarts.count} carritos de usuario eliminados`)

    // Eliminar pedidos
    console.log('📋 Eliminando pedidos...')
    const deletedOrderItems = await prisma.orderItem.deleteMany()
    console.log(`✅ ${deletedOrderItems.count} items de pedido eliminados`)

    const deletedOrders = await prisma.order.deleteMany()
    console.log(`✅ ${deletedOrders.count} pedidos eliminados`)

    // Eliminar valoraciones
    console.log('⭐ Eliminando valoraciones...')
    const deletedRatings = await prisma.productRating.deleteMany()
    console.log(`✅ ${deletedRatings.count} valoraciones eliminadas`)

    console.log('🎉 Base de datos limpiada completamente!')

  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
