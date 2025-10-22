const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updatePaulPassword() {
  try {
    console.log('🔧 Actualizando contraseña de Paul...')

    // Buscar el usuario Paul
    const paul = await prisma.user.findFirst({
      where: { email: 'paul790905@gmail.com' }
    })

    if (!paul) {
      console.log('❌ No se encontró el usuario Paul')
      return
    }

    console.log(`\n👤 Usuario encontrado: ${paul.name}`)
    console.log(`   Email: ${paul.email}`)

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash('Romero12345@', 10)

    // Actualizar la contraseña
    const updatedPaul = await prisma.user.update({
      where: { id: paul.id },
      data: {
        password: hashedPassword
      }
    })

    console.log('\n✅ Contraseña actualizada exitosamente')
    console.log(`   Usuario: ${updatedPaul.name}`)
    console.log(`   Email: ${updatedPaul.email}`)
    console.log(`   Nueva contraseña: Romero12345@`)

    // Verificar que la contraseña funciona
    const isPasswordValid = await bcrypt.compare('Romero12345@', updatedPaul.password)
    console.log(`   Contraseña verificada: ${isPasswordValid ? 'Sí' : 'No'}`)

  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePaulPassword()
