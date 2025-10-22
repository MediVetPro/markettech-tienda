const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCurrentProducts() {
  try {
    console.log('🔍 Verificando productos actuales...')

    // Verificar todos los productos
    const allProducts = await prisma.product.findMany({
      include: {
        user: true,
        images: true
      }
    })

    console.log(`\n📦 Total de productos en la base de datos: ${allProducts.length}`)
    
    allProducts.forEach(product => {
      console.log(`\n📦 Producto: ${product.title}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Usuario: ${product.user ? product.user.name : 'SIN USUARIO'}`)
      console.log(`   UserId: ${product.userId || 'NULL'}`)
      console.log(`   Imágenes: ${product.images.length}`)
    })

    // Verificar usuarios ADMIN_VENDAS
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN_VENDAS' }
    })

    console.log(`\n👥 Usuarios ADMIN_VENDAS:`)
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`)
    })

    // Verificar productos por usuario
    for (const user of users) {
      const userProducts = await prisma.product.findMany({
        where: { userId: user.id },
        include: { images: true }
      })
      
      console.log(`\n📦 Productos de ${user.name}:`)
      if (userProducts.length > 0) {
        userProducts.forEach(product => {
          console.log(`  - ${product.title} (${product.images.length} imágenes)`)
        })
      } else {
        console.log('  Sin productos')
      }
    }

    // Verificar si hay productos sin usuario
    const productsWithoutUser = await prisma.product.findMany({
      where: { userId: null }
    })
    
    if (productsWithoutUser.length > 0) {
      console.log(`\n❌ ${productsWithoutUser.length} productos sin usuario asignado:`)
      productsWithoutUser.forEach(product => {
        console.log(`  - ${product.title}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentProducts()
