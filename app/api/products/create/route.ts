import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      description, 
      price, 
      supplierPrice,
      stock, 
      status = 'ACTIVE',
      categories,
      condition,
      aestheticCondition,
      specifications,
      manufacturerCode,
      manufacturer,
      model,
      userId
    } = await request.json()

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        supplierPrice: supplierPrice || price * 0.7,
        stock,
        status,
        categories,
        condition: condition || 'NEW',
        aestheticCondition: aestheticCondition || 10,
        specifications: specifications || '',
        manufacturerCode: manufacturerCode || `MC-${Date.now()}`,
        manufacturer,
        model,
        userId
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
