const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const file = fs.createWriteStream(filePath)
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve(filePath)
      })
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}) // Delete the file on error
        reject(err)
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
}

async function downloadAllProductImages() {
  try {
    console.log('📥 Descargando imágenes de productos...')
    
    // Obtener todos los productos con sus imágenes
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    })
    
    console.log(`📦 Encontrados ${products.length} productos`)
    
    let downloadedCount = 0
    let errorCount = 0
    
    for (const product of products) {
      console.log(`\n🔄 Procesando: ${product.title}`)
      
      for (let i = 0; i < product.images.length; i++) {
        const image = product.images[i]
        
        // Solo procesar URLs de Unsplash
        if (image.path.startsWith('http')) {
          try {
            // Crear directorio para el producto
            const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', `product_${product.id}`)
            if (!fs.existsSync(productDir)) {
              fs.mkdirSync(productDir, { recursive: true })
            }
            
            // Generar nombre de archivo
            const timestamp = Date.now()
            const randomId = Math.random().toString(36).substring(2, 8)
            const filename = `${timestamp}_${randomId}.jpg`
            const filePath = path.join(productDir, filename)
            
            console.log(`  📥 Descargando: ${image.path}`)
            
            // Descargar imagen
            await downloadImage(image.path, filePath)
            
            // Actualizar la ruta en la base de datos
            const newPath = `/uploads/products/product_${product.id}/${filename}`
            await prisma.productImage.update({
              where: { id: image.id },
              data: { path: newPath }
            })
            
            console.log(`  ✅ Descargada: ${newPath}`)
            downloadedCount++
            
          } catch (error) {
            console.error(`  ❌ Error descargando imagen: ${error.message}`)
            errorCount++
          }
        } else {
          console.log(`  ⏭️ Saltando imagen local: ${image.path}`)
        }
      }
    }
    
    console.log(`\n🎉 Descarga completada!`)
    console.log(`✅ Imágenes descargadas: ${downloadedCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

downloadAllProductImages()