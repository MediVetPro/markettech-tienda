import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL, clearProductCache } from '@/lib/cache'

// GET - Obtener reseñas de un producto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'newest' // newest, oldest, highest, lowest, helpful
    const rating = searchParams.get('rating') // Filtrar por rating específico

    if (!productId) {
      return NextResponse.json(
        { error: 'ID de producto es requerido' },
        { status: 400 }
      )
    }

    console.log('⭐ [REVIEWS] Obteniendo reseñas para producto:', productId)

    // Usar caché para reseñas
    const cacheKey = `reviews:${productId}:${page}:${limit}:${sortBy}:${rating || 'all'}`
    
    const result = await getCachedData(
      cacheKey,
      async () => {
        const where: any = {
          productId,
          status: 'APPROVED',
          isPublic: true
        }

        if (rating) {
          where.rating = parseInt(rating)
        }

        let orderBy: any = { createdAt: 'desc' }
        
        switch (sortBy) {
          case 'oldest':
            orderBy = { createdAt: 'asc' }
            break
          case 'highest':
            orderBy = { rating: 'desc' }
            break
          case 'lowest':
            orderBy = { rating: 'asc' }
            break
          case 'helpful':
            orderBy = { helpful: 'desc' }
            break
        }

        const [reviews, total] = await Promise.all([
          prisma.review.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              votes: {
                select: {
                  userId: true,
                  isHelpful: true
                }
              }
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit
          }),
          prisma.review.count({ where })
        ])

        // Calcular estadísticas de reseñas
        const stats = await prisma.review.groupBy({
          by: ['rating'],
          where: {
            productId,
            status: 'APPROVED',
            isPublic: true
          },
          _count: { id: true }
        })

        const ratingCounts = stats.reduce((acc, stat) => {
          acc[stat.rating] = stat._count.id
          return acc
        }, {} as Record<number, number>)

        const totalReviews = stats.reduce((sum, stat) => sum + stat._count.id, 0)
        const averageRating = totalReviews > 0 
          ? stats.reduce((sum, stat) => sum + (stat.rating * stat._count.id), 0) / totalReviews
          : 0

        return {
          reviews,
          total,
          stats: {
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingCounts
          }
        }
      },
      CACHE_TTL.PRODUCTS
    )

    const totalPages = Math.ceil(result.total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      reviews: result.reviews,
      stats: result.stats,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Error getting reviews:', error)
    return handleError(error)
  }
}

// POST - Crear reseña
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded.user || decoded.error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.user.userId
    const { 
      productId, 
      orderId, 
      rating, 
      title, 
      comment, 
      images 
    } = await request.json()

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'productId y rating (1-5) son requeridos' },
        { status: 400 }
      )
    }

    console.log('⭐ [REVIEW] Creando reseña para producto:', productId)

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no existe una reseña previa del usuario
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya has reseñado este producto' },
        { status: 400 }
      )
    }

    // Verificar compra si se proporciona orderId
    let isVerified = false
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
          paymentStatus: 'PAID' // Solo pedidos realmente pagados
        },
        include: {
          items: {
            where: { productId }
          }
        }
      })

      isVerified = !!(order && order.items.length > 0)
    }

    // Crear reseña
    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        orderId,
        rating,
        title: title?.trim(),
        comment: comment?.trim(),
        images: images ? JSON.stringify(images) : null,
        isVerified,
        status: isVerified ? 'APPROVED' : 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Limpiar caché del producto
    clearProductCache(productId)

    console.log(`✅ [REVIEW] Reseña creada: ${review.id}`)

    return NextResponse.json({
      message: 'Reseña creada exitosamente',
      review
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating review:', error)
    return handleError(error)
  }
}
