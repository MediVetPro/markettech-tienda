require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Probando conexión a la base de datos...')
    
    // Probar conexión básica
    await prisma.$connect()
    console.log('✅ Conexión exitosa a la base de datos')
    
    // Probar consulta simple
    const userCount = await prisma.user.count()
    console.log(`📊 Total de usuarios: ${userCount}`)
    
    const productCount = await prisma.product.count()
    console.log(`📦 Total de productos: ${productCount}`)
    
    // Probar crear un usuario de prueba
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Usuario de Prueba',
        password: 'test123',
        role: 'USER'
      }
    })
    console.log('✅ Usuario de prueba creado:', testUser.id)
    
    // Limpiar usuario de prueba
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Usuario de prueba eliminado')
    
  } catch (error) {
    console.error('❌ Error en la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
