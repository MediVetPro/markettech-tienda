const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed completo con imágenes reales...')
  
  try {
    // Limpiar productos existentes
    console.log('🧹 Limpiando productos existentes...')
    await prisma.productImage.deleteMany({})
    await prisma.product.deleteMany({})
    
    // Crear directorio de uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log('📁 Directorio de uploads creado')
    }
    
    // Crear archivo placeholder.jpg
    const placeholderPath = path.join(process.cwd(), 'public', 'placeholder.jpg')
    if (!fs.existsSync(placeholderPath)) {
      const placeholderContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
      fs.writeFileSync(placeholderPath, placeholderContent)
      console.log('🖼️ Imagen placeholder.jpg creada')
    }
    
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
          { path: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop', filename: 'iphone15_frontal.jpg', alt: 'iPhone 15 Pro Max frontal' },
          { path: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop', filename: 'iphone15_trasera.jpg', alt: 'iPhone 15 Pro Max trasera' }
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
          { path: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop', filename: 'macbook_pro_16.jpg', alt: 'MacBook Pro 16 pulgadas' }
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
          { path: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop', filename: 'galaxy_s24_ultra.jpg', alt: 'Samsung Galaxy S24 Ultra' }
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
          { path: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop', filename: 'ipad_pro_12_9.jpg', alt: 'iPad Pro 12.9 pulgadas' }
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
          { path: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop', filename: 'airpods_pro_2.jpg', alt: 'AirPods Pro 2da generación' }
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
          { path: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop', filename: 'sony_wh1000xm5.jpg', alt: 'Sony WH-1000XM5' }
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
          { path: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', filename: 'dell_xps_13_plus.jpg', alt: 'Dell XPS 13 Plus' }
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
          { path: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop', filename: 'galaxy_tab_s9_ultra.jpg', alt: 'Samsung Galaxy Tab S9 Ultra' }
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
          { path: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop', filename: 'apple_watch_series_9.jpg', alt: 'Apple Watch Series 9' }
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
          { path: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', filename: 'macbook_air_m2.jpg', alt: 'MacBook Air M2' }
        ]
      }
    ]
    
    console.log(`📦 Creando ${products.length} productos con imágenes reales...`)
    
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
    
    console.log('\n🎉 ¡Seed completo exitoso!')
    console.log(`📊 Resumen:`)
    console.log(`- Productos creados: ${products.length}`)
    console.log(`- Imágenes: URLs de Unsplash (800x600)`)
    console.log(`- Categorías: smartphones, laptops, tablets, audio, smartwatch`)
    console.log(`- Estructura: public/uploads/products/`)
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar seed
main()
