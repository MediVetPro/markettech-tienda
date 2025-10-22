'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Globe, Mail, Phone, MapPin, Info, MessageSquare, Settings, Users, Award, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import GeographicRestrictionsComponent from '@/components/GeographicRestrictions'
import { GeographicRestrictions } from '@/lib/brazilianStates'

interface SiteConfig {
  id: string
  key: string
  value: string
  type: string
}

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<SiteConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [geographicRestrictions, setGeographicRestrictions] = useState<GeographicRestrictions>({
    enabled: false,
    type: 'none',
    allowedStates: [],
    allowedCities: []
  })
    const { isAdmin } = useAuth()

  useEffect(() => {
    if (!isAdmin) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      return
    }
    
    fetchConfigs()
  }, [isAdmin])

  // Cargar restricciones geográficas cuando se carguen las configuraciones
  useEffect(() => {
    if (configs.length > 0) {
      fetchGeographicRestrictions()
    }
  }, [configs])

  const fetchConfigs = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (response.ok) {
        setConfigs(data.configs || [])
      } else {
        console.error('Error fetching configs:', data.error)
        // Fallback a datos de prueba si la API falla
        const mockConfigs: SiteConfig[] = [
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
        setConfigs(mockConfigs)
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGeographicRestrictions = async () => {
    try {
      // Buscar las restricciones en las configuraciones del sitio
      const restrictionsConfig = configs.find(config => config.key === 'geographic_restrictions')
      
      if (restrictionsConfig) {
        try {
          const restrictions = JSON.parse(restrictionsConfig.value)
          setGeographicRestrictions(restrictions)
        } catch (error) {
          console.error('Error parsing geographic restrictions:', error)
        }
      } else {
        // Establecer valores por defecto
        setGeographicRestrictions({
          enabled: false,
          type: 'none',
          allowedStates: [],
          allowedCities: []
        })
      }
    } catch (error) {
      console.error('Error fetching geographic restrictions:', error)
    }
  }

  const saveGeographicRestrictions = async (restrictions: GeographicRestrictions) => {
    try {
      // Guardar las restricciones como parte de las configuraciones del sitio
      const restrictionsConfig = {
        id: getConfigId('geographic_restrictions') || '',
        key: 'geographic_restrictions',
        value: JSON.stringify(restrictions),
        type: 'json'
      }

      // Actualizar el estado local de configuraciones
      setConfigs(prev => {
        const filtered = prev.filter(config => config.key !== 'geographic_restrictions')
        return [...filtered, restrictionsConfig]
      })

      // Guardar todas las configuraciones
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          configs: [...configs.filter(config => config.key !== 'geographic_restrictions'), restrictionsConfig]
        })
      })

      if (response.ok) {
        alert('Restricciones geográficas guardadas correctamente')
        setGeographicRestrictions(restrictions)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar restricciones')
      }
    } catch (error) {
      console.error('Error saving geographic restrictions:', error)
      throw error
    }
  }

  const handleConfigChange = (id: string, value: string, key: string) => {
    if (id) {
      // Si el campo existe, actualizarlo
      setConfigs(prev => prev.map(config => 
        config.id === id ? { ...config, value } : config
      ))
    } else {
      // Si el campo no existe, crearlo temporalmente
      setConfigs(prev => [...prev, {
        id: `temp_${key}_${Date.now()}`, // ID temporal
        key,
        value,
        type: 'text'
      }])
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ configs })
      })

      if (response.ok) {
        alert('Configurações salvas com sucesso!')
        // Recargar las configuraciones para asegurar que se guardaron
        await fetchConfigs()
      } else {
        const errorData = await response.json()
        console.error('Error saving configs:', errorData.error)
        alert('Erro ao salvar configurações. Tente novamente.')
      }
    } catch (error) {
      console.error('Error saving configs:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const getConfigValue = (key: string) => {
    return configs.find(config => config.key === key)?.value || ''
  }

  const getConfigId = (key: string) => {
    return configs.find(config => config.key === key)?.id || ''
  }

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'site-config')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        const iconUrl = data.url
        
        // Actualizar la configuración con la nueva URL del icono
        handleConfigChange(getConfigId('site_icon'), iconUrl, 'site_icon')
      } else {
        const errorData = await response.json()
        alert('Erro ao fazer upload do ícone: ' + (errorData.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Error uploading icon:', error)
      alert('Erro ao fazer upload do ícone. Tente novamente.')
    }
  }

  const removeIcon = () => {
    handleConfigChange(getConfigId('site_icon'), '', 'site_icon')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao Painel
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Configurações do Site</h1>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
          {/* General Site Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Informações Gerais do Site</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Site
                </label>
                <input
                  type="text"
                  value={getConfigValue('site_title')}
                  onChange={(e) => handleConfigChange(getConfigId('site_title'), e.target.value, 'site_title')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Smartesh - Tecnología de Calidad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Site
                </label>
                <input
                  type="text"
                  value={getConfigValue('site_description')}
                  onChange={(e) => handleConfigChange(getConfigId('site_description'), e.target.value, 'site_description')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Tu tienda de tecnología de confianza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone da Loja
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleIconUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <button
                      type="button"
                      onClick={removeIcon}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                    >
                      Remover Ícone
                    </button>
                  </div>
                  
                  {getConfigValue('site_icon') && (
                    <div className="flex items-center space-x-4">
                      <img 
                        src={getConfigValue('site_icon')} 
                        alt="Ícone da loja"
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div>
                        <p className="text-sm text-gray-600">Ícone atual:</p>
                        <p className="text-xs text-gray-500 break-all">{getConfigValue('site_icon')}</p>
                      </div>
                    </div>
                  )}
                  
                  {!getConfigValue('site_icon') && (
                    <div className="text-sm text-gray-500">
                      Nenhum ícone configurado. O ícone padrão será usado.
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-md">
                    <p className="font-medium mb-1">Formatos recomendados:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>PNG</strong> - Melhor opção (suporte a transparência, alta qualidade)</li>
                      <li><strong>JPEG</strong> - Boa opção para fotos</li>
                      <li><strong>WebP</strong> - Formato moderno e otimizado</li>
                    </ul>
                    <p className="mt-2">Tamanho recomendado: 64x64px a 256x256px</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Info className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Seção Sobre</h2>
            </div>
            
            <div className="space-y-6">
              {/* Título y contenido principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Seção Sobre
                  </label>
                  <input
                    type="text"
                    value={getConfigValue('about_title')}
                    onChange={(e) => handleConfigChange(getConfigId('about_title'), e.target.value, 'about_title')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Sobre Smartesh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Missão
                  </label>
                  <input
                    type="text"
                    value={getConfigValue('about_mission_title')}
                    onChange={(e) => handleConfigChange(getConfigId('about_mission_title'), e.target.value, 'about_mission_title')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Nuestra Misión"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo da Seção Sobre
                </label>
                <textarea
                  rows={4}
                  value={getConfigValue('about_content')}
                  onChange={(e) => handleConfigChange(getConfigId('about_content'), e.target.value, 'about_content')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
                  placeholder="Descreva sua empresa, missão, valores, etc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo da Missão
                </label>
                <textarea
                  rows={4}
                  value={getConfigValue('about_mission_content')}
                  onChange={(e) => handleConfigChange(getConfigId('about_mission_content'), e.target.value, 'about_mission_content')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
                  placeholder="Ex: En MarketTech, nos dedicamos a ofrecer la mejor tecnología..."
                />
              </div>

              {/* Estadísticas */}
              <div className="border-t pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-primary-600" />
Estatísticas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
Clientes Satisfeitos
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('about_stats_clients')}
                      onChange={(e) => handleConfigChange(getConfigId('about_stats_clients'), e.target.value, 'about_stats_clients')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ex: +1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
Anos de Experiência
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('about_stats_experience')}
                      onChange={(e) => handleConfigChange(getConfigId('about_stats_experience'), e.target.value, 'about_stats_experience')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ex: 5+"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
Garantia
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('about_stats_guarantee')}
                      onChange={(e) => handleConfigChange(getConfigId('about_stats_guarantee'), e.target.value, 'about_stats_guarantee')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ex: 100%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
Suporte
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('about_stats_support')}
                      onChange={(e) => handleConfigChange(getConfigId('about_stats_support'), e.target.value, 'about_stats_support')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ex: 24/7"
                    />
                  </div>
                </div>
              </div>

              {/* Valores */}
              <div className="border-t pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-primary-600" />
Nossos Valores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
Título da Qualidade
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('about_value_quality_title')}
                      onChange={(e) => handleConfigChange(getConfigId('about_value_quality_title'), e.target.value, 'about_value_quality_title')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ex: Calidad Garantizada"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
Conteúdo da Qualidade
                    </label>
                    <textarea
                      rows={3}
                      value={getConfigValue('about_value_quality_content')}
                      onChange={(e) => handleConfigChange(getConfigId('about_value_quality_content'), e.target.value, 'about_value_quality_content')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
                      placeholder="Ex: Todos nuestros productos pasan por un riguroso proceso..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
Título do Serviço
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('about_value_service_title')}
                      onChange={(e) => handleConfigChange(getConfigId('about_value_service_title'), e.target.value, 'about_value_service_title')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ex: Servicio al Cliente"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
Conteúdo do Serviço
                    </label>
                    <textarea
                      rows={3}
                      value={getConfigValue('about_value_service_content')}
                      onChange={(e) => handleConfigChange(getConfigId('about_value_service_content'), e.target.value, 'about_value_service_content')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
                      placeholder="Ex: Nuestro equipo está disponible para ayudarte..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
Título dos Preços
                    </label>
                    <input
                      type="text"
                      value={getConfigValue('about_value_prices_title')}
                      onChange={(e) => handleConfigChange(getConfigId('about_value_prices_title'), e.target.value, 'about_value_prices_title')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ex: Precios Justos"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
Conteúdo dos Preços
                    </label>
                    <textarea
                      rows={3}
                      value={getConfigValue('about_value_prices_content')}
                      onChange={(e) => handleConfigChange(getConfigId('about_value_prices_content'), e.target.value, 'about_value_prices_content')}
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
                      placeholder="Ex: Ofrecemos precios competitivos sin comprometer la calidad..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Seção de Contato</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Contato
                </label>
                <input
                  type="text"
                  value={getConfigValue('contact_title')}
                  onChange={(e) => handleConfigChange(getConfigId('contact_title'), e.target.value, 'contact_title')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Contáctanos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo do Contato
                </label>
                <textarea
                  value={getConfigValue('contact_content')}
                  onChange={(e) => handleConfigChange(getConfigId('contact_content'), e.target.value, 'contact_content')}
                  rows={3}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Estamos aquí para ayudarte..."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email de Contato
                </label>
                <input
                  type="email"
                  value={getConfigValue('contact_email')}
                  onChange={(e) => handleConfigChange(getConfigId('contact_email'), e.target.value, 'contact_email')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: info@markettech.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
Telefone
                </label>
                <input
                  type="tel"
                  value={getConfigValue('contact_phone')}
                  onChange={(e) => handleConfigChange(getConfigId('contact_phone'), e.target.value, 'contact_phone')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: +1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
WhatsApp
                </label>
                <input
                  type="tel"
                  value={getConfigValue('contact_whatsapp')}
                  onChange={(e) => handleConfigChange(getConfigId('contact_whatsapp'), e.target.value, 'contact_whatsapp')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: +1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
Endereço
                </label>
                <input
                  type="text"
                  value={getConfigValue('contact_address')}
                  onChange={(e) => handleConfigChange(getConfigId('contact_address'), e.target.value, 'contact_address')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Ciudad, País"
                />
              </div>
            </div>

            {/* Horarios */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary-600" />
Horários de Funcionamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Dias da Semana
                  </label>
                  <input
                    type="text"
                    value={getConfigValue('contact_schedule_weekdays')}
                    onChange={(e) => handleConfigChange(getConfigId('contact_schedule_weekdays'), e.target.value, 'contact_schedule_weekdays')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Lunes - Viernes: 9:00 AM - 6:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Sábados
                  </label>
                  <input
                    type="text"
                    value={getConfigValue('contact_schedule_saturday')}
                    onChange={(e) => handleConfigChange(getConfigId('contact_schedule_saturday'), e.target.value, 'contact_schedule_saturday')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Sábados: 10:00 AM - 4:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Domingos
                  </label>
                  <input
                    type="text"
                    value={getConfigValue('contact_schedule_sunday')}
                    onChange={(e) => handleConfigChange(getConfigId('contact_schedule_sunday'), e.target.value, 'contact_schedule_sunday')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Domingos: Cerrado"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Redes Sociais</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
URL do Facebook
                </label>
                <input
                  type="url"
                  value={getConfigValue('social_facebook')}
                  onChange={(e) => handleConfigChange(getConfigId('social_facebook'), e.target.value, 'social_facebook')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: https://facebook.com/smartesh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
URL do Instagram
                </label>
                <input
                  type="url"
                  value={getConfigValue('social_instagram')}
                  onChange={(e) => handleConfigChange(getConfigId('social_instagram'), e.target.value, 'social_instagram')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: https://instagram.com/smartesh"
                />
              </div>
            </div>
          </div>

          {/* Commission Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Award className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Configurações de Comissão</h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-blue-800 text-sm">
                      <strong>Nota:</strong> Estas configurações afetam como as comissões são calculadas para todos os produtos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Porcentagem Total de Lucro
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getConfigValue('commission_total_percentage')}
                    onChange={(e) => handleConfigChange(getConfigId('commission_total_percentage'), e.target.value, 'commission_total_percentage')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Porcentagem de lucro total sobre o preço de compra</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Sua Porcentagem
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getConfigValue('commission_owner_percentage')}
                    onChange={(e) => handleConfigChange(getConfigId('commission_owner_percentage'), e.target.value, 'commission_owner_percentage')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="20"
                  />
                  <p className="text-xs text-gray-500 mt-1">Sua porcentagem do lucro total</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Porcentagem do Trabalhador
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getConfigValue('commission_worker_percentage')}
                    onChange={(e) => handleConfigChange(getConfigId('commission_worker_percentage'), e.target.value, 'commission_worker_percentage')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="20"
                  />
                  <p className="text-xs text-gray-500 mt-1">Porcentagem do trabalhador do lucro total</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Porcentagem da Loja
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getConfigValue('commission_store_percentage')}
                    onChange={(e) => handleConfigChange(getConfigId('commission_store_percentage'), e.target.value, 'commission_store_percentage')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Porcentagem da loja do lucro total</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Resumo das Comissões</h3>
                <div className="text-sm text-gray-600">
                  <p>• Lucro Total: {getConfigValue('commission_total_percentage') || '50'}% do preço de compra</p>
                  <p>• Sua Parte: {getConfigValue('commission_owner_percentage') || '20'}% do lucro</p>
                  <p>• Trabalhador: {getConfigValue('commission_worker_percentage') || '20'}% do lucro</p>
                  <p>• Loja: {getConfigValue('commission_store_percentage') || '10'}% do lucro</p>
                </div>
              </div>
            </div>
          </div>

          {/* Default Product Margin */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Configurações de Produtos</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margem Padrão de Produtos
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.1"
                  value={getConfigValue('default_product_margin')}
                  onChange={(e) => handleConfigChange(getConfigId('default_product_margin'), e.target.value, 'default_product_margin')}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="50"
                />
                <p className="text-xs text-gray-500 mt-1">Porcentagem de margem padrão para novos produtos (será aplicada automaticamente ao criar produtos)</p>
              </div>
            </div>
          </div>

          {/* Geographic Restrictions */}
          <GeographicRestrictionsComponent
            onSave={saveGeographicRestrictions}
            initialRestrictions={geographicRestrictions}
          />

          {/* Team Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Seção da Equipe</h2>
            </div>
            
            <div className="space-y-6">
              {/* Team Title and Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Equipe
                  </label>
                  <input
                    type="text"
                    value={getConfigValue('team_title')}
                    onChange={(e) => handleConfigChange(getConfigId('team_title'), e.target.value, 'team_title')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Nossa Equipe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo da Equipe
                  </label>
                  <input
                    type="text"
                    value={getConfigValue('team_subtitle')}
                    onChange={(e) => handleConfigChange(getConfigId('team_subtitle'), e.target.value, 'team_subtitle')}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Especialistas em tecnologia apaixonados..."
                  />
                </div>
              </div>

              {/* Team Members */}
              {[1, 2, 3, 4, 5].map((memberNum) => (
                <div key={memberNum} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    Membro da Equipe {memberNum}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Membro
                      </label>
                      <input
                        type="text"
                        value={getConfigValue(`team_member_${memberNum}_name`)}
                        onChange={(e) => handleConfigChange(getConfigId(`team_member_${memberNum}_name`), e.target.value, `team_member_${memberNum}_name`)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ex: María González"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posição do Membro
                      </label>
                      <input
                        type="text"
                        value={getConfigValue(`team_member_${memberNum}_position`)}
                        onChange={(e) => handleConfigChange(getConfigId(`team_member_${memberNum}_position`), e.target.value, `team_member_${memberNum}_position`)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ex: CEO & Fundadora"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição do Membro
                      </label>
                      <input
                        type="text"
                        value={getConfigValue(`team_member_${memberNum}_description`)}
                        onChange={(e) => handleConfigChange(getConfigId(`team_member_${memberNum}_description`), e.target.value, `team_member_${memberNum}_description`)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ex: Más de 10 años de experiencia..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagem do Membro
                      </label>
                      <input
                        type="url"
                        value={getConfigValue(`team_member_${memberNum}_image`)}
                        onChange={(e) => handleConfigChange(getConfigId(`team_member_${memberNum}_image`), e.target.value, `team_member_${memberNum}_image`)}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ex: https://ejemplo.com/foto.jpg"
                      />
                      {getConfigValue(`team_member_${memberNum}_image`) && (
                        <div className="mt-2">
                          <img 
                            src={getConfigValue(`team_member_${memberNum}_image`)} 
                            alt={`Foto de ${getConfigValue(`team_member_${memberNum}_name`) || 'miembro del equipo'}`}
                            className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              disabled={isSaving}
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}