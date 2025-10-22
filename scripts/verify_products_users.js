const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyProductsUsers() {
  try {
    console.log('🔍 Verificando productos y usuarios...')

    // Verificar usuarios
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN_VENDAS' }
    })
    
    console.log('\n👥 Usuarios ADMIN_VENDAS:')
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`)
    })

    // Verificar productos
    const products = await prisma.product.findMany({
      include: {
        user: true,
        images: true
      }
    })
    
    console.log('\n📦 Productos en la base de datos:')
    products.forEach(product => {
      console.log(`- ${product.title}`)
      console.log(`  Usuario: ${product.user ? product.user.name : 'SIN USUARIO'}`)
      console.log(`  UserId: ${product.userId || 'NULL'}`)
      console.log(`  Imágenes: ${product.images.length}`)
      console.log('')
    })

    // Verificar si hay productos sin usuario
    const productsWithoutUser = await prisma.product.findMany({
      where: { userId: null }
    })
    
    if (productsWithoutUser.length > 0) {
      console.log(`❌ ${productsWithoutUser.length} productos sin usuario asignado`)
      
      // Asignar productos a usuarios
      console.log('\n🔧 Asignando productos a usuarios...')
      
      const paul = users.find(u => u.email === 'paul790905@gmail.com')
      const maria = users.find(u => u.email === 'maria.silva@techstore.com')
      
      if (paul && maria) {
        // Asignar los primeros 3 productos a Paul
        const paulProducts = productsWithoutUser.slice(0, 3)
        for (const product of paulProducts) {
          await prisma.product.update({
            where: { id: product.id },
            data: { userId: paul.id }
          })
          console.log(`✅ ${product.title} asignado a Paul`)
        }
        
        // Asignar los siguientes 3 productos a Maria
        const mariaProducts = productsWithoutUser.slice(3, 6)
        for (const product of mariaProducts) {
          await prisma.product.update({
            where: { id: product.id },
            data: { userId: maria.id }
          })
          console.log(`✅ ${product.title} asignado a Maria`)
        }
      }
    } else {
      console.log('✅ Todos los productos tienen usuario asignado')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyProductsUsers()
