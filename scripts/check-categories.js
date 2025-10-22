const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCategories() {
  try {
    console.log('🔍 Verificando categorías de productos...')

    // Obtener todos los productos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        categories: true
      }
    })

    console.log(`📦 Total de productos: ${products.length}`)

    // Mostrar productos con categorías
    console.log('\n📱 Productos con categorías:')
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`)
      console.log(`   Categorías: ${product.categories || 'SIN CATEGORÍAS'}`)
      console.log('')
    })

    // Contar productos por categoría
    const categoryCounts = {}
    products.forEach(product => {
      if (product.categories) {
        const categories = product.categories.split(',').map(c => c.trim())
        categories.forEach(category => {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1
        })
      }
    })

    console.log('\n📊 Productos por categoría:')
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} productos`)
    })

    // Probar filtrado por categoría específica
    console.log('\n🔍 Probando filtrado por categoría "smartphones":')
    const smartphones = await prisma.product.findMany({
      where: {
        categories: {
          contains: 'smartphones'
        }
      },
      select: {
        title: true,
        categories: true
      }
    })

    console.log(`📱 Productos de smartphones encontrados: ${smartphones.length}`)
    smartphones.forEach(product => {
      console.log(`   - ${product.title} (${product.categories})`)
    })

  } catch (error) {
    console.error('❌ Error verificando categorías:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories()
