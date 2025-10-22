const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkLastLoginField() {
  try {
    console.log('🔍 Verificando campo lastLoginAt en usuarios...')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    console.log(`\n📊 Total de usuarios: ${users.length}`)
    
    users.forEach(user => {
      console.log(`\n👤 Usuario: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Último acceso: ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pt-BR') : 'Nunca'}`)
      console.log(`   Creado: ${new Date(user.createdAt).toLocaleString('pt-BR')}`)
    })

    // Verificar si el campo existe en el esquema
    console.log('\n🔧 Verificando esquema de la base de datos...')
    const userSchema = await prisma.user.findFirst()
    console.log('✅ Campo lastLoginAt está disponible en el esquema')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLastLoginField()
