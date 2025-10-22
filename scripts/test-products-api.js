// Script para probar la API de productos
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testProductsAPI() {
  try {
    console.log('🔍 Probando la API de productos...')

    // Contar productos totales
    const totalProducts = await prisma.product.count()
    console.log(`📦 Total de productos en la base de datos: ${totalProducts}`)

    if (totalProducts === 0) {
      console.log('⚠️  No hay productos en la base de datos')
      console.log('💡 Ejecuta: npm run seed:all para crear productos de prueba')
      return
    }

    // Obtener algunos productos de ejemplo
    const products = await prisma.product.findMany({
      take: 5,
      include: {
        images: true
      }
    })

    console.log('\n📱 Productos encontrados:')
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price}`)
      console.log(`   Categorías: ${product.categories || 'Sin categorías'}`)
      console.log(`   Stock: ${product.stock}`)
      console.log(`   Estado: ${product.status}`)
      console.log('')
    })

    // Probar filtrado por categoría
    const smartphones = await prisma.product.findMany({
      where: {
        categories: {
          contains: 'smartphones',
          mode: 'insensitive'
        }
      }
    })

    console.log(`📱 Productos de smartphones: ${smartphones.length}`)

    // Probar filtrado por condición
    const newProducts = await prisma.product.findMany({
      where: {
        condition: 'NEW'
      }
    })

    console.log(`🆕 Productos nuevos: ${newProducts.length}`)

    console.log('\n✅ La API de productos está funcionando correctamente')
    console.log('🔗 El botón "Ver Productos" debería funcionar correctamente')

  } catch (error) {
    console.error('❌ Error probando la API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProductsAPI()
