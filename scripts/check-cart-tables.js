const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCartTables() {
  try {
    console.log('🔍 Verificando estructura de tablas del carrito...\n')

    // Verificar si existe la tabla user_carts
    try {
      const userCarts = await prisma.userCart.findMany({
        take: 1
      })
      console.log('✅ Tabla user_carts existe')
    } catch (error) {
      console.log('❌ Tabla user_carts NO existe:', error.message)
    }

    // Verificar si existe la tabla cart_items
    try {
      const cartItems = await prisma.cartItem.findMany({
        take: 1
      })
      console.log('✅ Tabla cart_items existe')
    } catch (error) {
      console.log('❌ Tabla cart_items NO existe:', error.message)
    }

    // Verificar usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cart: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    price: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log(`\n👥 Usuarios encontrados: ${users.length}`)
    
    users.forEach(user => {
      console.log(`\n👤 Usuario: ${user.name} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      if (user.cart) {
        console.log(`   🛒 Carrito: ${user.cart.items.length} items`)
        user.cart.items.forEach(item => {
          console.log(`      - ${item.product.title}: ${item.quantity} x $${item.product.price}`)
        })
      } else {
        console.log(`   🛒 Carrito: No tiene carrito`)
      }
    })

    // Verificar productos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        stock: true
      },
      take: 5
    })

    console.log(`\n📦 Productos encontrados: ${products.length}`)
    products.forEach(product => {
      console.log(`   - ${product.title}: $${product.price} (Stock: ${product.stock})`)
    })

  } catch (error) {
    console.error('❌ Error verificando tablas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCartTables()
