import { NextRequest, NextResponse } from 'next/server'
import { brazilianStates, getAllowedStates, getAllowedCities } from '@/lib/brazilianStates'
import { GeographicRestrictions } from '@/lib/brazilianStates'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const stateCode = searchParams.get('state')
    const includeRestrictions = searchParams.get('includeRestrictions') === 'true'

    let restrictions: GeographicRestrictions = {
      enabled: false,
      type: 'none',
      allowedStates: [],
      allowedCities: []
    }

    // Si se solicitan restricciones, obtenerlas
    if (includeRestrictions) {
      try {
        const { prisma } = await import('@/lib/prisma')
        const restrictionsConfig = await prisma.siteConfig.findFirst({
          where: { key: 'geographic_restrictions' }
        })

        if (restrictionsConfig) {
          restrictions = JSON.parse(restrictionsConfig.value)
        }
      } catch (error) {
        console.error('Error fetching restrictions:', error)
      }
    }

    // Si se solicita un estado específico, devolver sus ciudades
    if (stateCode) {
      const cities = includeRestrictions 
        ? getAllowedCities(stateCode, restrictions)
        : brazilianStates.find(s => s.code === stateCode)?.cities || []
      
      return NextResponse.json({ cities })
    }

    // Devolver todos los estados (con restricciones si se solicitan)
    const states = includeRestrictions 
      ? getAllowedStates(restrictions)
      : brazilianStates

    return NextResponse.json({ 
      states: states.map(state => ({
        code: state.code,
        name: state.name,
        cities: includeRestrictions 
          ? getAllowedCities(state.code, restrictions)
          : state.cities
      }))
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
