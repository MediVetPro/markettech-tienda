'use client'

import { Users, Award, Shield, Heart } from 'lucide-react'
import { useSiteConfig } from '@/hooks/useSiteConfig'

export default function AboutPage() {
  const { getConfigValue, isLoading } = useSiteConfig()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sobre <span className="text-primary-600">{getConfigValue('site_title') || 'Smartesh'}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getConfigValue('about_content') || 'Conheça nossa história e compromisso com a excelência em tecnologia'}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {getConfigValue('about_mission_title') || 'Nossa Missão'}
              </h2>
              <div 
                className="text-lg text-gray-600 mb-6"
                dangerouslySetInnerHTML={{ 
                  __html: getConfigValue('about_mission_content') || 'Fornecer tecnologia de qualidade com preços justos e atendimento excepcional'
                }}
              />
              <p className="text-lg text-gray-600">
                {getConfigValue('about_mission_content2') || 'Transformando a forma como você compra tecnologia'}
              </p>
            </div>
            <div className="bg-primary-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {getConfigValue('about_stats_clients') || '+1000'}
                  </h3>
                  <p className="text-gray-600 text-sm">Clientes Satisfeitos</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {getConfigValue('about_stats_experience') || '5+'}
                  </h3>
                  <p className="text-gray-600 text-sm">Anos de Experiência</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {getConfigValue('about_stats_guarantee') || '100%'}
                  </h3>
                  <p className="text-gray-600 text-sm">Garantia Total</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {getConfigValue('about_stats_support') || '24/7'}
                  </h3>
                  <p className="text-gray-600 text-sm">Suporte 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {getConfigValue('about_values_title') || 'Nossos Valores'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {getConfigValue('about_values_subtitle') || 'O que nos move todos os dias'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {getConfigValue('about_value_quality_title') || 'Qualidade'}
              </h3>
              <p className="text-gray-600">
                {getConfigValue('about_value_quality_content') || 'Produtos testados e aprovados com rigorosos padrões de qualidade'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {getConfigValue('about_value_service_title') || 'Atendimento'}
              </h3>
              <p className="text-gray-600">
                {getConfigValue('about_value_service_content') || 'Suporte especializado e atendimento personalizado para cada cliente'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {getConfigValue('about_value_prices_title') || 'Preços Justos'}
              </h3>
              <p className="text-gray-600">
                {getConfigValue('about_value_prices_content') || 'Preços competitivos sem comprometer a qualidade'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {getConfigValue('team_title') || 'Nossa Equipe'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {getConfigValue('team_subtitle') || 'Profissionais dedicados ao seu sucesso'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5].map((memberNum) => {
              const name = getConfigValue(`team_member_${memberNum}_name`)
              const position = getConfigValue(`team_member_${memberNum}_position`)
              const description = getConfigValue(`team_member_${memberNum}_description`)
              const image = getConfigValue(`team_member_${memberNum}_image`)
              
              // Mostrar apenas membros que tenham nome
              if (!name) return null
              
              return (
                <div key={memberNum} className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4">
                    {image ? (
                      <img 
                        src={image} 
                        alt={`Foto de ${name}`}
                        className="w-32 h-32 object-cover rounded-full border-4 border-gray-200 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextElement) {
                            nextElement.style.display = 'block'
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-32 h-32 bg-gray-200 rounded-full mx-auto ${image ? 'hidden' : 'block'}`}
                    ></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
                  {position && <p className="text-primary-600 mb-2">{position}</p>}
                  {description && <p className="text-gray-600">{description}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {getConfigValue('about_ready_title') || 'Pronto para começar?'}
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            {getConfigValue('about_ready_subtitle') || 'Descubra nossa seleção de produtos tecnológicos'}
          </p>
          <a
            href="/products"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            {getConfigValue('about_ready_button') || 'Ver Produtos'}
          </a>
        </div>
      </section>
    </div>
  )
}