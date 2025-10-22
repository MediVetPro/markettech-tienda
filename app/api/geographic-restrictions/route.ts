import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GeographicRestrictions } from '@/lib/brazilianStates'

export async function GET() {
  try {
    // Obtener configuraciones de restricciones geográficas
    const restrictionsConfig = await prisma.siteConfig.findFirst({
      where: { key: 'geographic_restrictions' }
    })

    let restrictions: GeographicRestrictions = {
      enabled: false,
      type: 'none',
      allowedStates: [],
      allowedCities: []
    }

    if (restrictionsConfig) {
      try {
        restrictions = JSON.parse(restrictionsConfig.value)
      } catch (error) {
        console.error('Error parsing geographic restrictions:', error)
      }
    }

    return NextResponse.json({ restrictions })
  } catch (error) {
    console.error('Error fetching geographic restrictions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { restrictions } = await request.json()

    if (!restrictions || typeof restrictions !== 'object') {
      return NextResponse.json(
        { error: 'Datos de restricciones inválidos' },
        { status: 400 }
      )
    }

    // Validar estructura de restricciones
    if (typeof restrictions.enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo enabled debe ser un booleano' },
        { status: 400 }
      )
    }

    if (restrictions.enabled && !['state', 'city', 'none'].includes(restrictions.type)) {
      return NextResponse.json(
        { error: 'El tipo de restricción debe ser state, city o none' },
        { status: 400 }
      )
    }

    if (restrictions.enabled && restrictions.type === 'state' && !Array.isArray(restrictions.allowedStates)) {
      return NextResponse.json(
        { error: 'allowedStates debe ser un array' },
        { status: 400 }
      )
    }

    if (restrictions.enabled && restrictions.type === 'city' && !Array.isArray(restrictions.allowedCities)) {
      return NextResponse.json(
        { error: 'allowedCities debe ser un array' },
        { status: 400 }
      )
    }

    // Guardar o actualizar la configuración
    await prisma.siteConfig.upsert({
      where: { key: 'geographic_restrictions' },
      update: {
        value: JSON.stringify(restrictions),
        type: 'json'
      },
      create: {
        key: 'geographic_restrictions',
        value: JSON.stringify(restrictions),
        type: 'json'
      }
    })

    console.log('✅ [GEOGRAPHIC] Restricciones geográficas actualizadas:', restrictions)

    return NextResponse.json({ 
      message: 'Restricciones geográficas actualizadas correctamente',
      restrictions 
    })
  } catch (error) {
    console.error('Error updating geographic restrictions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
