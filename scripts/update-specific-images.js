const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// URLs muy específicas para cada tipo de producto
const specificProductImages = {
  smartphones: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop&q=80',
  laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=800&fit=crop&q=80',
  audio: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&h=800&fit=crop&q=80',
  cameras: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  gaming: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  wearables: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  chargers: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  cables: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  gadgets: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  motherboards: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  monitors: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  storage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  graphics: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  processors: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  memory: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  powerSupplies: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  cooling: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
}

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

async function updateSpecificImages() {
  try {
    console.log('🔍 Buscando productos para actualizar con imágenes específicas...')
    
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    })
    
    console.log(`📦 Encontrados ${products.length} productos`)
    
    for (const product of products) {
      const category = product.categories
      const specificImageUrl = specificProductImages[category]
      
      if (!specificImageUrl) {
        console.log(`⚠️ No hay imagen específica para categoría: ${category}`)
        continue
      }
      
      console.log(`\n🔄 Actualizando imagen específica para: ${product.title} (${category})`)
      
      try {
        // Eliminar imagen anterior si existe
        if (product.images.length > 0) {
          for (const image of product.images) {
            const oldImagePath = path.join(process.cwd(), 'public', image.path)
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath)
              console.log(`  🗑️ Eliminada imagen anterior: ${image.path}`)
            }
            
            // Eliminar registro de la base de datos
            await prisma.productImage.delete({
              where: { id: image.id }
            })
          }
        }
        
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
        
        console.log(`  📥 Descargando imagen específica para ${category}...`)
        
        // Descargar nueva imagen
        await downloadImage(specificImageUrl, filePath)
        
        // Crear nuevo registro de imagen
        await prisma.productImage.create({
          data: {
            path: `/uploads/products/product_${product.id}/${filename}`,
            filename: filename,
            alt: product.title,
            order: 0,
            productId: product.id
          }
        })
        
        console.log(`  ✅ Imagen específica actualizada: ${product.title}`)
        
      } catch (error) {
        console.error(`  ❌ Error actualizando imagen para ${product.title}: ${error.message}`)
      }
    }
    
    console.log(`\n🎉 Proceso completado! Se actualizaron las imágenes específicas de ${products.length} productos.`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSpecificImages()
