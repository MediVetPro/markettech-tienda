const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando seeding completo de la base de datos...')

  // Limpiar datos existentes
  console.log('🗑️ Limpiando datos existentes...')
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.productImage.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.siteConfig.deleteMany({})

  // 1. Crear usuarios
  console.log('👥 Creando usuarios...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  const users = [
    {
      name: 'Admin Smartesh',
      email: 'admin@markettech.com',
      phone: '(11) 99999-9999',
      password: hashedPassword,
      role: 'ADMIN',
      cpf: '123.456.789-00',
      birthDate: new Date('1980-01-15'),
      gender: 'masculino',
      address: 'Rua Principal, 100',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
      country: 'Brasil',
      newsletter: true,
    },
    {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 88888-8888',
      password: hashedPassword,
      role: 'CLIENT',
      cpf: '098.765.432-10',
      birthDate: new Date('1992-05-20'),
      gender: 'masculino',
      address: 'Avenida Secundária, 200',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20000-000',
      country: 'Brasil',
      newsletter: false,
    },
    {
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(11) 77777-7777',
      password: hashedPassword,
      role: 'CLIENT',
      cpf: '111.222.333-44',
      birthDate: new Date('1988-11-10'),
      gender: 'feminino',
      address: 'Praça Central, 300',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30000-000',
      country: 'Brasil',
      newsletter: true,
    }
  ]

  for (const user of users) {
    await prisma.user.create({ data: user })
    console.log(`✅ Usuario creado: ${user.name}`)
  }

  // 2. Crear configuración del sitio
  console.log('⚙️ Creando configuración del sitio...')
  
  const siteConfigs = [
    { key: 'site_title', value: 'Smartesh - Tecnología Premium', type: 'text' },
    { key: 'site_description', value: 'Tu tienda de tecnología de confianza con los mejores productos Apple, Samsung, Dell y más.', type: 'text' },
    { key: 'about_title', value: 'Sobre', type: 'text' },
    { key: 'about_content', value: 'Somos una tienda especializada en tecnología premium, ofreciendo los mejores productos de las marcas más reconocidas del mercado. Nuestra misión es brindar tecnología de calidad con el mejor servicio al cliente.', type: 'html' },
    { key: 'contact_title', value: 'Contáctanos', type: 'text' },
    { key: 'contact_content', value: 'Estamos aquí para ayudarte con cualquier consulta sobre nuestros productos. Nuestro equipo de expertos está disponible para brindarte la mejor asesoría.', type: 'html' },
    { key: 'contact_email', value: 'contacto@smartesh.com', type: 'text' },
    { key: 'contact_phone', value: '+55 11 99999-9999', type: 'text' },
    { key: 'contact_address', value: 'Rua da Tecnologia, 123 - São Paulo, SP', type: 'text' },
    { key: 'social_facebook', value: 'https://facebook.com/smartesh', type: 'text' },
    { key: 'social_instagram', value: 'https://instagram.com/smartesh', type: 'text' },
    { key: 'social_twitter', value: 'https://twitter.com/smartesh', type: 'text' }
  ]

  for (const config of siteConfigs) {
    await prisma.siteConfig.create({
      data: config
    })
  }
  console.log('✅ Configuración del sitio creada')

  // 3. Crear productos reales
  console.log('📱 Creando productos reales...')
  const realProducts = [
    {
      title: 'iPhone 15 Pro Max 256GB Titanio Natural',
      description: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP, pantalla Super Retina XDR de 6.7 pulgadas y diseño premium en titanio. Incluye iOS 17, resistencia al agua IP68 y carga inalámbrica MagSafe.',
      price: 1299.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Pantalla 6.7" Super Retina XDR, Chip A17 Pro, 256GB almacenamiento, iOS 17, Cámara principal 48MP, Cámara ultra gran angular 12MP, Cámara teleobjetivo 12MP, Resistencia al agua IP68, Carga inalámbrica MagSafe',
      stock: Math.floor(Math.random() * 15) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'MacBook Air M2 13" 256GB Space Gray',
      description: 'Laptop ultradelgada con chip M2 de Apple, pantalla Liquid Retina de 13.6 pulgadas, 8GB RAM unificada y 256GB SSD. Perfecta para trabajo y estudio con hasta 18 horas de batería.',
      price: 999.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Chip M2, 8GB RAM unificada, 256GB SSD, Pantalla 13.6" Liquid Retina, Hasta 18h batería, macOS Ventura, Cámara FaceTime HD 1080p, Touch ID',
      stock: Math.floor(Math.random() * 12) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'iPad Pro 11" M2 128GB Wi-Fi',
      description: 'Tablet profesional con chip M2, pantalla Liquid Retina de 11 pulgadas, compatibilidad con Apple Pencil 2da generación y Magic Keyboard. Ideal para creativos y profesionales.',
      price: 799.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Chip M2, 128GB almacenamiento, Pantalla 11" Liquid Retina, Compatible con Apple Pencil 2da gen, Magic Keyboard, Face ID, Wi-Fi 6E',
      stock: Math.floor(Math.random() * 10) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'AirPods Pro 2da Generación',
      description: 'Auriculares inalámbricos con cancelación activa de ruido, audio espacial, chip H2 y estuche de carga MagSafe. Hasta 6 horas de audio con cancelación de ruido activada.',
      price: 249.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Cancelación activa de ruido, Audio espacial, Chip H2, Hasta 6h audio, Estuche de carga MagSafe, Resistencia al agua IPX4, Control táctil',
      stock: Math.floor(Math.random() * 20) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Apple Watch Series 9 GPS 45mm',
      description: 'Reloj inteligente con pantalla Always-On, GPS, monitor de frecuencia cardíaca, detección de caídas y llamadas de emergencia. Resistente al agua hasta 50 metros.',
      price: 429.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Pantalla Always-On, GPS, Monitor frecuencia cardíaca, Detección caídas, Resistente agua 50m, Hasta 18h batería, watchOS 10, Aluminio',
      stock: Math.floor(Math.random() * 15) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Samsung Galaxy S24 Ultra 256GB',
      description: 'Smartphone Android premium con pantalla Dynamic AMOLED 2X de 6.8 pulgadas, cámara de 200MP, chip Snapdragon 8 Gen 3 y S Pen incluido. Diseño en titanio.',
      price: 1199.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Pantalla 6.8" Dynamic AMOLED 2X, Cámara 200MP, Snapdragon 8 Gen 3, 256GB, S Pen incluido, Titanio, Android 14, 5000mAh batería',
      stock: Math.floor(Math.random() * 8) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Dell XPS 13 Plus 9320 i7 16GB',
      description: 'Laptop premium con procesador Intel Core i7, 16GB RAM, 512GB SSD, pantalla táctil de 13.4 pulgadas y diseño minimalista. Perfecta para profesionales.',
      price: 1399.99,
      condition: 'USED',
      aestheticCondition: 9,
      specifications: 'Intel Core i7-1260P, 16GB LPDDR5, 512GB SSD, Pantalla 13.4" táctil, Windows 11, Teclado retroiluminado, Cámara 720p',
      stock: Math.floor(Math.random() * 6) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Sony WH-1000XM5 Auriculares',
      description: 'Auriculares over-ear con cancelación de ruido líder en la industria, audio de alta resolución, hasta 30 horas de batería y carga rápida. Sonido excepcional.',
      price: 399.99,
      condition: 'USED',
      aestheticCondition: 9,
      specifications: 'Cancelación ruido líder, Audio alta resolución, 30h batería, Carga rápida, Bluetooth 5.2, Control táctil, Micrófono integrado',
      stock: Math.floor(Math.random() * 12) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'MacBook Pro 14" M3 Pro 512GB',
      description: 'Laptop profesional con chip M3 Pro, pantalla Liquid Retina XDR de 14.2 pulgadas, 18GB RAM unificada y 512GB SSD. Potencia extrema para creativos.',
      price: 1999.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Chip M3 Pro, 18GB RAM unificada, 512GB SSD, Pantalla 14.2" Liquid Retina XDR, Hasta 18h batería, macOS Sonoma, Touch Bar',
      stock: Math.floor(Math.random() * 5) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'iPad Air 5ta Gen 64GB Wi-Fi',
      description: 'Tablet versátil con chip M1, pantalla Liquid Retina de 10.9 pulgadas, compatible con Apple Pencil 2da generación y Magic Keyboard. Equilibrio perfecto.',
      price: 599.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Chip M1, 64GB almacenamiento, Pantalla 10.9" Liquid Retina, Compatible Apple Pencil 2da gen, Touch ID, Wi-Fi 6, Cámara 12MP',
      stock: Math.floor(Math.random() * 18) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Samsung Galaxy Tab S9 128GB',
      description: 'Tablet Android premium con pantalla AMOLED de 11 pulgadas, S Pen incluido, chip Snapdragon 8 Gen 2 y diseño delgado. Ideal para productividad.',
      price: 899.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Pantalla 11" AMOLED, S Pen incluido, Snapdragon 8 Gen 2, 128GB, Android 13, 8400mAh batería, Cámara 13MP, Resistente agua IP68',
      stock: Math.floor(Math.random() * 10) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Microsoft Surface Laptop 5 i7 16GB',
      description: 'Laptop 2-en-1 con procesador Intel Core i7, 16GB RAM, 512GB SSD, pantalla táctil PixelSense de 13.5 pulgadas y Windows 11. Diseño elegante.',
      price: 1299.99,
      condition: 'USED',
      aestheticCondition: 8,
      specifications: 'Intel Core i7-1255U, 16GB RAM, 512GB SSD, Pantalla 13.5" táctil PixelSense, Windows 11, Cámara 720p, Teclado retroiluminado',
      stock: Math.floor(Math.random() * 7) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Bose QuietComfort 45 Auriculares',
      description: 'Auriculares over-ear con cancelación de ruido líder, audio de alta calidad, hasta 24 horas de batería y comodidad excepcional para uso prolongado.',
      price: 329.99,
      condition: 'USED',
      aestheticCondition: 9,
      specifications: 'Cancelación ruido líder, Audio alta calidad, 24h batería, Bluetooth 5.1, Micrófono integrado, Control táctil, Plegable',
      stock: Math.floor(Math.random() * 14) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Mac Studio M2 Max 32GB 1TB',
      description: 'Estación de trabajo compacta con chip M2 Max, 32GB RAM unificada, 1TB SSD y conectividad profesional. Potencia extrema en formato compacto.',
      price: 1999.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Chip M2 Max, 32GB RAM unificada, 1TB SSD, macOS Ventura, Thunderbolt 4, HDMI, USB-A, Ethernet 10Gb, Wi-Fi 6E',
      stock: Math.floor(Math.random() * 3) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'iPad mini 6ta Gen 64GB Wi-Fi',
      description: 'Tablet compacta con chip A15 Bionic, pantalla Liquid Retina de 8.3 pulgadas, compatible con Apple Pencil 2da generación. Perfecta para movilidad.',
      price: 499.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Chip A15 Bionic, 64GB almacenamiento, Pantalla 8.3" Liquid Retina, Compatible Apple Pencil 2da gen, Touch ID, Wi-Fi 6, Cámara 12MP',
      stock: Math.floor(Math.random() * 16) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Samsung Galaxy Watch 6 Classic 47mm',
      description: 'Reloj inteligente con pantalla AMOLED de 1.5 pulgadas, GPS, monitor de salud avanzado, resistencia al agua IP68 y hasta 40 horas de batería.',
      price: 399.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Pantalla 1.5" AMOLED, GPS, Monitor salud avanzado, Resistente agua IP68, 40h batería, Wear OS, Cámara, Bluetooth 5.3',
      stock: Math.floor(Math.random() * 12) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Dell XPS 15 9520 i7 32GB RTX 3050',
      description: 'Laptop gaming y profesional con procesador Intel Core i7, 32GB RAM, RTX 3050, pantalla 4K de 15.6 pulgadas y diseño premium. Potencia total.',
      price: 1899.99,
      condition: 'USED',
      aestheticCondition: 8,
      specifications: 'Intel Core i7-12700H, 32GB DDR5, RTX 3050, Pantalla 15.6" 4K, 1TB SSD, Windows 11, Cámara 720p, Teclado retroiluminado',
      stock: Math.floor(Math.random() * 4) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Sony WF-1000XM4 Auriculares Inalámbricos',
      description: 'Auriculares in-ear con cancelación de ruido líder, audio de alta resolución, hasta 8 horas de batería y estuche de carga. Sonido excepcional.',
      price: 279.99,
      condition: 'USED',
      aestheticCondition: 9,
      specifications: 'Cancelación ruido líder, Audio alta resolución, 8h batería, Estuche carga, Bluetooth 5.2, Control táctil, Micrófono integrado',
      stock: Math.floor(Math.random() * 18) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'MacBook Pro 16" M3 Max 1TB',
      description: 'Laptop profesional de máxima potencia con chip M3 Max, pantalla Liquid Retina XDR de 16.2 pulgadas, 36GB RAM unificada y 1TB SSD. Rendimiento extremo.',
      price: 3499.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Chip M3 Max, 36GB RAM unificada, 1TB SSD, Pantalla 16.2" Liquid Retina XDR, Hasta 22h batería, macOS Sonoma, Touch Bar',
      stock: Math.floor(Math.random() * 2) + 1,
      status: 'ACTIVE',
      images: [
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'
      ]
    }
  ]

  // Crear productos en la base de datos
  for (const productData of realProducts) {
    const { images, ...productInfo } = productData
    
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        images: {
          create: images.map((url, index) => ({
            url,
            alt: `${productInfo.title} - Imagen ${index + 1}`
          }))
        }
      }
    })
    
    console.log(`✅ Producto creado: ${product.title} (Stock: ${product.stock})`)
  }

  console.log(`🎉 ¡Seeding completo finalizado!`)
  console.log(`📊 Resumen:`)
  console.log(`   👥 Usuarios: ${users.length}`)
  console.log(`   📱 Productos: ${realProducts.length}`)
  console.log(`   ⚙️ Configuración: 1`)
  console.log(`   🎯 Total de registros creados: ${users.length + realProducts.length + 1}`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
