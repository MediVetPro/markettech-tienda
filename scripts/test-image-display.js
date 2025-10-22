const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testImageDisplay() {
  try {
    console.log('🔍 Probando visualización de imágenes...')
    
    // Obtener productos con imágenes
    const products = await prisma.product.findMany({
      include: {
        images: true
      },
      take: 3
    })
    
    console.log(`\n📦 Productos encontrados: ${products.length}`)
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Imágenes: ${product.images.length}`)
      
      product.images.forEach((image, imgIndex) => {
        console.log(`     ${imgIndex + 1}. ${image.filename}`)
        console.log(`        Ruta en BD: ${image.path}`)
        console.log(`        URL completa: http://localhost:3000/api/images${image.path}`)
      })
    })
    
    console.log('\n✅ Prueba completada')
    console.log('\n📋 Instrucciones para probar:')
    console.log('1. Ve a http://localhost:3000/products')
    console.log('2. Verifica que las imágenes se muestren correctamente')
    console.log('3. Prueba crear un nuevo producto con imagen')
    console.log('4. Prueba editar un producto existente')
    
  } catch (error) {
    console.error('❌ Error en prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testImageDisplay()
