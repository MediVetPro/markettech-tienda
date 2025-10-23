import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'

// POST - Validar cupón
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
    const { code, orderAmount, items } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Código de cupón es requerido' },
        { status: 400 }
      )
    }

    console.log('🔍 [VALIDATE_COUPON] Validando cupón:', code)

    // Buscar cupón
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        usages: {
          where: { userId },
          select: { id: true, usedAt: true }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      )
    }

    // Validar cupón activo
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Cupón no está activo' },
        { status: 400 }
      )
    }

    // Validar fechas
    const now = new Date()
    if (coupon.validFrom > now) {
      return NextResponse.json(
        { error: 'Cupón aún no es válido' },
        { status: 400 }
      )
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json(
        { error: 'Cupón ha expirado' },
        { status: 400 }
      )
    }

    // Validar límite de usos totales
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'Cupón ha alcanzado su límite de usos' },
        { status: 400 }
      )
    }

    // Validar límite por usuario
    if (coupon.userLimit && coupon.usages.length >= coupon.userLimit) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de usos de este cupón' },
        { status: 400 }
      )
    }

    // Validar monto mínimo de pedido
    if (coupon.minOrderAmount && orderAmount < parseFloat(coupon.minOrderAmount.toString())) {
      return NextResponse.json(
        { 
          error: `El pedido debe ser de al menos $${coupon.minOrderAmount}`,
          minOrderAmount: parseFloat(coupon.minOrderAmount.toString())
        },
        { status: 400 }
      )
    }

    // Validar categoría específica
    if (coupon.category && items) {
      const hasCategoryItem = items.some((item: any) => 
        item.categories?.toLowerCase().includes(coupon.category!.toLowerCase())
      )
      
      if (!hasCategoryItem) {
        return NextResponse.json(
          { 
            error: `Este cupón solo es válido para productos de la categoría: ${coupon.category}`,
            requiredCategory: coupon.category
          },
          { status: 400 }
        )
      }
    }

    // Calcular descuento
    const discount = calculateDiscount(coupon, orderAmount, items)

    console.log(`✅ [VALIDATE_COUPON] Cupón válido: ${coupon.code}, descuento: $${discount}`)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: parseFloat(coupon.value.toString()),
        discount: discount,
        minOrderAmount: coupon.minOrderAmount ? parseFloat(coupon.minOrderAmount.toString()) : null,
        maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount.toString()) : null,
        category: coupon.category
      }
    })

  } catch (error) {
    console.error('Error validating coupon:', error)
    return handleError(error)
  }
}

// Función para calcular descuento
function calculateDiscount(coupon: any, orderAmount: number, items?: any[]): number {
  let discount = 0

  switch (coupon.type) {
    case 'PERCENTAGE':
      discount = (orderAmount * parseFloat(coupon.value.toString())) / 100
      
      // Aplicar descuento máximo si existe
      if (coupon.maxDiscount) {
        discount = Math.min(discount, parseFloat(coupon.maxDiscount.toString()))
      }
      break

    case 'FIXED_AMOUNT':
      discount = parseFloat(coupon.value.toString())
      // No puede exceder el monto del pedido
      discount = Math.min(discount, orderAmount)
      break

    case 'FREE_SHIPPING':
      // Para envío gratis, el descuento sería el costo de envío
      // Por ahora, asumimos un costo de envío fijo de $500
      discount = 500
      break

    default:
      discount = 0
  }

  return Math.round(discount * 100) / 100
}
