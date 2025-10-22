import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyJWT(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener configuraciones de comisiones
    const commissionConfigs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            'commission_total_percentage',
            'commission_owner_percentage', 
            'commission_worker_percentage',
            'commission_store_percentage'
          ]
        }
      }
    })

    console.log('Found commission configs:', commissionConfigs)

    // Crear objeto con las configuraciones
    const settings = {
      totalPercentage: 50, // Valor por defecto
      ownerPercentage: 20, // Valor por defecto
      workerPercentage: 20, // Valor por defecto
      storePercentage: 10  // Valor por defecto
    }

    // Actualizar con valores de la base de datos si existen
    commissionConfigs.forEach(config => {
      const value = parseFloat(config.value) || 0
      console.log(`Setting ${config.key} to ${value}`)
      switch (config.key) {
        case 'commission_total_percentage':
          settings.totalPercentage = value
          break
        case 'commission_owner_percentage':
          settings.ownerPercentage = value
          break
        case 'commission_worker_percentage':
          settings.workerPercentage = value
          break
        case 'commission_store_percentage':
          settings.storePercentage = value
          break
      }
    })

    console.log('Final settings:', settings)

    return NextResponse.json(settings)

  } catch (error) {
    console.error('Error fetching commission settings:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}