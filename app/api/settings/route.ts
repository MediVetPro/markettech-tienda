import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener configuraciones de la base de datos
    const configs = await prisma.siteConfig.findMany({
      orderBy: { key: 'asc' }
    })

    // Si hay configuraciones en la base de datos, usarlas
    if (configs.length > 0) {
      return NextResponse.json({ configs })
    }

    // Si no hay configuraciones, crear las configuraciones por defecto
    const defaultConfigs = [
      {
        id: '1',
        key: 'site_title',
        value: 'Smartesh - Tecnología de Calidad',
        type: 'text'
      },
      {
        id: '2',
        key: 'site_description',
        value: 'Tu tienda de tecnología de confianza. Productos nuevos y usados de la mejor calidad.',
        type: 'text'
      },
      {
        id: '2.1',
        key: 'site_icon',
        value: '',
        type: 'text'
      },
      {
        id: '3',
        key: 'about_title',
        value: 'Sobre Smartesh',
        type: 'text'
      },
      {
        id: '4',
        key: 'about_content',
        value: 'Somos una empresa especializada en la venta de tecnología de alta calidad. Con más de 5 años de experiencia en el mercado, ofrecemos productos nuevos y usados con garantía y la mejor atención al cliente.',
        type: 'html'
      },
      {
        id: '5',
        key: 'about_mission_title',
        value: 'Nuestra Misión',
        type: 'text'
      },
      {
        id: '6',
        key: 'about_mission_content',
        value: 'En MarketTech, nos dedicamos a ofrecer la mejor tecnología con garantía, precios competitivos y un servicio excepcional. Creemos que todos merecen acceso a productos tecnológicos de calidad.',
        type: 'html'
      },
      {
        id: '7',
        key: 'about_stats_clients',
        value: '+1000',
        type: 'text'
      },
      {
        id: '8',
        key: 'about_stats_experience',
        value: '5+',
        type: 'text'
      },
      {
        id: '9',
        key: 'about_stats_guarantee',
        value: '100%',
        type: 'text'
      },
      {
        id: '10',
        key: 'about_stats_support',
        value: '24/7',
        type: 'text'
      },
      {
        id: '11',
        key: 'about_values_title',
        value: 'Nuestros Valores',
        type: 'text'
      },
      {
        id: '12',
        key: 'about_values_subtitle',
        value: 'Los principios que guían cada decisión que tomamos',
        type: 'text'
      },
      {
        id: '13',
        key: 'about_value_quality_title',
        value: 'Calidad Garantizada',
        type: 'text'
      },
      {
        id: '14',
        key: 'about_value_quality_content',
        value: 'Todos nuestros productos pasan por un riguroso proceso de verificación para asegurar que cumplan con los más altos estándares de calidad.',
        type: 'html'
      },
      {
        id: '15',
        key: 'about_value_service_title',
        value: 'Servicio al Cliente',
        type: 'text'
      },
      {
        id: '16',
        key: 'about_value_service_content',
        value: 'Nuestro equipo está disponible para ayudarte en cada paso del proceso, desde la selección hasta el soporte post-venta.',
        type: 'html'
      },
      {
        id: '17',
        key: 'about_value_prices_title',
        value: 'Precios Justos',
        type: 'text'
      },
      {
        id: '18',
        key: 'about_value_prices_content',
        value: 'Ofrecemos precios competitivos sin comprometer la calidad, asegurando que obtengas el mejor valor por tu inversión.',
        type: 'html'
      },
      {
        id: '19',
        key: 'contact_email',
        value: 'info@markettech.com',
        type: 'text'
      },
      {
        id: '20',
        key: 'contact_phone',
        value: '+1 (555) 123-4567',
        type: 'text'
      },
      {
        id: '21',
        key: 'contact_whatsapp',
        value: '+1 (555) 123-4567',
        type: 'text'
      },
      {
        id: '22',
        key: 'contact_address',
        value: 'Ciudad, País',
        type: 'text'
      },
      {
        id: '23',
        key: 'contact_schedule_weekdays',
        value: 'Lunes - Viernes: 9:00 AM - 6:00 PM',
        type: 'text'
      },
      {
        id: '24',
        key: 'contact_schedule_saturday',
        value: 'Sábados: 10:00 AM - 4:00 PM',
        type: 'text'
      },
      {
        id: '25',
        key: 'contact_schedule_sunday',
        value: 'Domingos: Cerrado',
        type: 'text'
      },
      {
        id: '26',
        key: 'social_facebook',
        value: 'https://facebook.com/smartesh',
        type: 'text'
      },
      {
        id: '27',
        key: 'social_instagram',
        value: 'https://instagram.com/smartesh',
        type: 'text'
      },
      {
        id: '28',
        key: 'default_product_margin',
        value: '50',
        type: 'number'
      },
      {
        id: '29',
        key: 'shipping_strategy',
        value: 'FREE_INCLUDED',
        type: 'text'
      },
      {
        id: '30',
        key: 'shipping_cost_curitiba',
        value: '15.00',
        type: 'number'
      },
      {
        id: '31',
        key: 'shipping_cost_other_regions',
        value: '25.00',
        type: 'number'
      },
      {
        id: '32',
        key: 'free_shipping_minimum',
        value: '100.00',
        type: 'number'
      },
      {
        id: '33',
        key: 'shipping_message',
        value: 'Frete Grátis para Curitiba - Região Urbana',
        type: 'text'
      }
    ]

    // Crear configuraciones por defecto en la base de datos
    for (const config of defaultConfigs) {
      await prisma.siteConfig.create({
        data: {
          key: config.key,
          value: config.value,
          type: config.type || 'text'
        }
      })
    }

    return NextResponse.json({ configs: defaultConfigs })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { configs } = body

    console.log('Updating configs:', configs)
    
    // Update or create each config in the database
    for (const config of configs) {
      await prisma.siteConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: {
          key: config.key,
          value: config.value,
          type: config.type || 'text'
        }
      })
    }

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
