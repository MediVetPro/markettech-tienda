const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedProducts() {
  try {
    console.log('🌱 Seeding products...')

    // Crear productos de ejemplo
    const products = [
      {
        title: 'iPhone 15 Pro Max 256GB',
        description: 'El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla de 6.7 pulgadas.',
        price: 1299.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: '256GB, 6.7 pulgadas, A17 Pro, 48MP, Titanio',
        status: 'ACTIVE',
        images: [
          { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', alt: 'iPhone 15 Pro Max' },
          { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', alt: 'iPhone 15 Pro Max Back' }
        ]
      },
      {
        title: 'MacBook Air M2 13"',
        description: 'MacBook Air con chip M2, 8GB RAM, 256GB SSD. Perfecto para trabajo y estudio.',
        price: 899.99,
        condition: 'USED',
        aestheticCondition: 9,
        specifications: 'M2, 8GB RAM, 256GB SSD, 13 pulgadas, Space Gray',
        status: 'ACTIVE',
        images: [
          { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', alt: 'MacBook Air M2' }
        ]
      },
      {
        title: 'iPad Pro 11" M2',
        description: 'iPad Pro con chip M2, pantalla Liquid Retina de 11 pulgadas, perfecto para creativos.',
        price: 599.99,
        condition: 'USED',
        aestheticCondition: 8,
        specifications: 'M2, 11 pulgadas, Liquid Retina, 128GB, Wi-Fi',
        status: 'ACTIVE',
        images: [
          { url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500', alt: 'iPad Pro 11"' }
        ]
      },
      {
        title: 'AirPods Pro 2da Gen',
        description: 'AirPods Pro con cancelación activa de ruido y audio espacial.',
        price: 199.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: '2da Gen, Cancelación de ruido, Audio espacial, Estuche de carga',
        status: 'ACTIVE',
        images: [
          { url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500', alt: 'AirPods Pro' }
        ]
      },
      {
        title: 'Apple Watch Series 9',
        description: 'Apple Watch Series 9 con GPS, pantalla Always-On y monitoreo de salud.',
        price: 399.99,
        condition: 'USED',
        aestheticCondition: 9,
        specifications: 'Series 9, GPS, 45mm, Pantalla Always-On, Aluminio',
        status: 'ACTIVE',
        images: [
          { url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', alt: 'Apple Watch Series 9' }
        ]
      }
    ]

    // Limpiar productos existentes
    await prisma.productImage.deleteMany()
    await prisma.product.deleteMany()

    // Crear productos
    for (const productData of products) {
      const { images, ...product } = productData
      
      const createdProduct = await prisma.product.create({
        data: {
          ...product,
          images: {
            create: images
          }
        }
      })
      
      console.log(`✅ Created product: ${createdProduct.title}`)
    }

    console.log('🎉 Products seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProducts()
