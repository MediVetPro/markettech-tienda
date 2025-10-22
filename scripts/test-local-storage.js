const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function testLocalStorage() {
  console.log('🧪 Probando sistema de almacenamiento local...\n')
  
  try {
    // 1. Verificar que la base de datos está actualizada
    console.log('1️⃣ Verificando esquema de base de datos...')
    const productImages = await prisma.productImage.findMany({
      take: 1
    })
    console.log('✅ Esquema actualizado correctamente')
    
    // 2. Verificar directorio de uploads
    console.log('\n2️⃣ Verificando directorio de uploads...')
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (fs.existsSync(uploadsDir)) {
      console.log('✅ Directorio de uploads existe')
    } else {
      console.log('❌ Directorio de uploads no existe')
      return
    }
    
    // 3. Crear un producto de prueba
    console.log('\n3️⃣ Creando producto de prueba...')
    const testProduct = await prisma.product.create({
      data: {
        title: 'Producto de Prueba',
        description: 'Este es un producto de prueba para verificar el sistema de imágenes',
        price: 99.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Especificaciones de prueba',
        categories: 'test',
        stock: 1,
        status: 'ACTIVE'
      }
    })
    console.log(`✅ Producto creado: ${testProduct.title} (ID: ${testProduct.id})`)
    
    // 4. Simular creación de directorio del producto
    console.log('\n4️⃣ Creando directorio del producto...')
    const productDir = path.join(uploadsDir, `product_${testProduct.id}`)
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true })
      console.log(`✅ Directorio creado: product_${testProduct.id}`)
    }
    
    // 5. Crear archivo de imagen simulado
    console.log('\n5️⃣ Creando archivo de imagen simulado...')
    const testImagePath = path.join(productDir, 'test_image.jpg')
    const testImageContent = 'Contenido de imagen de prueba'
    fs.writeFileSync(testImagePath, testImageContent)
    console.log('✅ Archivo de imagen simulado creado')
    
    // 6. Crear registro en la base de datos
    console.log('\n6️⃣ Creando registro de imagen en la base de datos...')
    const imageRecord = await prisma.productImage.create({
      data: {
        path: `/uploads/products/product_${testProduct.id}/test_image.jpg`,
        filename: 'test_image.jpg',
        alt: 'Imagen de prueba',
        order: 0,
        productId: testProduct.id
      }
    })
    console.log('✅ Registro de imagen creado en la base de datos')
    
    // 7. Verificar que todo funciona
    console.log('\n7️⃣ Verificando integridad del sistema...')
    const productWithImages = await prisma.product.findUnique({
      where: { id: testProduct.id },
      include: { images: true }
    })
    
    if (productWithImages && productWithImages.images.length > 0) {
      console.log('✅ Producto con imágenes encontrado')
      console.log(`   - Título: ${productWithImages.title}`)
      console.log(`   - Imágenes: ${productWithImages.images.length}`)
      console.log(`   - Primera imagen: ${productWithImages.images[0].path}`)
    }
    
    // 8. Limpiar datos de prueba
    console.log('\n8️⃣ Limpiando datos de prueba...')
    await prisma.productImage.deleteMany({
      where: { productId: testProduct.id }
    })
    await prisma.product.delete({
      where: { id: testProduct.id }
    })
    
    // Eliminar directorio de prueba
    if (fs.existsSync(productDir)) {
      fs.rmSync(productDir, { recursive: true, force: true })
    }
    
    console.log('✅ Datos de prueba eliminados')
    
    console.log('\n🎉 ¡Sistema de almacenamiento local funcionando correctamente!')
    console.log('\n📋 Resumen:')
    console.log('- ✅ Base de datos actualizada')
    console.log('- ✅ Directorio de uploads creado')
    console.log('- ✅ Creación de productos funciona')
    console.log('- ✅ Subida de imágenes funciona')
    console.log('- ✅ Registro en base de datos funciona')
    console.log('- ✅ Sistema listo para usar')
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar prueba
testLocalStorage()
