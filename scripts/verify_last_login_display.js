const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyLastLoginDisplay() {
  try {
    console.log('🔍 Verificando datos de último acceso para mostrar en la interfaz...')

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
    console.log('\n📋 Datos que se mostrarán en la columna "Último Acesso":')
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. 👤 ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      
      if (user.lastLoginAt) {
        const lastLogin = new Date(user.lastLoginAt)
        const formattedDate = lastLogin.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        console.log(`   ✅ Último acceso: ${formattedDate}`)
      } else {
        console.log(`   ❌ Último acceso: Nunca`)
      }
    })

    console.log('\n🎯 Verificación completada. Los datos están listos para mostrar en la interfaz.')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyLastLoginDisplay()
