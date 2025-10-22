'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, CreditCard, Building2, MapPin, Check, X } from 'lucide-react'
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
  country: string
  bankName: string
  bankCode: string
  accountType: string
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

export default function PaymentProfileDetailPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<PaymentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const { canManagePaymentProfiles } = useAuth()

  useEffect(() => {
    if (!canManagePaymentProfiles) {
      window.location.href = '/'
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
        setProfile(data.profile)
        console.log('✅ Perfil de pago cargado:', data.profile)
      } else {
        console.error('Error cargando perfil de pago:', response.status)
        window.location.href = '/admin/payment-profiles'
      }
    } catch (error) {
      console.error('Error cargando perfil de pago:', error)
      window.location.href = '/admin/payment-profiles'
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const token = localStorage.getItem('smartesh_token')
      
      if (!token) {
        alert('No hay sesión activa')
        return
      }

      const response = await fetch(`/api/payment-profiles/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        console.log('✅ Perfil de pago eliminado')
        window.location.href = '/admin/payment-profiles'
      } else {
        const error = await response.text()
        console.error('Error eliminando perfil:', error)
        alert('Error al eliminar el perfil de pago')
      }
    } catch (error) {
      console.error('Error eliminando perfil:', error)
      alert('Error al eliminar el perfil de pago')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
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

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Perfil no encontrado</h1>
          <Link
            href="/admin/payment-profiles"
            className="text-primary-600 hover:text-primary-700"
          >
            Volver a perfiles de pago
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link
                href="/admin/payment-profiles"
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">Detalles del perfil de pago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                href={`/admin/payment-profiles/${profile.id}/edit`}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              profile.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {profile.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información Básica */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Building2 className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Información Básica</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre del Perfil</label>
                <p className="text-sm text-gray-900">{profile.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Razón Social</label>
                <p className="text-sm text-gray-900">{profile.companyName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">CNPJ</label>
                <p className="text-sm text-gray-900">{formatCNPJ(profile.cnpj)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email de Contacto</label>
                <p className="text-sm text-gray-900">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Dirección Fiscal */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Dirección Fiscal</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Dirección</label>
                <p className="text-sm text-gray-900">{profile.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ciudad</label>
                  <p className="text-sm text-gray-900">{profile.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <p className="text-sm text-gray-900">{profile.state}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">CEP</label>
                  <p className="text-sm text-gray-900">{profile.zipCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">País</label>
                  <p className="text-sm text-gray-900">{profile.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Datos Bancarios */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Datos Bancarios</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Banco</label>
                <p className="text-sm text-gray-900">{profile.bankName}</p>
              </div>
              
              {profile.bankCode && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Código del Banco</label>
                  <p className="text-sm text-gray-900">{profile.bankCode}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Agencia</label>
                  <p className="text-sm text-gray-900">{profile.agencyNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cuenta</label>
                  <p className="text-sm text-gray-900">{profile.accountNumber}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo de Cuenta</label>
                <p className="text-sm text-gray-900">
                  {profile.accountType === 'CHECKING' ? 'Cuenta Corriente' : 'Cuenta de Ahorros'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Titular</label>
                <p className="text-sm text-gray-900">{profile.accountHolder}</p>
              </div>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Métodos de Pago</h2>
            </div>
            
            <div className="space-y-3">
              {profile.paymentMethods.length > 0 ? (
                profile.paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      method.isActive
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{getPaymentMethodIcon(method.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getPaymentMethodName(method.type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {method.isActive ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay métodos de pago configurados</p>
              )}
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Creado</label>
              <p className="text-sm text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Última Actualización</label>
              <p className="text-sm text-gray-900">
                {new Date(profile.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar este perfil de pago? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
