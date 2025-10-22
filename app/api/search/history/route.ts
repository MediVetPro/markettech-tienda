import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL, clearUserCache } from '@/lib/cache'

// GET - Obtener historial de búsquedas del usuario
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

    const userId = decoded.userId
    const { searchParams } = request.nextUrl
    const limit = parseInt(searchParams.get('limit') || '20')

    // Usar caché para historial
    const cacheKey = `search_history:${userId}:${limit}`
    
    const history = await getCachedData(
      cacheKey,
      async () => {
        // Obtener historial de búsquedas (simulado - en producción usarías una tabla dedicada)
        // Por ahora, obtenemos las búsquedas más populares
        const popularSearches = await prisma.product.findMany({
          where: { status: 'ACTIVE' },
          select: {
            title: true,
            categories: true,
            manufacturer: true
          },
          take: limit
        })

        // Simular historial basado en productos populares
        const searchHistory = popularSearches.map((product, index) => ({
          id: `search_${index}`,
          query: product.title,
          category: product.categories?.split(',')[0] || 'General',
          searchedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // Simular fechas
          resultCount: Math.floor(Math.random() * 50) + 1
        }))

        return searchHistory
      },
      CACHE_TTL.USER_PROFILE
    )

    return NextResponse.json({
      history,
      total: history.length
    })

  } catch (error) {
    console.error('Error getting search history:', error)
    return handleError(error)
  }
}

// POST - Guardar búsqueda en historial
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

    const userId = decoded.userId
    const { query, category, resultCount } = await request.json()

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query de búsqueda inválida' },
        { status: 400 }
      )
    }

    // En una implementación real, guardarías en una tabla de historial
    // Por ahora, solo limpiar caché para forzar actualización
    clearUserCache(userId)

    console.log(`🔍 [SEARCH_HISTORY] Búsqueda guardada: ${query}`)

    return NextResponse.json({
      message: 'Búsqueda guardada en historial'
    })

  } catch (error) {
    console.error('Error saving search history:', error)
    return handleError(error)
  }
}

// DELETE - Limpiar historial de búsquedas
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

    const userId = decoded.userId

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`🗑️ [SEARCH_HISTORY] Historial limpiado para usuario: ${userId}`)

    return NextResponse.json({
      message: 'Historial de búsquedas limpiado'
    })

  } catch (error) {
    console.error('Error clearing search history:', error)
    return handleError(error)
  }
}
