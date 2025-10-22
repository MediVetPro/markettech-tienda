const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCurrentUsers() {
  try {
    console.log('🔍 Verificando usuarios actuales...')

    // Verificar todos los usuarios
    const allUsers = await prisma.user.findMany({
      include: {
        products: true
      }
    })

    console.log(`\n👥 Total de usuarios en la base de datos: ${allUsers.length}`)
    
    allUsers.forEach(user => {
      console.log(`\n👤 Usuario: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Productos: ${user.products.length}`)
      console.log(`   Teléfono: ${user.phone || 'No especificado'}`)
      console.log(`   CPF: ${user.cpf || 'No especificado'}`)
      console.log(`   Dirección: ${user.address || 'No especificada'}`)
    })

    // Verificar si hay productos sin usuario
    const productsWithoutUser = await prisma.product.findMany({
      where: { userId: null }
    })
    
    if (productsWithoutUser.length > 0) {
      console.log(`\n❌ ${productsWithoutUser.length} productos sin usuario asignado`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentUsers()
