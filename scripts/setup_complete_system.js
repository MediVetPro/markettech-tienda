const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function setupCompleteSystem() {
  try {
    console.log('🚀 Iniciando configuración completa del sistema...')

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...')
    await prisma.sellerPayout.deleteMany()
    await prisma.commissionSettings.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.productRating.deleteMany()
    await prisma.productImage.deleteMany()
    await prisma.product.deleteMany()
    await prisma.userCart.deleteMany()
    await prisma.paymentProfile.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Base de datos limpiada')

    // Crear usuarios
    console.log('\n👥 Creando usuarios...')

    // 1. Administrador Principal
    const admin = await prisma.user.create({
      data: {
        name: 'Carlos Romero',
        email: 'admin@markettech.com',
        password: await bcrypt.hash('Romero12345@', 10),
        phone: '41999999999',
        cpf: '123.456.789-00',
        birthDate: new Date('1985-03-15'),
        gender: 'M',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        country: 'Brasil',
        newsletter: true,
        role: 'ADMIN'
      }
    })

    // 2. Administrador de Ventas 1
    const salesAdmin1 = await prisma.user.create({
      data: {
        name: 'Ana Silva',
        email: 'ana.silva@markettech.com',
        password: await bcrypt.hash('Romero12345@', 10),
        phone: '41988888888',
        cpf: '987.654.321-00',
        birthDate: new Date('1990-07-22'),
        gender: 'F',
        address: 'Rua das Flores, 500',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80000-000',
        country: 'Brasil',
        newsletter: true,
        role: 'ADMIN_VENDAS'
      }
    })

    // 3. Administrador de Ventas 2
    const salesAdmin2 = await prisma.user.create({
      data: {
        name: 'Roberto Santos',
        email: 'roberto.santos@markettech.com',
        password: await bcrypt.hash('Romero12345@', 10),
        phone: '41977777777',
        cpf: '456.789.123-00',
        birthDate: new Date('1988-11-10'),
        gender: 'M',
        address: 'Rua da Tecnologia, 200',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000',
        country: 'Brasil',
        newsletter: false,
        role: 'ADMIN_VENDAS'
      }
    })

    // 4. Cliente
    const client = await prisma.user.create({
      data: {
        name: 'Maria Oliveira',
        email: 'maria.oliveira@gmail.com',
        password: await bcrypt.hash('Romero12345@', 10),
        phone: '41966666666',
        cpf: '789.123.456-00',
        birthDate: new Date('1995-05-18'),
        gender: 'F',
        address: 'Rua da Paz, 300',
        city: 'Belo Horizonte',
        state: 'MG',
        zipCode: '30000-000',
        country: 'Brasil',
        newsletter: true,
        role: 'CLIENT'
      }
    })

    console.log('✅ Usuarios creados exitosamente')

    // Crear perfiles de pago para los vendedores
    console.log('\n💳 Creando perfiles de pago...')

    const paymentProfile1 = await prisma.paymentProfile.create({
      data: {
        name: 'Perfil Principal - Ana Silva',
        companyName: 'Ana Silva Comércio Eletrônico LTDA',
        cnpj: '12.345.678/0001-90',
        email: 'ana.silva@markettech.com',
        address: 'Rua das Flores, 500',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80000-000',
        country: 'Brasil',
        bankName: 'Banco do Brasil',
        bankCode: '001',
        accountType: 'CHECKING',
        accountNumber: '12345-6',
        agencyNumber: '1234',
        accountHolder: 'Ana Silva',
        userId: salesAdmin1.id
      }
    })

    const paymentProfile2 = await prisma.paymentProfile.create({
      data: {
        name: 'Perfil Principal - Roberto Santos',
        companyName: 'Roberto Santos Tecnologia LTDA',
        cnpj: '98.765.432/0001-10',
        email: 'roberto.santos@markettech.com',
        address: 'Rua da Tecnologia, 200',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000',
        country: 'Brasil',
        bankName: 'Itaú Unibanco',
        bankCode: '341',
        accountType: 'CHECKING',
        accountNumber: '67890-1',
        agencyNumber: '5678',
        accountHolder: 'Roberto Santos',
        userId: salesAdmin2.id
      }
    })

    console.log('✅ Perfiles de pago creados')

    // Crear productos con imágenes
    console.log('\n📦 Creando productos...')

    // Productos de Ana Silva
    const productsAna = [
      {
        title: 'iPhone 15 Pro Max 256GB',
        description: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7". Incluye cargador USB-C y cable.',
        price: 8999.99,
        supplierPrice: 7500.00,
        marginPercentage: 20.0,
        previousPrice: 9999.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 6.7" Super Retina XDR, Chip: A17 Pro, Cámara: 48MP principal + 12MP ultra gran angular + 12MP teleobjetivo, Almacenamiento: 256GB, Batería: Hasta 29 horas de video',
        categories: 'smartphones,apple,premium',
        stock: 15,
        status: 'ACTIVE',
        productCode: 'IPH15PM256',
        manufacturerCode: 'A3108',
        userId: salesAdmin1.id,
        paymentProfileId: paymentProfile1.id
      },
      {
        title: 'MacBook Pro M3 14" 512GB',
        description: 'MacBook Pro con chip M3, pantalla Liquid Retina XDR de 14", 8GB RAM unificada y 512GB SSD. Perfecto para profesionales.',
        price: 12999.99,
        supplierPrice: 11000.00,
        marginPercentage: 18.2,
        previousPrice: 13999.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 14.2" Liquid Retina XDR, Chip: Apple M3, RAM: 8GB unificada, Almacenamiento: 512GB SSD, Batería: Hasta 18 horas',
        categories: 'laptops,apple,profesional',
        stock: 8,
        status: 'ACTIVE',
        productCode: 'MBPM314512',
        manufacturerCode: 'MRX33B/A',
        userId: salesAdmin1.id,
        paymentProfileId: paymentProfile1.id
      },
      {
        title: 'AirPods Pro 2da Generación',
        description: 'AirPods Pro con cancelación activa de ruido, audio espacial y hasta 6 horas de autonomía. Incluye estuche de carga MagSafe.',
        price: 1899.99,
        supplierPrice: 1500.00,
        marginPercentage: 26.7,
        previousPrice: 2199.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Cancelación activa de ruido, Audio espacial, Autonomía: 6 horas (hasta 30 con estuche), Carga: Lightning y MagSafe',
        categories: 'audio,apple,inalambrico',
        stock: 25,
        status: 'ACTIVE',
        productCode: 'APP2GEN',
        manufacturerCode: 'MME73B/A',
        userId: salesAdmin1.id,
        paymentProfileId: paymentProfile1.id
      }
    ]

    // Productos de Roberto Santos
    const productsRoberto = [
      {
        title: 'Samsung Galaxy S24 Ultra 512GB',
        description: 'Galaxy S24 Ultra con S Pen, cámara de 200MP, pantalla Dynamic AMOLED 2X de 6.8" y procesador Snapdragon 8 Gen 3.',
        price: 6999.99,
        supplierPrice: 5800.00,
        marginPercentage: 20.7,
        previousPrice: 7999.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 6.8" Dynamic AMOLED 2X, Procesador: Snapdragon 8 Gen 3, Cámara: 200MP + 50MP + 12MP + 10MP, Almacenamiento: 512GB, S Pen incluido',
        categories: 'smartphones,samsung,premium',
        stock: 12,
        status: 'ACTIVE',
        productCode: 'SGS24U512',
        manufacturerCode: 'SM-S928B',
        userId: salesAdmin2.id,
        paymentProfileId: paymentProfile2.id
      },
      {
        title: 'PlayStation 5 Digital Edition',
        description: 'PlayStation 5 versión digital con SSD ultra rápido, ray tracing y 3D Audio. Incluye controlador DualSense.',
        price: 3999.99,
        supplierPrice: 3200.00,
        marginPercentage: 25.0,
        previousPrice: 4499.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'SSD: 825GB, GPU: AMD RDNA 2, CPU: AMD Zen 2, Ray Tracing, 3D Audio, Controlador DualSense incluido',
        categories: 'gaming,sony,consola',
        stock: 6,
        status: 'ACTIVE',
        productCode: 'PS5DIGITAL',
        manufacturerCode: 'CFI-1215A',
        userId: salesAdmin2.id,
        paymentProfileId: paymentProfile2.id
      },
      {
        title: 'Nintendo Switch OLED 64GB',
        description: 'Nintendo Switch OLED con pantalla de 7" OLED, 64GB de almacenamiento interno y Joy-Con incluidos.',
        price: 2499.99,
        supplierPrice: 2000.00,
        marginPercentage: 25.0,
        previousPrice: 2799.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 7" OLED, Almacenamiento: 64GB, Joy-Con incluidos, Modo portátil y TV, Batería: 4.5-9 horas',
        categories: 'gaming,nintendo,portatil',
        stock: 18,
        status: 'ACTIVE',
        productCode: 'NSWOLED64',
        manufacturerCode: 'HAC-001(-01)',
        userId: salesAdmin2.id,
        paymentProfileId: paymentProfile2.id
      }
    ]

    // Crear productos en la base de datos
    const allProducts = [...productsAna, ...productsRoberto]
    const createdProducts = []

    for (const productData of allProducts) {
      const product = await prisma.product.create({
        data: productData
      })
      createdProducts.push(product)
    }

    console.log('✅ Productos creados en la base de datos')

    // Crear imágenes para los productos
    console.log('\n📸 Creando imágenes de productos...')

    const productImages = {
      'iPhone 15 Pro Max 256GB': [
        { filename: 'iphone15pro-front.jpg', alt: 'iPhone 15 Pro Max vista frontal' },
        { filename: 'iphone15pro-back.jpg', alt: 'iPhone 15 Pro Max vista trasera' },
        { filename: 'iphone15pro-side.jpg', alt: 'iPhone 15 Pro Max vista lateral' }
      ],
      'MacBook Pro M3 14" 512GB': [
        { filename: 'macbookpro-front.jpg', alt: 'MacBook Pro M3 vista frontal' },
        { filename: 'macbookpro-open.jpg', alt: 'MacBook Pro M3 abierto' },
        { filename: 'macbookpro-side.jpg', alt: 'MacBook Pro M3 vista lateral' }
      ],
      'AirPods Pro 2da Generación': [
        { filename: 'airpodspro-case.jpg', alt: 'AirPods Pro con estuche' },
        { filename: 'airpodspro-earbuds.jpg', alt: 'AirPods Pro auriculares' },
        { filename: 'airpodspro-charging.jpg', alt: 'AirPods Pro cargando' }
      ],
      'Samsung Galaxy S24 Ultra 512GB': [
        { filename: 'galaxys24-front.jpg', alt: 'Galaxy S24 Ultra vista frontal' },
        { filename: 'galaxys24-back.jpg', alt: 'Galaxy S24 Ultra vista trasera' },
        { filename: 'galaxys24-pen.jpg', alt: 'Galaxy S24 Ultra con S Pen' }
      ],
      'PlayStation 5 Digital Edition': [
        { filename: 'ps5-front.jpg', alt: 'PlayStation 5 vista frontal' },
        { filename: 'ps5-side.jpg', alt: 'PlayStation 5 vista lateral' },
        { filename: 'ps5-controller.jpg', alt: 'PlayStation 5 con controlador' }
      ],
      'Nintendo Switch OLED 64GB': [
        { filename: 'switch-front.jpg', alt: 'Nintendo Switch OLED vista frontal' },
        { filename: 'switch-handheld.jpg', alt: 'Nintendo Switch modo portátil' },
        { filename: 'switch-docked.jpg', alt: 'Nintendo Switch en dock' }
      ]
    }

    // Crear directorios y archivos de imagen
    for (const product of createdProducts) {
      const productDir = path.join('public', 'uploads', 'products', product.productCode.toLowerCase())
      
      // Crear directorio del producto
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true })
      }

      // Crear imágenes en la base de datos
      const images = productImages[product.title] || []
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i]
        const imagePath = `/uploads/products/${product.productCode.toLowerCase()}/${imageData.filename}`
        
        await prisma.productImage.create({
          data: {
            path: imagePath,
            filename: imageData.filename,
            alt: imageData.alt,
            order: i,
            productId: product.id
          }
        })

        // Crear archivo de imagen placeholder
        const imageFilePath = path.join(productDir, imageData.filename)
        fs.writeFileSync(imageFilePath, `<!-- Placeholder para ${imageData.alt} -->`)
      }
    }

    console.log('✅ Imágenes de productos creadas')

    // Crear configuración de comisiones
    console.log('\n💰 Creando configuración de comisiones...')

    await prisma.commissionSettings.create({
      data: {
        name: 'Comisión Estándar',
        rate: 0.05, // 5%
        isActive: true,
        minAmount: 0,
        maxAmount: 100000
      }
    })

    console.log('✅ Configuración de comisiones creada')

    // Mostrar resumen
    console.log('\n🎉 Sistema configurado exitosamente!')
    console.log('\n📋 Credenciales de acceso (todos con contraseña: Romero12345@):')
    console.log('👑 ADMIN: admin@markettech.com')
    console.log('👩‍💼 VENDEDORA ANA: ana.silva@markettech.com')
    console.log('👨‍💼 VENDEDOR ROBERTO: roberto.santos@markettech.com')
    console.log('🛒 CLIENTE: maria.oliveira@gmail.com')
    
    console.log('\n📦 Productos creados:')
    console.log('👩‍💼 Ana Silva:')
    console.log('  - iPhone 15 Pro Max 256GB (R$ 8.999,99)')
    console.log('  - MacBook Pro M3 14" 512GB (R$ 12.999,99)')
    console.log('  - AirPods Pro 2da Generación (R$ 1.899,99)')
    console.log('👨‍💼 Roberto Santos:')
    console.log('  - Samsung Galaxy S24 Ultra 512GB (R$ 6.999,99)')
    console.log('  - PlayStation 5 Digital Edition (R$ 3.999,99)')
    console.log('  - Nintendo Switch OLED 64GB (R$ 2.499,99)')
    
    console.log('\n💳 Perfiles de pago configurados para vendedores')
    console.log('💰 Sistema de comisiones: 5% por defecto')
    console.log('\n🚀 ¡Sistema listo para usar!')

  } catch (error) {
    console.error('❌ Error configurando el sistema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupCompleteSystem()
