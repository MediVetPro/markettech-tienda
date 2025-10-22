const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateImages() {
  console.log('🔄 Iniciando migración de imágenes...')
  
  try {
    // Obtener todos los productos con imágenes
    const products = await prisma.product.findMany({
      include: { images: true }
    })
    
    console.log(`📦 Encontrados ${products.length} productos`)
    
    for (const product of products) {
      console.log(`\n🔄 Procesando producto: ${product.title}`)
      
      if (product.images.length > 0) {
        console.log(`  📸 ${product.images.length} imágenes encontradas`)
        
        // Crear directorio del producto
        const fs = require('fs')
        const path = require('path')
        const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', `product_${product.id}`)
        
        if (!fs.existsSync(productDir)) {
          fs.mkdirSync(productDir, { recursive: true })
          console.log(`  📁 Directorio creado: product_${product.id}`)
        }
        
        // Migrar cada imagen
        for (let i = 0; i < product.images.length; i++) {
          const image = product.images[i]
          const oldUrl = image.url
          
          // Generar nuevo nombre de archivo
          const timestamp = Date.now()
          const random = Math.random().toString(36).substring(2, 8)
          const extension = path.extname(oldUrl) || '.jpg'
          const newFilename = `image_${i + 1}_${timestamp}_${random}${extension}`
          
          // Crear nueva ruta
          const newPath = `/uploads/products/product_${product.id}/${newFilename}`
          
          // Actualizar en la base de datos
          await prisma.productImage.update({
            where: { id: image.id },
            data: {
              path: newPath,
              filename: newFilename
            }
          })
          
          console.log(`  ✅ Imagen ${i + 1} migrada: ${newFilename}`)
        }
      }
    }
    
    console.log('\n🎉 ¡Migración completada exitosamente!')
    console.log('\n📋 Resumen:')
    console.log(`- Productos procesados: ${products.length}`)
    console.log(`- Imágenes migradas: ${products.reduce((total, product) => total + product.images.length, 0)}`)
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar migración
migrateImages()
