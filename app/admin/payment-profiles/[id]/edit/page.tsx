'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, CreditCard, Building2, MapPin, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface PaymentMethodConfig {
  type: string
  isActive: boolean
  config?: any
}

export default function EditPaymentProfilePage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Información básica
    name: '',
    isActive: true,
    
    // Datos de la empresa
    companyName: '',
    cnpj: '',
    email: '',
    
    // Dirección fiscal
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    
    // Datos bancarios
    bankName: '',
    bankCode: '',
    accountType: 'CHECKING',
    accountNumber: '',
    agencyNumber: '',
    accountHolder: '',
    
    // Métodos de pago
    paymentMethods: [] as PaymentMethodConfig[]
  })

    const { canManagePaymentProfiles } = useAuth()
  const router = useRouter()

  const paymentMethodOptions = [
    { value: 'PIX', label: 'PIX', description: 'Transferencia instantánea' },
    { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito', description: 'Visa, Mastercard, etc.' },
    { value: 'BOLETO', label: 'Boleto Bancário', description: 'Pago en efectivo' },
    { value: 'DEBIT_CARD', label: 'Tarjeta de Débito', description: 'Débito directo' }
  ]

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  useEffect(() => {
    if (!canManagePaymentProfiles) {
      router.push('/')
      return
    }
    
    fetchPaymentProfile()
  }, [canManagePaymentProfiles, params.id])

  const fetchPaymentProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('smartesh_token')
      
      if (!token) {
        console.warn('No hay token JWT válido')
        return
      }

      const response = await fetch(`/api/payment-profiles/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const profile = data.profile
        
        setFormData({
          name: profile.name,
          isActive: profile.isActive,
          companyName: profile.companyName,
          cnpj: profile.cnpj,
          email: profile.email,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zipCode: profile.zipCode,
          country: profile.country,
          bankName: profile.bankName,
          bankCode: profile.bankCode,
          accountType: profile.accountType,
          accountNumber: profile.accountNumber,
          agencyNumber: profile.agencyNumber,
          accountHolder: profile.accountHolder,
          paymentMethods: profile.paymentMethods || []
        })
        
        console.log('✅ Perfil de pago cargado:', profile)
      } else {
        console.error('Error cargando perfil de pago:', response.status)
        router.push('/admin/payment-profiles')
      }
    } catch (error) {
      console.error('Error cargando perfil de pago:', error)
      router.push('/admin/payment-profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePaymentMethodToggle = (type: string, isActive: boolean) => {
    setFormData(prev => {
      const existingIndex = prev.paymentMethods.findIndex(m => m.type === type)
      let newMethods = [...prev.paymentMethods]
      
      if (existingIndex >= 0) {
        newMethods[existingIndex] = { ...newMethods[existingIndex], isActive }
      } else {
        newMethods.push({ type, isActive, config: {} })
      }
      
      return { ...prev, paymentMethods: newMethods }
    })
  }

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  const handleCNPJChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 14) {
      setFormData(prev => ({ ...prev, cnpj: cleaned }))
    }
  }

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.name && formData.companyName && formData.cnpj && formData.email
      case 2:
        return formData.address && formData.city && formData.state && formData.zipCode
      case 3:
        return formData.bankName && formData.accountNumber && formData.agencyNumber && formData.accountHolder
      case 4:
        return formData.paymentMethods.some(m => m.isActive)
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('smartesh_token')
      
      if (!token) {
        alert('No hay sesión activa')
        return
      }

      const response = await fetch(`/api/payment-profiles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Perfil de pago actualizado:', data)
        router.push('/admin/payment-profiles')
      } else {
        const error = await response.text()
        console.error('Error actualizando perfil:', error)
        alert('Error al actualizar el perfil de pago')
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      alert('Error al actualizar el perfil de pago')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil de pago...</p>
        </div>
      </div>
    )
  }

  if (!canManagePaymentProfiles) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/payment-profiles"
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Perfil de Pago</h1>
              <p className="text-gray-600">Modifica los datos fiscales y métodos de pago</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepNumber ? 'text-primary-600 font-medium' : 'text-gray-500'
                }`}>
                  {stepNumber === 1 && 'Información Básica'}
                  {stepNumber === 2 && 'Dirección Fiscal'}
                  {stepNumber === 3 && 'Datos Bancarios'}
                  {stepNumber === 4 && 'Métodos de Pago'}
                </span>
                {stepNumber < 4 && <div className="w-8 h-0.5 bg-gray-200 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Step 1: Información Básica */}
          {step === 1 && (
            <div>
              <div className="flex items-center mb-6">
                <Building2 className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Perfil *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: Mi Tienda Principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="contacto@mitienda.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={formatCNPJ(formData.cnpj)}
                    onChange={(e) => handleCNPJChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dirección Fiscal */}
          {step === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <MapPin className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Dirección Fiscal</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección Completa *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Seleccionar estado</option>
                    {brazilianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="00000-000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Datos Bancarios */}
          {step === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Datos Bancarios</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Banco *
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Banco do Brasil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código del Banco
                  </label>
                  <input
                    type="text"
                    value={formData.bankCode}
                    onChange={(e) => handleInputChange('bankCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cuenta *
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="CHECKING">Cuenta Corriente</option>
                    <option value="SAVINGS">Cuenta de Ahorros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Agencia *
                  </label>
                  <input
                    type="text"
                    value={formData.agencyNumber}
                    onChange={(e) => handleInputChange('agencyNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cuenta *
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="12345-6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titular de la Cuenta *
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nombre del titular"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Métodos de Pago */}
          {step === 4 && (
            <div>
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Métodos de Pago</h2>
              </div>
              
              <div className="space-y-4">
                {paymentMethodOptions.map((option) => (
                  <div key={option.value} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={option.value}
                          checked={formData.paymentMethods.find(m => m.type === option.value)?.isActive || false}
                          onChange={(e) => handlePaymentMethodToggle(option.value, e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor={option.value} className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <div className="flex space-x-4">
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!validateStep(step)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving || !validateStep(4)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
