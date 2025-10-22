import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  await prisma.sellerPayout.deleteMany()
  await prisma.commissionSettings.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productRating.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.userCart.deleteMany()
  // paymentProfile removido - ahora se usa perfil global
  await prisma.user.deleteMany()

  console.log('🧹 Datos existentes eliminados')

  // Crear usuarios
  const admin = await prisma.user.create({
    data: {
      email: 'admin@techstore.com',
      name: 'Administrador',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      cpf: '12345678901',
      phone: '11999999999',
      address: 'Rua Admin, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil'
    }
  })

  // Crear vendedores
  const paul = await prisma.user.create({
    data: {
      email: 'paul790905@gmail.com',
      name: 'Paul Silva',
      password: await bcrypt.hash('paul123', 10),
      role: 'ADMIN_VENDAS',
      cpf: '12345678901',
      phone: '11987654321',
      address: 'Rua Paul, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04567-890',
      country: 'Brasil'
    }
  })

  const maria = await prisma.user.create({
    data: {
      email: 'maria.silva@techstore.com',
      name: 'Maria Silva',
      password: await bcrypt.hash('maria123', 10),
      role: 'ADMIN_VENDAS',
      cpf: '98765432100',
      phone: '11987654322',
      address: 'Rua Maria, 789',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20000-000',
      country: 'Brasil'
    }
  })

  // Crear cliente de prueba
  const cliente = await prisma.user.create({
    data: {
      email: 'cliente@teste.com',
      name: 'Cliente Teste',
      password: await bcrypt.hash('cliente123', 10),
      role: 'CLIENT',
      cpf: '11122233344',
      phone: '11987654323',
      address: 'Rua Cliente, 321',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30000-000',
      country: 'Brasil'
    }
  })

  console.log('👥 Usuarios creados:', { admin: admin.name, paul: paul.name, maria: maria.name, cliente: cliente.name })

  // Productos de Paul (con descuentos y todos los campos)
  const paulProducts = [
    {
      title: 'MacBook Pro M3 14"',
      description: 'MacBook Pro con chip M3, 14 pulgadas, 16GB RAM, 512GB SSD. Perfecto para profesionales y creativos.',
      price: 12999.99,
      supplierPrice: 11000.00,
      previousPrice: 14999.99, // Precio anterior para mostrar descuento
      marginPercentage: 18.18, // Margen real
      stock: 5,
      condition: 'NEW',
      aestheticCondition: 10,
      categories: 'laptops,apple,profesional',
      status: 'ACTIVE',
      publishedAt: new Date(),
      publishedBy: paul.id,
      manufacturerCode: 'APPLE-MBP-M3-14',
      specifications: 'Chip M3, 16GB RAM, 512GB SSD, Pantalla Liquid Retina XDR de 14.2 pulgadas, macOS Sonoma',
      userId: paul.id,
      images: [
        {
          path: '/uploads/products/macbook-pro-m3/image_1.jpg',
          filename: 'image_1.jpg',
          alt: 'MacBook Pro M3 14 pulgadas',
          order: 0
        }
      ]
    },
    {
      title: 'iPhone 15 Pro Max',
      description: 'iPhone 15 Pro Max con 256GB, cámara de 48MP, chip A17 Pro. El smartphone más avanzado de Apple.',
      price: 8999.99,
      supplierPrice: 7500.00,
      previousPrice: 9999.99,
      marginPercentage: 20.0,
      stock: 8,
      condition: 'NEW',
      aestheticCondition: 10,
      categories: 'smartphones,apple,premium',
      status: 'ACTIVE',
      publishedAt: new Date(),
      publishedBy: paul.id,
      manufacturerCode: 'APPLE-IPH15-PM-256',
      specifications: 'Chip A17 Pro, 256GB, Cámara principal de 48MP, Pantalla Super Retina XDR de 6.7 pulgadas, iOS 17',
      userId: paul.id,
      images: [
        {
          path: '/uploads/products/iphone-15-pro-max/image_1.jpg',
          filename: 'image_1.jpg',
          alt: 'iPhone 15 Pro Max',
          order: 0
        }
      ]
    },
    {
      title: 'AirPods Pro 2da Gen',
      description: 'AirPods Pro con cancelación activa de ruido, audio espacial y estuche de carga inalámbrica.',
      price: 1899.99,
      supplierPrice: 1500.00,
      previousPrice: 2199.99,
      marginPercentage: 26.67,
      stock: 12,
      condition: 'NEW',
      aestheticCondition: 10,
      categories: 'audio,apple,inalambrico',
      status: 'ACTIVE',
      publishedAt: new Date(),
      publishedBy: paul.id,
      manufacturerCode: 'APPLE-APP-2GEN',
      specifications: 'Cancelación activa de ruido, Audio espacial, Resistencia al agua IPX4, Hasta 6 horas de audio',
      userId: paul.id,
      images: [
        {
          path: '/uploads/products/airpods-pro-2/image_1.jpg',
          filename: 'image_1.jpg',
          alt: 'AirPods Pro 2da Generación',
          order: 0
        }
      ]
    }
  ]

  // Productos de María (con descuentos y todos los campos)
  const mariaProducts = [
    {
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Samsung Galaxy S24 Ultra con 256GB, cámara de 200MP, S Pen incluido. El smartphone más potente de Samsung.',
      price: 7999.99,
      supplierPrice: 6500.00,
      previousPrice: 8999.99,
      marginPercentage: 23.08,
      stock: 6,
      condition: 'NEW',
      aestheticCondition: 10,
      categories: 'smartphones,samsung,premium',
      status: 'ACTIVE',
      publishedAt: new Date(),
      publishedBy: maria.id,
      manufacturerCode: 'SAMSUNG-SGS24-U-256',
      specifications: 'Snapdragon 8 Gen 3, 256GB, Cámara principal de 200MP, Pantalla Dynamic AMOLED 2X de 6.8 pulgadas, Android 14',
      userId: maria.id,
      images: [
        {
          path: '/uploads/products/samsung-galaxy-s24-ultra/image_1.jpg',
          filename: 'image_1.jpg',
          alt: 'Samsung Galaxy S24 Ultra',
          order: 0
        }
      ]
    },
    {
      title: 'Nintendo Switch OLED',
      description: 'Nintendo Switch OLED con pantalla de 7 pulgadas, 64GB de almacenamiento. Incluye Joy-Con.',
      price: 2499.99,
      supplierPrice: 2000.00,
      previousPrice: 2799.99,
      marginPercentage: 25.0,
      stock: 10,
      condition: 'NEW',
      aestheticCondition: 10,
      categories: 'gaming,nintendo,consola',
      status: 'ACTIVE',
      publishedAt: new Date(),
      publishedBy: maria.id,
      manufacturerCode: 'NINTENDO-NSW-OLED',
      specifications: 'Pantalla OLED de 7 pulgadas, 64GB de almacenamiento, Joy-Con incluidos, Modo portátil y TV',
      userId: maria.id,
      images: [
        {
          path: '/uploads/products/nintendo-switch-oled/image_1.jpg',
          filename: 'image_1.jpg',
          alt: 'Nintendo Switch OLED',
          order: 0
        }
      ]
    },
    {
      title: 'PlayStation 5',
      description: 'PlayStation 5 con 825GB SSD, control DualSense incluido. La consola de nueva generación de Sony.',
      price: 4499.99,
      supplierPrice: 3500.00,
      previousPrice: 4999.99,
      marginPercentage: 28.57,
      stock: 4,
      condition: 'NEW',
      aestheticCondition: 10,
      categories: 'gaming,sony,consola',
      status: 'ACTIVE',
      publishedAt: new Date(),
      publishedBy: maria.id,
      manufacturerCode: 'SONY-PS5-825GB',
      specifications: 'CPU AMD Zen 2, GPU AMD RDNA 2, 825GB SSD, Control DualSense, Compatible con 4K y ray tracing',
      userId: maria.id,
      images: [
        {
          path: '/uploads/products/playstation-5/image_1.jpg',
          filename: 'image_1.jpg',
          alt: 'PlayStation 5',
          order: 0
        }
      ]
    }
  ]

  // Crear productos de Paul
  for (const productData of paulProducts) {
    const { images, ...productInfo } = productData
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        images: {
          create: images
        }
      }
    })
    console.log(`✅ Producto de Paul creado: ${product.title} (Stock: ${product.stock}, Descuento: ${product.previousPrice ? Math.round(((Number(product.previousPrice) - Number(product.price)) / Number(product.previousPrice)) * 100) : 0}%)`)
  }

  // Crear productos de María
  for (const productData of mariaProducts) {
    const { images, ...productInfo } = productData
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        images: {
          create: images
        }
      }
    })
    console.log(`✅ Producto de María creado: ${product.title} (Stock: ${product.stock}, Descuento: ${product.previousPrice ? Math.round(((Number(product.previousPrice) - Number(product.price)) / Number(product.previousPrice)) * 100) : 0}%)`)
  }

  // Crear configuración de comisiones por defecto
  await prisma.commissionSettings.create({
    data: {
      name: 'Comisión Estándar',
      rate: 0.05, // 5%
      isActive: true,
      minAmount: 0,
      maxAmount: 100000
    }
  })

  console.log('💰 Configuración de comisiones creada')

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📋 Credenciales de acceso:')
  console.log('👑 ADMIN: admin@techstore.com / admin123')
  console.log('👨‍💼 VENDEDOR PAUL: paul790905@gmail.com / paul123')
  console.log('👩‍💼 VENDEDORA MARÍA: maria.silva@techstore.com / maria123')
  console.log('🛒 CLIENTE: cliente@teste.com / cliente123')
  console.log('\n📦 Productos creados:')
  console.log('👨‍💼 Paul: MacBook Pro (13% descuento), iPhone 15 Pro Max (10% descuento), AirPods Pro (14% descuento)')
  console.log('👩‍💼 María: Galaxy S24 Ultra (11% descuento), Nintendo Switch (11% descuento), PlayStation 5 (10% descuento)')
  console.log('\n📁 Estructura de imágenes:')
  console.log('- Cada producto tiene su propio directorio')
  console.log('- Imágenes organizadas por producto')
  console.log('- Códigos de producto únicos asignados')
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })