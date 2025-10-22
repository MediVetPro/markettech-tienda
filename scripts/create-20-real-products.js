const { PrismaClient } = require('@prisma/client')
const fs = require('fs').promises
const path = require('path')
const https = require('https')
const { promisify } = require('util')

const prisma = new PrismaClient()

// Productos reales con datos auténticos
const realProducts = [
  {
    title: "iPhone 15 Pro Max 256GB",
    description: "El iPhone más avanzado con chip A17 Pro, cámara de 48MP, pantalla Super Retina XDR de 6.7 pulgadas y hasta 29 horas de reproducción de video.",
    price: 1299.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip A17 Pro, Pantalla 6.7\" Super Retina XDR, 256GB almacenamiento, Cámara 48MP, 5G, iOS 17, Titanio natural",
    categories: "smartphones,apple,premium",
    stock: 15,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "MacBook Pro M3 14 pulgadas",
    description: "Laptop profesional con chip M3, pantalla Liquid Retina XDR de 14.2 pulgadas, hasta 22 horas de batería y rendimiento excepcional para profesionales.",
    price: 1999.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip M3, Pantalla 14.2\" Liquid Retina XDR, 512GB SSD, 8GB RAM, Hasta 22h batería, macOS Sonoma, Diseño unibody",
    categories: "laptops,apple,profesional",
    stock: 8,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Samsung Galaxy S24 Ultra 512GB",
    description: "Smartphone Android premium con S Pen, cámara de 200MP, pantalla Dynamic AMOLED 2X de 6.8 pulgadas y procesador Snapdragon 8 Gen 3.",
    price: 1199.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Snapdragon 8 Gen 3, Pantalla 6.8\" Dynamic AMOLED 2X, 512GB, Cámara 200MP, S Pen incluido, 5G, Android 14",
    categories: "smartphones,samsung,premium",
    stock: 12,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Dell XPS 15 9520 i7 32GB RTX 3050",
    description: "Laptop de alto rendimiento con procesador Intel i7, 32GB RAM, tarjeta gráfica RTX 3050 y pantalla 4K OLED de 15.6 pulgadas.",
    price: 1899.99,
    condition: "USED",
    aestheticCondition: 8,
    specifications: "Intel i7-12700H, 32GB RAM, RTX 3050, 1TB SSD, Pantalla 15.6\" 4K OLED, Windows 11, Diseño premium",
    categories: "laptops,dell,gaming",
    stock: 5,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Sony WF-1000XM4 Auriculares Inalámbricos",
    description: "Auriculares inalámbricos premium con cancelación de ruido líder en la industria, sonido de alta calidad y hasta 8 horas de batería.",
    price: 279.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "Cancelación de ruido, Sonido de alta calidad, 8h batería, Carga rápida, Resistente al agua, Bluetooth 5.2",
    categories: "audio,sony,inalambrico",
    stock: 20,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "PlayStation 5 Digital Edition",
    description: "Consola de videojuegos de nueva generación con SSD ultra rápido, ray tracing, 4K nativo y audio 3D espacial.",
    price: 399.99,
    condition: "USED",
    aestheticCondition: 8,
    specifications: "AMD Zen 2, SSD 825GB, Ray tracing, 4K nativo, Audio 3D, DualSense, Compatible con PS4",
    categories: "gaming,playstation,consola",
    stock: 7,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "iPad Pro 12.9 pulgadas M2",
    description: "Tablet profesional con chip M2, pantalla Liquid Retina XDR de 12.9 pulgadas, compatibilidad con Apple Pencil y Magic Keyboard.",
    price: 1099.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip M2, Pantalla 12.9\" Liquid Retina XDR, 256GB, Compatible Apple Pencil, Magic Keyboard, iPadOS 16",
    categories: "tablets,apple,profesional",
    stock: 10,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Nintendo Switch OLED",
    description: "Consola híbrida con pantalla OLED de 7 pulgadas, 64GB de almacenamiento interno y controles Joy-Con mejorados.",
    price: 349.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Pantalla OLED 7\", 64GB almacenamiento, Joy-Con mejorados, Modo portátil y TV, WiFi, Bluetooth",
    categories: "gaming,nintendo,portatil",
    stock: 15,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "AirPods Pro 2da Generación",
    description: "Auriculares inalámbricos con cancelación de ruido adaptativa, audio espacial personalizado y estuche de carga MagSafe.",
    price: 249.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Cancelación de ruido adaptativa, Audio espacial, 6h batería, Carga MagSafe, Resistente al agua, H2 chip",
    categories: "audio,apple,inalambrico",
    stock: 25,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Samsung Galaxy Tab S9 Ultra",
    description: "Tablet Android premium con pantalla AMOLED de 14.6 pulgadas, S Pen incluido, procesador Snapdragon 8 Gen 2 y hasta 12 horas de batería.",
    price: 1199.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Snapdragon 8 Gen 2, Pantalla 14.6\" AMOLED, 256GB, S Pen incluido, 12h batería, Android 13, 5G",
    categories: "tablets,samsung,premium",
    stock: 6,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Xbox Series X",
    description: "Consola de videojuegos de nueva generación con 4K nativo, 120 FPS, ray tracing y SSD de 1TB para carga ultra rápida.",
    price: 499.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "AMD Zen 2, 4K nativo, 120 FPS, Ray tracing, SSD 1TB, Compatible con Xbox One, Dolby Vision",
    categories: "gaming,xbox,consola",
    stock: 4,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "MacBook Air M2 13 pulgadas",
    description: "Laptop ultraportátil con chip M2, pantalla Liquid Retina de 13.6 pulgadas, diseño delgado y hasta 18 horas de batería.",
    price: 1199.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip M2, Pantalla 13.6\" Liquid Retina, 256GB SSD, 8GB RAM, Hasta 18h batería, macOS Sonoma, Diseño delgado",
    categories: "laptops,apple,ultraportatil",
    stock: 12,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Google Pixel 8 Pro 256GB",
    description: "Smartphone Android con cámara de 50MP, procesador Tensor G3, pantalla OLED de 6.7 pulgadas y 7 años de actualizaciones.",
    price: 999.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Tensor G3, Pantalla 6.7\" OLED, 256GB, Cámara 50MP, 7 años actualizaciones, 5G, Android 14",
    categories: "smartphones,google,premium",
    stock: 8,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Steam Deck 512GB",
    description: "Consola portátil para PC gaming con pantalla táctil de 7 pulgadas, almacenamiento SSD de 512GB y compatibilidad con Steam.",
    price: 649.99,
    condition: "USED",
    aestheticCondition: 8,
    specifications: "AMD APU, Pantalla 7\" táctil, SSD 512GB, Steam OS, Controles integrados, WiFi, Bluetooth",
    categories: "gaming,steam,portatil",
    stock: 3,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Bose QuietComfort 45",
    description: "Auriculares over-ear con cancelación de ruido líder, sonido equilibrado y hasta 24 horas de batería.",
    price: 329.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "Cancelación de ruido, Sonido equilibrado, 24h batería, Carga rápida, Bluetooth, Controles táctiles",
    categories: "audio,bose,over-ear",
    stock: 18,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Surface Pro 9 i7 16GB",
    description: "Tablet 2-en-1 con procesador Intel i7, 16GB RAM, pantalla PixelSense de 13 pulgadas y teclado Surface Type Cover.",
    price: 1299.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Intel i7, 16GB RAM, Pantalla 13\" PixelSense, 256GB SSD, Windows 11, Type Cover incluido",
    categories: "tablets,microsoft,profesional",
    stock: 7,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Meta Quest 3 128GB",
    description: "Gafas de realidad virtual con procesador Snapdragon XR2 Gen 2, pantalla de alta resolución y controladores Touch Plus.",
    price: 499.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Snapdragon XR2 Gen 2, Pantalla alta resolución, 128GB, Touch Plus, WiFi 6E, Bluetooth",
    categories: "vr,meta,realidad-virtual",
    stock: 9,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Apple Watch Series 9 GPS 45mm",
    description: "Reloj inteligente con chip S9, pantalla Always-On Retina, seguimiento de salud avanzado y hasta 18 horas de batería.",
    price: 429.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip S9, Pantalla Always-On Retina, GPS, Seguimiento salud, 18h batería, watchOS 10, Resistente al agua",
    categories: "wearables,apple,smartwatch",
    stock: 14,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "Sony WH-1000XM5",
    description: "Auriculares over-ear con cancelación de ruido líder, sonido de alta fidelidad y hasta 30 horas de batería.",
    price: 399.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "Cancelación de ruido líder, Sonido alta fidelidad, 30h batería, Carga rápida, Bluetooth 5.2, Controles táctiles",
    categories: "audio,sony,over-ear",
    stock: 11,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop&q=80"
  },
  {
    title: "iPad Air 5ta Generación M1",
    description: "Tablet con chip M1, pantalla Liquid Retina de 10.9 pulgadas, compatibilidad con Apple Pencil 2da generación y Magic Keyboard.",
    price: 599.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip M1, Pantalla 10.9\" Liquid Retina, 256GB, Apple Pencil 2da gen, Magic Keyboard, iPadOS 16",
    categories: "tablets,apple,profesional",
    stock: 16,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop&q=80"
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

// Función para generar nombre de archivo único
function generateUniqueFilename(originalName, productId) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop() || 'jpg'
  return `${timestamp}_${random}.${extension}`
}

async function createRealProducts() {
  try {
    console.log('🚀 Iniciando creación de 20 productos reales...')
    
    // Crear directorio base si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await fs.mkdir(uploadsDir, { recursive: true })
    
    const createdProducts = []
    
    for (let i = 0; i < realProducts.length; i++) {
      const productData = realProducts[i]
      console.log(`\n📦 Creando producto ${i + 1}/20: ${productData.title}`)
      
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
      
      console.log(`   ✅ Producto creado: ${product.id}`)
      
      // 2. Crear directorio para el producto
      const productDir = path.join(uploadsDir, `product_${product.id}`)
      await fs.mkdir(productDir, { recursive: true })
      
      // 3. Descargar imagen
      const imageFilename = generateUniqueFilename('product_image.jpg', product.id)
      const imagePath = path.join(productDir, imageFilename)
      const relativePath = `/uploads/products/product_${product.id}/${imageFilename}`
      
      try {
        console.log(`   📥 Descargando imagen desde: ${productData.imageUrl}`)
        await downloadImage(productData.imageUrl, imagePath)
        console.log(`   ✅ Imagen descargada: ${imageFilename}`)
        
        // 4. Crear registro de imagen en la base de datos
        await prisma.productImage.create({
          data: {
            path: relativePath,
            filename: imageFilename,
            alt: productData.title,
            order: 0,
            productId: product.id
          }
        })
        
        console.log(`   ✅ Imagen registrada en BD`)
        
        createdProducts.push({
          id: product.id,
          title: product.title,
          imagePath: relativePath
        })
        
      } catch (error) {
        console.log(`   ⚠️ Error descargando imagen: ${error.message}`)
        // Crear imagen placeholder si falla la descarga
        const placeholderPath = path.join(productDir, 'placeholder.jpg')
        await fs.copyFile(path.join(process.cwd(), 'public', 'placeholder.jpg'), placeholderPath)
        
        await prisma.productImage.create({
          data: {
            path: `/uploads/products/product_${product.id}/placeholder.jpg`,
            filename: 'placeholder.jpg',
            alt: productData.title,
            order: 0,
            productId: product.id
          }
        })
        
        console.log(`   ✅ Imagen placeholder creada`)
      }
    }
    
    console.log('\n🎉 ¡20 productos reales creados exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`   - Productos creados: ${createdProducts.length}`)
    console.log(`   - Imágenes descargadas: ${createdProducts.filter(p => !p.imagePath.includes('placeholder')).length}`)
    console.log(`   - Imágenes placeholder: ${createdProducts.filter(p => p.imagePath.includes('placeholder')).length}`)
    
    console.log('\n🔗 URLs de ejemplo:')
    createdProducts.slice(0, 3).forEach(product => {
      console.log(`   - ${product.title}: http://localhost:3000/api/images${product.imagePath}`)
    })
    
  } catch (error) {
    console.error('❌ Error creando productos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createRealProducts()
