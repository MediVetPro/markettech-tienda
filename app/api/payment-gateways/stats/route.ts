import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getGatewayStats } from '@/lib/paymentGateways'

// GET - Obtener estadísticas de pasarelas
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
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Solo administradores pueden ver estadísticas
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver estadísticas' },
        { status: 403 }
      )
    }

    console.log('💳 [STATS] Obteniendo estadísticas de pasarelas')

    const result = await getGatewayStats()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error obteniendo estadísticas' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      stats: result.stats,
      message: 'Estadísticas obtenidas exitosamente'
    })

  } catch (error) {
    console.error('Error getting gateway stats:', error)
    return handleError(error)
  }
}
