import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL, clearUserCache } from '@/lib/cache'

// GET - Obtener wishlist del usuario
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Usar caché para la wishlist
    const cacheKey = `wishlist:${userId}:${page}:${limit}`
    
    const result = await getCachedData(
      cacheKey,
      async () => {
        const wishlistItems = await prisma.wishlistItem.findMany({
          where: { userId },
          include: {
            product: {
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
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        })

        const total = await prisma.wishlistItem.count({
          where: { userId }
        })

        return {
          wishlistItems,
          total
        }
      },
      CACHE_TTL.USER_PROFILE
    )

    const totalPages = Math.ceil(result.total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      wishlistItems: result.wishlistItems,
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
    console.error('Error fetching wishlist:', error)
    return handleError(error)
  }
}

// POST - Agregar producto a wishlist
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

    const userId = decoded.userId
    const { productId, priceAlertEnabled, targetPrice } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'ID del producto es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, price: true, status: true }
    })

    if (!product) {
      throw CommonErrors.PRODUCT_NOT_FOUND(productId)
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'El producto no está disponible' },
        { status: 400 }
      )
    }

    // Verificar si ya está en la wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'El producto ya está en tu lista de deseos' },
        { status: 400 }
      )
    }

    // Crear item en wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
        priceAlertEnabled: priceAlertEnabled || false,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null
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

    console.log(`✅ [WISHLIST] Producto agregado: ${product.title}`)
    
    return NextResponse.json({
      message: 'Producto agregado a tu lista de deseos',
      wishlistItem
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return handleError(error)
  }
}

// DELETE - Remover producto de wishlist
export async function DELETE(request: NextRequest) {
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
    const productId = searchParams.get('productId')

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
            title: true
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

    // Eliminar de wishlist
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })

    // Limpiar caché del usuario
    clearUserCache(userId)

    console.log(`✅ [WISHLIST] Producto removido: ${wishlistItem.product.title}`)
    
    return NextResponse.json({
      message: 'Producto removido de tu lista de deseos'
    })

  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return handleError(error)
  }
}
