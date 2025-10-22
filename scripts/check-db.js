const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Verificando base de datos...')

    // Verificar usuarios
    const userCount = await prisma.user.count()
    console.log(`👥 Usuarios: ${userCount}`)
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { name: true, email: true, role: true }
      })
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`)
      })
    }

    // Verificar productos
    const productCount = await prisma.product.count()
    console.log(`📱 Productos: ${productCount}`)
    
    if (productCount > 0) {
      const products = await prisma.product.findMany({
        select: { id: true, title: true, price: true, stock: true, status: true }
      })
      products.forEach(product => {
        console.log(`   - ${product.title} - $${product.price} (Stock: ${product.stock}) - ${product.status}`)
      })
    }

    // Verificar configuración
    const configCount = await prisma.siteConfig.count()
    console.log(`⚙️ Configuraciones: ${configCount}`)
    
    if (configCount > 0) {
      const configs = await prisma.siteConfig.findMany({
        select: { key: true, value: true }
      })
      configs.forEach(config => {
        console.log(`   - ${config.key}: ${config.value.substring(0, 50)}...`)
      })
    }

    // Verificar órdenes
    const orderCount = await prisma.order.count()
    console.log(`🛒 Órdenes: ${orderCount}`)

    console.log('\n📊 Resumen:')
    console.log(`   Total registros: ${userCount + productCount + configCount + orderCount}`)
    
    if (productCount === 0) {
      console.log('\n⚠️  No hay productos en la base de datos.')
      console.log('💡 Ejecuta: npm run seed:simple')
    } else {
      console.log('\n✅ Base de datos tiene datos. El panel de admin debería mostrar productos reales.')
    }

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error)
  }
}

checkDatabase()
  .finally(async () => {
    await prisma.$disconnect()
  })
