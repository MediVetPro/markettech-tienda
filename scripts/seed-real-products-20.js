const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de 20 productos reales...')
  
  try {
    // Limpiar productos existentes (opcional)
    console.log('🧹 Limpiando productos existentes...')
    await prisma.productImage.deleteMany({})
    await prisma.product.deleteMany({})
    
    // Crear directorio de uploads si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log('📁 Directorio de uploads creado')
    }
    
    const products = [
      {
        title: 'iPhone 15 Pro Max 256GB Titanio Natural',
        description: 'El iPhone más avanzado con chip A17 Pro, pantalla Super Retina XDR de 6.7 pulgadas, cámara principal de 48MP y diseño premium en titanio. Perfecto para fotografía profesional y gaming intensivo.',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla 6.7" Super Retina XDR, Chip A17 Pro, 256GB almacenamiento, iOS 17, Cámara principal 48MP, Cámara ultra gran angular 12MP, Cámara teleobjetivo 12MP, Resistencia al agua IP68, Titanio natural',
        categories: 'smartphones,apple,premium',
        stock: 5,
        status: 'ACTIVE',
        images: [
          { filename: 'iphone15_frontal.jpg', alt: 'iPhone 15 Pro Max frontal' },
          { filename: 'iphone15_trasera.jpg', alt: 'iPhone 15 Pro Max trasera' },
          { filename: 'iphone15_lateral.jpg', alt: 'iPhone 15 Pro Max lateral' }
        ]
      },
      {
        title: 'MacBook Pro 16" M3 Max 1TB',
        description: 'Laptop profesional de máxima potencia con chip M3 Max, pantalla Liquid Retina XDR de 16.2 pulgadas, 36GB RAM unificada y 1TB SSD. Ideal para desarrollo, diseño y edición de video.',
        price: 3499.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M3 Max, 36GB RAM unificada, 1TB SSD, Pantalla 16.2" Liquid Retina XDR, Hasta 22h batería, macOS Sonoma, 8 núcleos CPU, 30 núcleos GPU',
        categories: 'laptops,apple,profesional',
        stock: 2,
        status: 'ACTIVE',
        images: [
          { filename: 'macbook_pro_16.jpg', alt: 'MacBook Pro 16 pulgadas' },
          { filename: 'macbook_pro_teclado.jpg', alt: 'Teclado MacBook Pro' }
        ]
      },
      {
        title: 'Samsung Galaxy S24 Ultra 512GB',
        description: 'Smartphone Android de gama alta con pantalla Dynamic AMOLED 2X de 6.8 pulgadas, cámara de 200MP, S Pen incluido y procesador Snapdragon 8 Gen 3. Perfecto para productividad y creatividad.',
        price: 1199.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla 6.8" Dynamic AMOLED 2X, Snapdragon 8 Gen 3, 512GB almacenamiento, 12GB RAM, Cámara 200MP, S Pen incluido, Android 14, Resistencia al agua IP68',
        categories: 'smartphones,samsung,android',
        stock: 8,
        status: 'ACTIVE',
        images: [
          { filename: 'galaxy_s24_ultra.jpg', alt: 'Samsung Galaxy S24 Ultra' },
          { filename: 'galaxy_s24_s_pen.jpg', alt: 'S Pen del Galaxy S24' }
        ]
      },
      {
        title: 'iPad Pro 12.9" M2 256GB',
        description: 'Tablet profesional con chip M2, pantalla Liquid Retina XDR de 12.9 pulgadas, compatibilidad con Apple Pencil y Magic Keyboard. Ideal para diseño, ilustración y productividad móvil.',
        price: 1099.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M2, Pantalla 12.9" Liquid Retina XDR, 256GB almacenamiento, 8GB RAM, Compatible con Apple Pencil, Magic Keyboard, iPadOS 16, Hasta 10h batería',
        categories: 'tablets,apple,profesional',
        stock: 6,
        status: 'ACTIVE',
        images: [
          { filename: 'ipad_pro_12_9.jpg', alt: 'iPad Pro 12.9 pulgadas' },
          { filename: 'ipad_pro_apple_pencil.jpg', alt: 'iPad Pro con Apple Pencil' }
        ]
      },
      {
        title: 'AirPods Pro 2da Generación',
        description: 'Auriculares inalámbricos con cancelación activa de ruido, audio espacial y chip H2. Incluyen estuche de carga MagSafe y hasta 6 horas de reproducción.',
        price: 249.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Cancelación activa de ruido, Audio espacial, Chip H2, Hasta 6h batería, Estuche de carga MagSafe, Resistencia al agua IPX4, Control táctil',
        categories: 'audio,apple,inalambrico',
        stock: 15,
        status: 'ACTIVE',
        images: [
          { filename: 'airpods_pro_2.jpg', alt: 'AirPods Pro 2da generación' },
          { filename: 'airpods_pro_estuche.jpg', alt: 'Estuche de AirPods Pro' }
        ]
      },
      {
        title: 'Sony WH-1000XM5 Auriculares',
        description: 'Auriculares over-ear con cancelación de ruido líder en la industria, audio de alta resolución y hasta 30 horas de batería. Perfectos para viajes y trabajo.',
        price: 399.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Cancelación de ruido líder, Audio de alta resolución, Hasta 30h batería, Carga rápida, Control táctil, Micrófono con cancelación de ruido',
        categories: 'audio,sony,profesional',
        stock: 12,
        status: 'ACTIVE',
        images: [
          { filename: 'sony_wh1000xm5.jpg', alt: 'Sony WH-1000XM5' },
          { filename: 'sony_wh1000xm5_detalle.jpg', alt: 'Detalle de los auriculares Sony' }
        ]
      },
      {
        title: 'Dell XPS 13 Plus 512GB',
        description: 'Laptop ultrabook premium con procesador Intel Core i7, pantalla 13.4" OLED 3.5K, diseño minimalista y construcción de aluminio. Ideal para profesionales y estudiantes.',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Intel Core i7-1360P, 16GB RAM, 512GB SSD, Pantalla 13.4" OLED 3.5K, Windows 11, Hasta 12h batería, Construcción de aluminio',
        categories: 'laptops,dell,ultrabook',
        stock: 7,
        status: 'ACTIVE',
        images: [
          { filename: 'dell_xps_13_plus.jpg', alt: 'Dell XPS 13 Plus' },
          { filename: 'dell_xps_13_teclado.jpg', alt: 'Teclado del Dell XPS 13' }
        ]
      },
      {
        title: 'Samsung Galaxy Tab S9 Ultra 14.6"',
        description: 'Tablet Android de gran formato con pantalla de 14.6 pulgadas, S Pen incluido y procesador Snapdragon 8 Gen 2. Perfecta para productividad y entretenimiento.',
        price: 899.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla 14.6" Super AMOLED, Snapdragon 8 Gen 2, 256GB almacenamiento, 12GB RAM, S Pen incluido, Android 13, Hasta 14h batería',
        categories: 'tablets,samsung,android',
        stock: 4,
        status: 'ACTIVE',
        images: [
          { filename: 'galaxy_tab_s9_ultra.jpg', alt: 'Samsung Galaxy Tab S9 Ultra' },
          { filename: 'galaxy_tab_s9_s_pen.jpg', alt: 'S Pen del Galaxy Tab S9' }
        ]
      },
      {
        title: 'Apple Watch Series 9 GPS 45mm',
        description: 'Smartwatch con chip S9, pantalla Always-On Retina, seguimiento de salud avanzado y resistencia al agua hasta 50 metros. Perfecto para fitness y productividad.',
        price: 429.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip S9, Pantalla Always-On Retina, GPS, Resistencia al agua 50m, Seguimiento de salud, watchOS 10, Hasta 18h batería, Carga rápida',
        categories: 'smartwatch,apple,fitness',
        stock: 20,
        status: 'ACTIVE',
        images: [
          { filename: 'apple_watch_series_9.jpg', alt: 'Apple Watch Series 9' },
          { filename: 'apple_watch_series_9_band.jpg', alt: 'Correa del Apple Watch' }
        ]
      },
      {
        title: 'MacBook Air M2 13" 256GB',
        description: 'Laptop ultraportátil con chip M2, pantalla Liquid Retina de 13.6 pulgadas, diseño delgado y hasta 18 horas de batería. Perfecta para estudiantes y profesionales móviles.',
        price: 1199.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M2, Pantalla 13.6" Liquid Retina, 256GB SSD, 8GB RAM, Hasta 18h batería, macOS Sonoma, Diseño delgado, Sin ventilador',
        categories: 'laptops,apple,ultraportatil',
        stock: 10,
        status: 'ACTIVE',
        images: [
          { filename: 'macbook_air_m2.jpg', alt: 'MacBook Air M2' },
          { filename: 'macbook_air_m2_abierto.jpg', alt: 'MacBook Air M2 abierto' }
        ]
      },
      {
        title: 'Sony PlayStation 5 Digital',
        description: 'Consola de videojuegos de nueva generación con SSD ultra rápido, ray tracing y audio 3D. Incluye control DualSense con retroalimentación háptica.',
        price: 399.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'AMD Zen 2, GPU AMD RDNA 2, SSD 825GB, Ray tracing, Audio 3D, Control DualSense, 4K hasta 120fps, Compatible con PS4',
        categories: 'gaming,sony,consola',
        stock: 3,
        status: 'ACTIVE',
        images: [
          { filename: 'ps5_digital.jpg', alt: 'PlayStation 5 Digital' },
          { filename: 'ps5_dualsense.jpg', alt: 'Control DualSense' }
        ]
      },
      {
        title: 'Nintendo Switch OLED 64GB',
        description: 'Consola híbrida con pantalla OLED de 7 pulgadas, 64GB de almacenamiento y controles Joy-Con. Perfecta para gaming en casa y en movimiento.',
        price: 349.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla OLED 7", 64GB almacenamiento, Controles Joy-Con, Modo portátil y TV, Hasta 9h batería, Compatible con juegos físicos y digitales',
        categories: 'gaming,nintendo,portatil',
        stock: 8,
        status: 'ACTIVE',
        images: [
          { filename: 'nintendo_switch_oled.jpg', alt: 'Nintendo Switch OLED' },
          { filename: 'nintendo_switch_joycon.jpg', alt: 'Controles Joy-Con' }
        ]
      },
      {
        title: 'Samsung Galaxy Buds2 Pro',
        description: 'Auriculares inalámbricos con cancelación de ruido inteligente, audio de alta resolución y hasta 5 horas de reproducción. Incluyen estuche de carga.',
        price: 229.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Cancelación de ruido inteligente, Audio de alta resolución, Hasta 5h batería, Estuche de carga, Resistencia al agua IPX7, Control táctil',
        categories: 'audio,samsung,inalambrico',
        stock: 18,
        status: 'ACTIVE',
        images: [
          { filename: 'galaxy_buds2_pro.jpg', alt: 'Samsung Galaxy Buds2 Pro' },
          { filename: 'galaxy_buds2_pro_estuche.jpg', alt: 'Estuche de Galaxy Buds2 Pro' }
        ]
      },
      {
        title: 'iPad Air 5ta Generación 256GB',
        description: 'Tablet con chip M1, pantalla Liquid Retina de 10.9 pulgadas, compatible con Apple Pencil y Magic Keyboard. Ideal para productividad y creatividad.',
        price: 599.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M1, Pantalla 10.9" Liquid Retina, 256GB almacenamiento, Compatible con Apple Pencil, Magic Keyboard, iPadOS 16, Hasta 10h batería',
        categories: 'tablets,apple,productividad',
        stock: 12,
        status: 'ACTIVE',
        images: [
          { filename: 'ipad_air_5.jpg', alt: 'iPad Air 5ta generación' },
          { filename: 'ipad_air_5_apple_pencil.jpg', alt: 'iPad Air con Apple Pencil' }
        ]
      },
      {
        title: 'Microsoft Surface Laptop 5 13.5"',
        description: 'Laptop premium con pantalla táctil PixelSense de 13.5 pulgadas, procesador Intel Core i7 y diseño elegante. Perfecta para profesionales y creativos.',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Intel Core i7-1255U, 16GB RAM, 512GB SSD, Pantalla táctil 13.5" PixelSense, Windows 11, Hasta 18h batería, Diseño premium',
        categories: 'laptops,microsoft,premium',
        stock: 6,
        status: 'ACTIVE',
        images: [
          { filename: 'surface_laptop_5.jpg', alt: 'Microsoft Surface Laptop 5' },
          { filename: 'surface_laptop_5_abierto.jpg', alt: 'Surface Laptop 5 abierto' }
        ]
      },
      {
        title: 'Google Pixel 8 Pro 256GB',
        description: 'Smartphone Android con cámara de 50MP, pantalla OLED de 6.7 pulgadas y procesador Google Tensor G3. Incluye funciones de IA avanzadas.',
        price: 999.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Google Tensor G3, Pantalla 6.7" OLED, 256GB almacenamiento, 12GB RAM, Cámara 50MP, Android 14, Hasta 24h batería, Carga rápida',
        categories: 'smartphones,google,android',
        stock: 9,
        status: 'ACTIVE',
        images: [
          { filename: 'pixel_8_pro.jpg', alt: 'Google Pixel 8 Pro' },
          { filename: 'pixel_8_pro_camara.jpg', alt: 'Cámara del Pixel 8 Pro' }
        ]
      },
      {
        title: 'Sony WF-1000XM4 Auriculares',
        description: 'Auriculares in-ear con cancelación de ruido líder, audio de alta resolución y hasta 8 horas de batería. Incluyen estuche de carga.',
        price: 279.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Cancelación de ruido líder, Audio de alta resolución, Hasta 8h batería, Estuche de carga, Control táctil, Micrófono integrado',
        categories: 'audio,sony,inalambrico',
        stock: 14,
        status: 'ACTIVE',
        images: [
          { filename: 'sony_wf1000xm4.jpg', alt: 'Sony WF-1000XM4' },
          { filename: 'sony_wf1000xm4_estuche.jpg', alt: 'Estuche de Sony WF-1000XM4' }
        ]
      },
      {
        title: 'iPad mini 6ta Generación 256GB',
        description: 'Tablet compacta con chip A15 Bionic, pantalla Liquid Retina de 8.3 pulgadas y compatible con Apple Pencil. Perfecta para lectura y productividad móvil.',
        price: 649.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip A15 Bionic, Pantalla 8.3" Liquid Retina, 256GB almacenamiento, Compatible con Apple Pencil, iPadOS 16, Hasta 10h batería',
        categories: 'tablets,apple,compacta',
        stock: 11,
        status: 'ACTIVE',
        images: [
          { filename: 'ipad_mini_6.jpg', alt: 'iPad mini 6ta generación' },
          { filename: 'ipad_mini_6_apple_pencil.jpg', alt: 'iPad mini con Apple Pencil' }
        ]
      },
      {
        title: 'Samsung Galaxy Z Fold5 512GB',
        description: 'Smartphone plegable con pantalla interior de 7.6 pulgadas, pantalla exterior de 6.2 pulgadas y procesador Snapdragon 8 Gen 2. Perfecto para productividad.',
        price: 1799.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla interior 7.6" Dynamic AMOLED, Pantalla exterior 6.2", Snapdragon 8 Gen 2, 512GB almacenamiento, 12GB RAM, Android 13, Resistencia al agua IPX8',
        categories: 'smartphones,samsung,plegable',
        stock: 2,
        status: 'ACTIVE',
        images: [
          { filename: 'galaxy_z_fold5.jpg', alt: 'Samsung Galaxy Z Fold5' },
          { filename: 'galaxy_z_fold5_abierto.jpg', alt: 'Galaxy Z Fold5 abierto' }
        ]
      }
    ]
    
    console.log(`📦 Creando ${products.length} productos...`)
    
    // Crear productos en la base de datos
    for (let i = 0; i < products.length; i++) {
      const productData = products[i]
      const { images, ...productInfo } = productData
      
      // Crear directorio del producto
      const productDir = path.join(uploadsDir, `product_${i + 1}`)
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true })
      }
      
      // Crear archivos de imagen placeholder
      const imageData = images.map((img, index) => ({
        path: `/uploads/products/product_${i + 1}/${img.filename}`,
        filename: img.filename,
        alt: img.alt,
        order: index
      }))
      
      // Crear producto en la base de datos
      const product = await prisma.product.create({
        data: {
          ...productInfo,
          images: {
            create: imageData
          }
        }
      })
      
      console.log(`✅ Producto ${i + 1}/${products.length} creado: ${product.title}`)
    }
    
    console.log('\n🎉 ¡Seed completado exitosamente!')
    console.log(`📊 Resumen:`)
    console.log(`- Productos creados: ${products.length}`)
    console.log(`- Categorías incluidas: smartphones, laptops, tablets, audio, gaming, smartwatch`)
    console.log(`- Imágenes organizadas en: public/uploads/products/`)
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar seed
main()
