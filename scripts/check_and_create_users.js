const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAndCreateUsers() {
  try {
    console.log('🔍 Verificando usuarios existentes...')

    // Verificar Paul
    let paul = await prisma.user.findFirst({
      where: { email: 'paul790905@gmail.com' }
    })

    if (!paul) {
      paul = await prisma.user.create({
        data: {
          name: 'Paul Romero Garcia',
          email: 'paul790905@gmail.com',
          password: 'password123',
          phone: '+55 41 99999-9999',
          role: 'ADMIN_VENDAS',
          cpf: '12345678901',
          birthDate: new Date('1990-01-15'),
          gender: 'MALE',
          address: 'Rua das Flores, 123',
          city: 'Curitiba',
          state: 'PR',
          zipCode: '80000-000',
          country: 'Brasil',
          newsletter: true
        }
      })
      console.log(`✅ Paul creado: ${paul.name} (${paul.email})`)
    } else {
      console.log(`👤 Paul ya existe: ${paul.name} (${paul.email})`)
    }

    // Verificar Maria
    let maria = await prisma.user.findFirst({
      where: { email: 'maria.silva@techstore.com' }
    })

    if (!maria) {
      maria = await prisma.user.create({
        data: {
          name: 'Maria Silva',
          email: 'maria.silva@techstore.com',
          password: 'password123',
          phone: '+55 11 98765-4321',
          role: 'ADMIN_VENDAS',
          cpf: '98765432100',
          birthDate: new Date('1985-06-15'),
          gender: 'FEMALE',
          address: 'Rua das Palmeiras, 456',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil',
          newsletter: true
        }
      })
      console.log(`✅ Maria creada: ${maria.name} (${maria.email})`)
    } else {
      console.log(`👤 Maria ya existe: ${maria.name} (${maria.email})`)
    }

    console.log('🎉 Usuarios listos!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateUsers()
