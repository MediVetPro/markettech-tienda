const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de 20 productos reales...')
  
  try {
    // Limpiar productos existentes (opcional)
    console.log('🧹 Limpiando productos existentes...')
    await prisma.productImage.deleteMany({})
    await prisma.product.deleteMany({})
    
    const products = [
      {
        title: 'iPhone 15 Pro Max 256GB Titanio Natural',
        description: 'El iPhone más avanzado con chip A17 Pro, pantalla Super Retina XDR de 6.7 pulgadas, cámara principal de 48MP y diseño premium en titanio.',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla 6.7" Super Retina XDR, Chip A17 Pro, 256GB almacenamiento, iOS 17, Cámara principal 48MP, Titanio natural',
        categories: 'smartphones,apple,premium',
        stock: 5,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_1/iphone15_frontal.jpg', filename: 'iphone15_frontal.jpg', alt: 'iPhone 15 Pro Max frontal' },
          { path: '/uploads/products/product_1/iphone15_trasera.jpg', filename: 'iphone15_trasera.jpg', alt: 'iPhone 15 Pro Max trasera' }
        ]
      },
      {
        title: 'MacBook Pro 16" M3 Max 1TB',
        description: 'Laptop profesional de máxima potencia con chip M3 Max, pantalla Liquid Retina XDR de 16.2 pulgadas, 36GB RAM unificada y 1TB SSD.',
        price: 3499.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M3 Max, 36GB RAM unificada, 1TB SSD, Pantalla 16.2" Liquid Retina XDR, Hasta 22h batería, macOS Sonoma',
        categories: 'laptops,apple,profesional',
        stock: 2,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_2/macbook_pro_16.jpg', filename: 'macbook_pro_16.jpg', alt: 'MacBook Pro 16 pulgadas' }
        ]
      },
      {
        title: 'Samsung Galaxy S24 Ultra 512GB',
        description: 'Smartphone Android de gama alta con pantalla Dynamic AMOLED 2X de 6.8 pulgadas, cámara de 200MP, S Pen incluido y procesador Snapdragon 8 Gen 3.',
        price: 1199.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla 6.8" Dynamic AMOLED 2X, Snapdragon 8 Gen 3, 512GB almacenamiento, 12GB RAM, Cámara 200MP, S Pen incluido',
        categories: 'smartphones,samsung,android',
        stock: 8,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_3/galaxy_s24_ultra.jpg', filename: 'galaxy_s24_ultra.jpg', alt: 'Samsung Galaxy S24 Ultra' }
        ]
      },
      {
        title: 'iPad Pro 12.9" M2 256GB',
        description: 'Tablet profesional con chip M2, pantalla Liquid Retina XDR de 12.9 pulgadas, compatibilidad con Apple Pencil y Magic Keyboard.',
        price: 1099.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M2, Pantalla 12.9" Liquid Retina XDR, 256GB almacenamiento, 8GB RAM, Compatible con Apple Pencil, Magic Keyboard',
        categories: 'tablets,apple,profesional',
        stock: 6,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_4/ipad_pro_12_9.jpg', filename: 'ipad_pro_12_9.jpg', alt: 'iPad Pro 12.9 pulgadas' }
        ]
      },
      {
        title: 'AirPods Pro 2da Generación',
        description: 'Auriculares inalámbricos con cancelación activa de ruido, audio espacial y chip H2. Incluyen estuche de carga MagSafe.',
        price: 249.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Cancelación activa de ruido, Audio espacial, Chip H2, Hasta 6h batería, Estuche de carga MagSafe, Resistencia al agua IPX4',
        categories: 'audio,apple,inalambrico',
        stock: 15,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_5/airpods_pro_2.jpg', filename: 'airpods_pro_2.jpg', alt: 'AirPods Pro 2da generación' }
        ]
      },
      {
        title: 'Sony WH-1000XM5 Auriculares',
        description: 'Auriculares over-ear con cancelación de ruido líder en la industria, audio de alta resolución y hasta 30 horas de batería.',
        price: 399.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Cancelación de ruido líder, Audio de alta resolución, Hasta 30h batería, Carga rápida, Control táctil',
        categories: 'audio,sony,profesional',
        stock: 12,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_6/sony_wh1000xm5.jpg', filename: 'sony_wh1000xm5.jpg', alt: 'Sony WH-1000XM5' }
        ]
      },
      {
        title: 'Dell XPS 13 Plus 512GB',
        description: 'Laptop ultrabook premium con procesador Intel Core i7, pantalla 13.4" OLED 3.5K, diseño minimalista y construcción de aluminio.',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Intel Core i7-1360P, 16GB RAM, 512GB SSD, Pantalla 13.4" OLED 3.5K, Windows 11, Hasta 12h batería',
        categories: 'laptops,dell,ultrabook',
        stock: 7,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_7/dell_xps_13_plus.jpg', filename: 'dell_xps_13_plus.jpg', alt: 'Dell XPS 13 Plus' }
        ]
      },
      {
        title: 'Samsung Galaxy Tab S9 Ultra 14.6"',
        description: 'Tablet Android de gran formato con pantalla de 14.6 pulgadas, S Pen incluido y procesador Snapdragon 8 Gen 2.',
        price: 899.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla 14.6" Super AMOLED, Snapdragon 8 Gen 2, 256GB almacenamiento, 12GB RAM, S Pen incluido, Android 13',
        categories: 'tablets,samsung,android',
        stock: 4,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_8/galaxy_tab_s9_ultra.jpg', filename: 'galaxy_tab_s9_ultra.jpg', alt: 'Samsung Galaxy Tab S9 Ultra' }
        ]
      },
      {
        title: 'Apple Watch Series 9 GPS 45mm',
        description: 'Smartwatch con chip S9, pantalla Always-On Retina, seguimiento de salud avanzado y resistencia al agua hasta 50 metros.',
        price: 429.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip S9, Pantalla Always-On Retina, GPS, Resistencia al agua 50m, Seguimiento de salud, watchOS 10, Hasta 18h batería',
        categories: 'smartwatch,apple,fitness',
        stock: 20,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_9/apple_watch_series_9.jpg', filename: 'apple_watch_series_9.jpg', alt: 'Apple Watch Series 9' }
        ]
      },
      {
        title: 'MacBook Air M2 13" 256GB',
        description: 'Laptop ultraportátil con chip M2, pantalla Liquid Retina de 13.6 pulgadas, diseño delgado y hasta 18 horas de batería.',
        price: 1199.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M2, Pantalla 13.6" Liquid Retina, 256GB SSD, 8GB RAM, Hasta 18h batería, macOS Sonoma, Diseño delgado',
        categories: 'laptops,apple,ultraportatil',
        stock: 10,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_10/macbook_air_m2.jpg', filename: 'macbook_air_m2.jpg', alt: 'MacBook Air M2' }
        ]
      },
      {
        title: 'Sony PlayStation 5 Digital',
        description: 'Consola de videojuegos de nueva generación con SSD ultra rápido, ray tracing y audio 3D. Incluye control DualSense.',
        price: 399.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'AMD Zen 2, GPU AMD RDNA 2, SSD 825GB, Ray tracing, Audio 3D, Control DualSense, 4K hasta 120fps',
        categories: 'gaming,sony,consola',
        stock: 3,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_11/ps5_digital.jpg', filename: 'ps5_digital.jpg', alt: 'PlayStation 5 Digital' }
        ]
      },
      {
        title: 'Nintendo Switch OLED 64GB',
        description: 'Consola híbrida con pantalla OLED de 7 pulgadas, 64GB de almacenamiento y controles Joy-Con.',
        price: 349.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla OLED 7", 64GB almacenamiento, Controles Joy-Con, Modo portátil y TV, Hasta 9h batería',
        categories: 'gaming,nintendo,portatil',
        stock: 8,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_12/nintendo_switch_oled.jpg', filename: 'nintendo_switch_oled.jpg', alt: 'Nintendo Switch OLED' }
        ]
      },
      {
        title: 'Samsung Galaxy Buds2 Pro',
        description: 'Auriculares inalámbricos con cancelación de ruido inteligente, audio de alta resolución y hasta 5 horas de reproducción.',
        price: 229.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Cancelación de ruido inteligente, Audio de alta resolución, Hasta 5h batería, Estuche de carga, Resistencia al agua IPX7',
        categories: 'audio,samsung,inalambrico',
        stock: 18,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_13/galaxy_buds2_pro.jpg', filename: 'galaxy_buds2_pro.jpg', alt: 'Samsung Galaxy Buds2 Pro' }
        ]
      },
      {
        title: 'iPad Air 5ta Generación 256GB',
        description: 'Tablet con chip M1, pantalla Liquid Retina de 10.9 pulgadas, compatible con Apple Pencil y Magic Keyboard.',
        price: 599.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M1, Pantalla 10.9" Liquid Retina, 256GB almacenamiento, Compatible con Apple Pencil, Magic Keyboard, iPadOS 16',
        categories: 'tablets,apple,productividad',
        stock: 12,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_14/ipad_air_5.jpg', filename: 'ipad_air_5.jpg', alt: 'iPad Air 5ta generación' }
        ]
      },
      {
        title: 'Microsoft Surface Laptop 5 13.5"',
        description: 'Laptop premium con pantalla táctil PixelSense de 13.5 pulgadas, procesador Intel Core i7 y diseño elegante.',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Intel Core i7-1255U, 16GB RAM, 512GB SSD, Pantalla táctil 13.5" PixelSense, Windows 11, Hasta 18h batería',
        categories: 'laptops,microsoft,premium',
        stock: 6,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_15/surface_laptop_5.jpg', filename: 'surface_laptop_5.jpg', alt: 'Microsoft Surface Laptop 5' }
        ]
      },
      {
        title: 'Google Pixel 8 Pro 256GB',
        description: 'Smartphone Android con cámara de 50MP, pantalla OLED de 6.7 pulgadas y procesador Google Tensor G3.',
        price: 999.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Google Tensor G3, Pantalla 6.7" OLED, 256GB almacenamiento, 12GB RAM, Cámara 50MP, Android 14, Hasta 24h batería',
        categories: 'smartphones,google,android',
        stock: 9,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_16/pixel_8_pro.jpg', filename: 'pixel_8_pro.jpg', alt: 'Google Pixel 8 Pro' }
        ]
      },
      {
        title: 'Sony WF-1000XM4 Auriculares',
        description: 'Auriculares in-ear con cancelación de ruido líder, audio de alta resolución y hasta 8 horas de batería.',
        price: 279.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Cancelación de ruido líder, Audio de alta resolución, Hasta 8h batería, Estuche de carga, Control táctil',
        categories: 'audio,sony,inalambrico',
        stock: 14,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_17/sony_wf1000xm4.jpg', filename: 'sony_wf1000xm4.jpg', alt: 'Sony WF-1000XM4' }
        ]
      },
      {
        title: 'iPad mini 6ta Generación 256GB',
        description: 'Tablet compacta con chip A15 Bionic, pantalla Liquid Retina de 8.3 pulgadas y compatible con Apple Pencil.',
        price: 649.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip A15 Bionic, Pantalla 8.3" Liquid Retina, 256GB almacenamiento, Compatible con Apple Pencil, iPadOS 16, Hasta 10h batería',
        categories: 'tablets,apple,compacta',
        stock: 11,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_18/ipad_mini_6.jpg', filename: 'ipad_mini_6.jpg', alt: 'iPad mini 6ta generación' }
        ]
      },
      {
        title: 'Samsung Galaxy Z Fold5 512GB',
        description: 'Smartphone plegable con pantalla interior de 7.6 pulgadas, pantalla exterior de 6.2 pulgadas y procesador Snapdragon 8 Gen 2.',
        price: 1799.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla interior 7.6" Dynamic AMOLED, Pantalla exterior 6.2", Snapdragon 8 Gen 2, 512GB almacenamiento, 12GB RAM',
        categories: 'smartphones,samsung,plegable',
        stock: 2,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_19/galaxy_z_fold5.jpg', filename: 'galaxy_z_fold5.jpg', alt: 'Samsung Galaxy Z Fold5' }
        ]
      },
      {
        title: 'MacBook Pro 14" M3 512GB',
        description: 'Laptop profesional con chip M3, pantalla Liquid Retina XDR de 14.2 pulgadas, 8GB RAM unificada y 512GB SSD.',
        price: 1999.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M3, 8GB RAM unificada, 512GB SSD, Pantalla 14.2" Liquid Retina XDR, Hasta 18h batería, macOS Sonoma',
        categories: 'laptops,apple,profesional',
        stock: 7,
        status: 'ACTIVE',
        images: [
          { path: '/uploads/products/product_20/macbook_pro_14_m3.jpg', filename: 'macbook_pro_14_m3.jpg', alt: 'MacBook Pro 14" M3' }
        ]
      }
    ]
    
    console.log(`📦 Creando ${products.length} productos...`)
    
    // Crear productos en la base de datos
    for (let i = 0; i < products.length; i++) {
      const productData = products[i]
      const { images, ...productInfo } = productData
      
      // Crear producto en la base de datos
      const product = await prisma.product.create({
        data: {
          ...productInfo,
          images: {
            create: images
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
