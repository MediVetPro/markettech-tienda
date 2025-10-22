import { useState, useEffect } from 'react'

interface SiteConfig {
  id: string
  key: string
  value: string
  type: string
}

export function useSiteConfig() {
  const [configs, setConfigs] = useState<SiteConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (response.ok) {
        setConfigs(data.configs || [])
      } else {
        setError(data.error || 'Error fetching configs')
        // Fallback a datos por defecto
        setConfigs(getDefaultConfigs())
      }
    } catch (err) {
      setError('Error fetching configs')
      setConfigs(getDefaultConfigs())
    } finally {
      setIsLoading(false)
    }
  }

  const getConfigValue = (key: string) => {
    return configs.find(config => config.key === key)?.value || ''
  }

  return {
    configs,
    isLoading,
    error,
    getConfigValue,
    refetch: fetchConfigs
  }
}

function getDefaultConfigs(): SiteConfig[] {
  return [
    {
      id: '1',
      key: 'site_title',
      value: 'Smartesh',
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
    }
  ]
}
