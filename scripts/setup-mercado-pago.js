const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupMercadoPago() {
  console.log('🚀 Configurando Mercado Pago para pagos PIX reales...')
  
  try {
    // Buscar el perfil global activo
    const globalProfile = await prisma.globalPaymentProfile.findFirst({
      where: { isActive: true }
    })

    if (!globalProfile) {
      console.error('❌ No se encontró perfil global activo')
      return
    }

    console.log('📝 Actualizando perfil con configuración Mercado Pago...')
    
    // Actualizar el perfil con configuración Mercado Pago
    const updatedProfile = await prisma.globalPaymentProfile.update({
      where: { id: globalProfile.id },
      data: {
        pixKey: 'admin@markettech.com',
        pixKeyType: 'EMAIL',
        pixProvider: 'MERCADO_PAGO', // Cambiar a Mercado Pago
        pixApiKey: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN',
        pixWebhookUrl: process.env.NEXT_PUBLIC_BASE_URL ? 
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/pix` : 
          'http://localhost:3002/api/webhooks/pix'
      }
    })

    console.log('✅ Perfil Mercado Pago configurado exitosamente')
    console.log('📊 Configuración PIX:')
    console.log(`   - Chave PIX: ${updatedProfile.pixKey}`)
    console.log(`   - Tipo: ${updatedProfile.pixKeyType}`)
    console.log(`   - Provedor: ${updatedProfile.pixProvider}`)
    console.log(`   - API Key: ${updatedProfile.pixApiKey?.substring(0, 20)}...`)
    console.log(`   - Webhook URL: ${updatedProfile.pixWebhookUrl}`)
    
    console.log('\n🔧 Para usar en producción:')
    console.log('1. Obtén tu Access Token de Mercado Pago')
    console.log('2. Configura la variable MERCADOPAGO_ACCESS_TOKEN')
    console.log('3. Configura la variable NEXT_PUBLIC_BASE_URL con tu dominio')
    console.log('4. Configura el webhook en Mercado Pago:')
    console.log(`   URL: ${updatedProfile.pixWebhookUrl}`)
    console.log('   Eventos: payment.created, payment.updated')

  } catch (error) {
    console.error('❌ Error configurando Mercado Pago:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupMercadoPago()
