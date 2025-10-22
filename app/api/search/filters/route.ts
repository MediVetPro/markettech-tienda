import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'
import { handleError } from '@/lib/errorHandler'

// GET - Obtener filtros disponibles para búsqueda
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')
    const manufacturer = searchParams.get('manufacturer')

    console.log('🔍 [FILTERS] Obteniendo filtros disponibles')

    // Usar caché para filtros
    const cacheKey = `filters:${category || 'all'}:${manufacturer || 'all'}`
    
    const filters = await getCachedData(
      cacheKey,
      async () => {
        // Construir filtros base
        const baseWhere: any = { status: 'ACTIVE' }
        
        if (category) {
          baseWhere.categories = { contains: category }
        }
        
        if (manufacturer) {
          baseWhere.manufacturer = { contains: manufacturer }
        }

        // Obtener categorías
        const categories = await prisma.product.findMany({
          where: baseWhere,
          select: {
            categories: true
          },
          distinct: ['categories']
        })

        // Obtener fabricantes
        const manufacturers = await prisma.product.findMany({
          where: baseWhere,
          select: {
            manufacturer: true
          },
          distinct: ['manufacturer']
        })

        // Obtener condiciones
        const conditions = await prisma.product.findMany({
          where: baseWhere,
          select: {
            condition: true
          },
          distinct: ['condition']
        })

        // Obtener rangos de precio
        const priceStats = await prisma.product.aggregate({
          where: baseWhere,
          _min: { price: true },
          _max: { price: true },
          _avg: { price: true }
        })

        // Procesar categorías
        const categoryList = categories
          .map(p => p.categories)
          .filter(Boolean)
          .flatMap(cat => cat?.split(',').map(c => c.trim()) || [])
          .filter(cat => cat.length > 0)
          .reduce((acc: Record<string, number>, cat) => {
            acc[cat] = (acc[cat] || 0) + 1
            return acc
          }, {})

        // Procesar fabricantes
        const manufacturerList = manufacturers
          .map(p => p.manufacturer)
          .filter(Boolean)
          .reduce((acc: Record<string, number>, man) => {
            acc[man!] = (acc[man!] || 0) + 1
            return acc
          }, {})

        // Procesar condiciones
        const conditionList = conditions
          .map(p => p.condition)
          .filter(Boolean)
          .reduce((acc: Record<string, number>, cond) => {
            acc[cond!] = (acc[cond!] || 0) + 1
            return acc
          }, {})

        return {
          categories: Object.entries(categoryList)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
          manufacturers: Object.entries(manufacturerList)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
          conditions: Object.entries(conditionList)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
          priceRange: {
            min: priceStats._min.price ? parseFloat(priceStats._min.price.toString()) : 0,
            max: priceStats._max.price ? parseFloat(priceStats._max.price.toString()) : 0,
            avg: priceStats._avg.price ? parseFloat(priceStats._avg.price.toString()) : 0
          }
        }
      },
      CACHE_TTL.PRODUCTS
    )

    return NextResponse.json(filters)

  } catch (error) {
    console.error('Error getting search filters:', error)
    return handleError(error)
  }
}
