const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// Un producto por categoría con imágenes específicas de tecnología
const productsByCategory = {
  smartphones: {
    title: 'iPhone 15 Pro Max 256GB',
    price: 1299.99,
    description: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop&q=80'
  },
  laptops: {
    title: 'MacBook Pro M3 14" 512GB',
    price: 1999.99,
    description: 'Laptop profesional con chip M3, pantalla Liquid Retina XDR de 14.2 pulgadas y hasta 22 horas de batería.',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=800&fit=crop&q=80'
  },
  audio: {
    title: 'Sony WH-1000XM5 Auriculares',
    price: 399.99,
    description: 'Auriculares inalámbricos premium con cancelación de ruido líder en la industria y 30 horas de batería.',
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&h=800&fit=crop&q=80'
  },
  cameras: {
    title: 'Canon EOS R5 Cámara Mirrorless',
    price: 3899.99,
    description: 'Cámara profesional con sensor de 45MP, grabación 8K y estabilización de imagen de 5 ejes.',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80'
  },
  gaming: {
    title: 'PlayStation 5 Console',
    price: 499.99,
    description: 'Consola de videojuegos de nueva generación con SSD ultra-rápido y ray tracing.',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80'
  },
  wearables: {
    title: 'Apple Watch Series 9 GPS',
    price: 399.99,
    description: 'Smartwatch con chip S9, pantalla Always-On Retina y seguimiento avanzado de salud.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80'
  },
  chargers: {
    title: 'Anker PowerCore 26800 PowerBank',
    price: 79.99,
    description: 'Power bank de alta capacidad con 26800mAh, carga rápida USB-C y diseño compacto.',
    imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80'
  },
  cables: {
    title: 'Anker PowerLine III USB-C Cable',
    price: 19.99,
    description: 'Cable USB-C a USB-C de alta velocidad con soporte para 100W y transferencia de datos rápida.',
    imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80'
  },
  gadgets: {
    title: 'Apple AirTag 4-Pack',
    price: 99.99,
    description: 'Dispositivos de seguimiento con tecnología U1 para encontrar objetos perdidos.',
    imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80'
  },
  motherboards: {
    title: 'ASUS ROG Strix B550-F Gaming',
    price: 189.99,
    description: 'Placa madre AMD AM4 con soporte para procesadores Ryzen, PCIe 4.0, WiFi 6 y RGB.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
  },
  monitors: {
    title: 'Samsung Odyssey G7 27" 1440p',
    price: 399.99,
    description: 'Monitor gaming curvo 27" con 240Hz, QHD y tecnología QLED.',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80'
  },
  storage: {
    title: 'Samsung 980 PRO 1TB NVMe',
    price: 129.99,
    description: 'SSD NVMe PCIe 4.0 de alta velocidad para gaming y trabajo profesional.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
  },
  graphics: {
    title: 'NVIDIA GeForce RTX 4070',
    price: 599.99,
    description: 'Tarjeta gráfica gaming de alta gama con ray tracing y DLSS 3.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
  },
  processors: {
    title: 'AMD Ryzen 7 7700X',
    price: 329.99,
    description: 'Procesador AMD de 8 núcleos y 16 hilos con arquitectura Zen 4.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
  },
  memory: {
    title: 'Corsair Vengeance LPX 32GB DDR4',
    price: 89.99,
    description: 'Kit de memoria DDR4 de 32GB (2x16GB) con latencia baja.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
  },
  powerSupplies: {
    title: 'Corsair RM850x 850W 80+ Gold',
    price: 129.99,
    description: 'Fuente de poder modular 850W con certificación 80+ Gold.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
  },
  cooling: {
    title: 'Noctua NH-D15 Chromax Black',
    price: 99.99,
    description: 'Cooler de CPU de alto rendimiento con doble ventilador.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
  }
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

function generateSpecifications(category) {
  const specs = {
    smartphones: 'Pantalla OLED, Cámara principal 48MP+, Procesador de última generación, 5G, Resistente al agua IP68',
    laptops: 'Procesador de última generación, 16GB+ RAM, SSD 512GB+, Pantalla 4K/1440p, WiFi 6, Bluetooth 5.0',
    audio: 'Cancelación de ruido, Batería 20+ horas, Bluetooth 5.0, Resistente al agua, Micrófonos de alta calidad',
    cameras: 'Sensor de alta resolución, Grabación 4K, Estabilización de imagen, Autofoco híbrido, WiFi integrado',
    gaming: 'Resolución 4K/1440p, 60+ FPS, Ray tracing, HDR, Audio 3D, Almacenamiento SSD',
    wearables: 'Pantalla AMOLED, Resistente al agua IP68, GPS integrado, Monitor de salud, Batería 7+ días',
    chargers: 'Carga rápida, Múltiples puertos, Certificación de seguridad, Cable incluido, Diseño compacto',
    cables: 'Transferencia de datos rápida, Carga rápida, Construcción duradera, Compatibilidad universal',
    gadgets: 'Conectividad inalámbrica, Batería de larga duración, Diseño compacto, Fácil configuración',
    motherboards: 'Socket compatible, PCIe 4.0, WiFi 6, Bluetooth 5.0, RGB integrado, Múltiples puertos',
    monitors: 'Resolución 4K/1440p, 144Hz+, HDR, G-Sync/FreeSync, Pantalla IPS/VA, Conectividad múltiple',
    storage: 'Velocidad de lectura/escritura alta, Tecnología NVMe, Capacidad 1TB+, Garantía extendida',
    graphics: 'Ray tracing, DLSS/FSR, 8GB+ VRAM, Refrigeración avanzada, RGB, Compatibilidad PCIe 4.0',
    processors: 'Múltiples núcleos, Alta frecuencia, Arquitectura de última generación, Compatibilidad DDR5',
    memory: 'Alta velocidad, Baja latencia, RGB opcional, Compatibilidad XMP, Garantía de por vida',
    powerSupplies: 'Certificación 80+ Gold, Modular, Protección completa, Ventilador silencioso, Cableado incluido',
    cooling: 'Refrigeración eficiente, Bajo ruido, Fácil instalación, Compatibilidad universal, RGB opcional'
  }
  
  return specs[category] || 'Especificaciones técnicas de alta calidad'
}

async function createOnePerCategory() {
  try {
    console.log('🚀 Creando un producto por categoría...')
    
    let totalCreated = 0
    const categories = Object.keys(productsByCategory)
    
    for (const category of categories) {
      const product = productsByCategory[category]
      
      console.log(`\n📦 Creando producto para categoría: ${category}`)
      
      try {
        // Crear producto
        const createdProduct = await prisma.product.create({
          data: {
            title: product.title,
            description: product.description,
            price: product.price,
            condition: 'NEW',
            aestheticCondition: 10,
            specifications: generateSpecifications(category),
            categories: category,
            stock: Math.floor(Math.random() * 20) + 1, // 1-20 unidades
            status: 'ACTIVE'
          }
        })
        
        // Descargar imagen específica de tecnología
        try {
          // Crear directorio para el producto
          const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', `product_${createdProduct.id}`)
          if (!fs.existsSync(productDir)) {
            fs.mkdirSync(productDir, { recursive: true })
          }
          
          // Generar nombre de archivo
          const timestamp = Date.now()
          const randomId = Math.random().toString(36).substring(2, 8)
          const filename = `${timestamp}_${randomId}.jpg`
          const filePath = path.join(productDir, filename)
          
          console.log(`  📥 Descargando imagen de tecnología: ${product.title}`)
          
          // Descargar imagen
          await downloadImage(product.imageUrl, filePath)
          
          // Crear registro de imagen
          await prisma.productImage.create({
            data: {
              path: `/uploads/products/product_${createdProduct.id}/${filename}`,
              filename: filename,
              alt: product.title,
              order: 0,
              productId: createdProduct.id
            }
          })
          
          console.log(`  ✅ Creado: ${product.title}`)
          totalCreated++
          
        } catch (error) {
          console.error(`  ❌ Error descargando imagen para ${product.title}: ${error.message}`)
        }
        
      } catch (error) {
        console.error(`❌ Error creando ${product.title}:`, error.message)
      }
    }
    
    console.log(`\n🎉 Se crearon ${totalCreated} productos (uno por categoría)!`)
    console.log('📊 Categorías incluidas:')
    categories.forEach(cat => {
      console.log(`  - ${cat}: ${productsByCategory[cat].title}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createOnePerCategory()
