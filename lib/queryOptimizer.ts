import { prisma } from './prisma'
import { handleError, CommonErrors } from './errorHandler'

/**
 * Optimizador de consultas para mejorar el rendimiento
 */
export class QueryOptimizer {
  private static instance: QueryOptimizer
  private queryCache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer()
    }
    return QueryOptimizer.instance
  }

  /**
   * Obtiene productos con optimizaciones de consulta
   */
  async getOptimizedProducts(options: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    const cacheKey = `products:${JSON.stringify(options)}`
    
    // Verificar caché
    const cached = this.queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const {
        page = 1,
        limit = 12,
        category,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options

      const skip = (page - 1) * limit

      // Construir where clause optimizado
      const where: any = {
        status: 'ACTIVE'
      }

      if (category) {
        where.categories = {
          contains: category
        }
      }

      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
          { manufacturer: { contains: search } },
          { model: { contains: search } }
        ]
      }

      // Usar select específico para reducir datos transferidos
      const select = {
        id: true,
        title: true,
        price: true,
        previousPrice: true,
        condition: true,
        aestheticCondition: true,
        stock: true,
        categories: true,
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
          take: 1,
          orderBy: { order: 'asc' as const }
        },
        _count: {
          select: {
            ratings: true,
            wishlistItems: true
          }
        }
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          select,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        prisma.product.count({ where })
      ])

      const result = {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }

      // Guardar en caché
      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })

      return result

    } catch (error: any) {
      throw CommonErrors.DB_OPERATION_FAILED('Error fetching optimized products.')
    }
  }

  /**
   * Obtiene estadísticas optimizadas del dashboard
   */
  async getOptimizedDashboardStats() {
    const cacheKey = 'dashboard:stats'
    
    const cached = this.queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const [
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        recentOrders,
        lowStockProducts
      ] = await Promise.all([
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count(),
        prisma.order.count({ where: { status: 'COMPLETED' } }),
        prisma.order.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { total: true }
        }),
        prisma.order.findMany({
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            total: true,
            createdAt: true,
            customerName: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        prisma.inventory.findMany({
          where: {
            OR: [
              { quantity: { lte: 5 } },
              { quantity: { lte: 0 } }
            ]
          },
          select: {
            id: true,
            quantity: true,
            minStock: true,
            product: {
              select: {
                id: true,
                title: true
              }
            }
          },
          take: 10
        })
      ])

      const stats = {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        recentOrders,
        lowStockProducts: lowStockProducts.map(item => ({
          id: item.id,
          productId: item.product.id,
          productTitle: item.product.title,
          currentStock: item.quantity,
          minStock: item.minStock,
          status: item.quantity <= 0 ? 'OUT' : 'LOW'
        }))
      }

      this.queryCache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      })

      return stats

    } catch (error: any) {
      throw CommonErrors.DB_OPERATION_FAILED('Error fetching dashboard stats.')
    }
  }

  /**
   * Obtiene productos relacionados optimizados
   */
  async getOptimizedRelatedProducts(productId: string, limit: number = 4) {
    const cacheKey = `related:${productId}:${limit}`
    
    const cached = this.queryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      // Obtener el producto actual
      const currentProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          categories: true,
          manufacturer: true,
          price: true
        }
      })

      if (!currentProduct) {
        return []
      }

      const categories = currentProduct.categories?.split(',') || []
      const manufacturer = currentProduct.manufacturer
      const price = currentProduct.price

      // Buscar productos relacionados por categoría y fabricante
      const relatedProducts = await prisma.product.findMany({
        where: {
          id: { not: productId },
          status: 'ACTIVE',
          stock: { gt: 0 },
          OR: [
            ...categories.map(cat => ({
              categories: { contains: cat.trim() }
            })),
            ...(manufacturer ? [{ manufacturer }] : [])
          ]
        },
        select: {
          id: true,
          title: true,
          price: true,
          previousPrice: true,
          condition: true,
          stock: true,
          images: {
            select: {
              path: true,
              alt: true
            },
            take: 1,
            orderBy: { order: 'asc' }
          }
        },
        take: limit,
        orderBy: [
          { manufacturer: 'asc' },
          { price: 'asc' }
        ]
      })

      this.queryCache.set(cacheKey, {
        data: relatedProducts,
        timestamp: Date.now()
      })

      return relatedProducts

    } catch (error: any) {
      throw CommonErrors.DB_OPERATION_FAILED('Error fetching related products.')
    }
  }

  /**
   * Limpia el caché de consultas
   */
  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of Array.from(this.queryCache.keys())) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key)
        }
      }
    } else {
      this.queryCache.clear()
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys()),
      memoryUsage: process.memoryUsage()
    }
  }
}

// Exportar instancia singleton
export const queryOptimizer = QueryOptimizer.getInstance()
