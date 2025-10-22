const { PrismaClient } = require('@prisma/client')
const fs = require('fs').promises
const path = require('path')

const prisma = new PrismaClient()

async function cleanAllProducts() {
  try {
    console.log('🧹 Iniciando limpieza completa de productos...')
    
    // 1. Obtener todos los productos con sus imágenes
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    })
    
    console.log(`📦 Productos encontrados: ${products.length}`)
    
    if (products.length === 0) {
      console.log('✅ No hay productos para limpiar')
      return
    }
    
    // 2. Eliminar archivos de imágenes del sistema de archivos
    console.log('🗑️ Eliminando archivos de imágenes...')
    
    for (const product of products) {
      console.log(`   📁 Producto: ${product.title} (${product.id})`)
      
      for (const image of product.images) {
        const imagePath = path.join(process.cwd(), 'public', image.path)
        
        try {
          await fs.access(imagePath)
          await fs.unlink(imagePath)
          console.log(`     ✅ Eliminado: ${image.filename}`)
        } catch (error) {
          console.log(`     ⚠️ No encontrado: ${image.filename}`)
        }
      }
      
      // Eliminar directorio del producto si está vacío
      const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', `product_${product.id}`)
      try {
        const files = await fs.readdir(productDir)
        if (files.length === 0) {
          await fs.rmdir(productDir)
          console.log(`     📁 Directorio eliminado: product_${product.id}`)
        }
      } catch (error) {
        console.log(`     ⚠️ Directorio no encontrado: product_${product.id}`)
      }
    }
    
    // 3. Eliminar registros de la base de datos
    console.log('🗑️ Eliminando registros de la base de datos...')
    
    // Eliminar imágenes primero (por las foreign keys)
    const deletedImages = await prisma.productImage.deleteMany({})
    console.log(`   ✅ Imágenes eliminadas: ${deletedImages.count}`)
    
    // Eliminar productos
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`   ✅ Productos eliminados: ${deletedProducts.count}`)
    
    console.log('🎉 Limpieza completada exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`   - Productos eliminados: ${deletedProducts.count}`)
    console.log(`   - Imágenes eliminadas: ${deletedImages.count}`)
    console.log(`   - Archivos eliminados del sistema de archivos`)
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanAllProducts()
