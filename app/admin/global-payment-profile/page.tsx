'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  Building, 
  CreditCard, 
  Smartphone, 
  Banknote,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
interface PaymentMethod {
  type: string
  isActive: boolean
  config?: any
}

interface GlobalPaymentProfile {
  id: string
  companyName: string
  cnpj: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  bankName: string
  bankCode: string
  accountType: string
  accountNumber: string
  agencyNumber: string
  accountHolder: string
  paymentMethods: PaymentMethod[]
}

export default function GlobalPaymentProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, isInitialized } = useAuth()
    
  const [profile, setProfile] = useState<GlobalPaymentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [cnpjError, setCnpjError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    bankName: '',
    bankCode: '',
    accountType: 'CHECKING',
    accountNumber: '',
    agencyNumber: '',
    accountHolder: '',
    paymentMethods: [
      { type: 'PIX', isActive: true },
      { type: 'CREDIT_CARD', isActive: true },
      { type: 'DEBIT_CARD', isActive: true },
      { type: 'BOLETO', isActive: false }
    ]
  })

  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      router.push('/login?redirect=/admin/global-payment-profile')
      return
    }
    
    if (isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated, isInitialized, user, router])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const response = await fetch('/api/global-payment-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      
      const data = await response.json()
      
      if (data.profile) {
        setProfile(data.profile)
        setFormData({
          companyName: data.profile.companyName,
          cnpj: data.profile.cnpj,
          email: data.profile.email,
          address: data.profile.address,
          city: data.profile.city,
          state: data.profile.state,
          zipCode: data.profile.zipCode,
          country: data.profile.country,
          bankName: data.profile.bankName,
          bankCode: data.profile.bankCode,
          accountType: data.profile.accountType,
          accountNumber: data.profile.accountNumber,
          agencyNumber: data.profile.agencyNumber,
          accountHolder: data.profile.accountHolder,
          paymentMethods: data.profile.paymentMethods || [
            { type: 'PIX', isActive: true },
            { type: 'CREDIT_CARD', isActive: true },
            { type: 'DEBIT_CARD', isActive: true },
            { type: 'BOLETO', isActive: false }
          ]
        })
        console.log('✅ Perfil cargado:', data.profile.id)
      } else {
        console.log('ℹ️ No hay perfil configurado, mostrando formulario vacío')
        setProfile(null)
      }
      
      console.log('✅ Global payment profile loaded successfully')
    } catch (error) {
      console.error('❌ Error fetching global payment profile:', error)
      setMessage({ type: 'error', text: 'Error al cargar el perfil de pago' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Aplicar máscara para CNPJ
    if (name === 'cnpj') {
      const formattedValue = formatCNPJ(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
      
      // Validar CNPJ en tiempo real
      if (formattedValue.length === 18) { // CNPJ completo con máscara
        if (validateCNPJ(formattedValue)) {
          setCnpjError(null)
        } else {
          setCnpjError('CNPJ inválido')
        }
      } else {
        setCnpjError(null)
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const formatCNPJ = (value: string) => {
    // Remover todos los caracteres no numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Aplicar máscara XX.XXX.XXX/XXXX-XX
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
    }
  }

  const validateCNPJ = (cnpj: string) => {
    // Remover caracteres no numéricos
    const numbers = cnpj.replace(/\D/g, '')
    
    // Verificar si tiene 14 dígitos
    if (numbers.length !== 14) {
      return false
    }
    
    // Verificar se não é uma sequência de números iguais
    if (/^(\d)\1{13}$/.test(numbers)) {
      return false
    }
    
    // Algoritmo de validação do CNPJ
    let sum = 0
    let weight = 5
    
    // Primeiro dígito verificador
    for (let i = 0; i < 12; i++) {
      sum += parseInt(numbers[i]) * weight
      weight = weight === 2 ? 9 : weight - 1
    }
    
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    
    if (parseInt(numbers[12]) !== digit1) {
      return false
    }
    
    // Segundo dígito verificador
    sum = 0
    weight = 6
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(numbers[i]) * weight
      weight = weight === 2 ? 9 : weight - 1
    }
    
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    
    return parseInt(numbers[13]) === digit2
  }

  const handlePaymentMethodChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, i) => 
        i === index ? { ...method, [field]: value } : method
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    // Validar CNPJ antes de enviar
    if (formData.cnpj && !validateCNPJ(formData.cnpj)) {
      setCnpjError('CNPJ inválido')
      setIsSaving(false)
      return
    }

    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const url = profile ? '/api/global-payment-profile' : '/api/global-payment-profile'
      const method = profile ? 'PUT' : 'POST'
      
      const requestData = {
        ...formData,
        id: profile?.id
      }
      
      console.log('📤 Enviando datos:', {
        method,
        url,
        hasProfile: !!profile,
        profileId: profile?.id,
        companyName: formData.companyName,
        cnpj: formData.cnpj,
        paymentMethodsCount: formData.paymentMethods.length
      })

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error de la API:', errorData)
        throw new Error(errorData.error || errorData.details || 'Error al guardar el perfil')
      }

      const data = await response.json()
      console.log('✅ Respuesta de la API:', data)
      setProfile(data.profile)
      setMessage({ type: 'success', text: 'Perfil de pago guardado exitosamente' })
      
      console.log('✅ Global payment profile saved successfully')
    } catch (error) {
      console.error('❌ Error saving global payment profile:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al guardar el perfil' 
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'PIX':
        return <Smartphone className="w-5 h-5" />
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard className="w-5 h-5" />
      case 'BOLETO':
        return <Banknote className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
    }
  }

  const getPaymentMethodName = (type: string) => {
    switch (type) {
      case 'PIX':
        return 'PIX'
      case 'CREDIT_CARD':
        return 'Tarjeta de Crédito'
      case 'DEBIT_CARD':
        return 'Tarjeta de Débito'
      case 'BOLETO':
        return 'Boleto Bancario'
      default:
        return type
    }
  }

  const fillTestData = () => {
    const testData = {
      companyName: 'MarketTech Soluções Digitais LTDA',
      cnpj: '11.222.333/0001-81',
      email: 'contato@markettech.com.br',
      address: 'Av. Paulista, 1000, Sala 101',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'Brasil',
      bankName: 'Banco do Brasil',
      bankCode: '001',
      accountType: 'CHECKING',
      accountNumber: '12345-6',
      agencyNumber: '1234',
      accountHolder: 'MarketTech Soluções Digitais LTDA',
      paymentMethods: [
        { type: 'PIX', isActive: true },
        { type: 'CREDIT_CARD', isActive: true },
        { type: 'DEBIT_CARD', isActive: true },
        { type: 'BOLETO', isActive: false }
      ]
    }
    
    setFormData(testData)
    setCnpjError(null)
    setMessage({ type: 'success', text: 'Datos de prueba cargados exitosamente' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder a esta página</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Perfil de Pago Global</h1>
              <p className="text-gray-600 mt-2">Configura el perfil de pago único del sistema</p>
            </div>
            <div className="flex items-center space-x-4">
              {profile && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Configurado</span>
                </div>
              )}
              {/* Botón solo visible para admin */}
              {user?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={fillTestData}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center text-sm"
                  title="Completar con datos de prueba"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Datos de Prueba
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil de pago...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información de la Empresa */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary-600" />
                Información de la Empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      cnpjError 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="00.000.000/0001-00"
                    maxLength={18}
                    required
                  />
                  {cnpjError ? (
                    <p className="text-xs text-red-500 mt-1">
                      {cnpjError}
                    </p>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        Formato: XX.XXX.XXX/XXXX-XX
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const exampleCNPJ = '11.222.333/0001-81'
                          setFormData(prev => ({ ...prev, cnpj: exampleCNPJ }))
                          setCnpjError(null)
                        }}
                        className="text-xs text-primary-600 hover:text-primary-800 underline"
                      >
                        Usar ejemplo
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dirección Fiscal */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dirección Fiscal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="00000-000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Datos Bancarios */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos Bancarios</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Banco *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código del Banco *
                  </label>
                  <input
                    type="text"
                    name="bankCode"
                    value={formData.bankCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cuenta *
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="CHECKING">Cuenta Corriente</option>
                    <option value="SAVINGS">Cuenta de Ahorros</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cuenta *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Agencia *
                  </label>
                  <input
                    type="text"
                    name="agencyNumber"
                    value={formData.agencyNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titular de la Cuenta *
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Nota sobre configuração PIX */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-900">
                    Configuração PIX
                  </h3>
                  <p className="mt-2 text-sm text-blue-700">
                    A configuração de PIX agora é gerenciada pela página do MercadoPago. 
                    Vá para <strong>Configuração do MercadoPago</strong> para configurar as credenciais de PIX.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        const baseUrl = window.location.origin
                        window.location.href = `${baseUrl}/admin/mercado-pago`
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Ir para Configuração do MercadoPago
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Métodos de Pago Habilitados</h2>
              
              <div className="space-y-4">
                {formData.paymentMethods.map((method, index) => (
                  <div key={method.type} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getPaymentMethodIcon(method.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{getPaymentMethodName(method.type)}</h3>
                        <p className="text-sm text-gray-500">Método de pago {method.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={method.isActive}
                          onChange={(e) => handlePaymentMethodChange(index, 'isActive', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Habilitado</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {profile ? 'Actualizar Perfil' : 'Crear Perfil'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
