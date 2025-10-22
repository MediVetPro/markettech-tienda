const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateToGlobalPayment() {
  console.log('🚀 Iniciando migración a perfil de pago global...')
  
  try {
    // 1. Crear perfil de pago global por defecto
    console.log('📝 Creando perfil de pago global por defecto...')
    
    const globalProfile = await prisma.globalPaymentProfile.create({
      data: {
        companyName: 'MarketTech - Perfil Principal',
        cnpj: '00.000.000/0001-00',
        email: 'admin@markettech.com',
        address: 'Dirección Principal',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '00000-000',
        country: 'Brasil',
        bankName: 'Banco Principal',
        bankCode: '001',
        accountType: 'CHECKING',
        accountNumber: '00000000-0',
        agencyNumber: '0000',
        accountHolder: 'MarketTech Ltda',
        isActive: true,
        paymentMethods: {
          create: [
            { type: 'PIX', isActive: true },
            { type: 'CREDIT_CARD', isActive: true },
            { type: 'DEBIT_CARD', isActive: true },
            { type: 'BOLETO', isActive: false }
          ]
        }
      }
    })
    
    console.log('✅ Perfil global creado:', globalProfile.id)
    
    // 2. Actualizar órdenes existentes para usar el perfil global
    console.log('🔄 Actualizando órdenes existentes...')
    
    const ordersUpdated = await prisma.order.updateMany({
      where: {
        globalPaymentProfileId: null
      },
      data: {
        globalPaymentProfileId: globalProfile.id
      }
    })
    
    console.log(`✅ ${ordersUpdated.count} órdenes actualizadas`)
    
    // 3. Actualizar OrderItems para incluir información del vendedor
    console.log('🔄 Actualizando OrderItems con información del vendedor...')
    
    const orderItems = await prisma.orderItem.findMany({
      include: {
        product: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })
    
    for (const item of orderItems) {
      if (item.product.user) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            sellerId: item.product.user.id,
            sellerName: item.product.user.name,
            sellerCommission: item.price * 0.05 // 5% por defecto
          }
        })
      }
    }
    
    console.log(`✅ ${orderItems.length} OrderItems actualizados`)
    
    // 4. Crear SellerPayouts para órdenes existentes
    console.log('🔄 Creando SellerPayouts para órdenes existentes...')
    
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                user: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    })
    
    let payoutsCreated = 0
    for (const order of orders) {
      const sellerGroups = new Map()
      
      // Agrupar items por vendedor
      for (const item of order.items) {
        if (item.product.user) {
          const sellerId = item.product.user.id
          if (!sellerGroups.has(sellerId)) {
            sellerGroups.set(sellerId, {
              sellerId,
              amount: 0,
              commission: 0
            })
          }
          
          const group = sellerGroups.get(sellerId)
          const itemTotal = item.price * item.quantity
          group.amount += itemTotal * 0.95 // 95% para el vendedor
          group.commission += itemTotal * 0.05 // 5% para la plataforma
        }
      }
      
      // Crear payouts
      for (const [sellerId, data] of sellerGroups) {
        await prisma.sellerPayout.create({
          data: {
            orderId: order.id,
            sellerId: data.sellerId,
            amount: data.amount,
            commission: data.commission,
            status: 'PENDING'
          }
        })
        payoutsCreated++
      }
    }
    
    console.log(`✅ ${payoutsCreated} SellerPayouts creados`)
    
    console.log('🎉 Migración completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar migración
migrateToGlobalPayment()
  .then(() => {
    console.log('✅ Migración finalizada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })
