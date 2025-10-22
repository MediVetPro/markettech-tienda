const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkLastLoginData() {
  try {
    console.log('🔍 Verificando campo lastLoginAt en la base de datos...\n')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    console.log(`📊 Total de usuarios: ${users.length}\n`)

    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   lastLoginAt: ${user.lastLoginAt || 'NULL'}`)
      console.log(`   createdAt: ${user.createdAt}`)
      console.log('')
    })

    // Verificar si el campo existe en el esquema
    console.log('🔍 Verificando esquema de la base de datos...')
    const schema = await prisma.$queryRaw`PRAGMA table_info(User)`
    console.log('📋 Campos en la tabla User:')
    schema.forEach(field => {
      console.log(`   - ${field.name}: ${field.type}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLastLoginData()
