const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupPixProfile() {
  console.log('🚀 Configurando perfil PIX...')
  
  try {
    // Buscar el perfil global activo
    const globalProfile = await prisma.globalPaymentProfile.findFirst({
      where: { isActive: true }
    })

    if (!globalProfile) {
      console.error('❌ No se encontró perfil global activo')
      return
    }

    console.log('📝 Actualizando perfil con configuración PIX...')
    
    // Actualizar el perfil con configuración PIX
    const updatedProfile = await prisma.globalPaymentProfile.update({
      where: { id: globalProfile.id },
      data: {
        pixKey: 'admin@markettech.com',
        pixKeyType: 'EMAIL',
        pixProvider: 'STATIC', // Usar PIX estático para pruebas
        pixApiKey: 'test_api_key',
        pixWebhookUrl: 'https://markettech.com/api/webhooks/pix'
      }
    })

    console.log('✅ Perfil PIX configurado exitosamente')
    console.log('📊 Configuración PIX:')
    console.log(`   - Chave PIX: ${updatedProfile.pixKey}`)
    console.log(`   - Tipo: ${updatedProfile.pixKeyType}`)
    console.log(`   - Provedor: ${updatedProfile.pixProvider}`)
    
    // Verificar que PIX esté habilitado en los métodos de pago
    const pixMethod = await prisma.globalPaymentMethod.findFirst({
      where: {
        globalPaymentProfileId: globalProfile.id,
        type: 'PIX'
      }
    })

    if (!pixMethod) {
      console.log('📝 Creando método de pago PIX...')
      await prisma.globalPaymentMethod.create({
        data: {
          globalPaymentProfileId: globalProfile.id,
          type: 'PIX',
          isActive: true,
          config: JSON.stringify({
            instantPayment: true,
            fee: 0,
            processingTime: 'Instantâneo'
          })
        }
      })
      console.log('✅ Método PIX creado')
    } else {
      console.log('✅ Método PIX ya existe')
    }

  } catch (error) {
    console.error('❌ Error configurando PIX:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupPixProfile()
