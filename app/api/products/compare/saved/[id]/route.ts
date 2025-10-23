import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { clearUserCache } from '@/lib/cache'

// GET - Obtener comparación guardada específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const comparisonId = params.id

    const comparison = await prisma.savedComparison.findFirst({
      where: {
        id: comparisonId,
        userId
      }
    })

    if (!comparison) {
      return NextResponse.json(
        { error: 'Comparación no encontrada' },
        { status: 404 }
      )
    }

    // Obtener productos de la comparación
    const productIds = comparison.productIds.split(',')
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        previousPrice: true,
        condition: true,
        aestheticCondition: true,
        specifications: true,
        categories: true,
        stock: true,
        manufacturer: true,
        model: true,
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
      }
    })

    return NextResponse.json({
      comparison: {
        id: comparison.id,
        name: comparison.name,
        notes: comparison.notes,
        createdAt: comparison.createdAt,
        updatedAt: comparison.updatedAt
      },
      products
    })

  } catch (error) {
    console.error('Error getting saved comparison:', error)
    return handleError(error)
  }
}

// PUT - Actualizar comparación guardada
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const comparisonId = params.id
    const { name, productIds, notes } = await request.json()

    // Verificar que la comparación existe y pertenece al usuario
    const existingComparison = await prisma.savedComparison.findFirst({
      where: {
        id: comparisonId,
        userId
      }
    })

    if (!existingComparison) {
      return NextResponse.json(
        { error: 'Comparación no encontrada' },
        { status: 404 }
      )
    }

    // Validar datos
    if (productIds && (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 4)) {
      return NextResponse.json(
        { error: 'Se requieren entre 2 y 4 productos' },
        { status: 400 }
      )
    }

    // Verificar productos si se están actualizando
    if (productIds) {
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          status: 'ACTIVE'
        },
        select: { id: true }
      })

      if (products.length !== productIds.length) {
        const foundIds = products.map(p => p.id)
        const missingIds = productIds.filter((id: string) => !foundIds.includes(id))
        throw CommonErrors.PRODUCT_NOT_FOUND(missingIds.join(', '))
      }
    }

    // Actualizar comparación
    const updatedComparison = await prisma.savedComparison.update({
      where: { id: comparisonId },
      data: {
        ...(name && { name: name.trim() }),
        ...(productIds && { productIds: productIds.join(',') }),
        ...(notes !== undefined && { notes: notes?.trim() || null })
      }
    })

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`✏️ [UPDATE_COMPARISON] Comparación actualizada: ${updatedComparison.name}`)

    return NextResponse.json({
      message: 'Comparación actualizada exitosamente',
      comparison: updatedComparison
    })

  } catch (error) {
    console.error('Error updating comparison:', error)
    return handleError(error)
  }
}

// DELETE - Eliminar comparación guardada
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const comparisonId = params.id

    // Verificar que la comparación existe y pertenece al usuario
    const comparison = await prisma.savedComparison.findFirst({
      where: {
        id: comparisonId,
        userId
      }
    })

    if (!comparison) {
      return NextResponse.json(
        { error: 'Comparación no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar comparación
    await prisma.savedComparison.delete({
      where: { id: comparisonId }
    })

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`🗑️ [DELETE_COMPARISON] Comparación eliminada: ${comparison.name}`)

    return NextResponse.json({
      message: 'Comparación eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting comparison:', error)
    return handleError(error)
  }
}
