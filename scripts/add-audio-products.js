const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// Productos específicos de audio
const audioProducts = [
  {
    title: 'Sony WH-1000XM5 Auriculares Inalámbricos',
    description: 'Auriculares premium con cancelación de ruido líder en la industria y 30 horas de batería.',
    price: 399.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 3,
    categories: 'audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'AirPods Pro 2da Generación',
    description: 'Auriculares inalámbricos con cancelación activa de ruido y audio espacial.',
    price: 249.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 5,
    categories: 'audio',
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Bose QuietComfort 45',
    description: 'Auriculares con cancelación de ruido y sonido equilibrado para uso diario.',
    price: 329.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 2,
    categories: 'audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Sennheiser HD 660S',
    description: 'Auriculares de estudio de alta fidelidad con transductores de 150 ohmios.',
    price: 499.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 1,
    categories: 'audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'JBL Charge 5 Altavoz Bluetooth',
    description: 'Altavoz portátil resistente al agua con 20 horas de reproducción.',
    price: 179.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 4,
    categories: 'audio',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Audio-Technica ATH-M50x',
    description: 'Auriculares de monitoreo profesionales con respuesta plana.',
    price: 149.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 3,
    categories: 'audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=800&fit=crop&q=80'
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

async function addAudioProducts() {
  try {
    console.log('🎵 Agregando productos de audio...')
    
    // Crear nuevos productos de audio
    for (const productData of audioProducts) {
      console.log(`\n🎧 Creando: ${productData.title}`)
      
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
              categoria: productData.categories,
              tipo: 'Audio'
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
        
        console.log(`  ✅ Producto de audio creado: ${productData.title}`)
        
      } catch (error) {
        console.error(`  ❌ Error creando ${productData.title}: ${error.message}`)
      }
    }
    
    console.log(`\n🎉 Proceso completado! Se agregaron ${audioProducts.length} productos de audio.`)
    console.log('\n🎧 PRODUCTOS DE AUDIO AGREGADOS:')
    audioProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addAudioProducts()
