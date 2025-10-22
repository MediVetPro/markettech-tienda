import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError } from '@/lib/errorHandler'

// GET - Verificar si productos están en wishlist
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

    const userId = decoded.userId
    const { searchParams } = request.nextUrl
    const productIds = searchParams.get('productIds')

    if (!productIds) {
      return NextResponse.json(
        { error: 'IDs de productos son requeridos' },
        { status: 400 }
      )
    }

    // Parsear IDs de productos
    const productIdArray = productIds.split(',').filter(id => id.trim())

    if (productIdArray.length === 0) {
      return NextResponse.json({
        wishlistStatus: {}
      })
    }

    // Obtener items de wishlist para los productos especificados
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId,
        productId: {
          in: productIdArray
        }
      },
      select: {
        productId: true,
        priceAlertEnabled: true,
        targetPrice: true
      }
    })

    // Crear mapa de estado de wishlist
    const wishlistStatus: Record<string, {
      inWishlist: boolean
      priceAlertEnabled: boolean
      targetPrice: number | null
    }> = {}

    productIdArray.forEach(productId => {
      const wishlistItem = wishlistItems.find(item => item.productId === productId)
      wishlistStatus[productId] = {
        inWishlist: !!wishlistItem,
        priceAlertEnabled: wishlistItem?.priceAlertEnabled || false,
        targetPrice: wishlistItem?.targetPrice ? parseFloat(wishlistItem.targetPrice.toString()) : null
      }
    })

    return NextResponse.json({
      wishlistStatus
    })

  } catch (error) {
    console.error('Error checking wishlist status:', error)
    return handleError(error)
  }
}
