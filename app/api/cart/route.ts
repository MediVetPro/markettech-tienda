import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] GET /api/cart - Iniciando...')
    
    // Verificar autenticación JWT
    const authHeader = request.headers.get('authorization')
    console.log('🔍 [API] Authorization header:', authHeader ? 'Presente' : 'Ausente')
    
    const token = extractTokenFromHeader(authHeader)
    console.log('🔍 [API] Token extraído:', token ? 'Sí' : 'No')
    
    if (!token) {
      console.warn('⚠️ [API] No token provided in cart GET request')
      return NextResponse.json({ error: 'No token provided' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const payload = verifyJWT(token)
    console.log('🔍 [API] Payload JWT:', payload)
    
    if (!payload) {
      console.warn('⚠️ [API] Invalid token in cart GET request:', token.substring(0, 20) + '...')
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const userId = payload.userId
    console.log('✅ [API] Valid JWT token for user:', userId)

    // Buscar carrito del usuario en la base de datos
    console.log('🔍 [API] Buscando carrito para userId:', userId)
    const userCart = await prisma.userCart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        }
      }
    })

    console.log('🔍 [API] Carrito encontrado:', userCart ? 'Sí' : 'No')
    if (userCart) {
      console.log('🔍 [API] Items en carrito:', userCart.items.length)
      console.log('🔍 [API] Carrito ID:', userCart.id)
      console.log('🔍 [API] Items detallados:', userCart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        productTitle: item.product.title
      })))
    }

    if (!userCart) {
      console.log('ℹ️ [API] No hay carrito para el usuario, retornando array vacío')
      return NextResponse.json({ items: [] }, { headers: corsHeaders })
    }

    // Convertir a formato del carrito
    const cartItems = userCart.items.map(item => ({
      id: item.product.id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0]?.path ? `/api/images${item.product.images[0].path}` : '/placeholder.jpg',
      condition: item.product.condition,
      aestheticCondition: item.product.aestheticCondition
    }))

    console.log('✅ [API] Retornando carrito con', cartItems.length, 'items')
    return NextResponse.json({ items: cartItems }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 [API] POST /api/cart - Iniciando...')
    
    // Verificar autenticación JWT
    const authHeader = request.headers.get('authorization')
    console.log('💾 [API] Authorization header:', authHeader ? 'Presente' : 'Ausente')
    
    const token = extractTokenFromHeader(authHeader)
    console.log('💾 [API] Token extraído:', token ? 'Sí' : 'No')
    
    if (!token) {
      console.warn('⚠️ [API] No token provided in cart POST request')
      return NextResponse.json({ error: 'No token provided' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const payload = verifyJWT(token)
    console.log('💾 [API] Payload JWT:', payload)
    
    if (!payload) {
      console.warn('⚠️ [API] Invalid token in cart POST request:', token.substring(0, 20) + '...')
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const userId = payload.userId
    console.log('✅ [API] Valid JWT token for user:', userId)

    const body = await request.json()
    const { items } = body
    console.log('💾 [API] Items recibidos:', items.length)
    console.log('💾 [API] Items:', items)

    // Validar que los productos existen
    const productIds = items.map((item: any) => item.id)
    console.log('💾 [API] Product IDs a validar:', productIds)
    
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    })
    
    console.log('💾 [API] Productos existentes encontrados:', existingProducts.length)

    if (existingProducts.length !== productIds.length) {
      console.warn('⚠️ [API] Algunos productos no existen')
      const missingProducts = productIds.filter((id: string) => !existingProducts.find(p => p.id === id))
      console.warn('⚠️ [API] Productos no encontrados:', missingProducts)
      return NextResponse.json({ 
        error: 'Some products not found',
        missingProducts: missingProducts
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Usar transacción para evitar pérdida de datos
    console.log('💾 [API] Iniciando transacción...')
    await prisma.$transaction(async (tx) => {
      // Buscar carrito existente
      console.log('💾 [API] Buscando carrito existente...')
      const existingCart = await tx.userCart.findUnique({
        where: { userId },
        include: { items: true }
      })
      
      console.log('💾 [API] Carrito existente:', existingCart ? 'Sí' : 'No')
      if (existingCart) {
        console.log('💾 [API] Items existentes:', existingCart.items.length)
      }

      if (existingCart) {
        // Eliminar items existentes
        console.log('💾 [API] Eliminando items existentes...')
        await tx.cartItem.deleteMany({
          where: { userCartId: existingCart.id }
        })
      }

      // Crear o actualizar carrito
      const userCart = existingCart || await tx.userCart.create({
        data: { userId }
      })
      console.log('💾 [API] Carrito ID:', userCart.id)

      // Agregar nuevos items
      if (items.length > 0) {
        console.log('💾 [API] Creando nuevos items...')
        await tx.cartItem.createMany({
          data: items.map((item: any) => ({
            userCartId: userCart.id,
            productId: item.id,
            quantity: item.quantity
          }))
        })
        console.log('💾 [API] Items creados exitosamente')
      }
    })

    console.log('✅ [API] Carrito guardado exitosamente para usuario:', userId)
    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error saving cart:', error)
    return NextResponse.json({ error: 'Failed to save cart' }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación JWT
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      console.warn('⚠️ No token provided in cart DELETE request')
      return NextResponse.json({ error: 'No token provided' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const payload = verifyJWT(token)
    if (!payload) {
      console.warn('⚠️ Invalid token in cart DELETE request:', token.substring(0, 20) + '...')
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const userId = payload.userId
    console.log('✅ Valid JWT token for user:', userId)

    // Usar transacción para eliminar carrito de forma segura
    await prisma.$transaction(async (tx) => {
      // Buscar carrito del usuario
      const userCart = await tx.userCart.findUnique({
        where: { userId },
        include: { items: true }
      })

      if (userCart) {
        // Eliminar items del carrito
        await tx.cartItem.deleteMany({
          where: { userCartId: userCart.id }
        })

        // Eliminar carrito
        await tx.userCart.delete({
          where: { id: userCart.id }
        })

        console.log('🛒 Carrito eliminado para usuario:', userId)
      } else {
        console.log('🛒 No hay carrito para eliminar para usuario:', userId)
      }
    })

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json({ error: 'Failed to clear cart' }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}