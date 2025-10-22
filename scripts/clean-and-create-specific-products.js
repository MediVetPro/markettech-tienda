const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// Productos específicos de celulares, videojuegos y monitores
const specificProducts = [
  // CELULARES
  {
    title: 'iPhone 15 Pro Max 256GB',
    description: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.',
    price: 1299.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 5,
    categories: 'smartphones',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'Smartphone premium con S Pen, cámara de 200MP y pantalla Dynamic AMOLED 2X de 6.8 pulgadas.',
    price: 1199.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 3,
    categories: 'smartphones',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Google Pixel 8 Pro 256GB',
    description: 'Smartphone con IA avanzada, cámara de 50MP y pantalla OLED de 6.7 pulgadas con 120Hz.',
    price: 999.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 4,
    categories: 'smartphones',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=80'
  },
  
  // VIDEOJUEGOS
  {
    title: 'PlayStation 5 Console',
    description: 'Consola de videojuegos de nueva generación con SSD ultra-rápido y ray tracing.',
    price: 499.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 2,
    categories: 'gaming',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Xbox Series X Console',
    description: 'Consola de Microsoft con 4K nativo, 120 FPS y Quick Resume.',
    price: 499.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 2,
    categories: 'gaming',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Nintendo Switch OLED',
    description: 'Consola híbrida con pantalla OLED de 7 pulgadas y Joy-Con mejorados.',
    price: 349.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 3,
    categories: 'gaming',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Steam Deck 512GB',
    description: 'Consola portátil para PC gaming con AMD APU y pantalla táctil de 7 pulgadas.',
    price: 649.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 1,
    categories: 'gaming',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80'
  },
  
  // MONITORES
  {
    title: 'Samsung Odyssey G7 27" 1440p',
    description: 'Monitor gaming curvo QHD con 240Hz, 1ms y tecnología Quantum Dot.',
    price: 399.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 2,
    categories: 'monitors',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'LG UltraGear 24" 1080p 144Hz',
    description: 'Monitor gaming Full HD con 144Hz, 1ms y FreeSync Premium.',
    price: 199.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 4,
    categories: 'monitors',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'ASUS ROG Swift 32" 4K 144Hz',
    description: 'Monitor gaming 4K con 144Hz, HDR600 y G-SYNC Ultimate.',
    price: 899.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 1,
    categories: 'monitors',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Dell UltraSharp 27" 4K',
    description: 'Monitor profesional 4K con 99% sRGB y USB-C.',
    price: 449.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 2,
    categories: 'monitors',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80'
  }
]

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

async function cleanAndCreateSpecificProducts() {
  try {
    console.log('🧹 Limpiando productos y fotos existentes...')
    
    // Obtener todos los productos existentes
    const existingProducts = await prisma.product.findMany({
      include: {
        images: true
      }
    })
    
    console.log(`📦 Encontrados ${existingProducts.length} productos existentes`)
    
    // Eliminar imágenes físicas
    for (const product of existingProducts) {
      if (product.images.length > 0) {
        for (const image of product.images) {
          const imagePath = path.join(process.cwd(), 'public', image.path)
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
            console.log(`  🗑️ Eliminada imagen: ${image.path}`)
          }
        }
      }
    }
    
    // Eliminar directorio de uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true, force: true })
      console.log('  🗑️ Directorio de uploads eliminado')
    }
    
    // Eliminar todos los productos de la base de datos
    await prisma.productImage.deleteMany()
    await prisma.product.deleteMany()
    
    console.log('  ✅ Base de datos limpiada')
    
    console.log('\n🔄 Creando productos específicos...')
    
    // Crear nuevos productos
    for (const productData of specificProducts) {
      console.log(`\n📱 Creando: ${productData.title}`)
      
      try {
        // Crear producto en la base de datos
        const product = await prisma.product.create({
          data: {
            title: productData.title,
            description: productData.description,
            price: productData.price,
            condition: productData.condition,
            aestheticCondition: productData.aestheticCondition,
            stock: productData.stock,
            categories: productData.categories,
            status: 'ACTIVE',
            specifications: JSON.stringify({
              marca: productData.title.split(' ')[0],
              modelo: productData.title,
              categoria: productData.categories
            })
          }
        })
        
        // Crear directorio para el producto
        const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', `product_${product.id}`)
        fs.mkdirSync(productDir, { recursive: true })
        
        // Generar nombre de archivo
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 8)
        const filename = `${timestamp}_${randomId}.jpg`
        const filePath = path.join(productDir, filename)
        
        console.log(`  📥 Descargando imagen para ${productData.title}...`)
        
        // Descargar imagen
        await downloadImage(productData.imageUrl, filePath)
        
        // Crear registro de imagen
        await prisma.productImage.create({
          data: {
            path: `/uploads/products/product_${product.id}/${filename}`,
            filename: filename,
            alt: productData.title,
            order: 0,
            productId: product.id
          }
        })
        
        console.log(`  ✅ Producto creado: ${productData.title}`)
        
      } catch (error) {
        console.error(`  ❌ Error creando ${productData.title}: ${error.message}`)
      }
    }
    
    console.log(`\n🎉 Proceso completado! Se crearon ${specificProducts.length} productos específicos.`)
    console.log('\n📱 CELULARES: iPhone 15 Pro Max, Samsung Galaxy S24 Ultra, Google Pixel 8 Pro')
    console.log('🎮 VIDEOJUEGOS: PlayStation 5, Xbox Series X, Nintendo Switch OLED, Steam Deck')
    console.log('🖥️ MONITORES: Samsung Odyssey G7, LG UltraGear, ASUS ROG Swift, Dell UltraSharp')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanAndCreateSpecificProducts()
