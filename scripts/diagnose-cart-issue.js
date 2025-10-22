const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function diagnoseCartIssue() {
  try {
    console.log('🔍 DIAGNÓSTICO DEL PROBLEMA DEL CARRITO')
    console.log('=' .repeat(50))

    // 1. Verificar conexión a la base de datos
    console.log('\n1️⃣ Verificando conexión a la base de datos...')
    await prisma.$connect()
    console.log('✅ Conexión exitosa')

    // 2. Verificar usuarios
    console.log('\n2️⃣ Verificando usuarios...')
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

    console.log(`📊 Total de usuarios: ${users.length}`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`)
      console.log(`      ID: ${user.id}`)
      console.log(`      Carrito: ${user.cart ? 'Sí' : 'No'}`)
      if (user.cart) {
        console.log(`      Items: ${user.cart.items.length}`)
        user.cart.items.forEach(item => {
          console.log(`        - ${item.product.title}: ${item.quantity} x $${item.product.price}`)
        })
      }
    })

    // 3. Verificar productos
    console.log('\n3️⃣ Verificando productos...')
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        stock: true
      },
      take: 5
    })

    console.log(`📦 Total de productos: ${products.length}`)
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title} - $${product.price} (Stock: ${product.stock})`)
    })

    // 4. Verificar carritos
    console.log('\n4️⃣ Verificando carritos...')
    const carts = await prisma.userCart.findMany({
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
      }
    })

    console.log(`🛒 Total de carritos: ${carts.length}`)
    carts.forEach((cart, index) => {
      console.log(`   ${index + 1}. Usuario: ${cart.user.name}`)
      console.log(`      Carrito ID: ${cart.id}`)
      console.log(`      Items: ${cart.items.length}`)
      cart.items.forEach(item => {
        console.log(`        - ${item.product.title}: ${item.quantity} x $${item.product.price}`)
      })
    })

    // 5. Verificar items del carrito
    console.log('\n5️⃣ Verificando items del carrito...')
    const cartItems = await prisma.cartItem.findMany({
      include: {
        userCart: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        product: {
          select: {
            title: true,
            price: true
          }
        }
      }
    })

    console.log(`🛍️ Total de items en carritos: ${cartItems.length}`)
    cartItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.product.title} (${item.quantity} x $${item.product.price})`)
      console.log(`      Usuario: ${item.userCart.user.name}`)
      console.log(`      Carrito ID: ${item.userCartId}`)
    })

    // 6. Crear un carrito de prueba si no existe
    if (users.length > 0 && products.length > 0 && carts.length === 0) {
      console.log('\n6️⃣ Creando carrito de prueba...')
      const testUser = users[0]
      const testProducts = products.slice(0, 2)

      const testCart = await prisma.userCart.create({
        data: {
          userId: testUser.id,
          items: {
            create: testProducts.map(product => ({
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

      console.log('✅ Carrito de prueba creado:')
      console.log(`   Usuario: ${testUser.name}`)
      console.log(`   Carrito ID: ${testCart.id}`)
      console.log(`   Items: ${testCart.items.length}`)
      testCart.items.forEach(item => {
        console.log(`     - ${item.product.title}: ${item.quantity} x $${item.product.price}`)
      })
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETADO')
    console.log('=' .repeat(50))
    console.log('📋 RESUMEN:')
    console.log(`   - Usuarios: ${users.length}`)
    console.log(`   - Productos: ${products.length}`)
    console.log(`   - Carritos: ${carts.length}`)
    console.log(`   - Items en carritos: ${cartItems.length}`)

    if (users.length === 0) {
      console.log('\n⚠️ PROBLEMA: No hay usuarios en la base de datos')
      console.log('   Solución: Crear usuarios primero')
    }

    if (products.length === 0) {
      console.log('\n⚠️ PROBLEMA: No hay productos en la base de datos')
      console.log('   Solución: Ejecutar el seed de productos')
    }

    if (carts.length === 0 && users.length > 0 && products.length > 0) {
      console.log('\n⚠️ PROBLEMA: No hay carritos creados')
      console.log('   Solución: Los carritos se crean automáticamente cuando se agregan productos')
    }

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseCartIssue()
