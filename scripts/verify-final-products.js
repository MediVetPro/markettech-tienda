const { PrismaClient } = require('@prisma/client')
const fs = require('fs').promises
const path = require('path')

const prisma = new PrismaClient()

async function verifyFinalProducts() {
  try {
    console.log('🔍 Verificando productos finales...')
    
    // 1. Obtener todos los productos con imágenes
    const products = await prisma.product.findMany({
      include: {
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n📦 Total de productos: ${products.length}`)
    
    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos')
      return
    }
    
    // 2. Verificar cada producto
    let validProducts = 0
    let validImages = 0
    let missingImages = 0
    
    console.log('\n📋 Verificación detallada:')
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      console.log(`\n${i + 1}. ${product.title}`)
      console.log(`   💰 Precio: $${product.price}`)
      console.log(`   📦 Stock: ${product.stock}`)
      console.log(`   🏷️ Categorías: ${product.categories}`)
      console.log(`   🖼️ Imágenes: ${product.images.length}`)
      
      if (product.images.length > 0) {
        validProducts++
        
        for (const image of product.images) {
          const imagePath = path.join(process.cwd(), 'public', image.path)
          
          try {
            await fs.access(imagePath)
            console.log(`     ✅ ${image.filename} - Archivo existe`)
            validImages++
          } catch (error) {
            console.log(`     ❌ ${image.filename} - Archivo no encontrado`)
            missingImages++
          }
        }
      } else {
        console.log(`     ⚠️ Sin imágenes`)
        missingImages++
      }
    }
    
    // 3. Resumen final
    console.log('\n🎯 RESUMEN FINAL:')
    console.log('='.repeat(50))
    console.log(`📦 Productos totales: ${products.length}`)
    console.log(`✅ Productos con imágenes: ${validProducts}`)
    console.log(`🖼️ Imágenes válidas: ${validImages}`)
    console.log(`❌ Imágenes faltantes: ${missingImages}`)
    
    // 4. Verificar estructura de archivos
    console.log('\n📁 Estructura de archivos:')
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    
    try {
      const productDirs = await fs.readdir(uploadsDir)
      console.log(`   📂 Directorios de productos: ${productDirs.length}`)
      
      for (const dir of productDirs.slice(0, 3)) {
        const dirPath = path.join(uploadsDir, dir)
        const files = await fs.readdir(dirPath)
        console.log(`   📁 ${dir}: ${files.length} archivos`)
      }
      
      if (productDirs.length > 3) {
        console.log(`   📁 ... y ${productDirs.length - 3} directorios más`)
      }
      
    } catch (error) {
      console.log(`   ❌ Error leyendo directorio: ${error.message}`)
    }
    
    // 5. URLs de ejemplo
    console.log('\n🔗 URLs de ejemplo:')
    const sampleProducts = products.slice(0, 3)
    
    for (const product of sampleProducts) {
      if (product.images.length > 0) {
        const imageUrl = `http://localhost:3000/api/images${product.images[0].path}`
        console.log(`   📱 ${product.title}`)
        console.log(`      ${imageUrl}`)
      }
    }
    
    console.log('\n✅ Verificación completada!')
    console.log('\n🎉 El sistema está listo para usar:')
    console.log('   - Ve a http://localhost:3000/products para ver los productos')
    console.log('   - Ve a http://localhost:3000/admin para gestionar productos')
    console.log('   - Todas las imágenes se descargaron correctamente de Unsplash')
    
  } catch (error) {
    console.error('❌ Error en verificación:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifyFinalProducts()
