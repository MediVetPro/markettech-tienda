import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Obtener fabricantes únicos
    const manufacturers = await prisma.product.findMany({
      where: {
        manufacturer: {
          not: null
        }
      },
      select: {
        manufacturer: true
      },
      distinct: ['manufacturer']
    })

    // Obtener modelos únicos
    const models = await prisma.product.findMany({
      where: {
        model: {
          not: null
        }
      },
      select: {
        model: true
      },
      distinct: ['model']
    })

    const manufacturerList = manufacturers
      .map(item => item.manufacturer)
      .filter(Boolean)
      .sort()

    const modelList = models
      .map(item => item.model)
      .filter(Boolean)
      .sort()

    return NextResponse.json({
      manufacturers: manufacturerList,
      models: modelList
    })
  } catch (error) {
    console.error('Error fetching manufacturers and models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manufacturers and models' },
      { status: 500 }
    )
  }
}
