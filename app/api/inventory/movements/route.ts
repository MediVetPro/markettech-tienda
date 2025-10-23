import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { recordInventoryMovement, reserveStock, releaseStock } from '@/lib/inventory'

// POST - Registrar movimiento de inventario
export async function POST(request: NextRequest) {
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

    // Solo administradores pueden registrar movimientos
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden registrar movimientos de inventario' },
        { status: 403 }
      )
    }

    const { 
      inventoryId, 
      type, 
      quantity, 
      reason, 
      reference, 
      notes 
    } = await request.json()

    if (!inventoryId || !type || !quantity) {
      return NextResponse.json(
        { error: 'inventoryId, type y quantity son requeridos' },
        { status: 400 }
      )
    }

    if (!['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'].includes(type)) {
      return NextResponse.json(
        { error: 'type debe ser IN, OUT, ADJUSTMENT o TRANSFER' },
        { status: 400 }
      )
    }

    console.log('📦 [INVENTORY_MOVEMENT] Registrando movimiento:', type)

    const result = await recordInventoryMovement({
      inventoryId,
      type: type as any,
      quantity: parseInt(quantity),
      reason,
      reference,
      notes,
      userId: decoded.user.userId
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error registrando movimiento' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Movimiento registrado exitosamente',
      movement: result.movement,
      inventory: result.inventory
    })

  } catch (error) {
    console.error('Error recording inventory movement:', error)
    return handleError(error)
  }
}

// POST - Reservar stock
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
    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const { inventoryId, quantity, orderId } = await request.json()

    if (!inventoryId || !quantity || !orderId) {
      return NextResponse.json(
        { error: 'inventoryId, quantity y orderId son requeridos' },
        { status: 400 }
      )
    }

    console.log('📦 [INVENTORY_RESERVE] Reservando stock:', quantity)

    const result = await reserveStock(inventoryId, parseInt(quantity), orderId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error reservando stock' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Stock reservado exitosamente',
      inventory: result.inventory
    })

  } catch (error) {
    console.error('Error reserving stock:', error)
    return handleError(error)
  }
}

// DELETE - Liberar stock
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = request.nextUrl
    const inventoryId = searchParams.get('inventoryId')
    const quantity = searchParams.get('quantity')
    const orderId = searchParams.get('orderId')

    if (!inventoryId || !quantity || !orderId) {
      return NextResponse.json(
        { error: 'inventoryId, quantity y orderId son requeridos' },
        { status: 400 }
      )
    }

    console.log('📦 [INVENTORY_RELEASE] Liberando stock:', quantity)

    const result = await releaseStock(inventoryId, parseInt(quantity), orderId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error liberando stock' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Stock liberado exitosamente',
      inventory: result.inventory
    })

  } catch (error) {
    console.error('Error releasing stock:', error)
    return handleError(error)
  }
}
