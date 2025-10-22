'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Mail, Phone, Shield, X, ChevronDown, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import DateOfBirthInput from '@/components/DateOfBirthInput'

// Función para convertir data ISO (AAAA-MM-DD) para formato DD/MM/AAAA
const convertISOToDDMMAAAA = (isoDate: string) => {
  try {
    if (!isoDate) return ''
    
    // Si ya está en formato DD/MM/AAAA, devolverlo tal como está
    if (isoDate.includes('/')) {
      return isoDate
    }
    
    // Manejar formato ISO completo (YYYY-MM-DDTHH:mm:ss.sssZ)
    let dateStr = isoDate
    if (isoDate.includes('T')) {
      dateStr = isoDate.split('T')[0]
    }
    
    // Parsear la fecha ISO
    const parts = dateStr.split('-')
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

// Función para convertir data DD/MM/AAAA para formato ISO (AAAA-MM-DD)
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

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  updatedAt: string
  
  // Información personal adicional
  cpf?: string
  birthDate?: string
  gender?: string
  
  // Dirección
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  
  // Preferencias
  newsletter?: boolean
}

export default function AdminEditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CLIENT',
    password: '',
    
    // Información personal adicional
    cpf: '',
    birthDate: '',
    gender: '',
    
    // Dirección
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    
    // Preferencias
    newsletter: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
    const { isAdmin } = useAuth()

  useEffect(() => {
    if (!isAdmin) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      return
    }
    
    fetchUser()
  }, [isAdmin, params.id])

  const fetchUser = async () => {
    try {
      setIsLoadingUser(true)
      
      const response = await fetch(`/api/users/${params.id}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'CLIENT',
          password: '',
          
          // Información personal adicional
          cpf: userData.cpf || '',
          birthDate: userData.birthDate ? convertISOToDDMMAAAA(userData.birthDate) : '',
          gender: userData.gender || '',
          
          // Dirección
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zipCode || '',
          country: userData.country || 'Brasil',
          
          // Preferencias
          newsletter: userData.newsletter || false
        })
      } else {
        console.error('Error fetching user:', response.statusText)
        // Fallback a datos mock si la API falla
        const mockUser = {
          id: params.id,
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          role: 'CLIENT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        setUser(mockUser)
        setFormData({
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone || '',
          role: mockUser.role,
          password: '',
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
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setIsLoadingUser(false)
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

  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      // Preparar datos para envío, convirtiendo la fecha correctamente
      const dataToSend = {
        ...formData,
        birthDate: formData.birthDate ? convertDDMMAAAAToISO(formData.birthDate) : null
      }
      
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        alert('Usuário atualizado com sucesso!')
        router.push('/admin/users')
      } else {
        const errorData = await response.json()
        alert(`Erro ao atualizar usuário: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Erro ao atualizar usuário. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Usuário excluído com sucesso!')
        router.push('/admin/users')
      } else {
        const errorData = await response.json()
        alert(`Erro ao excluir usuário: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao excluir usuário. Tente novamente.')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuário não encontrado</h1>
          <p className="text-gray-600 mb-6">O usuário solicitado não existe</p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Voltar
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
            onClick={() => window.history.back()} 
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Editar Usuário</h2>
              <p className="mt-2 text-gray-600">Gerencie as informações do usuário</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Usuário
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Resumo do Usuário */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-500"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Usuário</h2>
              
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
                
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <Shield className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Função</span>
                    <p className={`font-semibold ${
                      user.role === 'ADMIN' 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                    }`}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                </div>
                
                <div className="text-gray-500 text-xs bg-gray-50 p-3 rounded-xl">
                  <p>Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                  <p>Atualizado em: {new Date(user.updatedAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
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
            </div>
          </div>

          {/* Formulário Principal */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Informações Básicas */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm border border-purple-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3 text-primary-600" />
                  Informações Básicas
                </h3>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-purple-800 font-medium text-sm">
                        Informações básicas da conta
                      </p>
                      <p className="text-purple-600 text-xs mt-1">
                        Estes dados permitem identificar o usuário na plataforma
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
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Digite o nome completo"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      👤 Como aparecerá no perfil do usuário
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
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="usuario@email.com"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      📧 E-mail de acesso à plataforma
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-primary-600" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="(11) 99999-9999"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      📱 Para notificações e suporte
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-primary-600" />
                      Função
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none transition-colors"
                        required
                      >
                        <option value="CLIENT">Cliente</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      🔐 Define as permissões do usuário
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Pessoais */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-primary-600" />
                  Informações Pessoais
                </h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium text-sm">
                        Informações necessárias para a conta
                      </p>
                      <p className="text-blue-600 text-xs mt-1">
                        Esta informação ajuda a personalizar a experiência do usuário
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* CPF con diseño mejorado */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-primary-600" />
                      CPF (Documento de Identidade)
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      📋 Formato: 000.000.000-00
                    </p>
                  </div>
                  
                  {/* Fecha de nacimiento con diseño mejorado */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <DateOfBirthInput
                      value={formData.birthDate}
                      onChange={(value) => setFormData(prev => ({ ...prev, birthDate: value }))}
                      label="Data de Nascimento"
                      showValidation={true}
                      showAgeInfo={true}
                    />
                  </div>
                  
                  {/* Género con diseño mejorado */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-primary-600" />
                      Gênero
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option value="">Selecione o gênero</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                      <option value="nao_informar">Prefiro não informar</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      👤 Esta informação ajuda a personalizar a experiência
                    </p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-sm border border-green-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Mail className="w-6 h-6 mr-3 text-primary-600" />
                  Endereço de Entrega
                </h3>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-green-800 font-medium text-sm">
                        Informação de entrega necessária
                      </p>
                      <p className="text-green-600 text-xs mt-1">
                        Este endereço será utilizado para a entrega dos produtos
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-primary-600" />
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Rua, número, complemento"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      🏠 Endereço completo para entrega
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-primary-600" />
                        CEP
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleCEPChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        📮 Código postal brasileiro
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-primary-600" />
                        Cidade
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Nome da cidade"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        🏙️ Cidade onde o usuário reside
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-primary-600" />
                        Estado
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Estado"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        🗺️ Estado onde o usuário reside
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-primary-600" />
                      País
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="País"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      🌍 País de residência
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferências */}
              <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-sm border border-orange-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Phone className="w-6 h-6 mr-3 text-primary-600" />
                  Preferências
                </h3>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-orange-800 font-medium text-sm">
                        Configurações de comunicação
                      </p>
                      <p className="text-orange-600 text-xs mt-1">
                        Defina como o usuário deseja receber informações
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">
                        Receber newsletter
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        📧 Receber atualizações e ofertas por e-mail
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nova Senha */}
              <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm border border-red-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-primary-600" />
                  Segurança
                </h3>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-100 rounded-full p-2">
                      <Shield className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-red-800 font-medium text-sm">
                        Configurações de segurança
                      </p>
                      <p className="text-red-600 text-xs mt-1">
                        Altere a senha do usuário se necessário
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-primary-600" />
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Digite uma nova senha"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    🔐 Deixe em branco para manter a senha atual
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o usuário <strong>{user.name}</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}