const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🔧 Creando usuario de prueba...')
    
    // Verificar si ya existe
    const existingUser = await prisma.user.findFirst({
      where: { email: 'test@markettech.com' }
    })
    
    if (existingUser) {
      console.log('✅ Usuario de prueba ya existe')
      return
    }
    
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('test123', 10)
    
    const user = await prisma.user.create({
      data: {
        name: 'Usuario de Prueba',
        email: 'test@markettech.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Usuario de prueba creado exitosamente:')
    console.log(`   Email: test@markettech.com`)
    console.log(`   Contraseña: test123`)
    console.log(`   Rol: ADMIN`)
    console.log(`   ID: ${user.id}`)
    
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
