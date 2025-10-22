const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestProducts() {
  try {
    console.log('🛍️ Creando productos de prueba...')
    
    // Obtener el usuario de prueba
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@markettech.com' }
    })
    
    if (!testUser) {
      console.log('❌ No se encontró el usuario de prueba')
      return
    }
    
    const products = [
      {
        title: 'Smartphone Samsung Galaxy S23',
        description: 'Smartphone de última generación con cámara de 108MP y pantalla AMOLED de 6.1 pulgadas',
        price: 899.99,
        supplierPrice: 600.00,
        marginPercentage: 33.33,
        previousPrice: 999.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla: 6.1" AMOLED, Cámara: 108MP + 12MP + 10MP, RAM: 8GB, Almacenamiento: 128GB, Batería: 3900mAh',
        categories: 'smartphones,tecnologia',
        stock: 15,
        manufacturer: 'Samsung',
        model: 'Galaxy S23',
        manufacturerCode: 'SM-S911BZKAEUE'
      },
      {
        title: 'Laptop Dell XPS 13',
        description: 'Laptop ultrabook premium con procesador Intel i7 y pantalla 4K',
        price: 1299.99,
        supplierPrice: 900.00,
        marginPercentage: 30.77,
        previousPrice: 1499.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 13.4" 4K, Procesador: Intel i7-1360P, RAM: 16GB, SSD: 512GB, GPU: Intel Iris Xe',
        categories: 'laptops,computadoras',
        stock: 8,
        manufacturer: 'Dell',
        model: 'XPS 13',
        manufacturerCode: 'XPS139320'
      },
      {
        title: 'Auriculares Sony WH-1000XM5',
        description: 'Auriculares inalámbricos con cancelación de ruido líder en la industria',
        price: 399.99,
        supplierPrice: 250.00,
        marginPercentage: 37.5,
        previousPrice: 449.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Cancelación de ruido: Sí, Batería: 30h, Conectividad: Bluetooth 5.2, Peso: 250g',
        categories: 'audio,auriculares',
        stock: 25,
        manufacturer: 'Sony',
        model: 'WH-1000XM5',
        manufacturerCode: 'WH1000XM5B'
      },
      {
        title: 'Tablet iPad Air 5ta Gen',
        description: 'Tablet Apple con chip M1 y pantalla Liquid Retina de 10.9 pulgadas',
        price: 599.99,
        supplierPrice: 400.00,
        marginPercentage: 33.33,
        previousPrice: 649.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 10.9" Liquid Retina, Chip: M1, RAM: 8GB, Almacenamiento: 64GB, Cámara: 12MP',
        categories: 'tablets,apple',
        stock: 12,
        manufacturer: 'Apple',
        model: 'iPad Air 5th Gen',
        manufacturerCode: 'MM9C3LL/A'
      },
      {
        title: 'Smartwatch Apple Watch Series 9',
        description: 'Reloj inteligente con GPS, monitor de salud y resistencia al agua',
        price: 399.99,
        supplierPrice: 280.00,
        marginPercentage: 30.0,
        previousPrice: 429.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Pantalla: 45mm, GPS: Sí, Resistencia al agua: 50m, Batería: 18h, Material: Aluminio',
        categories: 'wearables,smartwatch',
        stock: 20,
        manufacturer: 'Apple',
        model: 'Apple Watch Series 9',
        manufacturerCode: 'A2848'
      }
    ]
    
    for (const productData of products) {
      const existingProduct = await prisma.product.findFirst({
        where: { title: productData.title }
      })
      
      if (!existingProduct) {
        const product = await prisma.product.create({
          data: {
            ...productData,
            userId: testUser.id,
            publishedAt: new Date(),
            publishedBy: testUser.id
          }
        })
        
        console.log(`✅ Producto creado: ${product.title} - $${product.price}`)
        
        // Crear inventario para el producto
        const inventory = await prisma.inventory.create({
          data: {
            productId: product.id,
            sku: `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            quantity: product.stock,
            reserved: 0,
            available: product.stock,
            minStock: 5,
            maxStock: 100,
            reorderPoint: 10,
            cost: product.supplierPrice,
            price: product.price,
            location: `A${Math.floor(Math.random() * 5) + 1}-B${Math.floor(Math.random() * 5) + 1}`,
            supplier: `Proveedor ${Math.floor(Math.random() * 3) + 1}`,
            supplierSku: `SUP-${product.id.substring(0, 6).toUpperCase()}`,
            lastRestocked: new Date(),
            isActive: true
          }
        })
        
        console.log(`   📦 Inventario: ${inventory.quantity} unidades`)
      } else {
        console.log(`⚠️  Producto ya existe: ${productData.title}`)
      }
    }
    
    console.log('🎉 Productos de prueba creados exitosamente!')
    
  } catch (error) {
    console.error('❌ Error creando productos de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestProducts()
