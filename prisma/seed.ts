import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@markettech.com' },
    update: {},
    create: {
      email: 'admin@markettech.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+1 (555) 123-4567'
    }
  })

  console.log('✅ Usuario administrador creado:', admin.email)

  // Crear usuario cliente de ejemplo
  const clientPassword = await bcrypt.hash('client123', 12)
  
  const client = await prisma.user.upsert({
    where: { email: 'cliente@ejemplo.com' },
    update: {},
    create: {
      email: 'cliente@ejemplo.com',
      name: 'Cliente Ejemplo',
      password: clientPassword,
      role: 'CLIENT',
      phone: '+1 (555) 987-6543'
    }
  })

  console.log('✅ Usuario cliente creado:', client.email)

  // Crear productos de ejemplo
  const products = [
    {
      title: 'iPhone 15 Pro Max 256GB',
      description: 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP. Diseño premium en titanio con pantalla Super Retina XDR de 6.7 pulgadas.',
      price: 1299.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Pantalla 6.7" Super Retina XDR, Chip A17 Pro, 256GB almacenamiento, iOS 17, Cámara principal 48MP, Resistencia al agua IP68',
      status: 'ACTIVE'
    },
    {
      title: 'MacBook Pro M3 14"',
      description: 'Laptop profesional con chip M3 y pantalla Liquid Retina XDR. Perfecta para trabajo profesional y creativo.',
      price: 1999.99,
      condition: 'USED',
      aestheticCondition: 9,
      specifications: 'Chip M3, 16GB RAM, 512GB SSD, macOS Sonoma, Pantalla Liquid Retina XDR 14.2"',
      status: 'ACTIVE'
    },
    {
      title: 'AirPods Pro 2da Gen',
      description: 'Auriculares inalámbricos con cancelación activa de ruido y audio espacial.',
      price: 249.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Cancelación activa de ruido, Audio espacial, Resistencia al agua IPX4, Hasta 6 horas de audio',
      status: 'ACTIVE'
    },
    {
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Smartphone Android con S Pen y cámara de 200MP. El dispositivo más potente de Samsung.',
      price: 1199.99,
      condition: 'USED',
      aestheticCondition: 8,
      specifications: 'Pantalla 6.8" Dynamic AMOLED 2X, Snapdragon 8 Gen 3, 256GB, S Pen incluido, Cámara 200MP',
      status: 'ACTIVE'
    },
    {
      title: 'iPad Pro 12.9" M2',
      description: 'Tablet profesional con chip M2 y pantalla Liquid Retina XDR. Ideal para creativos y profesionales.',
      price: 1099.99,
      condition: 'NEW',
      aestheticCondition: 10,
      specifications: 'Chip M2, 128GB, WiFi + Cellular, Pantalla Liquid Retina XDR 12.9", Compatible con Apple Pencil',
      status: 'ACTIVE'
    },
    {
      title: 'Sony WH-1000XM5',
      description: 'Auriculares over-ear con cancelación de ruido líder en la industria y 30 horas de batería.',
      price: 399.99,
      condition: 'USED',
      aestheticCondition: 9,
      specifications: 'Cancelación de ruido líder, 30h batería, Carga rápida, Audio de alta resolución',
      status: 'ACTIVE'
    }
  ]

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: [
            {
              url: '/placeholder.jpg',
              alt: productData.title,
              order: 0
            }
          ]
        }
      }
    })
    console.log(`✅ Producto creado: ${product.title}`)
  }

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\nCredenciales de acceso:')
  console.log('👤 Admin: admin@markettech.com / admin123')
  console.log('👤 Cliente: cliente@ejemplo.com / client123')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
