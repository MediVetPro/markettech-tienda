import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    const { user, error } = verifyToken(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Solo permitir a administradores
    if (user.role !== 'ADMIN' && user.role !== 'ADMIN_VENDAS') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    console.log('🔧 Iniciando corrección de productos...')

    // Contar productos sin userId
    const productsWithoutUser = await prisma.product.count({
      where: {
        userId: null
      }
    })

    console.log(`📦 Productos sin userId: ${productsWithoutUser}`)

    if (productsWithoutUser === 0) {
      return NextResponse.json({ 
        message: 'No hay productos que corregir',
        fixed: 0 
      })
    }

    // Buscar el usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    console.log(`👤 Asignando productos al usuario: ${currentUser.name} (${currentUser.role})`)

    // Actualizar productos sin userId
    const updateResult = await prisma.product.updateMany({
      where: {
        userId: null
      },
      data: {
        userId: user.userId
      }
    })

    console.log(`✅ Productos corregidos: ${updateResult.count}`)

    return NextResponse.json({
      message: 'Productos corregidos exitosamente',
      fixed: updateResult.count,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
      }
    })

  } catch (error) {
    console.error('❌ Error corrigiendo productos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
