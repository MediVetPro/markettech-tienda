const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// URLs de imágenes reales de alta calidad para cada producto
const realProductImages = {
  // Smartphones - Imágenes reales de productos
  'iPhone 15 Pro Max 256GB': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop&q=80',
  'Samsung Galaxy S24 Ultra 512GB': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=80',
  'Google Pixel 8 Pro 256GB': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop&q=80',
  'OnePlus 12 256GB': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&q=80',
  'Xiaomi 14 Ultra 512GB': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=800&fit=crop&q=80',
  
  // Laptops - Imágenes reales de laptops
  'MacBook Pro M3 14" 512GB': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=800&fit=crop&q=80',
  'Dell XPS 15 9520 i7 32GB': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1200&h=800&fit=crop&q=80',
  'ASUS ROG Strix G15 Gaming': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=800&fit=crop&q=80',
  'HP Spectre x360 16" 2-in-1': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1200&h=800&fit=crop&q=80',
  'Lenovo ThinkPad X1 Carbon Gen 11': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=800&fit=crop&q=80',
  
  // Audio - Imágenes reales de auriculares
  'Sony WH-1000XM5 Auriculares': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&h=800&fit=crop&q=80',
  'AirPods Pro 2da Generación': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=800&fit=crop&q=80',
  'Bose QuietComfort 45': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&h=800&fit=crop&q=80',
  'Sennheiser HD 660S': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=800&fit=crop&q=80',
  'Audio-Technica ATH-M50xBT2': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&h=800&fit=crop&q=80',
  
  // Cameras - Imágenes reales de cámaras
  'Canon EOS R5 Cámara Mirrorless': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  'Sony A7 IV Full Frame': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  'Nikon Z6 III Mirrorless': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  'Fujifilm X-T5 Mirrorless': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  'Panasonic Lumix GH6': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop&q=80',
  
  // Gaming - Imágenes reales de consolas
  'PlayStation 5 Console': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  'Xbox Series X Console': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  'Nintendo Switch OLED': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  'Steam Deck 512GB': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  'ASUS ROG Ally Gaming Handheld': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&q=80',
  
  // Wearables - Imágenes reales de smartwatches
  'Apple Watch Series 9 GPS': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  'Samsung Galaxy Watch 6 Classic': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  'Garmin Fenix 7X Solar': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  'Fitbit Versa 4 Fitness Smartwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  'Amazfit GTR 4 Smartwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop&q=80',
  
  // Chargers - Imágenes reales de cargadores
  'Anker PowerCore 26800 PowerBank': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Apple MagSafe Charger': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Samsung 25W Super Fast Charger': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Belkin Boost Charge Pro 3-in-1': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'RAVPower 65W GaN Charger': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  
  // Cables - Imágenes reales de cables
  'Anker PowerLine III USB-C Cable': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Apple Lightning to USB-C Cable': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'UGREEN USB-C to HDMI Cable': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Anker PowerLine III Lightning Cable': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Cable Matters USB-C Hub': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  
  // Gadgets - Imágenes reales de gadgets
  'Apple AirTag 4-Pack': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Tile Pro Bluetooth Tracker': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Ring Video Doorbell Pro 2': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Nest Hub 2nd Gen': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  'Amazon Echo Dot 5th Gen': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=1200&h=800&fit=crop&q=80',
  
  // Computer Parts - Imágenes reales de componentes
  'ASUS ROG Strix B550-F Gaming': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'MSI MAG B550 Tomahawk': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Gigabyte X570 AORUS Elite': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'ASRock B450M Pro4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'MSI MPG Z690 Edge WiFi': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Monitors - Imágenes reales de monitores
  'Samsung Odyssey G7 27" 1440p': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  'LG UltraGear 24" 1080p': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  'ASUS ROG Swift PG32UQX 32" 4K': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  'Dell UltraSharp U2720Q 27" 4K': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  'BenQ EX2780Q 27" 1440p': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=800&fit=crop&q=80',
  
  // Storage - Imágenes reales de almacenamiento
  'Samsung 980 PRO 1TB NVMe': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'WD Blue SN570 500GB NVMe': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Crucial MX4 1TB SATA SSD': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Seagate BarraCuda 2TB HDD': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'SanDisk Extreme Pro 1TB': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Graphics Cards - Imágenes reales de tarjetas gráficas
  'NVIDIA GeForce RTX 4070': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'AMD Radeon RX 6700 XT': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'NVIDIA GeForce RTX 4090': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'AMD Radeon RX 7800 XT': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'NVIDIA GeForce RTX 3060 Ti': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Processors - Imágenes reales de procesadores
  'AMD Ryzen 7 7700X': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Intel Core i5-13400F': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'AMD Ryzen 9 7950X': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Intel Core i7-13700K': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'AMD Ryzen 5 7600X': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Memory - Imágenes reales de memoria RAM
  'Corsair Vengeance LPX 32GB DDR4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'G.Skill Trident Z RGB 16GB DDR4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Corsair Dominator Platinum 64GB DDR5': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Kingston Fury Beast 32GB DDR5': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'TeamGroup T-Force Delta RGB 16GB DDR4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Power Supplies - Imágenes reales de fuentes de poder
  'Corsair RM850x 850W 80+ Gold': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'EVGA SuperNOVA 650W 80+ Gold': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Seasonic Focus GX-750 750W': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Thermaltake Toughpower GF1 1000W': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Cooler Master V750 Gold V2': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  
  // Cooling - Imágenes reales de refrigeración
  'Noctua NH-D15 Chromax Black': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Corsair H100i RGB Elite': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Cooler Master Hyper 212 RGB': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'Arctic Liquid Freezer II 280': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
  'be quiet! Dark Rock Pro 4': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80'
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

async function updateWithRealImages() {
  try {
    console.log('🔄 Actualizando productos con imágenes reales de alta calidad...')
    
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    })
    
    console.log(`📦 Encontrados ${products.length} productos`)
    
    let updatedCount = 0
    let errorCount = 0
    
    for (const product of products) {
      console.log(`\n🔄 Procesando: ${product.title}`)
      
      // Buscar imagen real para este producto
      const realImageUrl = realProductImages[product.title]
      
      if (realImageUrl) {
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
          
          console.log(`  📥 Descargando imagen real de alta calidad: ${realImageUrl}`)
          
          // Descargar imagen
          await downloadImage(realImageUrl, filePath)
          
          // Actualizar la ruta en la base de datos
          const newPath = `/uploads/products/product_${product.id}/${filename}`
          await prisma.productImage.update({
            where: { id: product.images[0].id },
            data: { path: newPath }
          })
          
          console.log(`  ✅ Imagen real descargada: ${newPath}`)
          updatedCount++
          
        } catch (error) {
          console.error(`  ❌ Error descargando imagen real: ${error.message}`)
          errorCount++
        }
      } else {
        console.log(`  ⚠️ No se encontró imagen real para: ${product.title}`)
      }
    }
    
    console.log(`\n🎉 Actualización completada!`)
    console.log(`✅ Imágenes reales descargadas: ${updatedCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateWithRealImages()
