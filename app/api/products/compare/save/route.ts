import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { clearUserCache } from '@/lib/cache'

// POST - Guardar comparación
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
    const { name, productIds, notes } = await request.json()

    if (!name || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Nombre y IDs de productos son requeridos' },
        { status: 400 }
      )
    }

    if (productIds.length < 2 || productIds.length > 4) {
      return NextResponse.json(
        { error: 'Se requieren entre 2 y 4 productos' },
        { status: 400 }
      )
    }

    // Verificar que los productos existen
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE'
      },
      select: { id: true, title: true }
    })

    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id)
      const missingIds = productIds.filter(id => !foundIds.includes(id))
      throw CommonErrors.PRODUCT_NOT_FOUND(missingIds.join(', '))
    }

    // Crear comparación guardada
    const savedComparison = await prisma.savedComparison.create({
      data: {
        name: name.trim(),
        userId,
        productIds: productIds.join(','),
        notes: notes?.trim() || null
      }
    })

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`💾 [SAVE_COMPARISON] Comparación guardada: ${name}`)

    return NextResponse.json({
      message: 'Comparación guardada exitosamente',
      comparison: {
        id: savedComparison.id,
        name: savedComparison.name,
        productIds: productIds,
        notes: savedComparison.notes,
        createdAt: savedComparison.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error saving comparison:', error)
    return handleError(error)
  }
}

// GET - Obtener comparaciones guardadas del usuario
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
    
    if (!decoded.user || decoded.error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.user.userId
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const comparisons = await prisma.savedComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.savedComparison.count({
      where: { userId }
    })

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      comparisons,
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
    console.error('Error getting saved comparisons:', error)
    return handleError(error)
  }
}
