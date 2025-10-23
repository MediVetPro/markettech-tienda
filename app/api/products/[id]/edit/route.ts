import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description, price, stock, status, categories } = await request.json()

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        title,
        description,
        price,
        stock,
        status,
        categories,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}
