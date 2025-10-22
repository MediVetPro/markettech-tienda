const { PrismaClient } = require('@prisma/client')
const fs = require('fs').promises
const path = require('path')

const prisma = new PrismaClient()

async function cleanProducts() {
  try {
    console.log('🧹 Iniciando limpieza de productos...')
    
    // 1. Obtener todos los productos con sus imágenes
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    })
    
    console.log(`📦 Productos encontrados: ${products.length}`)
    
    // 2. Eliminar archivos físicos de imágenes
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          try {
            // Construir ruta del archivo
            const imagePath = path.join(process.cwd(), 'public', image.path)
            console.log(`🗑️ Eliminando archivo: ${imagePath}`)
            
            // Verificar si el archivo existe y eliminarlo
            try {
              await fs.access(imagePath)
              await fs.unlink(imagePath)
              console.log(`✅ Archivo eliminado: ${imagePath}`)
            } catch (error) {
              console.log(`⚠️ Archivo no encontrado: ${imagePath}`)
            }
          } catch (error) {
            console.error(`❌ Error eliminando archivo ${image.path}:`, error.message)
          }
        }
        
        // Eliminar directorio del producto si existe
        try {
          const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', `product_${product.id}`)
          await fs.rmdir(productDir, { recursive: true })
          console.log(`✅ Directorio eliminado: ${productDir}`)
        } catch (error) {
          console.log(`⚠️ Directorio no encontrado o ya eliminado: product_${product.id}`)
        }
      }
    }
    
    // 3. Eliminar registros de la base de datos
    console.log('🗑️ Eliminando registros de imágenes...')
    await prisma.productImage.deleteMany({})
    console.log('✅ Registros de imágenes eliminados')
    
    console.log('🗑️ Eliminando productos...')
    await prisma.product.deleteMany({})
    console.log('✅ Productos eliminados')
    
    console.log('🎉 Limpieza completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar limpieza
cleanProducts()
  .then(() => {
    console.log('✅ Script de limpieza completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en script de limpieza:', error)
    process.exit(1)
  })
