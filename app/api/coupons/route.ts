import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL, clearCouponCache } from '@/lib/cache'

// GET - Obtener cupones disponibles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('🎫 [COUPONS] Obteniendo cupones disponibles')

    // Usar caché para cupones
    const cacheKey = `coupons:${category || 'all'}:${type || 'all'}:${page}:${limit}`
    
    const result = await getCachedData(
      cacheKey,
      async () => {
        const where: any = {
          isActive: true,
          validFrom: { lte: new Date() }
        }

        if (category) {
          where.category = category
        }

        if (type) {
          where.type = type
        }

        // Verificar fecha de expiración
        where.OR = [
          { validUntil: null },
          { validUntil: { gte: new Date() } }
        ]

        const [coupons, total] = await Promise.all([
          prisma.coupon.findMany({
            where,
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
              type: true,
              value: true,
              minOrderAmount: true,
              maxDiscount: true,
              category: true,
              usageLimit: true,
              usageCount: true,
              userLimit: true,
              validFrom: true,
              validUntil: true
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
          }),
          prisma.coupon.count({ where })
        ])

        return { coupons, total }
      },
      CACHE_TTL.PRODUCTS
    )

    const totalPages = Math.ceil(result.total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      coupons: result.coupons,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Error fetching coupons:', error)
    return handleError(error)
  }
}

// POST - Crear cupón (solo admin)
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
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar que es admin
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden crear cupones' },
        { status: 403 }
      )
    }

    const {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      category,
      usageLimit,
      userLimit,
      validFrom,
      validUntil
    } = await request.json()

    // Validaciones
    if (!code || !name || !type || !value) {
      return NextResponse.json(
        { error: 'Código, nombre, tipo y valor son requeridos' },
        { status: 400 }
      )
    }

    if (!['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de cupón inválido' },
        { status: 400 }
      )
    }

    if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'El porcentaje debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    if (type === 'FIXED_AMOUNT' && value < 0) {
      return NextResponse.json(
        { error: 'El monto fijo debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar que el código no existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'El código de cupón ya existe' },
        { status: 400 }
      )
    }

    // Crear cupón
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name: name.trim(),
        description: description?.trim(),
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        category: category?.trim(),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        userLimit: userLimit ? parseInt(userLimit) : 1,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null
      }
    })

    // Limpiar caché de cupones
    clearCouponCache()

    console.log(`✅ [COUPON] Cupón creado: ${coupon.code}`)

    return NextResponse.json({
      message: 'Cupón creado exitosamente',
      coupon
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating coupon:', error)
    return handleError(error)
  }
}
