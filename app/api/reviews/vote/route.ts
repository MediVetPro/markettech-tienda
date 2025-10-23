import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { clearProductCache } from '@/lib/cache'

// POST - Votar en reseña
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
    const { reviewId, isHelpful } = await request.json()

    if (!reviewId || typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'reviewId e isHelpful son requeridos' },
        { status: 400 }
      )
    }

    console.log('👍 [REVIEW_VOTE] Votando en reseña:', reviewId)

    // Verificar que la reseña existe
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { 
        id: true, 
        productId: true, 
        userId: true,
        helpful: true,
        notHelpful: true
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    // No permitir votar en tu propia reseña
    if (review.userId === userId) {
      return NextResponse.json(
        { error: 'No puedes votar en tu propia reseña' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un voto
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    })

    let vote
    let helpfulChange = 0
    let notHelpfulChange = 0

    if (existingVote) {
      // Si ya existe un voto, actualizarlo
      if (existingVote.isHelpful === isHelpful) {
        // Si es el mismo voto, eliminarlo
        await prisma.reviewVote.delete({
          where: { id: existingVote.id }
        })

        // Actualizar contadores
        if (isHelpful) {
          helpfulChange = -1
        } else {
          notHelpfulChange = -1
        }

        vote = null
      } else {
        // Si es diferente, actualizarlo
        vote = await prisma.reviewVote.update({
          where: { id: existingVote.id },
          data: { isHelpful }
        })

        // Actualizar contadores
        if (isHelpful) {
          helpfulChange = 1
          notHelpfulChange = -1
        } else {
          helpfulChange = -1
          notHelpfulChange = 1
        }
      }
    } else {
      // Crear nuevo voto
      vote = await prisma.reviewVote.create({
        data: {
          reviewId,
          userId,
          isHelpful
        }
      })

      // Actualizar contadores
      if (isHelpful) {
        helpfulChange = 1
      } else {
        notHelpfulChange = 1
      }
    }

    // Actualizar contadores en la reseña
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpful: { increment: helpfulChange },
        notHelpful: { increment: notHelpfulChange }
      }
    })

    // Limpiar caché del producto
    clearProductCache(review.productId)

    console.log(`✅ [REVIEW_VOTE] Voto procesado: ${isHelpful ? 'útil' : 'no útil'}`)

    return NextResponse.json({
      message: 'Voto procesado exitosamente',
      vote,
      helpfulChange,
      notHelpfulChange
    })

  } catch (error) {
    console.error('Error voting on review:', error)
    return handleError(error)
  }
}

// DELETE - Eliminar voto
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
    
    if (!decoded.user || decoded.error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.user.userId
    const { searchParams } = request.nextUrl
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'ID de reseña es requerido' },
        { status: 400 }
      )
    }

    console.log('👍 [REVIEW_VOTE] Eliminando voto en reseña:', reviewId)

    // Buscar el voto existente
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      },
      include: {
        review: {
          select: { productId: true }
        }
      }
    })

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Voto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar voto
    await prisma.reviewVote.delete({
      where: { id: existingVote.id }
    })

    // Actualizar contadores
    const helpfulChange = existingVote.isHelpful ? -1 : 0
    const notHelpfulChange = !existingVote.isHelpful ? -1 : 0

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpful: { increment: helpfulChange },
        notHelpful: { increment: notHelpfulChange }
      }
    })

    // Limpiar caché del producto
    clearProductCache(existingVote.review.productId)

    console.log(`✅ [REVIEW_VOTE] Voto eliminado`)

    return NextResponse.json({
      message: 'Voto eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting vote:', error)
    return handleError(error)
  }
}
