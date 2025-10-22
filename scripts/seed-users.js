const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedUsers() {
  try {
    console.log('🌱 Iniciando seed de usuarios...')

    // Limpiar usuarios existentes (opcional)
    await prisma.user.deleteMany({})
    console.log('🧹 Usuarios existentes eliminados')

    // Crear usuarios de prueba
    const users = [
      {
        name: 'Admin Smartesh',
        email: 'admin@markettech.com',
        phone: '(11) 99999-9999',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 88888-8888',
        password: 'client123',
        role: 'CLIENT'
      },
      {
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '(11) 77777-7777',
        password: 'client123',
        role: 'CLIENT'
      },
      {
        name: 'Pedro Costa',
        email: 'pedro@email.com',
        phone: '(11) 66666-6666',
        password: 'client123',
        role: 'CLIENT'
      },
      {
        name: 'Ana Oliveira',
        email: 'ana@email.com',
        phone: '(11) 55555-5555',
        password: 'client123',
        role: 'CLIENT'
      },
      {
        name: 'Carlos Ferreira',
        email: 'carlos@email.com',
        phone: '(11) 44444-4444',
        password: 'client123',
        role: 'CLIENT'
      }
    ]

    // Crear usuarios en la base de datos
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData
      })
      console.log(`✅ Usuario creado: ${user.name} (${user.email})`)
    }

    console.log('🎉 Seed de usuarios completado exitosamente!')
    console.log(`📊 Total de usuarios creados: ${users.length}`)

  } catch (error) {
    console.error('❌ Error durante el seed de usuarios:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers()
