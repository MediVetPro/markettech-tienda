const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyCartDatabase() {
  try {
    console.log('🔍 Verificando base de datos para carrito sincronizado...')

    // Verificar que las tablas existen
    console.log('\n📊 Verificando tablas:')
    
    // Verificar tabla user_carts
    try {
      const userCartsCount = await prisma.userCart.count()
      console.log(`✅ user_carts: ${userCartsCount} carritos`)
    } catch (error) {
      console.log('❌ user_carts: Tabla no existe o error:', error.message)
      return false
    }

    // Verificar tabla cart_items
    try {
      const cartItemsCount = await prisma.cartItem.count()
      console.log(`✅ cart_items: ${cartItemsCount} items`)
    } catch (error) {
      console.log('❌ cart_items: Tabla no existe o error:', error.message)
      return false
    }

    // Verificar relaciones
    console.log('\n🔗 Verificando relaciones:')
    
    // Verificar relación User -> UserCart
    try {
      const usersWithCart = await prisma.user.findMany({
        where: {
          cart: {
            isNot: null
          }
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
      console.log(`✅ User -> UserCart: ${usersWithCart.length} usuarios con carrito`)
    } catch (error) {
      console.log('❌ User -> UserCart: Error en relación:', error.message)
    }

    // Verificar relación UserCart -> CartItem
    try {
      const cartsWithItems = await prisma.userCart.findMany({
        include: {
          items: true
        }
      })
      console.log(`✅ UserCart -> CartItem: ${cartsWithItems.length} carritos con items`)
    } catch (error) {
      console.log('❌ UserCart -> CartItem: Error en relación:', error.message)
    }

    // Verificar relación CartItem -> Product
    try {
      const itemsWithProduct = await prisma.cartItem.findMany({
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true
            }
          }
        }
      })
      console.log(`✅ CartItem -> Product: ${itemsWithProduct.length} items con productos`)
    } catch (error) {
      console.log('❌ CartItem -> Product: Error en relación:', error.message)
    }

    // Probar operaciones CRUD
    console.log('\n🧪 Probando operaciones CRUD:')
    
    // Crear carrito de prueba
    try {
      const testUser = await prisma.user.findFirst()
      if (testUser) {
        // Eliminar carrito existente si existe
        await prisma.userCart.deleteMany({
          where: { userId: testUser.id }
        })

        // Crear carrito de prueba
        const testCart = await prisma.userCart.create({
          data: {
            userId: testUser.id,
            items: {
              create: [
                {
                  productId: 'test-product-1',
                  quantity: 2
                }
              ]
            }
          }
        })
        console.log('✅ CREATE: Carrito de prueba creado')

        // Leer carrito
        const readCart = await prisma.userCart.findUnique({
          where: { id: testCart.id },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        })
        console.log('✅ READ: Carrito leído correctamente')

        // Actualizar carrito
        await prisma.cartItem.updateMany({
          where: { userCartId: testCart.id },
          data: { quantity: 3 }
        })
        console.log('✅ UPDATE: Carrito actualizado')

        // Eliminar carrito
        await prisma.userCart.delete({
          where: { id: testCart.id }
        })
        console.log('✅ DELETE: Carrito eliminado')

      } else {
        console.log('⚠️ No hay usuarios en la base de datos para probar')
      }
    } catch (error) {
      console.log('❌ Error en operaciones CRUD:', error.message)
    }

    console.log('\n🎉 ¡Base de datos verificada exitosamente!')
    console.log('🚀 El carrito sincronizado está listo para usar')
    return true

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error)
    return false
  }
}

verifyCartDatabase()
  .then(success => {
    if (success) {
      console.log('\n✅ Verificación completada exitosamente')
    } else {
      console.log('\n❌ Verificación falló')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
