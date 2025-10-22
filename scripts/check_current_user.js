const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function checkCurrentUser() {
  try {
    console.log('🔍 Verificando usuario actual...')

    // Verificar todos los usuarios ADMIN_VENDAS
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN_VENDAS' }
    })
    
    console.log('\n👥 Usuarios ADMIN_VENDAS disponibles:')
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
          console.log(`- ${product.title} (${product.images.length} imágenes)`)
        })
      } else {
        console.log('  Sin productos')
      }
    }

    // Verificar si hay algún token en localStorage (simulado)
    console.log('\n🔑 Para probar, puedes usar estos tokens:')
    const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here'
    
    for (const user of users) {
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      console.log(`\nToken para ${user.name}:`)
      console.log(token)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentUser()
