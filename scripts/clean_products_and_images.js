const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function cleanProductsAndImages() {
  try {
    console.log('🧹 Limpiando productos e imágenes...')

    // Eliminar todos los productos (esto también eliminará las imágenes de la BD por cascade)
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`✅ Eliminados ${deletedProducts.count} productos de la base de datos`)

    // Eliminar directorio de imágenes
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true, force: true })
      console.log('✅ Directorio de imágenes eliminado')
    }

    // Recrear directorio
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log('✅ Directorio de imágenes recreado')

    console.log('🎉 Limpieza completada!')
    
  } catch (error) {
    console.error('❌ Error limpiando:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanProductsAndImages()
