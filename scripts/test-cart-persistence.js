const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCartPersistence() {
  try {
    console.log('🧪 Probando persistencia del carrito...\n')

    // 1. Verificar usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    console.log('👥 Usuarios en la base de datos:')
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ID: ${user.id}`)
    })

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos')
      return
    }

    // 2. Verificar productos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        stock: true
      },
      take: 3
    })

    console.log('\n📦 Productos disponibles:')
    products.forEach(product => {
      console.log(`   - ${product.title} - $${product.price} (Stock: ${product.stock})`)
    })

    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos')
      return
    }

    // 3. Probar crear carrito para un usuario
    const testUser = users[0]
    console.log(`\n🛒 Probando carrito para usuario: ${testUser.name}`)

    // Crear carrito de prueba
    const testCart = await prisma.userCart.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        items: {
          create: products.slice(0, 2).map(product => ({
            productId: product.id,
            quantity: Math.floor(Math.random() * 3) + 1
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                price: true
              }
            }
          }
        }
      }
    })

    console.log('✅ Carrito creado exitosamente:')
    testCart.items.forEach(item => {
      console.log(`   - ${item.product.title}: ${item.quantity} x $${item.product.price}`)
    })

    // 4. Verificar que se puede leer el carrito
    const retrievedCart = await prisma.userCart.findUnique({
      where: { userId: testUser.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (retrievedCart) {
      console.log('\n✅ Carrito recuperado exitosamente:')
      retrievedCart.items.forEach(item => {
        console.log(`   - ${item.product.title}: ${item.quantity} x $${item.product.price}`)
      })
    } else {
      console.log('❌ No se pudo recuperar el carrito')
    }

    // 5. Probar actualizar carrito
    console.log('\n🔄 Probando actualización del carrito...')
    
    await prisma.$transaction(async (tx) => {
      // Eliminar items existentes
      await tx.cartItem.deleteMany({
        where: { userCartId: testCart.id }
      })

      // Agregar nuevos items
      await tx.cartItem.createMany({
        data: products.slice(1, 3).map(product => ({
          userCartId: testCart.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 2) + 1
        }))
      })
    })

    const updatedCart = await prisma.userCart.findUnique({
      where: { userId: testUser.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                price: true
              }
            }
          }
        }
      }
    })

    console.log('✅ Carrito actualizado:')
    updatedCart.items.forEach(item => {
      console.log(`   - ${item.product.title}: ${item.quantity} x $${item.product.price}`)
    })

    console.log('\n🎉 Prueba de persistencia completada exitosamente!')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCartPersistence()
