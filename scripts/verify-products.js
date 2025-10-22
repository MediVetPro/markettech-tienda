const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyProducts() {
  try {
    console.log('🔍 Verificando productos en la base de datos...')
    
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    })
    
    console.log(`\n📦 Total de productos: ${products.length}`)
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Precio: $${product.price}`)
      console.log(`   Stock: ${product.stock}`)
      console.log(`   Estado: ${product.status}`)
      console.log(`   Categorías: ${product.categories}`)
      console.log(`   Imágenes: ${product.images.length}`)
      
      product.images.forEach((image, imgIndex) => {
        console.log(`     ${imgIndex + 1}. ${image.filename}`)
        console.log(`        Ruta: ${image.path}`)
        console.log(`        Alt: ${image.alt}`)
      })
    })
    
    console.log('\n✅ Verificación completada')
    
  } catch (error) {
    console.error('❌ Error verificando productos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyProducts()
