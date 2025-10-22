const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function forceImageReload() {
  try {
    console.log('🔄 Forzando recarga de imágenes...')
    
    // Obtener todos los productos con sus imágenes
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    })
    
    console.log(`📦 Encontrados ${products.length} productos`)
    
    let updatedCount = 0
    
    for (const product of products) {
      console.log(`\n🔄 Procesando: ${product.title}`)
      
      for (const image of product.images) {
        // Solo procesar imágenes locales (no URLs externas)
        if (image.path.startsWith('/uploads/')) {
          try {
            // Agregar timestamp para forzar recarga
            const timestamp = Date.now()
            const newPath = `${image.path}?v=${timestamp}`
            
            await prisma.productImage.update({
              where: { id: image.id },
              data: { path: newPath }
            })
            
            console.log(`  ✅ Imagen actualizada: ${newPath}`)
            updatedCount++
            
          } catch (error) {
            console.error(`  ❌ Error actualizando imagen: ${error.message}`)
          }
        } else {
          console.log(`  ⏭️ Saltando URL externa: ${image.path}`)
        }
      }
    }
    
    console.log(`\n🎉 Actualización completada!`)
    console.log(`✅ Imágenes actualizadas: ${updatedCount}`)
    console.log(`\n💡 Para ver los cambios:`)
    console.log(`1. Refresca la página con Ctrl+F5 (o Cmd+Shift+R en Mac)`)
    console.log(`2. O abre las herramientas de desarrollador y desactiva el caché`)
    console.log(`3. O abre la página en modo incógnito`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceImageReload()
