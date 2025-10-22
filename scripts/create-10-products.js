const { PrismaClient } = require('@prisma/client')
const fs = require('fs').promises
const path = require('path')
const https = require('https')

const prisma = new PrismaClient()

// Productos con datos reales
const productsData = [
  {
    title: "iPhone 15 Pro Max 256GB",
    description: "El iPhone más avanzado con chip A17 Pro, cámara de 48MP, pantalla Super Retina XDR de 6.7 pulgadas y hasta 29 horas de reproducción de video.",
    price: 1299.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip A17 Pro, Pantalla 6.7\" Super Retina XDR, 256GB, Cámara 48MP, 5G, iOS 17, Batería hasta 29h",
    categories: "smartphones,apple,premium",
    stock: 15,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop"
  },
  {
    title: "MacBook Pro M3 14\" 512GB",
    description: "Laptop profesional con chip M3, pantalla Liquid Retina XDR de 14.2 pulgadas, hasta 22 horas de batería y rendimiento excepcional para profesionales.",
    price: 1999.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip M3, Pantalla 14.2\" Liquid Retina XDR, 512GB SSD, 8GB RAM, Hasta 22h batería, macOS Sonoma",
    categories: "laptops,apple,professional",
    stock: 8,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop"
  },
  {
    title: "Samsung Galaxy S24 Ultra 512GB",
    description: "Smartphone Android premium con S Pen, cámara de 200MP, pantalla Dynamic AMOLED 2X de 6.8 pulgadas y procesador Snapdragon 8 Gen 3.",
    price: 1199.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Snapdragon 8 Gen 3, Pantalla 6.8\" Dynamic AMOLED 2X, 512GB, Cámara 200MP, S Pen, 5G",
    categories: "smartphones,samsung,android",
    stock: 12,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop"
  },
  {
    title: "iPad Pro 12.9\" M2 256GB",
    description: "Tablet profesional con chip M2, pantalla Liquid Retina XDR de 12.9 pulgadas, compatibilidad con Apple Pencil y Magic Keyboard.",
    price: 1099.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip M2, Pantalla 12.9\" Liquid Retina XDR, 256GB, Apple Pencil compatible, Magic Keyboard, iPadOS 17",
    categories: "tablets,apple,professional",
    stock: 10,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop"
  },
  {
    title: "AirPods Pro 2da Generación",
    description: "Auriculares inalámbricos con cancelación activa de ruido, audio espacial personalizado y hasta 6 horas de reproducción.",
    price: 249.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Cancelación activa de ruido, Audio espacial, Hasta 6h reproducción, Carga inalámbrica, Resistencia al agua IPX4",
    categories: "audio,apple,wireless",
    stock: 25,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop"
  },
  {
    title: "Sony WH-1000XM5 Auriculares",
    description: "Auriculares over-ear con cancelación de ruido líder en la industria, hasta 30 horas de batería y sonido de alta fidelidad.",
    price: 399.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Cancelación de ruido líder, Hasta 30h batería, Sonido Hi-Res, Carga rápida, Control táctil",
    categories: "audio,sony,noise-cancelling",
    stock: 18,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop"
  },
  {
    title: "Dell XPS 15 9520 i7 32GB",
    description: "Laptop premium con procesador Intel i7, 32GB RAM, pantalla 15.6 pulgadas 4K OLED y tarjeta gráfica RTX 3050.",
    price: 1899.99,
    condition: "USED",
    aestheticCondition: 8,
    specifications: "Intel i7-12700H, 32GB RAM, 512GB SSD, RTX 3050, Pantalla 15.6\" 4K OLED, Windows 11",
    categories: "laptops,dell,professional",
    stock: 5,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop"
  },
  {
    title: "Samsung Galaxy Tab S9 Ultra 14.6\"",
    description: "Tablet Android premium con pantalla de 14.6 pulgadas, S Pen incluido, procesador Snapdragon 8 Gen 2 y hasta 14 horas de batería.",
    price: 899.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Snapdragon 8 Gen 2, Pantalla 14.6\" AMOLED, 256GB, S Pen incluido, Hasta 14h batería, Android 13",
    categories: "tablets,samsung,android",
    stock: 7,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop"
  },
  {
    title: "Apple Watch Series 9 GPS 45mm",
    description: "Smartwatch con chip S9, pantalla Always-On Retina, seguimiento de salud avanzado y hasta 18 horas de batería.",
    price: 429.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip S9, Pantalla Always-On Retina, GPS, Resistencia al agua 50m, Hasta 18h batería, watchOS 10",
    categories: "wearables,apple,smartwatch",
    stock: 20,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop"
  },
  {
    title: "PlayStation 5 Digital Edition",
    description: "Consola de videojuegos de nueva generación con SSD ultra rápido, ray tracing y compatibilidad con juegos 4K a 120fps.",
    price: 399.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "SSD 825GB, Ray tracing, 4K a 120fps, Audio 3D, Compatible con PS4, DualSense incluido",
    categories: "gaming,sony,console",
    stock: 3,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop"
  }
]

