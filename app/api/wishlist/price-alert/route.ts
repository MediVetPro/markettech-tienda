import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { clearUserCache } from '@/lib/cache'

// PUT - Actualizar alerta de precio
export async function PUT(request: NextRequest) {
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
    const { productId, priceAlertEnabled, targetPrice } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'ID del producto es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el item existe en la wishlist del usuario
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    })

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'El producto no está en tu lista de deseos' },
        { status: 404 }
      )
    }

    // Validar precio objetivo
    if (priceAlertEnabled && targetPrice) {
      const currentPrice = parseFloat(wishlistItem.product.price.toString())
      const target = parseFloat(targetPrice)
      
      if (target >= currentPrice) {
        return NextResponse.json(
          { 
            error: 'El precio objetivo debe ser menor al precio actual',
            currentPrice,
            targetPrice: target
          },
          { status: 400 }
        )
      }
    }

    // Actualizar alerta de precio
    const updatedItem = await prisma.wishlistItem.update({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      data: {
        priceAlertEnabled: priceAlertEnabled || false,
        targetPrice: priceAlertEnabled && targetPrice ? parseFloat(targetPrice) : null,
        lastNotifiedAt: null // Reset notification timestamp
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              select: {
                id: true,
                path: true,
                alt: true,
                order: true
              },
              orderBy: { order: 'asc' },
              take: 1
            }
          }
        }
      }
    })

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`✅ [PRICE_ALERT] Alerta actualizada para: ${wishlistItem.product.title}`)
    
    return NextResponse.json({
      message: priceAlertEnabled ? 'Alerta de precio activada' : 'Alerta de precio desactivada',
      wishlistItem: updatedItem
    })

  } catch (error) {
    console.error('Error updating price alert:', error)
    return handleError(error)
  }
}

// GET - Obtener alertas de precio activas
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
    
    if (!decoded.user || decoded.error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.user.userId

    const priceAlerts = await prisma.wishlistItem.findMany({
      where: {
        userId,
        priceAlertEnabled: true
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            previousPrice: true,
            images: {
              select: {
                id: true,
                path: true,
                alt: true,
                order: true
              },
              orderBy: { order: 'asc' },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calcular información de descuento
    const alertsWithDiscount = priceAlerts.map(item => {
      const currentPrice = parseFloat(item.product.price.toString())
      const targetPrice = parseFloat(item.targetPrice?.toString() || '0')
      const previousPrice = item.product.previousPrice ? parseFloat(item.product.previousPrice.toString()) : null
      
      let discountPercentage = 0
      if (previousPrice && previousPrice > currentPrice) {
        discountPercentage = ((previousPrice - currentPrice) / previousPrice) * 100
      }

      const targetDiscountPercentage = targetPrice > 0 ? ((currentPrice - targetPrice) / currentPrice) * 100 : 0

      return {
        ...item,
        product: {
          ...item.product,
          currentPrice,
          targetPrice,
          previousPrice,
          discountPercentage: Math.round(discountPercentage * 100) / 100,
          targetDiscountPercentage: Math.round(targetDiscountPercentage * 100) / 100,
          isTargetReached: targetPrice > 0 && currentPrice <= targetPrice
        }
      }
    })

    return NextResponse.json({
      priceAlerts: alertsWithDiscount,
      total: alertsWithDiscount.length
    })

  } catch (error) {
    console.error('Error fetching price alerts:', error)
    return handleError(error)
  }
}
