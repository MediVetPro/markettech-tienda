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

    console.log('🔍 Verificando todas las tablas del sistema...')

    // Lista completa de todas las tablas
    const allTables = [
      'SiteConfig', 'CommissionSettings', 'GlobalPaymentProfile', 'GlobalPaymentMethod',
      'User', 'Product', 'ProductImage', 'ProductRating', 'Review', 'ReviewVote',
      'WishlistItem', 'SavedComparison', 'Order', 'OrderItem', 'Payment', 'PaymentMethod',
      'PixPayment', 'SellerPayout', 'Coupon', 'CouponUsage', 'Message', 'ChatRoom',
      'ChatMessage', 'ChatParticipant', 'WhatsAppMessage', 'WhatsAppSession',
      'Notification', 'NotificationPreference', 'NotificationLog', 'PushSubscription',
      'UserCart', 'CartItem', 'Inventory', 'InventoryMovement', 'InventoryAlert',
      'UserEvent', 'UserSession', 'AnalyticsMetric'
    ]

    // Mapeo de nombres de tablas a modelos de Prisma
    const tableModelMap: { [key: string]: string } = {
      'SiteConfig': 'siteConfig',
      'CommissionSettings': 'commissionSettings',
      'GlobalPaymentProfile': 'globalPaymentProfile',
      'GlobalPaymentMethod': 'globalPaymentMethod',
      'User': 'user',
      'Product': 'product',
      'ProductImage': 'productImage',
      'ProductRating': 'productRating',
      'Review': 'review',
      'ReviewVote': 'reviewVote',
      'WishlistItem': 'wishlistItem',
      'SavedComparison': 'savedComparison',
      'Order': 'order',
      'OrderItem': 'orderItem',
      'Payment': 'payment',
      'PaymentMethod': 'paymentMethod',
      'PixPayment': 'pixPayment',
      'SellerPayout': 'sellerPayout',
      'Coupon': 'coupon',
      'CouponUsage': 'couponUsage',
      'Message': 'message',
      'ChatRoom': 'chatRoom',
      'ChatMessage': 'chatMessage',
      'ChatParticipant': 'chatParticipant',
      'WhatsAppMessage': 'whatsAppMessage',
      'WhatsAppSession': 'whatsAppSession',
      'Notification': 'notification',
      'NotificationPreference': 'notificationPreference',
      'NotificationLog': 'notificationLog',
      'PushSubscription': 'pushSubscription',
      'UserCart': 'userCart',
      'CartItem': 'cartItem',
        // Inventory models removed
      'UserEvent': 'userEvent',
      'UserSession': 'userSession',
      'AnalyticsMetric': 'analyticsMetric'
    }

    const tableStatus: { [key: string]: any } = {}
    let totalRecords = 0

    // Verificar cada tabla
    for (const table of allTables) {
      try {
        const modelName = tableModelMap[table] || table.toLowerCase()
        const data = await (prisma as any)[modelName].findMany()
        const count = data.length
        totalRecords += count

        tableStatus[table] = {
          exists: true,
          count: count,
          modelName: modelName,
          status: count > 0 ? 'HAS_DATA' : 'EMPTY'
        }

        console.log(`✅ ${table}: ${count} registros (modelo: ${modelName})`)

        // Log especial para tablas de configuración
        if (['SiteConfig', 'CommissionSettings', 'GlobalPaymentProfile'].includes(table) && count > 0) {
          console.log(`🔧 Configuraciones en ${table}: ${count} registros`)
          if (table === 'SiteConfig') {
            data.slice(0, 3).forEach((config: any) => {
              console.log(`  - ${config.key}: ${config.value.substring(0, 50)}...`)
            })
          }
        }
      } catch (error) {
        tableStatus[table] = {
          exists: false,
          count: 0,
          error: error instanceof Error ? error.message : String(error),
          status: 'ERROR'
        }
        console.warn(`⚠️ Error en tabla ${table}:`, error instanceof Error ? error.message : String(error))
      }
    }

    console.log(`📊 Total de registros en todas las tablas: ${totalRecords}`)

    return NextResponse.json({
      success: true,
      summary: {
        totalTables: allTables.length,
        tablesWithData: Object.values(tableStatus).filter((t: any) => t.count > 0).length,
        totalRecords: totalRecords
      },
      tables: tableStatus
    })

  } catch (error) {
    console.error('❌ Erro ao verificar tablas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
