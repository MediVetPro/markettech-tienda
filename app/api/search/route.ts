import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'
import { handleError } from '@/lib/errorHandler'

// GET - Búsqueda avanzada con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const manufacturer = searchParams.get('manufacturer')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const condition = searchParams.get('condition')
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    console.log('🔍 [SEARCH] Parámetros de búsqueda:', {
      query,
      category,
      manufacturer,
      minPrice,
      maxPrice,
      condition,
      sortBy,
      sortOrder,
      page,
      limit
    })

    // Construir filtros
    const where: any = {
      status: 'ACTIVE'
    }

    // Búsqueda de texto
    if (query.trim()) {
      const searchTerms = query.trim().split(/\s+/)
      where.OR = searchTerms.map(term => ({
        OR: [
          { title: { contains: term } },
          { description: { contains: term } },
          { categories: { contains: term } },
          { manufacturer: { contains: term } },
          { model: { contains: term } },
          { specifications: { contains: term } }
        ]
      }))
    }

    // Filtros adicionales
    if (category) {
      where.categories = { contains: category }
    }

    if (manufacturer) {
      where.manufacturer = { contains: manufacturer }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        where.price.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice)
      }
    }

    if (condition) {
      where.condition = condition
    }

    // Ordenamiento
    let orderBy: any = {}
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder }
        break
      case 'name':
        orderBy = { title: sortOrder }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'rating':
        // Ordenar por rating promedio (implementar cuando tengamos ratings)
        orderBy = { createdAt: 'desc' }
        break
      default: // relevance
        orderBy = { createdAt: 'desc' }
    }

    // Usar caché para búsquedas
    const cacheKey = `search:${JSON.stringify({
      query,
      category,
      manufacturer,
      minPrice,
      maxPrice,
      condition,
      sortBy,
      sortOrder,
      page,
      limit
    })}`

    const result = await getCachedData(
      cacheKey,
      async () => {
        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              previousPrice: true,
              condition: true,
              aestheticCondition: true,
              categories: true,
              stock: true,
              status: true,
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
            orderBy,
            skip: (page - 1) * limit,
            take: limit
          }),
          prisma.product.count({ where })
        ])

        return { products, total }
      },
      CACHE_TTL.SEARCH
    )

    // Calcular información de descuento
    const productsWithDiscount = result.products.map(product => {
      const currentPrice = parseFloat(product.price.toString())
      const previousPrice = product.previousPrice ? parseFloat(product.previousPrice.toString()) : null
      
      let discountPercentage = 0
      if (previousPrice && previousPrice > currentPrice) {
        discountPercentage = Math.round(((previousPrice - currentPrice) / previousPrice) * 100 * 100) / 100
      }

      return {
        ...product,
        currentPrice,
        previousPrice,
        discountPercentage,
        hasDiscount: discountPercentage > 0
      }
    })

    const totalPages = Math.ceil(result.total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      products: productsWithDiscount,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        query,
        category,
        manufacturer,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        condition,
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    console.error('Error in search:', error)
    return handleError(error)
  }
}
