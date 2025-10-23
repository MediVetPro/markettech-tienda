import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { clearCouponCache, clearUserCache } from '@/lib/cache'

// POST - Aplicar cupón a pedido
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
    const { couponCode, orderId, orderAmount, items } = await request.json()

    if (!couponCode || !orderId) {
      return NextResponse.json(
        { error: 'Código de cupón e ID de pedido son requeridos' },
        { status: 400 }
      )
    }

    console.log('🎫 [APPLY_COUPON] Aplicando cupón:', couponCode, 'a pedido:', orderId)

    // Verificar que el pedido existe y pertenece al usuario
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerEmail: decoded.user.email // Asumiendo que el email está en el token
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Buscar cupón
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
      include: {
        usages: {
          where: { userId },
          select: { id: true }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      )
    }

    // Validar cupón (reutilizar lógica de validación)
    const validationResult = await validateCoupon(coupon, userId, orderAmount, items)
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      )
    }

    // Verificar que el cupón no se ha usado en este pedido
    const existingUsage = await prisma.couponUsage.findUnique({
      where: {
        couponId_userId_orderId: {
          couponId: coupon.id,
          userId,
          orderId
        }
      }
    })

    if (existingUsage) {
      return NextResponse.json(
        { error: 'Este cupón ya ha sido aplicado a este pedido' },
        { status: 400 }
      )
    }

    // Aplicar cupón usando transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear registro de uso
      const couponUsage = await tx.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId,
          orderId
        }
      })

      // Actualizar contador de usos del cupón
      await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          usageCount: { increment: 1 }
        }
      })

      // Calcular descuento
      const discount = calculateDiscount(coupon, orderAmount, items)

      // Actualizar pedido con descuento
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          total: { decrement: discount },
          notes: order.notes 
            ? `${order.notes}\nCupón aplicado: ${coupon.code} (-$${discount})`
            : `Cupón aplicado: ${coupon.code} (-$${discount})`
        }
      })

      return {
        couponUsage,
        updatedOrder,
        discount
      }
    })

    // Limpiar cachés
    clearCouponCache()
    clearUserCache(userId)

    console.log(`✅ [APPLY_COUPON] Cupón aplicado exitosamente: ${coupon.code}`)

    return NextResponse.json({
      message: 'Cupón aplicado exitosamente',
      discount: result.discount,
      newTotal: parseFloat(result.updatedOrder.total.toString()),
      coupon: {
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: parseFloat(coupon.value.toString())
      }
    })

  } catch (error) {
    console.error('Error applying coupon:', error)
    return handleError(error)
  }
}

// Función para validar cupón (reutilizada)
async function validateCoupon(coupon: any, userId: string, orderAmount: number, items?: any[]): Promise<{valid: boolean, error?: string}> {
  // Validar cupón activo
  if (!coupon.isActive) {
    return { valid: false, error: 'Cupón no está activo' }
  }

  // Validar fechas
  const now = new Date()
  if (coupon.validFrom > now) {
    return { valid: false, error: 'Cupón aún no es válido' }
  }

  if (coupon.validUntil && coupon.validUntil < now) {
    return { valid: false, error: 'Cupón ha expirado' }
  }

  // Validar límite de usos totales
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: 'Cupón ha alcanzado su límite de usos' }
  }

  // Validar límite por usuario
  if (coupon.userLimit && coupon.usages.length >= coupon.userLimit) {
    return { valid: false, error: 'Has alcanzado el límite de usos de este cupón' }
  }

  // Validar monto mínimo de pedido
  if (coupon.minOrderAmount && orderAmount < parseFloat(coupon.minOrderAmount.toString())) {
    return { 
      valid: false, 
      error: `El pedido debe ser de al menos $${coupon.minOrderAmount}` 
    }
  }

  // Validar categoría específica
  if (coupon.category && items) {
    const hasCategoryItem = items.some((item: any) => 
      item.categories?.toLowerCase().includes(coupon.category!.toLowerCase())
    )
    
    if (!hasCategoryItem) {
      return { 
        valid: false, 
        error: `Este cupón solo es válido para productos de la categoría: ${coupon.category}` 
      }
    }
  }

  return { valid: true }
}

// Función para calcular descuento (reutilizada)
function calculateDiscount(coupon: any, orderAmount: number, items?: any[]): number {
  let discount = 0

  switch (coupon.type) {
    case 'PERCENTAGE':
      discount = (orderAmount * parseFloat(coupon.value.toString())) / 100
      
      if (coupon.maxDiscount) {
        discount = Math.min(discount, parseFloat(coupon.maxDiscount.toString()))
      }
      break

    case 'FIXED_AMOUNT':
      discount = parseFloat(coupon.value.toString())
      discount = Math.min(discount, orderAmount)
      break

    case 'FREE_SHIPPING':
      discount = 500 // Costo de envío fijo
      break

    default:
      discount = 0
  }

  return Math.round(discount * 100) / 100
}
