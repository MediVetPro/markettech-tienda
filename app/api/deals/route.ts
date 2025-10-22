import { NextRequest, NextResponse } from 'next/server'
import { getBestDeals } from '@/lib/priceAlerts'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'
import { handleError } from '@/lib/errorHandler'

// GET - Obtener mejores ofertas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')

    // Usar caché para las ofertas
    const cacheKey = `deals:${limit}:${category || 'all'}`
    
    const deals = await getCachedData(
      cacheKey,
      async () => {
        let deals = await getBestDeals(limit * 2) // Obtener más para filtrar por categoría

        // Filtrar por categoría si se especifica
        if (category) {
          deals = deals.filter(deal => 
            deal.categories?.toLowerCase().includes(category.toLowerCase())
          )
        }

        return deals.slice(0, limit)
      },
      CACHE_TTL.PRODUCTS // 10 minutos
    )

    // Calcular estadísticas
    const totalSavings = deals.reduce((sum, deal) => sum + deal.savings, 0)
    const averageDiscount = deals.length > 0 
      ? deals.reduce((sum, deal) => sum + deal.discountPercentage, 0) / deals.length 
      : 0

    return NextResponse.json({
      deals,
      stats: {
        totalDeals: deals.length,
        totalSavings: Math.round(totalSavings * 100) / 100,
        averageDiscount: Math.round(averageDiscount * 100) / 100,
        maxDiscount: deals.length > 0 ? Math.max(...deals.map(d => d.discountPercentage)) : 0
      }
    })

  } catch (error) {
    console.error('Error fetching deals:', error)
    return handleError(error)
  }
}
