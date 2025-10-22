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

    console.log('🔄 Iniciando restore da base de dados...')

    // Obter arquivo do formulário
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Arquivo de backup não fornecido' }, { status: 400 })
    }

    if (!file.name.endsWith('.json')) {
      return NextResponse.json({ error: 'Arquivo deve ser um backup JSON válido' }, { status: 400 })
    }

    try {
      // Ler arquivo JSON
      const fileContent = await file.text()
      const backupData = JSON.parse(fileContent)

      if (!backupData.tables) {
        return NextResponse.json({ error: 'Arquivo de backup inválido' }, { status: 400 })
      }

      console.log('📁 Arquivo de backup carregado:', backupData.timestamp)

      // Restaurar dados de cada tabela (orden importante para dependencias)
      const tableOrder = [
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

      for (const table of tableOrder) {
        if (backupData.tables[table] && backupData.tables[table].length > 0) {
          try {
            // Mapear nombres de tablas a nombres de modelos de Prisma
            const modelName = tableModelMap[table] || table.toLowerCase()
            
            // Limpar tabela existente
            await (prisma as any)[modelName].deleteMany()
            
            // Inserir dados do backup
            await (prisma as any)[modelName].createMany({
              data: backupData.tables[table]
            })
            
            console.log(`✅ Tabela ${table}: ${backupData.tables[table].length} registros restaurados`)
            
            // Log especial para tablas de configuración
            if (['SiteConfig', 'CommissionSettings', 'GlobalPaymentProfile'].includes(table) && backupData.tables[table].length > 0) {
              console.log(`🔧 Configuraciones restauradas en ${table}: ${backupData.tables[table].length} registros`)
              if (table === 'SiteConfig') {
                backupData.tables[table].slice(0, 3).forEach((config: any) => {
                  console.log(`  - ${config.key}: ${config.value.substring(0, 50)}...`)
                })
              }
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao restaurar tabela ${table}:`, error)
          }
        }
      }

      console.log('✅ Restore realizado com sucesso!')

      return NextResponse.json({
        success: true,
        message: 'Backup restaurado com sucesso!'
      })

    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error)
      return NextResponse.json({ error: 'Erro ao processar arquivo de backup' }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro no restore:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor durante o restore' },
      { status: 500 }
    )
  }
}
