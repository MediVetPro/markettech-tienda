'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MessageCircle, MapPin, Clock, Send } from 'lucide-react'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import { useAuth } from '@/contexts/AuthContext'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { getConfigValue, isLoading } = useSiteConfig()
  const { user, isAuthenticated } = useAuth()

  // Carregar dados do usuário se estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }
  }, [isAuthenticated, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpar erros de validação quando o usuário começar a digitar
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const getMessageTypeFromSubject = (subject: string) => {
    switch (subject) {
      case 'consulta-produto':
        return 'PRODUCT_INQUIRY'
      case 'order-status':
        return 'SUPPORT'
      case 'technical-support':
        return 'SUPPORT'
      case 'general':
        return 'GENERAL'
      case 'other':
        return 'CONTACT'
      default:
        return 'CONTACT'
    }
  }

  const getSubjectText = (subject: string) => {
    switch (subject) {
      case 'consulta-produto':
        return 'Consulta sobre produto'
      case 'order-status':
        return 'Status do pedido'
      case 'technical-support':
        return 'Suporte técnico'
      case 'general':
        return 'Geral'
      case 'other':
        return 'Outro'
      default:
        return subject
    }
  }

  const validateForm = () => {
    const errors: string[] = []
    
    // Validações básicas
    if (!formData.name.trim()) {
      errors.push('Nome completo é obrigatório')
    }
    
    if (!formData.subject.trim()) {
      errors.push('Assunto é obrigatório')
    }
    
    if (!formData.message.trim()) {
      errors.push('Mensagem é obrigatória')
    }
    
    // Se não estiver autenticado, deve fornecer pelo menos um contato
    if (!isAuthenticated) {
      const hasEmail = formData.email.trim() !== ''
      const hasPhone = formData.phone.trim() !== ''
      
      if (!hasEmail && !hasPhone) {
        errors.push('É obrigatório fornecer pelo menos um meio de contato (email ou telefone)')
      }
      
      // Validar formato de email se fornecido
      if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('Email inválido')
      }
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setValidationErrors([])

    // Validar formulário
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem('smartesh_token')
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          subject: getSubjectText(formData.subject),
          content: formData.message,
          type: getMessageTypeFromSubject(formData.subject),
          senderName: formData.name,
          senderEmail: formData.email,
          senderPhone: formData.phone
        })
      })

      if (response.ok) {
        alert('Mensagem enviada com sucesso!')
        // Limpar apenas se não estiver autenticado (para manter os dados do perfil)
        if (!isAuthenticated) {
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
          })
        } else {
          // Se estiver autenticado, limpar apenas subject e message
          setFormData(prev => ({
            ...prev,
            subject: '',
            message: ''
          }))
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao enviar mensagem')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Temos o prazer de ajudá-lo. Envie-nos uma mensagem e responderemos o mais rápido possível.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Enviar Mensagem</h2>
            
            {/* Mensagem informativa para usuários autenticados */}
            {isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Dados do seu perfil carregados automaticamente
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Seus dados de contato foram preenchidos automaticamente. Você pode editá-los se necessário.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mostrar erros de validação */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-2">Por favor, corrija os seguintes erros:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email {!isAuthenticated && '*'}
                    {isAuthenticated && <span className="text-gray-500 text-sm"> (do seu perfil)</span>}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required={!isAuthenticated}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone {!isAuthenticated && <span className="text-gray-500">(opcional)</span>}
                    {isAuthenticated && <span className="text-gray-500 text-sm"> (do seu perfil)</span>}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="consulta-produto">Consulta sobre produto</option>
                    <option value="order-status">Status do pedido</option>
                    <option value="technical-support">Suporte técnico</option>
                    <option value="general">Geral</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Escreva sua mensagem aqui..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600 mb-2">{getConfigValue('contact_email') || 'info@markettech.com'}</p>
                    <p className="text-sm text-gray-500">Respondemos em até 24 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Telefone</h3>
                    <p className="text-gray-600 mb-2">{getConfigValue('contact_phone') || '+1 (555) 123-4567'}</p>
                    <p className="text-sm text-gray-500">Seg-Sex: 9h às 18h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                    <p className="text-gray-600 mb-2">{getConfigValue('contact_whatsapp') || '+1 (555) 123-4567'}</p>
                    <p className="text-sm text-gray-500">Resposta rápida via WhatsApp</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Localização</h3>
                    <p className="text-gray-600 mb-2">{getConfigValue('contact_address') || 'Ciudad, País'}</p>
                    <p className="text-sm text-gray-500">Visite nossa loja física</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Horário de Funcionamento</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Segunda a Sexta: 9h às 18h</span>
                    <span className="font-medium">{getConfigValue('contact_schedule_weekdays') || '9:00 AM - 6:00 PM'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Sábado: 9h às 14h</span>
                    <span className="font-medium">{getConfigValue('contact_schedule_saturday') || '10:00 AM - 4:00 PM'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Domingo: Fechado</span>
                    <span className="font-medium">{getConfigValue('contact_schedule_sunday') || 'Cerrado'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-primary-50 rounded-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="space-y-3">
                <a
                  href={`mailto:${getConfigValue('contact_email') || 'info@markettech.com'}`}
                  className="block w-full bg-primary-600 text-white py-3 px-4 rounded-lg text-center hover:bg-primary-700 transition-colors"
                >
                  Enviar Email
                </a>
                <a
                  href={`tel:${getConfigValue('contact_phone') || '+15551234567'}`}
                  className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg text-center hover:bg-green-700 transition-colors"
                >
                  Ligar Agora
                </a>
                <a
                  href={`https://wa.me/${getConfigValue('contact_whatsapp')?.replace(/[^\d]/g, '') || '15551234567'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 text-white py-3 px-4 rounded-lg text-center hover:bg-green-600 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}