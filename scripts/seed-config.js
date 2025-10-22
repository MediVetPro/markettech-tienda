const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedConfig() {
  try {
    console.log('🌱 Seeding site configuration...')

    // Configuraciones por defecto
    const defaultConfigs = [
      {
        key: 'site_title',
        value: 'Smartesh - Tecnología de Calidad',
        type: 'text'
      },
      {
        key: 'site_description',
        value: 'Tu tienda de tecnología de confianza. Productos nuevos y usados de la mejor calidad.',
        type: 'text'
      },
      {
        key: 'about_title',
        value: 'Sobre Smartesh',
        type: 'text'
      },
      {
        key: 'about_content',
        value: 'Somos una empresa especializada en la venta de tecnología de alta calidad. Con más de 5 años de experiencia en el mercado, ofrecemos productos nuevos y usados con garantía y la mejor atención al cliente.',
        type: 'html'
      },
      {
        key: 'contact_email',
        value: 'contacto@smartesh.com',
        type: 'text'
      },
      {
        key: 'contact_phone',
        value: '+55 (11) 99999-9999',
        type: 'text'
      },
      {
        key: 'contact_address',
        value: 'Rua da Tecnologia, 123 - São Paulo, SP - CEP: 01234-567',
        type: 'text'
      },
      {
        key: 'contact_whatsapp',
        value: '+55 (11) 99999-9999',
        type: 'text'
      },
      {
        key: 'social_facebook',
        value: 'https://facebook.com/smartesh',
        type: 'text'
      },
      {
        key: 'social_instagram',
        value: 'https://instagram.com/smartesh',
        type: 'text'
      }
    ]

    // Crear configuraciones
    for (const config of defaultConfigs) {
      await prisma.siteConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: config
      })
      
      console.log(`✅ Created/Updated config: ${config.key}`)
    }

    console.log('🎉 Site configuration seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding configuration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedConfig()
