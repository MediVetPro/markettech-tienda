import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'

// GET - Obtener estadísticas de cupones
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
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Solo administradores pueden ver estadísticas
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver estadísticas' },
        { status: 403 }
      )
    }

    console.log('📊 [COUPON_STATS] Obteniendo estadísticas de cupones')

    // Usar caché para estadísticas
    const cacheKey = 'coupon_stats'
    
    const stats = await getCachedData(
      cacheKey,
      async () => {
        // Estadísticas generales
        const totalCoupons = await prisma.coupon.count()
        const activeCoupons = await prisma.coupon.count({
          where: { isActive: true }
        })
        const expiredCoupons = await prisma.coupon.count({
          where: {
            validUntil: { lt: new Date() }
          }
        })

        // Estadísticas de uso
        const totalUsages = await prisma.couponUsage.count()
        
        // Calcular descuento total basado en los cupones usados
        const usedCoupons = await prisma.couponUsage.findMany({
          include: {
            coupon: true
          }
        })
        
        const totalDiscountGiven = usedCoupons.reduce((sum, usage) => {
          return sum + usage.coupon.value.toNumber()
        }, 0)

        // Cupones más usados
        const mostUsedCoupons = await prisma.coupon.findMany({
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            value: true,
            usageCount: true,
            usageLimit: true
          },
          orderBy: { usageCount: 'desc' },
          take: 10
        })

        // Cupones por tipo
        const couponsByType = await prisma.coupon.groupBy({
          by: ['type'],
          _count: { id: true },
          _sum: { usageCount: true }
        })

        // Cupones por categoría
        const couponsByCategory = await prisma.coupon.groupBy({
          by: ['category'],
          where: {
            category: { not: null }
          },
          _count: { id: true },
          _sum: { usageCount: true }
        })

        // Uso reciente (últimos 30 días)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentUsages = await prisma.couponUsage.count({
          where: {
            usedAt: { gte: thirtyDaysAgo }
          }
        })

        // Cupones que están por expirar (próximos 7 días)
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

        const expiringSoon = await prisma.coupon.count({
          where: {
            validUntil: {
              gte: new Date(),
              lte: sevenDaysFromNow
            },
            isActive: true
          }
        })

        // Cupones con límite alcanzado
        const limitReached = await prisma.coupon.count({
          where: {
            usageLimit: { not: null },
            usageCount: { gte: prisma.coupon.fields.usageLimit }
          }
        })

        return {
          general: {
            totalCoupons,
            activeCoupons,
            expiredCoupons,
            totalUsages,
            recentUsages,
            expiringSoon,
            limitReached
          },
          mostUsedCoupons,
          byType: couponsByType.map(item => ({
            type: item.type,
            count: item._count.id,
            totalUsages: item._sum.usageCount || 0
          })),
          byCategory: couponsByCategory.map(item => ({
            category: item.category,
            count: item._count.id,
            totalUsages: item._sum.usageCount || 0
          }))
        }
      },
      CACHE_TTL.ADMIN_STATS
    )

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error getting coupon stats:', error)
    return handleError(error)
  }
}
