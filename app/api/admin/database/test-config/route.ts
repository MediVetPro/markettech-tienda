import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyJWT(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' }, { status: 403 })
    }

    console.log('🔍 Verificando tablas de configuración...')

    // Verificar SiteConfig
    const siteConfigs = await prisma.siteConfig.findMany()
    console.log(`📊 SiteConfig: ${siteConfigs.length} registros`)

    // Verificar otras tablas de configuración si existen
    const globalPaymentProfiles = await prisma.globalPaymentProfile.findMany()
    console.log(`📊 GlobalPaymentProfile: ${globalPaymentProfiles.length} registros`)

    const commissionSettings = await prisma.commissionSettings.findMany()
    console.log(`📊 CommissionSettings: ${commissionSettings.length} registros`)

    return NextResponse.json({
      success: true,
      data: {
        siteConfigs: {
          count: siteConfigs.length,
          records: siteConfigs.slice(0, 5) // Primeros 5 registros como muestra
        },
        globalPaymentProfiles: {
          count: globalPaymentProfiles.length,
          records: globalPaymentProfiles.slice(0, 3)
        },
        commissionSettings: {
          count: commissionSettings.length,
          records: commissionSettings.slice(0, 3)
        }
      }
    })

  } catch (error) {
    console.error('❌ Erro ao verificar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
