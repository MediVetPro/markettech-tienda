const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createClientUsers() {
  try {
    console.log('🔧 Creando usuarios clientes...')

    // Hashear la contraseña (misma que Paul)
    const hashedPassword = await bcrypt.hash('Romero12345@', 10)

    // Crear primer cliente
    const client1 = await prisma.user.create({
      data: {
        name: 'Ana Silva Santos',
        email: 'ana.silva@email.com',
        password: hashedPassword,
        phone: '41987654321',
        cpf: '123.456.789-01',
        address: 'Rua das Flores 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil',
        role: 'CLIENT'
      }
    })

    console.log('\n✅ Primer cliente creado:')
    console.log(`   Nombre: ${client1.name}`)
    console.log(`   Email: ${client1.email}`)
    console.log(`   ID: ${client1.id}`)
    console.log(`   Role: ${client1.role}`)
    console.log(`   Teléfono: ${client1.phone}`)
    console.log(`   CPF: ${client1.cpf}`)
    console.log(`   Dirección: ${client1.address}`)
    console.log(`   Ciudad: ${client1.city}`)
    console.log(`   Estado: ${client1.state}`)
    console.log(`   CEP: ${client1.zipCode}`)
    console.log(`   País: ${client1.country}`)

    // Crear segundo cliente
    const client2 = await prisma.user.create({
      data: {
        name: 'Carlos Eduardo Lima',
        email: 'carlos.lima@email.com',
        password: hashedPassword,
        phone: '41912345678',
        cpf: '987.654.321-00',
        address: 'Avenida Brasil 789',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000',
        country: 'Brasil',
        role: 'CLIENT'
      }
    })

    console.log('\n✅ Segundo cliente creado:')
    console.log(`   Nombre: ${client2.name}`)
    console.log(`   Email: ${client2.email}`)
    console.log(`   ID: ${client2.id}`)
    console.log(`   Role: ${client2.role}`)
    console.log(`   Teléfono: ${client2.phone}`)
    console.log(`   CPF: ${client2.cpf}`)
    console.log(`   Dirección: ${client2.address}`)
    console.log(`   Ciudad: ${client2.city}`)
    console.log(`   Estado: ${client2.state}`)
    console.log(`   CEP: ${client2.zipCode}`)
    console.log(`   País: ${client2.country}`)

    console.log('\n🔐 Credenciales de acceso para ambos clientes:')
    console.log(`   Contraseña: Romero12345@`)

    // Verificar que la contraseña funciona
    const isPasswordValid = await bcrypt.compare('Romero12345@', client1.password)
    console.log(`   Contraseña verificada: ${isPasswordValid ? 'Sí' : 'No'}`)

    // Mostrar resumen de todos los usuarios
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
    console.error('❌ Error creando usuarios clientes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createClientUsers()
