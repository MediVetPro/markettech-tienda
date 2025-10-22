import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'
import { handleError, CommonErrors } from '@/lib/errorHandler'

// GET - Comparar productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const productIds = searchParams.get('ids')

    if (!productIds) {
      return NextResponse.json(
        { error: 'IDs de productos son requeridos' },
        { status: 400 }
      )
    }

    const ids = productIds.split(',').filter(id => id.trim())
    
    if (ids.length < 2) {
      return NextResponse.json(
        { error: 'Se requieren al menos 2 productos para comparar' },
        { status: 400 }
      )
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { error: 'Máximo 4 productos para comparar' },
        { status: 400 }
      )
    }

    console.log('🔍 [COMPARE] Comparando productos:', ids)

    // Usar caché para comparaciones
    const cacheKey = `compare:${ids.sort().join(',')}`
    
    const comparison = await getCachedData(
      cacheKey,
      async () => {
        // Obtener productos con información completa
        const products = await prisma.product.findMany({
          where: {
            id: { in: ids },
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
            manufacturerCode: true,
            createdAt: true,
            images: {
              select: {
                id: true,
                path: true,
                alt: true,
                order: true
              },
              orderBy: { order: 'asc' },
              take: 3
            },
            user: {
              select: {
                id: true,
                name: true
              }
            },
            ratings: {
              select: {
                rating: true,
                comment: true
              }
            }
          }
        })

        if (products.length !== ids.length) {
          const foundIds = products.map(p => p.id)
          const missingIds = ids.filter(id => !foundIds.includes(id))
          throw CommonErrors.PRODUCT_NOT_FOUND(missingIds.join(', '))
        }

        // Calcular estadísticas de rating
        const productsWithStats = products.map(product => {
          const ratings = product.ratings.map(r => r.rating)
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0
          const ratingCount = ratings.length

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
            hasDiscount: discountPercentage > 0,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingCount,
            savings: previousPrice ? previousPrice - currentPrice : 0
          }
        })

        // Analizar especificaciones comunes
        const allSpecs = productsWithStats.map(p => p.specifications).filter(Boolean)
        const commonSpecs = analyzeSpecifications(allSpecs)

        // Calcular comparaciones
        const comparisons = calculateComparisons(productsWithStats)

        return {
          products: productsWithStats,
          commonSpecs,
          comparisons,
          summary: {
            totalProducts: productsWithStats.length,
            priceRange: {
              min: Math.min(...productsWithStats.map(p => p.currentPrice)),
              max: Math.max(...productsWithStats.map(p => p.currentPrice)),
              avg: productsWithStats.reduce((sum, p) => sum + p.currentPrice, 0) / productsWithStats.length
            },
            bestValue: findBestValue(productsWithStats),
            mostRated: findMostRated(productsWithStats)
          }
        }
      },
      CACHE_TTL.PRODUCTS
    )

    return NextResponse.json(comparison)

  } catch (error) {
    console.error('Error comparing products:', error)
    return handleError(error)
  }
}

// Función para analizar especificaciones comunes
function analyzeSpecifications(specs: string[]): any[] {
  const specMap = new Map<string, { values: string[], count: number }>()
  
  specs.forEach(spec => {
    if (!spec) return
    
    // Parsear especificaciones (formato: "key: value, key2: value2")
    const lines = spec.split('\n').filter(line => line.trim())
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        const cleanKey = key.trim().toLowerCase()
        const value = valueParts.join(':').trim()
        
        if (!specMap.has(cleanKey)) {
          specMap.set(cleanKey, { values: [], count: 0 })
        }
        
        const entry = specMap.get(cleanKey)!
        if (!entry.values.includes(value)) {
          entry.values.push(value)
        }
        entry.count++
      }
    })
  })

  // Convertir a array y ordenar por frecuencia
  return Array.from(specMap.entries())
    .map(([key, data]) => ({
      key,
      values: data.values,
      count: data.count,
      isCommon: data.count === specs.length
    }))
    .sort((a, b) => b.count - a.count)
}

// Función para calcular comparaciones
function calculateComparisons(products: any[]): any {
  const comparisons = {
    price: {
      cheapest: products.reduce((min, p) => p.currentPrice < min.currentPrice ? p : min),
      mostExpensive: products.reduce((max, p) => p.currentPrice > max.currentPrice ? p : max),
      priceDifference: 0
    },
    rating: {
      highest: products.reduce((max, p) => p.averageRating > max.averageRating ? p : max),
      lowest: products.reduce((min, p) => p.averageRating < min.averageRating ? p : min)
    },
    discount: {
      bestDiscount: products.reduce((best, p) => p.discountPercentage > best.discountPercentage ? p : best),
      totalSavings: products.reduce((sum, p) => sum + p.savings, 0)
    },
    stock: {
      mostStock: products.reduce((max, p) => p.stock > max.stock ? p : max),
      leastStock: products.reduce((min, p) => p.stock < min.stock ? p : min)
    }
  }

  // Calcular diferencia de precio
  comparisons.price.priceDifference = comparisons.price.mostExpensive.currentPrice - comparisons.price.cheapest.currentPrice

  return comparisons
}

// Función para encontrar mejor valor
function findBestValue(products: any[]): any {
  return products.reduce((best, product) => {
    const bestScore = calculateValueScore(best)
    const productScore = calculateValueScore(product)
    return productScore > bestScore ? product : best
  })
}

// Función para calcular score de valor
function calculateValueScore(product: any): number {
  const priceScore = 100 - (product.currentPrice / 20000) * 100 // Normalizar precio
  const ratingScore = product.averageRating * 20 // 0-100
  const discountScore = product.discountPercentage * 2 // Bonus por descuento
  const stockScore = Math.min(product.stock * 2, 20) // Bonus por stock
  
  return Math.max(0, priceScore + ratingScore + discountScore + stockScore)
}

// Función para encontrar más valorado
function findMostRated(products: any[]): any {
  return products.reduce((most, product) => 
    product.ratingCount > most.ratingCount ? product : most
  )
}
