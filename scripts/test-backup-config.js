const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBackupConfig() {
  try {
    console.log('🔍 Verificando tablas de configuración en el backup...')

    // Verificar SiteConfig
    const siteConfigs = await prisma.siteConfig.findMany()
    console.log(`📊 SiteConfig: ${siteConfigs.length} registros`)
    
    if (siteConfigs.length > 0) {
      console.log('✅ SiteConfig tiene datos:')
      siteConfigs.slice(0, 3).forEach(config => {
        console.log(`  - ${config.key}: ${config.value.substring(0, 50)}...`)
      })
    } else {
      console.log('⚠️ SiteConfig está vacía')
    }

    // Verificar GlobalPaymentProfile
    const globalPaymentProfiles = await prisma.globalPaymentProfile.findMany()
    console.log(`📊 GlobalPaymentProfile: ${globalPaymentProfiles.length} registros`)

    // Verificar CommissionSettings
    const commissionSettings = await prisma.commissionSettings.findMany()
    console.log(`📊 CommissionSettings: ${commissionSettings.length} registros`)

    // Simular el proceso de backup
    console.log('\n🧪 Simulando proceso de backup...')
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: {}
    }

    // Probar SiteConfig específicamente
    try {
      const siteConfigData = await prisma.siteConfig.findMany()
      backupData.tables['SiteConfig'] = siteConfigData
      console.log(`✅ SiteConfig incluida en backup: ${siteConfigData.length} registros`)
    } catch (error) {
      console.error('❌ Error al obtener SiteConfig:', error)
    }

    // Probar con el nombre correcto del modelo
    try {
      const siteConfigData = await prisma.siteConfig.findMany()
      backupData.tables['SiteConfig'] = siteConfigData
      console.log(`✅ SiteConfig (modelo correcto): ${siteConfigData.length} registros`)
    } catch (error) {
      console.error('❌ Error con modelo correcto:', error)
    }

    console.log('\n📋 Resumen del backup:')
    console.log(`- SiteConfig: ${backupData.tables['SiteConfig']?.length || 0} registros`)
    
    if (backupData.tables['SiteConfig']?.length > 0) {
      console.log('✅ Las configuraciones del sitio SÍ están incluidas en el backup')
    } else {
      console.log('❌ Las configuraciones del sitio NO están incluidas en el backup')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBackupConfig()
