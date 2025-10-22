import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getInventoryReport, getInventoryAlerts } from '@/lib/inventory'

// GET - Obtener reporte de inventario
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

    // Solo administradores pueden ver inventario
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver el inventario' },
        { status: 403 }
      )
    }

    const { searchParams } = request.nextUrl
    const lowStock = searchParams.get('lowStock') === 'true'
    const outOfStock = searchParams.get('outOfStock') === 'true'
    const category = searchParams.get('category') || undefined
    const supplier = searchParams.get('supplier') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('📦 [INVENTORY] Obteniendo reporte de inventario')

    const result = await getInventoryReport({
      lowStock,
      outOfStock,
      category,
      supplier,
      page,
      limit
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error obteniendo inventario' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error getting inventory report:', error)
    return handleError(error)
  }
}
