const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdminAccount() {
  try {
    console.log('🔍 Verificando cuenta de administrador principal...')

    // Buscar la cuenta admin
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@markettech.com' }
    })

    if (admin) {
      console.log('\n✅ Cuenta de administrador encontrada:')
      console.log(`   Nombre: ${admin.name}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   ID: ${admin.id}`)
      console.log(`   Role: ${admin.role}`)
      console.log(`   Teléfono: ${admin.phone || 'No especificado'}`)
      console.log(`   CPF: ${admin.cpf || 'No especificado'}`)
      console.log(`   Dirección: ${admin.address || 'No especificada'}`)
      console.log(`   Ciudad: ${admin.city || 'No especificada'}`)
      console.log(`   Estado: ${admin.state || 'No especificado'}`)
      console.log(`   CEP: ${admin.zipCode || 'No especificado'}`)
      console.log(`   País: ${admin.country || 'No especificado'}`)
    } else {
      console.log('\n❌ Cuenta de administrador NO encontrada')
      console.log('   Necesitamos crear la cuenta admin@markettech.com')
    }

    // Verificar todos los usuarios
    const allUsers = await prisma.user.findMany({
      include: {
        products: true
      }
    })

    console.log(`\n📊 Total de usuarios en la base de datos: ${allUsers.length}`)
    
    allUsers.forEach(user => {
      console.log(`\n👤 Usuario: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Productos: ${user.products.length}`)
    })

  } catch (error) {
    console.error('❌ Error verificando cuenta de administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminAccount()
