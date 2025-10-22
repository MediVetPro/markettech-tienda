'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Bell, Save, ArrowLeft, Edit, Check, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import RegisterDateOfBirthInput from '@/components/RegisterDateOfBirthInput'
import UserAgeCard from '@/components/UserAgeCard'

interface State {
  code: string
  name: string
  cities: string[]
}

// Função para converter data ISO (AAAA-MM-DD) para formato DD/MM/AAAA
const convertISOToDDMMAAAA = (isoDate: string) => {
  try {
    // Parsear la fecha ISO directamente sin problemas de zona horaria
    const parts = isoDate.split('-')
    if (parts.length !== 3) return ''
    
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]
    
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error converting date:', error)
    return ''
  }
}

// Função para converter data DD/MM/AAAA para formato ISO (AAAA-MM-DD)
const convertDDMMAAAAToISO = (ddmmaaaa: string) => {
  try {
    if (!ddmmaaaa || !ddmmaaaa.includes('/')) return ''
    
    const parts = ddmmaaaa.split('/')
    if (parts.length !== 3) return ''
    
    const day = parts[0]
    const month = parts[1]
    const year = parts[2]
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error converting date:', error)
    return ''
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, isInitialized, updateUser } = useAuth()
    
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loadingStates, setLoadingStates] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    newsletter: false
  })

  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      router.push('/login?redirect=/profile')
      return
    }
    
    if (user) {
      console.log('🔍 [PROFILE] Carregando dados do usuário:', {
        name: user.name,
        city: user.city,
        state: user.state,
        address: user.address
      })
      
      const newFormData = {
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ? formatPhone(user.phone) : '',
        cpf: user.cpf ? formatCPF(user.cpf) : '',
        birthDate: user.birthDate ? convertISOToDDMMAAAA(user.birthDate) : '',
        gender: user.gender ?? '',
        address: user.address ?? '',
        city: user.city ?? '',
        state: user.state ?? '',
        zipCode: user.zipCode ? formatCEP(user.zipCode) : '',
        country: user.country ?? 'Brasil',
        newsletter: user.newsletter ?? false
      }
      
      console.log('🏙️ [PROFILE] Nuevo formData a establecer:', newFormData)
      console.log('🏙️ [PROFILE] Estado del usuario:', user.state)
      console.log('🏙️ [PROFILE] Ciudad del usuario:', user.city)
      console.log('🏙️ [PROFILE] newFormData.city específico:', newFormData.city)
      
      setFormData(newFormData)
      
      // Verificar inmediatamente después de establecer
      setTimeout(() => {
        console.log('🏙️ [PROFILE] Verificación post-setFormData - formData.city:', formData.city)
      }, 50)
      
      console.log('🏙️ [PROFILE] Estado estabelecido em formData:', user.state)

      // NÃO carregar cidades aqui - serão carregadas automaticamente quando o estado for estabelecido
    }
  }, [user, isAuthenticated, isInitialized, router])

  // Carregar estados ao montar o componente
  useEffect(() => {
    loadStates()
  }, [])

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    if (formData.state) {
      console.log('🏙️ [PROFILE] Estado estabelecido, carregando cidades para:', formData.state)
      loadCities(formData.state, true) // Preservar la ciudad actual
    } else {
      setCities([])
      setFormData(prev => ({ ...prev, city: '' }))
    }
  }, [formData.state])

  // Forçar seleção de cidade quando as cidades são carregadas
  useEffect(() => {
    console.log('🏙️ [PROFILE] useEffect ciudades - cities.length:', cities.length, 'formData.city:', formData.city)
    
    if (cities.length > 0 && formData.city) {
      console.log('🏙️ [PROFILE] ✅ Condiciones cumplidas: ciudades cargadas y ciudad en formData')
      console.log('🏙️ [PROFILE] Ciudad actual en formData:', formData.city)
      console.log('🏙️ [PROFILE] Lista de ciudades disponibles:', cities)
      console.log('🏙️ [PROFILE] ¿Ciudad está en la lista?', cities.includes(formData.city))
      
      // Si la ciudad está en la lista, forzar la selección
      if (cities.includes(formData.city)) {
        console.log('🏙️ [PROFILE] ✅ Ciudad encontrada en la lista, forzando selección...')
        // Forzar un pequeño delay para asegurar que el DOM se actualice
        setTimeout(() => {
          console.log('🏙️ [PROFILE] 🔄 Forzando selección de ciudad después del delay:', formData.city)
          setFormData(prev => {
            console.log('🏙️ [PROFILE] 🔄 setFormData prev:', prev)
            const newData = { ...prev, city: formData.city }
            console.log('🏙️ [PROFILE] 🔄 setFormData new:', newData)
            return newData
          })
        }, 150)
      } else {
        console.log('🏙️ [PROFILE] ❌ Ciudad no encontrada en la lista')
        console.log('🏙️ [PROFILE] ❌ Búsqueda exacta:', cities.find(city => city === formData.city))
        console.log('🏙️ [PROFILE] ❌ Búsqueda case-insensitive:', cities.find(city => city.toLowerCase() === formData.city.toLowerCase()))
      }
    } else {
      console.log('🏙️ [PROFILE] ⚠️ Condiciones no cumplidas:')
      console.log('🏙️ [PROFILE] ⚠️ - cities.length > 0:', cities.length > 0)
      console.log('🏙️ [PROFILE] ⚠️ - formData.city existe:', !!formData.city)
    }
  }, [cities, formData.city])

  // Log cuando las ciudades se cargan para debuggear
  useEffect(() => {
    if (cities.length > 0) {
      console.log('🏙️ [PROFILE] Ciudades disponibles:', cities)
      console.log('🏙️ [PROFILE] Ciudad actual en formData:', formData.city)
      console.log('🏙️ [PROFILE] ¿Ciudad actual está en la lista?', cities.includes(formData.city))
    }
  }, [cities, formData.city])

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

  const loadCities = async (stateCode: string, preserveCurrentCity = false) => {
    try {
      setLoadingCities(true)
      console.log('🏙️ [PROFILE] Cargando ciudades para estado:', stateCode)
      console.log('🏙️ [PROFILE] preserveCurrentCity:', preserveCurrentCity)
      console.log('🏙️ [PROFILE] formData.city actual:', formData.city)
      console.log('🏙️ [PROFILE] user.city actual:', user?.city)
      
      const response = await fetch(`/api/locations?state=${stateCode}&includeRestrictions=true`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('🏙️ [PROFILE] ✅ Respuesta API exitosa')
        console.log('🏙️ [PROFILE] Ciudades recibidas:', data.cities)
        console.log('🏙️ [PROFILE] Cantidad de ciudades:', data.cities?.length || 0)
        setCities(data.cities || [])
        
        // Usar la ciudad del usuario directamente si está disponible
        const userCity = user?.city || formData.city
        console.log('🏙️ [PROFILE] Ciudad a verificar (user.city || formData.city):', userCity)
        
        // Verificar si la ciudad del usuario está en la lista de ciudades disponibles
        if (userCity && data.cities.includes(userCity)) {
          console.log('🏙️ [PROFILE] ✅ Ciudad del usuario encontrada en la lista:', userCity)
          // Forzar la selección de la ciudad después de un pequeño delay
          setTimeout(() => {
            console.log('🏙️ [PROFILE] 🔄 Forzando selección de ciudad en loadCities:', userCity)
            setFormData(prev => {
              console.log('🏙️ [PROFILE] 🔄 loadCities setFormData prev:', prev)
              const newData = { ...prev, city: userCity }
              console.log('🏙️ [PROFILE] 🔄 loadCities setFormData new:', newData)
              return newData
            })
          }, 100)
        } else if (userCity && !data.cities.includes(userCity)) {
          console.log('🏙️ [PROFILE] ❌ Ciudad del usuario no disponible en la lista:', userCity)
          console.log('🏙️ [PROFILE] ❌ Búsqueda exacta en loadCities:', data.cities.find((city: string) => city === userCity))
          console.log('🏙️ [PROFILE] ❌ Búsqueda case-insensitive en loadCities:', data.cities.find((city: string) => city.toLowerCase() === userCity.toLowerCase()))
          if (!preserveCurrentCity) {
            console.log('🏙️ [PROFILE] Limpiando ciudad no disponible...')
            setFormData(prev => ({ ...prev, city: '' }))
          }
        } else {
          console.log('🏙️ [PROFILE] No hay ciudad del usuario para verificar')
          console.log('🏙️ [PROFILE] user.city es:', user?.city)
          console.log('🏙️ [PROFILE] formData.city es:', formData.city)
        }
      } else {
        console.error('❌ Error loading cities:', data.error)
        setCities([])
      }
    } catch (error) {
      console.error('❌ Error loading cities:', error)
      setCities([])
    } finally {
      setLoadingCities(false)
      console.log('🏙️ [PROFILE] loadCities completado, loadingCities = false')
    }
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

  const formatCPF = (value: string) => {
    // Remover caracteres no numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Aplicar máscara CPF: 000.000.000-00
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value
  }

  const validateCPF = (cpf: string) => {
    // Remover caracteres no numéricos
    const numbers = cpf.replace(/\D/g, '')
    
    // Verificar se tem 11 dígitos
    if (numbers.length !== 11) return false
    
    // Verificar se não são todos iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    // Algoritmo de validação do CPF
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

  const formatCEP = (value: string) => {
    // Remover caracteres no numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Aplicar máscara CEP: 00000-000
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2')
    }
    return value
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }))
  }

  const handleSave = async () => {
    // Validar CPF si está presente
    if (formData.cpf && !validateCPF(formData.cpf)) {
      alert('CPF inválido. Por favor, verifique os dígitos.')
      return
    }

    // Validar campos obrigatórios
    if (!formData.name || !formData.email) {
      alert('Nome e email são obrigatórios.')
      return
    }

    console.log('💾 [PROFILE] Guardando datos del perfil:', {
      name: formData.name,
      city: formData.city,
      state: formData.state,
      address: formData.address
    })

    setIsSaving(true)
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user?.id || ''
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          birthDate: formData.birthDate ? convertDDMMAAAAToISO(formData.birthDate) : null,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          newsletter: formData.newsletter
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        console.log('✅ [PROFILE] Usuario actualizado recibido:', {
          name: updatedUser.name,
          city: updatedUser.city,
          state: updatedUser.state,
          address: updatedUser.address
        })
        
        // Atualizar o contexto de autenticação com os novos dados
        updateUser(updatedUser)
        
        // Atualizar também o formData para refletir as mudanças imediatamente
        setFormData(prev => ({
          ...prev,
          name: updatedUser.name,
          city: updatedUser.city,
          state: updatedUser.state,
          address: updatedUser.address,
          phone: updatedUser.phone ? formatPhone(updatedUser.phone) : '',
          cpf: updatedUser.cpf ? formatCPF(updatedUser.cpf) : '',
          birthDate: updatedUser.birthDate ? convertISOToDDMMAAAA(updatedUser.birthDate) : '',
          gender: updatedUser.gender,
          zipCode: updatedUser.zipCode ? formatCEP(updatedUser.zipCode) : '',
          country: updatedUser.country,
          newsletter: updatedUser.newsletter
        }))
        
        alert('Perfil atualizado com sucesso!')
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        alert(`Erro ao atualizar o perfil: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Erro ao atualizar o perfil. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuário não encontrado</h1>
          <p className="text-gray-600 mb-6">Faça login para acessar seu perfil</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Meu Perfil</h2>
          <p className="mt-2 text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Resumo do Perfil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-500"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Perfil</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Nome</span>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">E-mail</span>
                    <p className="font-semibold text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Phone className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Telefone</span>
                      <p className="font-semibold text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Ações Rápidas */}
              <div className="space-y-3 mt-8">
                <Link
                  href="/orders"
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Ver Meus Pedidos
                </Link>
              </div>
              
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Formulario principal */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Informações Básicas */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm border border-purple-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <User className="w-6 h-6 mr-3 text-primary-600" />
                    Informações Básicas
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${
                      isEditing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </>
                    )}
                  </button>
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
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-primary-600" />
                      Nome Completo
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="Digite seu nome completo"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      👤 Como aparecerá no seu perfil
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-primary-600" />
                      E-mail
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="seu@email.com"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      📧 Usaremos este e-mail para nos comunicarmos com você
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-primary-600" />
                      Número de Telefone
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      📱 Para notificações importantes e suporte
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Pessoais */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <CreditCard className="w-6 h-6 mr-3 text-primary-600" />
                    Informações Pessoais
                  </h3>
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
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-primary-600" />
                      CPF (Documento de Identidade)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="000.000.000-00"
                      maxLength={14}
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
                      disabled={!isEditing}
                      required={isEditing}
                    />
                  </div>
                  
                  {/* Género con diseño mejorado */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-primary-600" />
                      Gênero
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
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

              {/* Tarjeta de Edad */}
              {formData.birthDate && (
                <UserAgeCard 
                  birthDate={formData.birthDate}
                  className="mb-6"
                />
              )}

              {/* Endereço */}
              <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-sm border border-green-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <MapPin className="w-6 h-6 mr-3 text-primary-600" />
                    Endereço de Entrega
                  </h3>
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
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                      Endereço Completo
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      placeholder="Rua, número, complemento"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      🏠 Endereço completo para entrega
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                        CEP
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleCEPChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        📮 Código postal brasileiro
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                        Estado
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!isEditing || loadingStates}
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
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
                      <p className="text-xs text-gray-500 mt-2">
                        🗺️ Estado onde você reside
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                        Cidade
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        key={`city-select-${cities.length}-${formData.city}`}
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing || !formData.state || loadingCities}
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
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
                      <p className="text-xs text-gray-500 mt-2">
                        🏙️ Cidade onde você reside
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
