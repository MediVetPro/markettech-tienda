const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminAccount() {
  try {
    console.log('🔧 Creando cuenta de administrador principal...')

    // Verificar si ya existe
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@markettech.com' }
    })

    if (existingAdmin) {
      console.log('⚠️ La cuenta de administrador ya existe')
      return
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('Admin12345@', 10)

    // Crear la cuenta de administrador
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador Principal',
        email: 'admin@markettech.com',
        password: hashedPassword,
        phone: '41999999999',
        cpf: '000.000.000-00',
        address: 'Rua Principal 123',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80000-000',
        country: 'Brasil',
        role: 'ADMIN'
      }
    })

    console.log('\n✅ Cuenta de administrador creada exitosamente:')
    console.log(`   Nombre: ${admin.name}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   ID: ${admin.id}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Teléfono: ${admin.phone}`)
    console.log(`   CPF: ${admin.cpf}`)
    console.log(`   Dirección: ${admin.address}`)
    console.log(`   Ciudad: ${admin.city}`)
    console.log(`   Estado: ${admin.state}`)
    console.log(`   CEP: ${admin.zipCode}`)
    console.log(`   País: ${admin.country}`)

    console.log('\n🔐 Credenciales de acceso:')
    console.log(`   Email: admin@markettech.com`)
    console.log(`   Contraseña: Admin12345@`)

    // Verificar que la contraseña funciona
    const isPasswordValid = await bcrypt.compare('Admin12345@', admin.password)
    console.log(`   Contraseña verificada: ${isPasswordValid ? 'Sí' : 'No'}`)

  } catch (error) {
    console.error('❌ Error creando cuenta de administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminAccount()
