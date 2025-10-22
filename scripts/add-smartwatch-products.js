const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// Productos específicos de smartwatch
const smartwatchProducts = [
  {
    title: 'Apple Watch Series 9 45mm GPS',
    description: 'Smartwatch con pantalla Always-On, seguimiento de salud avanzado y resistencia al agua hasta 50 metros.',
    price: 429.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 3,
    categories: 'wearables',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Samsung Galaxy Watch 6 Classic 47mm',
    description: 'Smartwatch premium con bisel giratorio, monitoreo de salud y batería de larga duración.',
    price: 399.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 2,
    categories: 'wearables',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Garmin Fenix 7 Pro Solar',
    description: 'Reloj deportivo con GPS, carga solar y seguimiento avanzado de actividades al aire libre.',
    price: 799.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 1,
    categories: 'wearables',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Fitbit Versa 4',
    description: 'Smartwatch fitness con seguimiento de sueño, GPS integrado y resistencia al agua.',
    price: 199.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 4,
    categories: 'wearables',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Amazfit GTR 4',
    description: 'Smartwatch elegante con pantalla AMOLED, GPS dual y batería de 14 días.',
    price: 249.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 2,
    categories: 'wearables',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&h=800&fit=crop&q=80'
  },
  {
    title: 'Huawei Watch GT 4',
    description: 'Smartwatch con diseño premium, monitoreo de salud 24/7 y autonomía de 14 días.',
    price: 299.99,
    condition: 'NEW',
    aestheticCondition: 10,
    stock: 3,
    categories: 'wearables',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&h=800&fit=crop&q=80'
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

async function addSmartwatchProducts() {
  try {
    console.log('⌚ Agregando productos de smartwatch...')
    
    // Crear nuevos productos de smartwatch
    for (const productData of smartwatchProducts) {
      console.log(`\n⌚ Creando: ${productData.title}`)
      
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
              tipo: 'Smartwatch'
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
        
        console.log(`  ✅ Producto de smartwatch creado: ${productData.title}`)
        
      } catch (error) {
        console.error(`  ❌ Error creando ${productData.title}: ${error.message}`)
      }
    }
    
    console.log(`\n🎉 Proceso completado! Se agregaron ${smartwatchProducts.length} productos de smartwatch.`)
    console.log('\n⌚ PRODUCTOS DE SMARTWATCH AGREGADOS:')
    smartwatchProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSmartwatchProducts()
