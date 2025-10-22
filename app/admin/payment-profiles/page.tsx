'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, CreditCard, Building2, MapPin, Edit, Trash2, Eye, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface PaymentProfile {
  id: string
  name: string
  isActive: boolean
  companyName: string
  cnpj: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  bankName: string
  accountNumber: string
  agencyNumber: string
  accountHolder: string
  paymentMethods: PaymentMethod[]
  createdAt: string
  updatedAt: string
}

interface PaymentMethod {
  id: string
  type: string
  isActive: boolean
  config?: string
}

export default function PaymentProfilesPage() {
  const [profiles, setProfiles] = useState<PaymentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
    const { canManagePaymentProfiles } = useAuth()

  useEffect(() => {
    if (!canManagePaymentProfiles) {
      window.location.href = '/'
      return
    }
    
    fetchPaymentProfiles()
  }, [canManagePaymentProfiles])

  const fetchPaymentProfiles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('smartesh_token')
      
      if (!token) {
        console.warn('No hay token JWT válido')
        return
      }

      const response = await fetch('/api/payment-profiles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfiles(data.profiles || [])
        console.log('✅ Perfiles de pago cargados:', data.profiles?.length || 0)
      } else {
        console.error('Error cargando perfiles de pago:', response.status)
        setProfiles([])
      }
    } catch (error) {
      console.error('Error cargando perfiles de pago:', error)
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'PIX':
        return '💳'
      case 'CREDIT_CARD':
        return '💳'
      case 'BOLETO':
        return '📄'
      case 'DEBIT_CARD':
        return '💳'
      default:
        return '💳'
    }
  }

  const getPaymentMethodName = (type: string) => {
    switch (type) {
      case 'PIX':
        return 'PIX'
      case 'CREDIT_CARD':
        return 'Tarjeta de Crédito'
      case 'BOLETO':
        return 'Boleto Bancário'
      case 'DEBIT_CARD':
        return 'Tarjeta de Débito'
      default:
        return type
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este perfil de pago? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setDeletingId(profileId)
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }

      const response = await fetch(`/api/payment-profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Remover el perfil de la lista local
        setProfiles(prev => prev.filter(profile => profile.id !== profileId))
        console.log('Perfil eliminado exitosamente')
      } else {
        const errorData = await response.json()
        console.error('Error al eliminar perfil:', errorData.error || response.statusText)
        alert(`Error al eliminar perfil: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Error eliminando perfil:', error)
      alert('Error al eliminar el perfil de pago')
    } finally {
      setDeletingId(null)
    }
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfiles de pago...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Perfiles de Pago</h1>
              <p className="text-gray-600">Gestiona los métodos de pago y datos fiscales de tu tienda</p>
            </div>
            <Link
              href="/admin/payment-profiles/new"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Perfil
            </Link>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/admin" className="hover:text-gray-700">
                Administración
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Perfiles de Pago</span>
            </li>
          </ol>
        </nav>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Perfiles</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perfiles Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Métodos Configurados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.reduce((total, p) => total + p.paymentMethods.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Profiles List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Perfiles de Pago</h2>
          </div>
          
          {profiles.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {profiles.map((profile) => (
                <div key={profile.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-primary-100 rounded-lg mr-4">
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Building2 className="w-4 h-4 mr-1" />
                              {profile.companyName}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {profile.city}, {profile.state}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              profile.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {profile.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Información Fiscal</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">CNPJ:</span> {formatCNPJ(profile.cnpj)}</p>
                            <p><span className="font-medium">Email:</span> {profile.email}</p>
                            <p><span className="font-medium">Dirección:</span> {profile.address}</p>
                            <p><span className="font-medium">CEP:</span> {profile.zipCode}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Datos Bancarios</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Banco:</span> {profile.bankName}</p>
                            <p><span className="font-medium">Agencia:</span> {profile.agencyNumber}</p>
                            <p><span className="font-medium">Cuenta:</span> {profile.accountNumber}</p>
                            <p><span className="font-medium">Titular:</span> {profile.accountHolder}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Métodos de Pago</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.paymentMethods.length > 0 ? (
                            profile.paymentMethods.map((method) => (
                              <span
                                key={method.id}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  method.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <span className="mr-1">{getPaymentMethodIcon(method.type)}</span>
                                {getPaymentMethodName(method.type)}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No hay métodos configurados</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <Link
                        href={`/admin/payment-profiles/${profile.id}`}
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                        title="Ver Detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/payment-profiles/${profile.id}/edit`}
                        className="text-primary-600 hover:text-primary-900 p-2 rounded-lg hover:bg-primary-50"
                        title="Editar Perfil"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        disabled={deletingId === profile.id}
                        className={`p-2 rounded-lg transition-colors ${
                          deletingId === profile.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                        }`}
                        title="Eliminar Perfil"
                      >
                        {deletingId === profile.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center">
                <CreditCard className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay perfiles de pago</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Crea tu primer perfil de pago para comenzar a recibir pagos de tus productos.
                </p>
                <Link
                  href="/admin/payment-profiles/new"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Primer Perfil
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
