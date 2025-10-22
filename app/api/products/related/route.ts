import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'
import { handleError, CommonErrors } from '@/lib/errorHandler'

// GET - Obtener productos relacionados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const productId = searchParams.get('productId')
    const limit = parseInt(searchParams.get('limit') || '6')

    if (!productId) {
      return NextResponse.json(
        { error: 'ID del producto es requerido' },
        { status: 400 }
      )
    }

    console.log('🔗 [RELATED] Buscando productos relacionados para:', productId)

    // Usar caché para productos relacionados
    const cacheKey = `related_products:${productId}:${limit}`
    
    const relatedProducts = await getCachedData(
      cacheKey,
      async () => {
        // Obtener el producto base
        const baseProduct = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            title: true,
            categories: true,
            manufacturer: true,
            price: true
          }
        })

        if (!baseProduct) {
          throw CommonErrors.PRODUCT_NOT_FOUND(productId)
        }

        // Buscar productos relacionados por categorías
        const categoryProducts = await prisma.product.findMany({
          where: {
            id: { not: productId },
            status: 'ACTIVE',
            categories: {
              in: baseProduct.categories?.split(',').map(c => c.trim()) || []
            }
          },
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
          take: limit * 2 // Obtener más para filtrar mejor
        })

        // Buscar productos del mismo fabricante si no hay suficientes
        let manufacturerProducts: any[] = []
        if (categoryProducts.length < limit && baseProduct.manufacturer) {
          manufacturerProducts = await prisma.product.findMany({
            where: {
              id: { not: productId },
              status: 'ACTIVE',
              manufacturer: baseProduct.manufacturer
            },
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
            take: limit
          })
        }

        // Combinar y deduplicar productos
        const allProducts = [...categoryProducts, ...manufacturerProducts]
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        )

        // Ordenar por relevancia (más categorías en común = más relevante)
        const baseCategories = baseProduct.categories?.split(',').map(c => c.trim()) || []
        
        const scoredProducts = uniqueProducts.map(product => {
          const productCategories = product.categories?.split(',').map((c: string) => c.trim()) || []
          const commonCategories = baseCategories.filter(cat => 
            productCategories.includes(cat)
          ).length
          
          const isSameManufacturer = product.manufacturer === baseProduct.manufacturer ? 1 : 0
          const priceSimilarity = 1 - Math.abs(
            parseFloat(product.price.toString()) - parseFloat(baseProduct.price.toString())
          ) / parseFloat(baseProduct.price.toString())
          
          const score = commonCategories * 2 + isSameManufacturer + priceSimilarity
          
          return { ...product, relevanceScore: score }
        })

        // Ordenar por score y tomar los mejores
        return scoredProducts
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, limit)
          .map(({ relevanceScore, ...product }) => product) // Remover score del resultado
      },
      CACHE_TTL.PRODUCTS
    )

    // Calcular información de descuento
    const productsWithDiscount = relatedProducts.map(product => {
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

    return NextResponse.json({
      relatedProducts: productsWithDiscount,
      total: productsWithDiscount.length
    })

  } catch (error) {
    console.error('Error getting related products:', error)
    return handleError(error)
  }
}
