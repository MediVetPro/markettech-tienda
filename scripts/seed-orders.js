const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🛒 Creando órdenes de prueba...')

  try {
    // Obtener productos existentes
    const products = await prisma.product.findMany({
      take: 5
    })

    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos. Ejecuta primero: npm run seed:simple')
      return
    }

    // Obtener usuarios existentes
    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      take: 3
    })

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos. Ejecuta primero: npm run seed:simple')
      return
    }

    // Crear órdenes de prueba
    const orders = [
      {
        customerName: 'Juan Pérez',
        customerEmail: 'juan@email.com',
        customerPhone: '+55 11 99999-9999',
        customerAddress: 'Rua das Flores, 123 - São Paulo, SP',
        total: 1299.99,
        status: 'PENDING',
        notes: 'Método de pago: PIX',
        userId: users[0].id,
        items: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price
          }
        ]
      },
      {
        customerName: 'María García',
        customerEmail: 'maria@email.com',
        customerPhone: '+55 11 88888-8888',
        customerAddress: 'Avenida Paulista, 456 - São Paulo, SP',
        total: 2499.99,
        status: 'CONFIRMED',
        notes: 'Método de pago: Tarjeta de crédito',
        userId: users[1]?.id || users[0].id,
        items: [
          {
            productId: products[1].id,
            quantity: 1,
            price: products[1].price
          },
          {
            productId: products[2].id,
            quantity: 1,
            price: products[2].price
          }
        ]
      },
      {
        customerName: 'Carlos Silva',
        customerEmail: 'carlos@email.com',
        customerPhone: '+55 11 77777-7777',
        customerAddress: 'Rua Augusta, 789 - São Paulo, SP',
        total: 899.99,
        status: 'COMPLETED',
        notes: 'Método de pago: Transferencia bancaria',
        userId: users[2]?.id || users[0].id,
        items: [
          {
            productId: products[3].id,
            quantity: 1,
            price: products[3].price
          }
        ]
      },
      {
        customerName: 'Ana Costa',
        customerEmail: 'ana@email.com',
        customerPhone: '+55 11 66666-6666',
        customerAddress: 'Rua Oscar Freire, 321 - São Paulo, SP',
        total: 1799.99,
        status: 'PENDING',
        notes: 'Método de pago: PIX',
        userId: null, // Orden sin usuario registrado
        items: [
          {
            productId: products[4].id,
            quantity: 1,
            price: products[4].price
          }
        ]
      }
    ]

    // Crear órdenes en la base de datos
    for (const orderData of orders) {
      const order = await prisma.order.create({
        data: {
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          customerAddress: orderData.customerAddress,
          total: orderData.total,
          status: orderData.status,
          notes: orderData.notes,
          userId: orderData.userId,
          items: {
            create: orderData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      })

      console.log(`✅ Orden creada: ${order.id} - ${order.customerName} - $${order.total}`)
    }

    console.log(`🎉 ¡${orders.length} órdenes de prueba creadas!`)
    console.log('📊 Resumen:')
    console.log(`   - Órdenes pendientes: ${orders.filter(o => o.status === 'PENDING').length}`)
    console.log(`   - Órdenes confirmadas: ${orders.filter(o => o.status === 'CONFIRMED').length}`)
    console.log(`   - Órdenes completadas: ${orders.filter(o => o.status === 'COMPLETED').length}`)

  } catch (error) {
    console.error('❌ Error creando órdenes:', error)
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
