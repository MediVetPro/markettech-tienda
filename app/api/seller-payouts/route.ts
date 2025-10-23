import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// GET /api/seller-payouts - Obtener pagos de un vendedor
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
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar que el usuario es ADMIN_VENDAS
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN_VENDAS') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    // Obtener pagos del vendedor
    const payouts = await prisma.sellerPayout.findMany({
      where: { sellerId: decoded.userId },
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            total: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calcular totales
    const totalEarnings = payouts.reduce((sum, payout) => sum + Number(payout.amount), 0)
    const totalCommission = payouts.reduce((sum, payout) => sum + Number(payout.commission), 0)
    const pendingPayouts = payouts.filter(p => p.status === 'PENDING').length
    const paidPayouts = payouts.filter(p => p.status === 'PAID').length

    return NextResponse.json({
      payouts,
      summary: {
        totalEarnings,
        totalCommission,
        pendingPayouts,
        paidPayouts,
        totalPayouts: payouts.length
      }
    })

  } catch (error) {
    console.error('❌ [SELLER_PAYOUTS] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener pagos del vendedor' },
      { status: 500 }
    )
  }
}

// PUT /api/seller-payouts - Marcar pago como completado (solo ADMIN)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar que el usuario es ADMIN
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden marcar pagos como completados' },
        { status: 403 }
      )
    }

    const { payoutId, status } = await request.json()

    const payout = await prisma.sellerPayout.update({
      where: { id: payoutId },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null
      },
      include: {
        seller: {
          select: {
            name: true,
            email: true
          }
        },
        order: {
          select: {
            id: true,
            customerName: true
          }
        }
      }
    })

    console.log(`💰 [SELLER_PAYOUTS] Pago ${payoutId} marcado como ${status}`)
    console.log(`💰 [SELLER_PAYOUTS] Vendedor: ${payout.seller.name}`)
    console.log(`💰 [SELLER_PAYOUTS] Monto: R$ ${payout.amount}`)

    return NextResponse.json({
      success: true,
      payout,
      message: `Pago marcado como ${status}`
    })

  } catch (error) {
    console.error('❌ [SELLER_PAYOUTS] Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar pago' },
      { status: 500 }
    )
  }
}
