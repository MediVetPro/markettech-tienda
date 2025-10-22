const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando seeding simplificado...')

  try {
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
    const bcrypt = require('bcryptjs')
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
      { key: 'about_content', value: 'Somos una tienda especializada en tecnología premium, ofreciendo los mejores productos de las marcas más reconocidas del mercado.', type: 'html' },
      { key: 'contact_title', value: 'Contáctanos', type: 'text' },
      { key: 'contact_content', value: 'Estamos aquí para ayudarte con cualquier consulta sobre nuestros productos.', type: 'html' },
      { key: 'contact_email', value: 'contacto@smartesh.com', type: 'text' },
      { key: 'contact_phone', value: '+55 11 99999-9999', type: 'text' },
      { key: 'contact_address', value: 'Rua da Tecnologia, 123 - São Paulo, SP', type: 'text' }
    ]

    for (const config of siteConfigs) {
      await prisma.siteConfig.create({ data: config })
    }
    console.log('✅ Configuración del sitio creada')

    // 3. Crear productos reales (solo 5 para empezar)
    console.log('📱 Creando productos reales...')
    const realProducts = [
      {
        title: 'iPhone 15 Pro Max 256GB Titanio Natural',
        description: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP, pantalla Super Retina XDR de 6.7 pulgadas y diseño premium en titanio.',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla 6.7" Super Retina XDR, Chip A17 Pro, 256GB almacenamiento, iOS 17, Cámara principal 48MP',
        stock: Math.floor(Math.random() * 15) + 1,
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'MacBook Air M2 13" 256GB Space Gray',
        description: 'Laptop ultradelgada con chip M2 de Apple, pantalla Liquid Retina de 13.6 pulgadas, 8GB RAM unificada y 256GB SSD.',
        price: 999.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M2, 8GB RAM unificada, 256GB SSD, Pantalla 13.6" Liquid Retina, Hasta 18h batería',
        stock: Math.floor(Math.random() * 12) + 1,
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'iPad Pro 11" M2 128GB Wi-Fi',
        description: 'Tablet profesional con chip M2, pantalla Liquid Retina de 11 pulgadas, compatible con Apple Pencil 2da generación.',
        price: 799.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Chip M2, 128GB almacenamiento, Pantalla 11" Liquid Retina, Compatible con Apple Pencil 2da gen',
        stock: Math.floor(Math.random() * 10) + 1,
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'AirPods Pro 2da Generación',
        description: 'Auriculares inalámbricos con cancelación activa de ruido, audio espacial, chip H2 y estuche de carga MagSafe.',
        price: 249.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Cancelación activa de ruido, Audio espacial, Chip H2, Hasta 6h audio, Estuche de carga MagSafe',
        stock: Math.floor(Math.random() * 20) + 1,
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'Apple Watch Series 9 GPS 45mm',
        description: 'Reloj inteligente con pantalla Always-On, GPS, monitor de frecuencia cardíaca, detección de caídas.',
        price: 429.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla Always-On, GPS, Monitor frecuencia cardíaca, Detección caídas, Resistente agua 50m',
        stock: Math.floor(Math.random() * 15) + 1,
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop'
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

    console.log(`🎉 ¡Seeding simplificado completado!`)
    console.log(`📊 Resumen:`)
    console.log(`   👥 Usuarios: ${users.length}`)
    console.log(`   📱 Productos: ${realProducts.length}`)
    console.log(`   ⚙️ Configuración: ${siteConfigs.length} campos`)

  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
