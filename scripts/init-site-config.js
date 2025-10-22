const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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
    key: 'about_mission_title',
    value: 'Nuestra Misión',
    type: 'text'
  },
  {
    key: 'about_mission_content',
    value: 'En MarketTech, nos dedicamos a ofrecer la mejor tecnología con garantía, precios competitivos y un servicio excepcional. Creemos que todos merecen acceso a productos tecnológicos de calidad.',
    type: 'html'
  },
  {
    key: 'about_stats_clients',
    value: '+1000',
    type: 'text'
  },
  {
    key: 'about_stats_experience',
    value: '5+',
    type: 'text'
  },
  {
    key: 'about_stats_guarantee',
    value: '100%',
    type: 'text'
  },
  {
    key: 'about_stats_support',
    value: '24/7',
    type: 'text'
  },
  {
    key: 'about_values_title',
    value: 'Nuestros Valores',
    type: 'text'
  },
  {
    key: 'about_values_subtitle',
    value: 'Los principios que guían cada decisión que tomamos',
    type: 'text'
  },
  {
    key: 'about_value_quality_title',
    value: 'Calidad Garantizada',
    type: 'text'
  },
  {
    key: 'about_value_quality_content',
    value: 'Todos nuestros productos pasan por un riguroso proceso de verificación para asegurar que cumplan con los más altos estándares de calidad.',
    type: 'html'
  },
  {
    key: 'about_value_service_title',
    value: 'Servicio al Cliente',
    type: 'text'
  },
  {
    key: 'about_value_service_content',
    value: 'Nuestro equipo está disponible para ayudarte en cada paso del proceso, desde la selección hasta el soporte post-venta.',
    type: 'html'
  },
  {
    key: 'about_value_prices_title',
    value: 'Precios Justos',
    type: 'text'
  },
  {
    key: 'about_value_prices_content',
    value: 'Ofrecemos precios competitivos sin comprometer la calidad, asegurando que obtengas el mejor valor por tu inversión.',
    type: 'html'
  },
  {
    key: 'contact_title',
    value: 'Contáctanos',
    type: 'text'
  },
  {
    key: 'contact_content',
    value: 'Estamos aquí para ayudarte. Contáctanos para cualquier consulta sobre nuestros productos o servicios.',
    type: 'html'
  },
  {
    key: 'contact_email',
    value: 'info@markettech.com',
    type: 'text'
  },
  {
    key: 'contact_phone',
    value: '+1 (555) 123-4567',
    type: 'text'
  },
  {
    key: 'contact_whatsapp',
    value: '+1 (555) 123-4567',
    type: 'text'
  },
  {
    key: 'contact_address',
    value: 'Ciudad, País',
    type: 'text'
  },
  {
    key: 'contact_schedule_weekdays',
    value: 'Lunes - Viernes: 9:00 AM - 6:00 PM',
    type: 'text'
  },
  {
    key: 'contact_schedule_saturday',
    value: 'Sábados: 10:00 AM - 4:00 PM',
    type: 'text'
  },
  {
    key: 'contact_schedule_sunday',
    value: 'Domingos: Cerrado',
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
  },
  {
    key: 'team_title',
    value: 'Nossa Equipe',
    type: 'text'
  },
  {
    key: 'team_subtitle',
    value: 'Especialistas em tecnologia apaixonados por oferecer a melhor experiência',
    type: 'text'
  },
  {
    key: 'team_member_1_name',
    value: 'María González',
    type: 'text'
  },
  {
    key: 'team_member_1_position',
    value: 'CEO & Fundadora',
    type: 'text'
  },
  {
    key: 'team_member_1_description',
    value: 'Más de 10 años de experiencia en tecnología y retail',
    type: 'text'
  },
  {
    key: 'team_member_2_name',
    value: 'Carlos Rodríguez',
    type: 'text'
  },
  {
    key: 'team_member_2_position',
    value: 'Director Técnico',
    type: 'text'
  },
  {
    key: 'team_member_2_description',
    value: 'Especialista en productos Apple y dispositivos móviles',
    type: 'text'
  },
  {
    key: 'team_member_3_name',
    value: 'Ana Martínez',
    type: 'text'
  },
  {
    key: 'team_member_3_position',
    value: 'Gerente de Ventas',
    type: 'text'
  },
  {
    key: 'team_member_3_description',
    value: 'Experta en atención al cliente y soluciones tecnológicas',
    type: 'text'
  },
  {
    key: 'team_member_4_name',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_4_position',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_4_description',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_5_name',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_5_position',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_5_description',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_1_image',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_2_image',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_3_image',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_4_image',
    value: '',
    type: 'text'
  },
  {
    key: 'team_member_5_image',
    value: '',
    type: 'text'
  }
]

async function initSiteConfig() {
  try {
    console.log('🚀 Inicializando configuraciones del sitio...')
    
    // Verificar si ya existen configuraciones
    const existingConfigs = await prisma.siteConfig.count()
    
    if (existingConfigs > 0) {
      console.log(`✅ Ya existen ${existingConfigs} configuraciones en la base de datos`)
      return
    }
    
    // Crear configuraciones por defecto
    for (const config of defaultConfigs) {
      await prisma.siteConfig.create({
        data: config
      })
      console.log(`✅ Creada configuración: ${config.key}`)
    }
    
    console.log(`🎉 Se crearon ${defaultConfigs.length} configuraciones por defecto`)
    
  } catch (error) {
    console.error('❌ Error inicializando configuraciones:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initSiteConfig()
