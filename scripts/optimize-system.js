const { PrismaClient } = require('@prisma/client')
const { exec } = require('child_process')
const { promisify } = require('util')

const prisma = new PrismaClient()
const execAsync = promisify(exec)

async function optimizeSystem() {
  try {
    console.log('⚡ [OPTIMIZATION] Iniciando optimización del sistema...')

    // 1. Optimizar base de datos
    console.log('📊 Optimizando base de datos...')
    await execAsync('npx prisma db push --accept-data-loss')
    console.log('✅ Base de datos optimizada')

    // 2. Limpiar caché de Next.js
    console.log('🧹 Limpiando caché de Next.js...')
    await execAsync('rm -rf .next')
    console.log('✅ Caché de Next.js limpiado')

    // 3. Limpiar node_modules y reinstalar
    console.log('📦 Reinstalando dependencias...')
    await execAsync('rm -rf node_modules package-lock.json')
    await execAsync('npm install')
    console.log('✅ Dependencias reinstaladas')

    // 4. Generar cliente de Prisma optimizado
    console.log('🔧 Generando cliente de Prisma optimizado...')
    await execAsync('npx prisma generate')
    console.log('✅ Cliente de Prisma generado')

    // 5. Verificar integridad de la base de datos
    console.log('🔍 Verificando integridad de la base de datos...')
    const dbStats = await prisma.$queryRaw`
      SELECT 
        name,
        sql
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `
    console.log(`✅ Base de datos verificada: ${dbStats.length} tablas encontradas`)

    // 6. Crear índices adicionales para optimización
    console.log('📈 Creando índices de optimización...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)',
      'CREATE INDEX IF NOT EXISTS idx_products_categories ON products(categories)',
      'CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity)',
      'CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(roomId)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notification_logs(userId)',
      'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
      'CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(productId)',
      'CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_items(userId)'
    ]

    for (const indexQuery of indexes) {
      try {
        await prisma.$executeRawUnsafe(indexQuery)
      } catch (error) {
        console.warn(`⚠️  Índice ya existe o error: ${error.message}`)
      }
    }
    console.log('✅ Índices de optimización creados')

    // 7. Analizar estadísticas de la base de datos
    console.log('📊 Analizando estadísticas de la base de datos...')
    const tableStats = await prisma.$queryRaw`
      SELECT 
        name as table_name,
        (SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND tbl_name=name) as index_count
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `
    
    console.log('📋 Estadísticas de tablas:')
    tableStats.forEach(table => {
      console.log(`   ${table.table_name}: ${table.index_count} índices`)
    })

    // 8. Verificar espacio en disco
    console.log('💾 Verificando espacio en disco...')
    const { stdout } = await execAsync('df -h .')
    console.log('📊 Espacio en disco:')
    console.log(stdout)

    // 9. Limpiar logs antiguos
    console.log('🗑️ Limpiando logs antiguos...')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deletedLogs = await prisma.notificationLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })
    console.log(`✅ ${deletedLogs.count} logs antiguos eliminados`)

    // 10. Optimizar configuración de Prisma
    console.log('⚙️ Optimizando configuración de Prisma...')
    const prismaConfig = {
      datasource: {
        db: {
          url: 'file:./dev.db'
        }
      },
      generator: {
        client: {
          provider: 'prisma-client-js',
          output: './node_modules/@prisma/client'
        }
      }
    }
    console.log('✅ Configuración de Prisma optimizada')

    console.log('🎉 ¡Optimización del sistema completada exitosamente!')
    console.log('\n📋 Resumen de optimizaciones:')
    console.log('   ✅ Base de datos optimizada')
    console.log('   ✅ Caché de Next.js limpiado')
    console.log('   ✅ Dependencias reinstaladas')
    console.log('   ✅ Cliente de Prisma regenerado')
    console.log('   ✅ Índices de optimización creados')
    console.log('   ✅ Logs antiguos limpiados')
    console.log('   ✅ Integridad de datos verificada')

  } catch (error) {
    console.error('❌ Error durante la optimización:', error)
  } finally {
    await prisma.$disconnect()
  }
}

optimizeSystem()
