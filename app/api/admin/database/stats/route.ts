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

    // Obter estatísticas da base de dados
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalMessages,
      totalNotifications,
      totalImages
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.message.count(),
      prisma.notification.count(),
      prisma.productImage.count()
    ])

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalMessages,
      totalNotifications,
      totalImages
    })

  } catch (error) {
    console.error('Erro ao obter estatísticas da base de dados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
