'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Lock, User, Phone, CreditCard, Calendar, MapPin, Bell, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import RegisterDateOfBirthInput from '@/components/RegisterDateOfBirthInput'
import RegistrationProgress from '@/components/RegistrationProgress'

interface State {
  code: string
  name: string
  cities: string[]
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Informações pessoais adicionais
    cpf: '',
    birthDate: '',
    gender: '',
    
    // Endereço
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    
    // Preferências
    newsletter: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loadingStates, setLoadingStates] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const { register } = useAuth()

  // Carregar estados ao montar o componente
  useEffect(() => {
    loadStates()
  }, [])

  // Validar progresso de acordo com as seções completadas
  useEffect(() => {
    const validateProgress = () => {
      let step = 1

      // Validar email con regex básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isValidEmail = emailRegex.test(formData.email)

      // Validar CPF (formato básico)
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
      const isValidCPF = cpfRegex.test(formData.cpf)

      // Validar data de nascimento (formato DD/MM/AAAA)
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
      const isValidDate = dateRegex.test(formData.birthDate)

      // Validar CEP (formato brasileño)
      const zipRegex = /^\d{5}-?\d{3}$/
      const isValidZip = zipRegex.test(formData.zipCode)

      // Paso 1: Informações Básicas (nome, email, telefone)
      if (formData.name.trim() && isValidEmail && formData.phone.trim()) {
        step = 2
      }

      // Paso 2: Informações Pessoais (CPF, data de nascimento, gênero)
      if (step === 2 && isValidCPF && isValidDate && formData.gender.trim()) {
        step = 3
      }

      // Paso 3: Endereço (endereço, cidade, estado, CEP)
      if (step === 3 && formData.address.trim() && formData.city.trim() && formData.state.trim() && isValidZip) {
        step = 4
      }

      setCurrentStep(step)
    }

    validateProgress()
  }, [formData])

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    if (formData.state) {
      loadCities(formData.state)
    } else {
      setCities([])
      setFormData(prev => ({ ...prev, city: '' }))
    }
  }, [formData.state])

  const loadStates = async () => {
    try {
      setLoadingStates(true)
      const response = await fetch('/api/locations?includeRestrictions=true')
      const data = await response.json()
      
      if (response.ok) {
        setStates(data.states || [])
      } else {
        console.error('Error loading states:', data.error)
        // Fallback para todos os estados se houver erro
        const fallbackResponse = await fetch('/api/locations')
        const fallbackData = await fallbackResponse.json()
        setStates(fallbackData.states || [])
      }
    } catch (error) {
      console.error('Error loading states:', error)
    } finally {
      setLoadingStates(false)
    }
  }

  const loadCities = async (stateCode: string) => {
    try {
      setLoadingCities(true)
      const response = await fetch(`/api/locations?state=${stateCode}&includeRestrictions=true`)
      const data = await response.json()
      
      if (response.ok) {
        setCities(data.cities || [])
        // Limpar cidade selecionada se não estiver disponível no novo estado
        if (formData.city && !data.cities.includes(formData.city)) {
          setFormData(prev => ({ ...prev, city: '' }))
        }
      } else {
        console.error('Error loading cities:', data.error)
        setCities([])
      }
    } catch (error) {
      console.error('Error loading cities:', error)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  const formatPhone = (value: string) => {
    // Remover caracteres no numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Aplicar máscara telefone brasileiro: (00) 00000-0000 ou (00) 0000-0000
    if (numbers.length <= 11) {
      if (numbers.length <= 10) {
        // Formato: (00) 0000-0000
        return numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2')
      } else {
        // Formato: (00) 00000-0000 (celular com 9º dígito)
        return numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2')
      }
    }
    return value
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }))
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2')
    }
    return value
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData(prev => ({
      ...prev,
      cpf: formatted
    }))
  }

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setFormData(prev => ({
      ...prev,
      zipCode: formatted
    }))
  }

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '')
    if (numbers.length !== 11) return false
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.charAt(10))) return false
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações básicas
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    if (!formData.name || !formData.email || !formData.password || !formData.phone || 
        !formData.cpf || !formData.birthDate || !formData.gender || 
        !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      alert('Todos os campos são obrigatórios')
      return
    }

    // Validar CPF se estiver presente
    if (formData.cpf && !validateCPF(formData.cpf)) {
      alert('CPF inválido')
      return
    }

    setIsLoading(true)

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        newsletter: formData.newsletter
      })
      
      if (success) {
        // Usar router.push en lugar de window.location.href para evitar problemas con RSC
        router.push('/')
      } else {
        alert('Erro ao registrar usuário')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Erro ao registrar usuário')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Início
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Criar Conta</h2>
          <p className="mt-2 text-gray-600">Junte-se à nossa plataforma</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progreso del registro */}
          <div className="lg:col-span-1">
            <RegistrationProgress currentStep={currentStep} />
          </div>

          {/* Formulario principal */}
          <div className="lg:col-span-3">

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <User className="w-6 h-6 mr-3 text-primary-600" />
                Informações Básicas
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
                currentStep > 1 
                  ? 'bg-green-100 text-green-800' 
                  : currentStep === 1 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {currentStep > 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Concluído</span>
                  </>
                ) : currentStep === 1 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Passo 1 de 3</span>
                  </>
                ) : (
                  <span>Passo 1 de 3</span>
                )}
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-purple-800 font-medium text-sm">
                    Informações básicas da sua conta
                  </p>
                  <p className="text-purple-600 text-xs mt-1">
                    Estes dados nos permitem identificá-lo na plataforma
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary-600" />
                  Nome Completo
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Digite seu nome completo"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  👤 Como aparecerá no seu perfil
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-primary-600" />
                  E-mail
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="seu@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  📧 Usaremos este e-mail para nos comunicarmos com você
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm md:col-span-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-primary-600" />
                  Número de Telefone
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  📱 Para notificações importantes e suporte
                </p>
              </div>
            </div>
          </div>

          {/* Informações Pessoais Adicionais */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-primary-600" />
                Informações Pessoais
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
                currentStep > 2 
                  ? 'bg-green-100 text-green-800' 
                  : currentStep === 2 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {currentStep > 2 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Concluído</span>
                  </>
                ) : currentStep === 2 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Passo 2 de 3</span>
                  </>
                ) : (
                  <span>Passo 2 de 3</span>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-blue-800 font-medium text-sm">
                    Informações necessárias para sua conta
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    Esta informação nos ajuda a personalizar sua experiência
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* CPF con diseño mejorado */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <label htmlFor="cpf" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-primary-600" />
                  CPF (Documento de Identidade)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  📋 Formato: 000.000.000-00
                </p>
              </div>
              
              {/* Fecha de nacimiento con diseño mejorado */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <RegisterDateOfBirthInput
                  value={formData.birthDate}
                  onChange={(value) => setFormData(prev => ({ ...prev, birthDate: value }))}
                  required
                />
              </div>
              
              {/* Género con diseño mejorado */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-primary-600" />
                  Gênero
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                >
                  <option value="">Selecione seu gênero</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="nao_informar">Prefiro não informar</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  👤 Esta informação nos ajuda a personalizar sua experiência
                </p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border border-green-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-primary-600" />
                Endereço de Entrega
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
                currentStep > 3 
                  ? 'bg-green-100 text-green-800' 
                  : currentStep === 3 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {currentStep > 3 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Concluído</span>
                  </>
                ) : currentStep === 3 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Passo 3 de 3</span>
                  </>
                ) : (
                  <span>Passo 3 de 3</span>
                )}
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-green-800 font-medium text-sm">
                    Informação de entrega necessária
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Este endereço será utilizado para a entrega dos seus produtos
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço Completo *
                  </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Rua, número, complemento"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleCEPChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="00000-000"
                    maxLength={9}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={loadingStates}
                  >
                      <option value="">
                        {loadingStates ? 'Carregando estados...' : 'Selecione um estado'}
                      </option>
                    {states.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={!formData.state || loadingCities}
                  >
                    <option value="">
                      {!formData.state 
                        ? 'Primeiro selecione um estado' 
                        : loadingCities 
                        ? 'Carregando cidades...' 
                        : 'Selecione uma cidade'
                      }
                    </option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preferências */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary-600" />
              Preferências
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">
                  Receber newsletter
                </label>
              </div>
            </div>
          </div>

          {/* Senha */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-primary-600" />
              Segurança
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Mensagem de sucesso quando todas as seções estão completas */}
          {currentStep === 4 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    🎉 Todas as seções foram preenchidas!
                  </h3>
                  <p className="text-green-700 text-sm mt-1">
                    Você pode agora criar sua conta com segurança.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Registro */}
          <div className="flex items-center justify-between">
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              Já tem uma conta?
            </Link>
            
            <button
              type="submit"
              disabled={isLoading || currentStep < 4}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors flex items-center ${
                currentStep < 4
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </>
              ) : currentStep < 4 ? (
                'Complete todas as seções'
              ) : (
                'Criar Conta'
              )}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  )
}