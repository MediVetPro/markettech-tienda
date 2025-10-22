'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Plus, 
  Edit, 
  Save, 
  X,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react'

interface CommissionSetting {
  id: string
  name: string
  rate: number
  minAmount?: number
  maxAmount?: number
  isActive: boolean
  createdAt: string
}

export default function CommissionSettingsPage() {
  const { user, isAuthenticated, isAdmin } = useAuth()
    const router = useRouter()
  const [settings, setSettings] = useState<CommissionSetting[]>([])
  const [activeSetting, setActiveSetting] = useState<CommissionSetting | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSetting, setEditingSetting] = useState<CommissionSetting | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    rate: 0.05,
    minAmount: '',
    maxAmount: '',
    isActive: true
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isAdmin) {
      router.push('/')
      return
    }

    fetchSettings()
  }, [isAuthenticated, isAdmin, router])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) return

      const response = await fetch('/api/commission-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        setActiveSetting(data.activeSetting)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) return

      const payload = {
        ...formData,
        minAmount: formData.minAmount ? Number(formData.minAmount) : null,
        maxAmount: formData.maxAmount ? Number(formData.maxAmount) : null
      }

      const url = editingSetting ? '/api/commission-settings' : '/api/commission-settings'
      const method = editingSetting ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingSetting ? { id: editingSetting.id, ...payload } : payload)
      })

      if (response.ok) {
        await fetchSettings()
        setShowForm(false)
        setEditingSetting(null)
        setFormData({
          name: '',
          rate: 0.05,
          minAmount: '',
          maxAmount: '',
          isActive: true
        })
      }
    } catch (error) {
      console.error('Error saving setting:', error)
    }
  }

  const handleEdit = (setting: CommissionSetting) => {
    setEditingSetting(setting)
    setFormData({
      name: setting.name,
      rate: setting.rate,
      minAmount: setting.minAmount?.toString() || '',
      maxAmount: setting.maxAmount?.toString() || '',
      isActive: setting.isActive
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSetting(null)
    setFormData({
      name: '',
      rate: 0.05,
      minAmount: '',
      maxAmount: '',
      isActive: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-primary-600" />
            Configuración de Comisiones
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las tasas de comisión de la plataforma
          </p>
        </div>

        {/* Current Active Setting */}
        {activeSetting && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Configuración Activa</h2>
                <p className="text-gray-600">{activeSetting.name}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  {(activeSetting.rate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Tasa de comisión</div>
              </div>
            </div>
          </div>
        )}

        {/* Settings List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Configuraciones</h2>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Configuración
            </button>
          </div>

          {settings.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay configuraciones</h3>
              <p className="text-gray-600 mb-4">
                Crea tu primera configuración de comisiones.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Configuración
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {settings.map((setting) => (
                <div key={setting.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">{setting.name}</h3>
                        {setting.isActive && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Activa
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Tasa: {(setting.rate * 100).toFixed(1)}%</span>
                        {setting.minAmount && (
                          <span>Mín: R$ {setting.minAmount.toLocaleString('pt-BR')}</span>
                        )}
                        {setting.maxAmount && (
                          <span>Máx: R$ {setting.maxAmount.toLocaleString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(setting)}
                        className="flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-sm max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingSetting ? 'Editar Configuración' : 'Nueva Configuración'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa de Comisión (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Ejemplo: 0.05 = 5%, 0.10 = 10%
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto Mínimo (opcional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.minAmount}
                        onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto Máximo (opcional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.maxAmount}
                        onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Activar esta configuración
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingSetting ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
