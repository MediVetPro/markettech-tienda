import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true
          }
        }
      }
    })

    return NextResponse.json({ wishlistItems })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Error al obtener lista de deseos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json()

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId
      },
      include: {
        product: {
          include: {
            images: true
          }
        }
      }
    })

    return NextResponse.json({ wishlistItem })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { error: 'Error al agregar a lista de deseos' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'userId y productId son requeridos' },
        { status: 400 }
      )
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { error: 'Error al eliminar de lista de deseos' },
      { status: 500 }
    )
  }
}