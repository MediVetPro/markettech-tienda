import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyJWT(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' }, { status: 403 })
    }

    console.log('💾 Iniciando backup da base de dados...')

    try {
      // Obter dados de todas as tabelas principais
      const backupData: { timestamp: string; version: string; tables: { [key: string]: any[] } } = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        tables: {}
      }

      // Lista COMPLETA de todas las tablas del esquema (en orden de dependencias)
      const tables = [
        // Tablas de configuración (sin dependencias)
        'SiteConfig',
        'CommissionSettings',
        'GlobalPaymentProfile',
        'GlobalPaymentMethod',
        
        // Tablas principales de usuarios y productos
        'User',
        'Product',
        'ProductImage',
        'ProductRating',
        'Review',
        'ReviewVote',
        'WishlistItem',
        'SavedComparison',
        
        // Tablas de pedidos y pagos
        'Order',
        'OrderItem',
        'Payment',
        'PaymentMethod',
        'PixPayment',
        'SellerPayout',
        
        // Tablas de cupones y descuentos
        'Coupon',
        'CouponUsage',
        
        // Tablas de comunicación
        'Message',
        'ChatRoom',
        'ChatMessage',
        'ChatParticipant',
        'WhatsAppMessage',
        'WhatsAppSession',
        
        // Tablas de notificaciones
        'Notification',
        'NotificationPreference',
        'NotificationLog',
        'PushSubscription',
        
        // Tablas de carrito
        'UserCart',
        'CartItem',
        
        // Tablas de inventario
        'Inventory',
        'InventoryMovement',
        'InventoryAlert',
        
        // Tablas de analytics y eventos
        'UserEvent',
        'UserSession',
        'AnalyticsMetric'
      ]

      // Mapeo completo de nombres de tablas a modelos de Prisma
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
        'Inventory': 'inventory',
        'InventoryMovement': 'inventoryMovement',
        'InventoryAlert': 'inventoryAlert',
        'UserEvent': 'userEvent',
        'UserSession': 'userSession',
        'AnalyticsMetric': 'analyticsMetric'
      }

      // Obter dados de cada tabela
      for (const table of tables) {
        try {
          const modelName = tableModelMap[table] || table.toLowerCase()
          const data = await (prisma as any)[modelName].findMany()
          backupData.tables[table] = data
          console.log(`✅ Tabela ${table}: ${data.length} registros`)
          
          // Log especial para tablas de configuración
          if (['SiteConfig', 'CommissionSettings', 'GlobalPaymentProfile'].includes(table) && data.length > 0) {
            console.log(`🔧 Configuraciones incluidas en ${table}: ${data.length} registros`)
            if (table === 'SiteConfig') {
              data.slice(0, 3).forEach((config: any) => {
                console.log(`  - ${config.key}: ${config.value.substring(0, 50)}...`)
              })
            }
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao obter dados da tabela ${table}:`, error)
          backupData.tables[table] = []
        }
      }

      console.log('✅ Backup criado com sucesso!')

      // Retornar o backup como arquivo JSON
      const backupContent = JSON.stringify(backupData, null, 2)
      
      return new NextResponse(backupContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`
        }
      })

    } catch (error) {
      console.error('❌ Erro ao criar backup:', error)
      return NextResponse.json({ error: 'Erro ao criar backup da base de dados' }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro no backup:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor durante o backup' },
      { status: 500 }
    )
  }
}
