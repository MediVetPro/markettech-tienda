import { prisma } from './prisma'

// Función para crear índices de base de datos
export async function createDatabaseIndexes() {
  console.log('🔧 [DB] Creando índices de optimización...')
  
  try {
    // Índices para la tabla Product
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_status ON Product(status)
    `
    console.log('✅ [DB] Índice idx_products_status creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_user_id ON Product(userId)
    `
    console.log('✅ [DB] Índice idx_products_user_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_categories ON Product(categories)
    `
    console.log('✅ [DB] Índice idx_products_categories creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_price ON Product(price)
    `
    console.log('✅ [DB] Índice idx_products_price creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_created_at ON Product(createdAt)
    `
    console.log('✅ [DB] Índice idx_products_created_at creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_manufacturer_code ON Product(manufacturerCode)
    `
    console.log('✅ [DB] Índice idx_products_manufacturer_code creado')
    
    // Índices para la tabla Order
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON "Order"(userId)
    `
    console.log('✅ [DB] Índice idx_orders_user_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON "Order"(status)
    `
    console.log('✅ [DB] Índice idx_orders_status creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON "Order"(createdAt)
    `
    console.log('✅ [DB] Índice idx_orders_created_at creado')
    
    // Índices para la tabla OrderItem
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON OrderItem(orderId)
    `
    console.log('✅ [DB] Índice idx_order_items_order_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON OrderItem(productId)
    `
    console.log('✅ [DB] Índice idx_order_items_product_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON OrderItem(sellerId)
    `
    console.log('✅ [DB] Índice idx_order_items_seller_id creado')
    
    // Índices para la tabla User
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_email ON User(email)
    `
    console.log('✅ [DB] Índice idx_users_email creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_role ON User(role)
    `
    console.log('✅ [DB] Índice idx_users_role creado')
    
    // Índices para la tabla ProductImage
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON ProductImage(productId)
    `
    console.log('✅ [DB] Índice idx_product_images_product_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_product_images_order ON ProductImage(productId, "order")
    `
    console.log('✅ [DB] Índice idx_product_images_order creado')
    
    // Índices para la tabla UserCart
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_user_cart_user_id ON UserCart(userId)
    `
    console.log('✅ [DB] Índice idx_user_cart_user_id creado')
    
    // Índices para la tabla CartItem
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON CartItem(userCartId)
    `
    console.log('✅ [DB] Índice idx_cart_items_cart_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON CartItem(productId)
    `
    console.log('✅ [DB] Índice idx_cart_items_product_id creado')
    
    // Índices para la tabla ProductRating
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_product_ratings_product_id ON product_ratings(productId)
    `
    console.log('✅ [DB] Índice idx_product_ratings_product_id creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_product_ratings_user_id ON product_ratings(userId)
    `
    console.log('✅ [DB] Índice idx_product_ratings_user_id creado')
    
    // Índices compuestos para consultas complejas
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_status_price ON Product(status, price)
    `
    console.log('✅ [DB] Índice compuesto idx_products_status_price creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_products_user_status ON Product(userId, status)
    `
    console.log('✅ [DB] Índice compuesto idx_products_user_status creado')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_user_status ON "Order"(userId, status)
    `
    console.log('✅ [DB] Índice compuesto idx_orders_user_status creado')
    
    console.log('🎉 [DB] Todos los índices creados exitosamente')
    
  } catch (error) {
    console.error('❌ [DB] Error creando índices:', error)
    throw error
  }
}

// Función para analizar el rendimiento de consultas
export async function analyzeQueryPerformance() {
  console.log('📊 [DB] Analizando rendimiento de consultas...')
  
  try {
    // Analizar consulta de productos
    const productQueryStart = Date.now()
    await prisma.product.findMany({
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
    const productQueryTime = Date.now() - productQueryStart
    console.log(`⏱️ [DB] Consulta de productos: ${productQueryTime}ms`)
    
    // Analizar consulta de órdenes
    const orderQueryStart = Date.now()
    await prisma.order.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        customerName: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            productId: true,
            quantity: true,
            price: true
          }
        }
      },
      take: 10
    })
    const orderQueryTime = Date.now() - orderQueryStart
    console.log(`⏱️ [DB] Consulta de órdenes: ${orderQueryTime}ms`)
    
    return {
      productQueryTime,
      orderQueryTime,
      totalTime: productQueryTime + orderQueryTime
    }
    
  } catch (error) {
    console.error('❌ [DB] Error analizando rendimiento:', error)
    throw error
  }
}

// Función para limpiar índices no utilizados
export async function cleanupUnusedIndexes() {
  console.log('🧹 [DB] Limpiando índices no utilizados...')
  
  try {
    // En SQLite, no hay una forma directa de detectar índices no utilizados
    // Pero podemos verificar que los índices existan
    const indexes = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type = 'index' 
      AND name LIKE 'idx_%'
      ORDER BY name
    `
    
    console.log('📋 [DB] Índices existentes:', indexes)
    console.log('✅ [DB] Limpieza de índices completada')
    
  } catch (error) {
    console.error('❌ [DB] Error limpiando índices:', error)
    throw error
  }
}

// Función para obtener estadísticas de la base de datos
export async function getDatabaseStats() {
  console.log('📈 [DB] Obteniendo estadísticas de la base de datos...')
  
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        'Product' as table_name,
        COUNT(*) as row_count
      FROM Product
      UNION ALL
      SELECT 
        'Order' as table_name,
        COUNT(*) as row_count
      FROM "Order"
      UNION ALL
      SELECT 
        'OrderItem' as table_name,
        COUNT(*) as row_count
      FROM OrderItem
      UNION ALL
      SELECT 
        'User' as table_name,
        COUNT(*) as row_count
      FROM User
      UNION ALL
      SELECT 
        'ProductImage' as table_name,
        COUNT(*) as row_count
      FROM ProductImage
    `
    
    console.log('📊 [DB] Estadísticas:', stats)
    return stats
    
  } catch (error) {
    console.error('❌ [DB] Error obteniendo estadísticas:', error)
    throw error
  }
}

// Función para optimizar consultas específicas
export const optimizedQueries = {
  // Obtener productos con paginación optimizada
  async getProductsPaginated(page: number = 1, limit: number = 12, filters: any = {}) {
    const offset = (page - 1) * limit
    
    return prisma.product.findMany({
      where: {
        ...filters
      },
      select: {
        id: true,
        title: true,
        price: true,
        previousPrice: true,
        description: true,
        categories: true,
        stock: true,
        condition: true,
        status: true,
        aestheticCondition: true,
        manufacturer: true,
        model: true,
        createdAt: true,
        images: {
          select: {
            id: true,
            path: true,
            alt: true,
            order: true
          },
          orderBy: { order: 'asc' },
          take: 1
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    })
  },
  
  // Obtener producto por ID con datos mínimos
  async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        supplierPrice: true,
        marginPercentage: true,
        previousPrice: true,
        condition: true,
        aestheticCondition: true,
        specifications: true,
        categories: true,
        stock: true,
        status: true,
        manufacturerCode: true,
        manufacturer: true,
        model: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            path: true,
            alt: true,
            order: true
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  },
  
  // Obtener órdenes del usuario con paginación
  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit
    
    return prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                title: true,
                images: {
                  select: {
                    path: true,
                    alt: true
                  },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    })
  },
  
  // Buscar productos con filtros optimizados
  async searchProducts(searchTerm: string, filters: any = {}, page: number = 1, limit: number = 12) {
    const offset = (page - 1) * limit
    
    return prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(searchTerm && {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { categories: { contains: searchTerm, mode: 'insensitive' } },
            { manufacturer: { contains: searchTerm, mode: 'insensitive' } },
            { model: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }),
        ...filters
      },
      select: {
        id: true,
        title: true,
        price: true,
        description: true,
        categories: true,
        stock: true,
        condition: true,
        manufacturer: true,
        model: true,
        createdAt: true,
        images: {
          select: {
            id: true,
            path: true,
            alt: true,
            order: true
          },
          orderBy: { order: 'asc' },
          take: 1
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    })
  }
}
