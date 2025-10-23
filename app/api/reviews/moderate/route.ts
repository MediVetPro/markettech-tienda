import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { clearProductCache } from '@/lib/cache'

// GET - Obtener reseñas pendientes de moderación
export async function GET(request: NextRequest) {
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
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Solo administradores pueden moderar reseñas
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden moderar reseñas' },
        { status: 403 }
      )
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('🔍 [REVIEW_MODERATE] Obteniendo reseñas para moderación:', status)

    const where: any = { status }
    if (status === 'PENDING') {
      where.isPublic = true // Solo reseñas públicas pendientes
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
          },
          order: {
            select: {
              id: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Error getting reviews for moderation:', error)
    return handleError(error)
  }
}

// PUT - Moderar reseña
export async function PUT(request: NextRequest) {
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
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Solo administradores pueden moderar reseñas
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden moderar reseñas' },
        { status: 403 }
      )
    }

    const { reviewId, action, reason } = await request.json()

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: 'reviewId y action son requeridos' },
        { status: 400 }
      )
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'action debe ser APPROVE o REJECT' },
        { status: 400 }
      )
    }

    console.log('🔍 [REVIEW_MODERATE] Moderando reseña:', reviewId, action)

    // Verificar que la reseña existe
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { 
        id: true, 
        productId: true, 
        status: true 
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    if (review.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'La reseña ya ha sido moderada' },
        { status: 400 }
      )
    }

    // Actualizar reseña
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        moderatedBy: decoded.user.userId,
        moderatedAt: new Date(),
        reason: action === 'REJECT' ? reason : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Limpiar caché del producto
    clearProductCache(review.productId)

    console.log(`✅ [REVIEW_MODERATE] Reseña ${action.toLowerCase()}d: ${reviewId}`)

    return NextResponse.json({
      message: `Reseña ${action.toLowerCase()}da exitosamente`,
      review: updatedReview
    })

  } catch (error) {
    console.error('Error moderating review:', error)
    return handleError(error)
  }
}

// DELETE - Eliminar reseña
export async function DELETE(request: NextRequest) {
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
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Solo administradores pueden eliminar reseñas
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden eliminar reseñas' },
        { status: 403 }
      )
    }

    const { searchParams } = request.nextUrl
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'ID de reseña es requerido' },
        { status: 400 }
      )
    }

    console.log('🗑️ [REVIEW_MODERATE] Eliminando reseña:', reviewId)

    // Verificar que la reseña existe
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { 
        id: true, 
        productId: true 
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar reseña (esto también eliminará los votos por CASCADE)
    await prisma.review.delete({
      where: { id: reviewId }
    })

    // Limpiar caché del producto
    clearProductCache(review.productId)

    console.log(`✅ [REVIEW_MODERATE] Reseña eliminada: ${reviewId}`)

    return NextResponse.json({
      message: 'Reseña eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting review:', error)
    return handleError(error)
  }
}
