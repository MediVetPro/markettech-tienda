import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/orders/commission - Crear orden con sistema de comisiones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customerInfo, 
      items, 
      paymentMethod = 'PIX',
      commissionRate = 0.05 // 5% por defecto
    } = body

    console.log('💰 [COMMISSION] Creando orden con sistema de comisiones')
    console.log('💰 [COMMISSION] Items:', items.length)
    console.log('💰 [COMMISSION] Tasa de comisión:', commissionRate)
    console.log('💰 [COMMISSION] Payment method:', paymentMethod)
    console.log('💰 [COMMISSION] Customer info:', customerInfo)
    console.log('💰 [COMMISSION] Items details:', items)
    console.log('💰 [COMMISSION] Body completo:', JSON.stringify(body, null, 2))

    // 1. Agrupar items por vendedor
    const itemsBySeller = new Map<string, any[]>()
    
    for (const item of items) {
      console.log(`💰 [COMMISSION] Procesando item: ${item.id}`)
      
      // Obtener información del producto para saber el vendedor
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { userId: true, title: true, price: true }
      })

      console.log(`💰 [COMMISSION] Producto encontrado:`, product)

      if (!product) {
        console.error(`❌ [COMMISSION] Producto ${item.id} no encontrado`)
        throw new Error(`Producto ${item.id} no encontrado`)
      }

      const sellerId = product.userId
      console.log(`💰 [COMMISSION] Seller ID: ${sellerId}`)
      
      if (!sellerId) {
        console.error(`❌ [COMMISSION] Producto ${item.id} no tiene vendedor asignado`)
        throw new Error(`Producto ${item.id} no tiene vendedor asignado`)
      }
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, [])
      }
      
      itemsBySeller.get(sellerId)!.push({
        ...item,
        sellerId,
        productTitle: product.title,
        productPrice: product.price
      })
    }

    console.log('💰 [COMMISSION] Items agrupados por vendedor:', itemsBySeller.size)

    // 2. Crear la orden principal
    const totalAmount = items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0)
    
    console.log(`💰 [COMMISSION] Total amount: ${totalAmount}`)
    console.log(`💰 [COMMISSION] Customer info:`, customerInfo)
    
    const order = await prisma.order.create({
      data: {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: `${customerInfo.address || ''}, ${customerInfo.city || ''}, ${customerInfo.state || ''} ${customerInfo.zipCode || ''}`.trim(),
        total: totalAmount,
        status: 'PENDING',
        paymentMethod,
        commissionRate,
        platformFee: totalAmount * commissionRate,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: parseFloat(item.price)
          }))
        }
      }
    })

    console.log('💰 [COMMISSION] Orden principal creada:', order.id)

    // 3. Crear pagos para cada vendedor
    const sellerPayouts = []
    
    for (const [sellerId, sellerItems] of Array.from(itemsBySeller.entries())) {
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
      const commission = sellerTotal * commissionRate
      const sellerAmount = sellerTotal - commission

      console.log(`💰 [COMMISSION] Vendedor ${sellerId}:`)
      console.log(`💰 [COMMISSION] - Total: R$ ${sellerTotal}`)
      console.log(`💰 [COMMISSION] - Comisión: R$ ${commission}`)
      console.log(`💰 [COMMISSION] - Vendedor recibe: R$ ${sellerAmount}`)

      const payout = await prisma.sellerPayout.create({
        data: {
          orderId: order.id,
          sellerId,
          amount: sellerAmount,
          commission: commission,
          status: 'PENDING'
        }
      })

      sellerPayouts.push(payout)
    }

    console.log('💰 [COMMISSION] Pagos a vendedores creados:', sellerPayouts.length)

    // 4. Retornar la orden con información de comisiones
    const orderWithPayouts = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                userId: true
              }
            }
          }
        },
        sellerPayouts: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      order: orderWithPayouts,
      message: 'Orden creada con sistema de comisiones'
    })

  } catch (error) {
    console.error('❌ [COMMISSION] Error:', error)
    console.error('❌ [COMMISSION] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: 'Error al crear orden con comisiones',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/orders/commission - Obtener configuración de comisiones
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.commissionSettings.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      commissionRate: settings?.rate || 0.05,
      settings
    })

  } catch (error) {
    console.error('❌ [COMMISSION] Error al obtener configuración:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración de comisiones' },
      { status: 500 }
    )
  }
}
