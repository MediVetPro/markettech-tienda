const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixUserCredentials() {
  try {
    console.log('🔧 Corrigiendo credenciales de usuarios...')

    // Buscar usuarios ADMIN_VENDAS
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN_VENDAS' }
    })

    console.log(`\n👥 Encontrados ${users.length} usuarios ADMIN_VENDAS:`)

    for (const user of users) {
      console.log(`\n👤 Usuario: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Password actual: ${user.password}`)

      // Verificar si la contraseña es correcta
      const isPasswordValid = await bcrypt.compare('password123', user.password)
      console.log(`   Password válida: ${isPasswordValid ? 'Sí' : 'No'}`)

      if (!isPasswordValid) {
        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash('password123', 10)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        })
        console.log(`   ✅ Contraseña actualizada`)
      }

      // Verificar productos del usuario
      const userProducts = await prisma.product.findMany({
        where: { userId: user.id },
        include: { images: true }
      })
      
      console.log(`   📦 Productos: ${userProducts.length}`)
      userProducts.forEach(product => {
        console.log(`      - ${product.title} (${product.images.length} imágenes)`)
      })
    }

    console.log('\n🎉 Credenciales verificadas y corregidas!')
    console.log('\n📋 Para hacer login, usa:')
    console.log('   Email: paul790905@gmail.com')
    console.log('   Password: password123')
    console.log('   O')
    console.log('   Email: maria.silva@techstore.com')
    console.log('   Password: password123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserCredentials()
