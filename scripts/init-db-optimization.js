#!/usr/bin/env node

/**
 * Script para inicializar optimizaciones de base de datos
 * Ejecutar con: node scripts/init-db-optimization.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando optimización de base de datos...')
  
  try {
    // Crear índices
    console.log('📊 Creando índices de base de datos...')
    
    // Índices para la tabla products
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)
    `
    console.log('✅ Índice idx_products_status creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(userId)
    `
    console.log('✅ Índice idx_products_user_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_categories ON products(categories)
    `
    console.log('✅ Índice idx_products_categories creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)
    `
    console.log('✅ Índice idx_products_price creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(createdAt)
    `
    console.log('✅ Índice idx_products_created_at creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_manufacturer_code ON products(manufacturerCode)
    `
    console.log('✅ Índice idx_products_manufacturer_code creado')
    
    // Índices para la tabla orders
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(userId)
    `
    console.log('✅ Índice idx_orders_user_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `
    console.log('✅ Índice idx_orders_status creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt)
    `
    console.log('✅ Índice idx_orders_created_at creado')
    
    // Índices para la tabla order_items
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(orderId)
    `
    console.log('✅ Índice idx_order_items_order_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(productId)
    `
    console.log('✅ Índice idx_order_items_product_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON order_items(sellerId)
    `
    console.log('✅ Índice idx_order_items_seller_id creado')
    
    // Índices para la tabla users
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `
    console.log('✅ Índice idx_users_email creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `
    console.log('✅ Índice idx_users_role creado')
    
    // Índices para la tabla product_images
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(productId)
    `
    console.log('✅ Índice idx_product_images_product_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(productId, "order")
    `
    console.log('✅ Índice idx_product_images_order creado')
    
    // Índices para la tabla user_carts
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_user_cart_user_id ON user_carts(userId)
    `
    console.log('✅ Índice idx_user_cart_user_id creado')
    
    // Índices para la tabla cart_items
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(userCartId)
    `
    console.log('✅ Índice idx_cart_items_cart_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(productId)
    `
    console.log('✅ Índice idx_cart_items_product_id creado')
    
    // Índices para la tabla product_ratings
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_product_ratings_product_id ON product_ratings(productId)
    `
    console.log('✅ Índice idx_product_ratings_product_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_product_ratings_user_id ON product_ratings(userId)
    `
    console.log('✅ Índice idx_product_ratings_user_id creado')
    
    // Índices compuestos para consultas complejas
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_status_price ON products(status, price)
    `
    console.log('✅ Índice compuesto idx_products_status_price creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_user_status ON products(userId, status)
    `
    console.log('✅ Índice compuesto idx_products_user_status creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(userId, status)
    `
    console.log('✅ Índice compuesto idx_orders_user_status creado')
    
    // Obtener estadísticas de la base de datos
    console.log('\n📊 Estadísticas de la base de datos:')
    const stats = await prisma.$queryRaw`
      SELECT 
        'products' as table_name,
        COUNT(*) as row_count
      FROM products
      UNION ALL
      SELECT 
        'orders' as table_name,
        COUNT(*) as row_count
      FROM orders
      UNION ALL
      SELECT 
        'order_items' as table_name,
        COUNT(*) as row_count
      FROM order_items
      UNION ALL
      SELECT 
        'users' as table_name,
        COUNT(*) as row_count
      FROM users
      UNION ALL
      SELECT 
        'product_images' as table_name,
        COUNT(*) as row_count
      FROM product_images
    `
    
    console.table(stats)
    
    // Probar rendimiento de consultas
    console.log('\n⚡ Probando rendimiento de consultas...')
    
    const startTime = Date.now()
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        price: true,
        images: {
          select: {
            id: true,
            path: true,
            alt: true,
            order: true
          },
          orderBy: { order: 'asc' },
          take: 1
        }
      },
      take: 10
    })
    const queryTime = Date.now() - startTime
    
    console.log(`⏱️ Consulta de productos optimizada: ${queryTime}ms`)
    console.log(`📦 Productos encontrados: ${products.length}`)
    
    console.log('\n🎉 ¡Optimización de base de datos completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error durante la optimización:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
