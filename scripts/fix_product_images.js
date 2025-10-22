const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function fixProductImages() {
  try {
    console.log('🔧 Corrigiendo rutas de imágenes de productos...')

    // Obtener todos los productos
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    })

    console.log(`📦 Encontrados ${products.length} productos`)

    for (const product of products) {
      console.log(`\n🔍 Procesando: ${product.title}`)
      console.log(`   Código: ${product.productCode}`)
      console.log(`   Imágenes actuales: ${product.images.length}`)

      // Verificar si el directorio del producto existe
      const productDir = path.join('public', 'uploads', 'products', product.productCode.toLowerCase())
      
      if (!fs.existsSync(productDir)) {
        console.log(`   ❌ Directorio no existe: ${productDir}`)
        continue
      }

      // Listar archivos en el directorio
      const files = fs.readdirSync(productDir)
      console.log(`   📁 Archivos encontrados: ${files.length}`)
      files.forEach(file => console.log(`      - ${file}`))

      // Eliminar imágenes existentes en la base de datos
      if (product.images.length > 0) {
        await prisma.productImage.deleteMany({
          where: { productId: product.id }
        })
        console.log(`   🗑️ Imágenes existentes eliminadas`)
      }

      // Crear nuevas imágenes en la base de datos
      const imageRecords = files.map((file, index) => ({
        path: `/uploads/products/${product.productCode.toLowerCase()}/${file}`,
        filename: file,
        alt: `${product.title} - Imagen ${index + 1}`,
        order: index
      }))

      if (imageRecords.length > 0) {
        await prisma.productImage.createMany({
          data: imageRecords.map(record => ({
            ...record,
            productId: product.id
          }))
        })
        console.log(`   ✅ ${imageRecords.length} imágenes agregadas a la base de datos`)
      }
    }

    console.log('\n🎉 Rutas de imágenes corregidas exitosamente!')
    
    // Mostrar resumen
    const updatedProducts = await prisma.product.findMany({
      include: {
        images: true
      }
    })

    console.log('\n📊 Resumen:')
    for (const product of updatedProducts) {
      console.log(`   ${product.title}: ${product.images.length} imágenes`)
      product.images.forEach(img => {
        console.log(`      - ${img.path}`)
      })
    }

  } catch (error) {
    console.error('❌ Error corrigiendo imágenes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProductImages()
