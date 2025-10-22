const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDatabase() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...\n')

    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Conexión a la base de datos exitosa')

    // Verificar tablas principales
    const tables = [
      { name: 'users', query: () => prisma.user.count() },
      { name: 'products', query: () => prisma.product.count() },
      { name: 'user_carts', query: () => prisma.userCart.count() },
      { name: 'cart_items', query: () => prisma.cartItem.count() },
      { name: 'orders', query: () => prisma.order.count() },
      { name: 'order_items', query: () => prisma.orderItem.count() }
    ]

    console.log('\n📊 Conteo de registros por tabla:')
    for (const table of tables) {
      try {
        const count = await table.query()
        console.log(`   ${table.name}: ${count} registros`)
      } catch (error) {
        console.log(`   ${table.name}: ❌ Error - ${error.message}`)
      }
    }

    // Verificar estructura de UserCart
    console.log('\n🛒 Verificando estructura de UserCart:')
    try {
      const userCarts = await prisma.userCart.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
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
        },
        take: 3
      })

      if (userCarts.length > 0) {
        console.log('✅ UserCart funciona correctamente')
        userCarts.forEach(cart => {
          console.log(`   Usuario: ${cart.user.name} (${cart.user.email})`)
          console.log(`   Items: ${cart.items.length}`)
          cart.items.forEach(item => {
            console.log(`     - ${item.product.title}: ${item.quantity} x $${item.product.price}`)
          })
        })
      } else {
        console.log('ℹ️  No hay carritos en la base de datos')
      }
    } catch (error) {
      console.log('❌ Error verificando UserCart:', error.message)
    }

    // Verificar relaciones
    console.log('\n🔗 Verificando relaciones:')
    try {
      const usersWithCarts = await prisma.user.findMany({
        where: {
          cart: {
            isNot: null
          }
        },
        include: {
          cart: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      title: true
                    }
                  }
                }
              }
            }
          }
        },
        take: 2
      })

      console.log(`✅ ${usersWithCarts.length} usuarios tienen carritos`)
      usersWithCarts.forEach(user => {
        console.log(`   ${user.name}: ${user.cart?.items.length || 0} items`)
      })
    } catch (error) {
      console.log('❌ Error verificando relaciones:', error.message)
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabase()
