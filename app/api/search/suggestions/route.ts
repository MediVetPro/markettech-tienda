import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'
import { handleError } from '@/lib/errorHandler'

// GET - Obtener sugerencias de búsqueda
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        categories: [],
        manufacturers: []
      })
    }

    console.log('💡 [SUGGESTIONS] Buscando sugerencias para:', query)

    // Usar caché para sugerencias
    const cacheKey = `suggestions:${query}:${limit}`
    
    const result = await getCachedData(
      cacheKey,
      async () => {
        // Buscar productos que coincidan
        const products = await prisma.product.findMany({
          where: {
            status: 'ACTIVE',
            OR: [
              { title: { contains: query } },
              { manufacturer: { contains: query } },
              { model: { contains: query } },
              { categories: { contains: query } }
            ]
          },
          select: {
            id: true,
            title: true,
            manufacturer: true,
            model: true,
            categories: true,
            price: true,
            images: {
              select: {
                path: true,
                alt: true
              },
              take: 1
            }
          },
          take: limit
        })

        // Obtener categorías únicas
        const categoryResults = await prisma.product.findMany({
          where: {
            status: 'ACTIVE',
            categories: { contains: query }
          },
          select: {
            categories: true
          },
          distinct: ['categories']
        })

        // Obtener fabricantes únicos
        const manufacturerResults = await prisma.product.findMany({
          where: {
            status: 'ACTIVE',
            manufacturer: { contains: query }
          },
          select: {
            manufacturer: true
          },
          distinct: ['manufacturer']
        })

        // Procesar categorías
        const categories = categoryResults
          .map(p => p.categories)
          .filter(Boolean)
          .flatMap(cat => cat?.split(',').map(c => c.trim()) || [])
          .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)

        // Procesar fabricantes
        const manufacturers = manufacturerResults
          .map(p => p.manufacturer)
          .filter(Boolean)
          .filter(man => man?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)

        return {
          products,
          categories: Array.from(new Set(categories)),
          manufacturers: Array.from(new Set(manufacturers))
        }
      },
      CACHE_TTL.SEARCH
    )

    return NextResponse.json({
      suggestions: result.products,
      categories: result.categories,
      manufacturers: result.manufacturers,
      query
    })

  } catch (error) {
    console.error('Error getting search suggestions:', error)
    return handleError(error)
  }
}
