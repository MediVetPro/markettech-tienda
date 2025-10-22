const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSpecificationsFormat() {
  try {
    console.log('🔧 Iniciando corrección del formato de especificaciones...')
    
    // Obtener todos los productos
    const products = await prisma.product.findMany()
    
    console.log(`📦 Encontrados ${products.length} productos`)
    
    for (const product of products) {
      let newSpecifications = product.specifications
      
      // Si las especificaciones están en formato JSON (entre llaves), convertirlas
      if (product.specifications && product.specifications.startsWith('{') && product.specifications.endsWith('}')) {
        try {
          const specsObj = JSON.parse(product.specifications)
          
          // Convertir objeto JSON a formato legible
          const specsArray = Object.entries(specsObj).map(([key, value]) => {
            // Capitalizar la primera letra de la clave
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1)
            return `${capitalizedKey}: ${value}`
          })
          
          newSpecifications = specsArray.join('\n')
          
          console.log(`✅ Producto ${product.id}: ${product.title}`)
          console.log(`   Antes: ${product.specifications}`)
          console.log(`   Después: ${newSpecifications}`)
          
        } catch (error) {
          console.log(`⚠️ Error parseando JSON para producto ${product.id}: ${error.message}`)
          continue
        }
      } else {
        console.log(`ℹ️ Producto ${product.id} ya tiene formato correcto`)
        continue
      }
      
      // Actualizar el producto con las nuevas especificaciones
      await prisma.product.update({
        where: { id: product.id },
        data: { specifications: newSpecifications }
      })
    }
    
    console.log('✅ Corrección de especificaciones completada!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSpecificationsFormat()