// Función para descargar imagen
async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(filePath)
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      require('fs').unlink(filePath, () => {}) // Eliminar archivo parcial
      reject(err)
    })
  })
}

// Función para generar nombre único de archivo
function generateUniqueFilename(originalName) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = path.extname(originalName) || '.jpg'
  const nameWithoutExt = path.basename(originalName, extension)
  return `${nameWithoutExt}_${timestamp}_${random}${extension}`
}

async function createProducts() {
  try {
    console.log('🚀 Iniciando creación de 10 productos...')
    
    for (let i = 0; i < productsData.length; i++) {
      const productData = productsData[i]
      console.log(`\n📦 Creando producto ${i + 1}/10: ${productData.title}`)
      
      // 1. Crear producto en la base de datos
      const product = await prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          price: productData.price,
          condition: productData.condition,
          aestheticCondition: productData.aestheticCondition,
          specifications: productData.specifications,
          categories: productData.categories,
          stock: productData.stock,
          status: productData.status
        }
      })
      
      console.log(`✅ Producto creado con ID: ${product.id}`)
      
      // 2. Crear directorio para el producto
      const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', `product_${product.id}`)
      await fs.mkdir(productDir, { recursive: true })
      console.log(`📁 Directorio creado: ${productDir}`)
      
      // 3. Descargar imagen
      try {
        const filename = generateUniqueFilename('product_image.jpg')
        const imagePath = path.join(productDir, filename)
        
        console.log(`📥 Descargando imagen desde: ${productData.imageUrl}`)
        await downloadImage(productData.imageUrl, imagePath)
        console.log(`✅ Imagen descargada: ${filename}`)
        
        // 4. Crear registro de imagen en la base de datos
        const relativePath = `/uploads/products/product_${product.id}/${filename}`
        await prisma.productImage.create({
          data: {
            path: relativePath,
            filename: filename,
            alt: productData.title,
            order: 0,
            productId: product.id
          }
        })
        
        console.log(`✅ Registro de imagen creado: ${relativePath}`)
        
      } catch (error) {
        console.error(`❌ Error descargando imagen para ${productData.title}:`, error.message)
        
        // Crear placeholder si falla la descarga
        const placeholderPath = `/placeholder.jpg`
        await prisma.productImage.create({
          data: {
            path: placeholderPath,
            filename: 'placeholder.jpg',
            alt: productData.title,
            order: 0,
            productId: product.id
          }
        })
        console.log(`⚠️ Usando placeholder para ${productData.title}`)
      }
    }
    
    console.log('\n🎉 ¡10 productos creados exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`✅ Productos creados: ${productsData.length}`)
    console.log(`📁 Imágenes descargadas y almacenadas`)
    console.log(`💾 Registros guardados en base de datos`)
    
  } catch (error) {
    console.error('❌ Error creando productos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar creación
createProducts()
  .then(() => {
    console.log('✅ Script de creación completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en script de creación:', error)
    process.exit(1)
  })
