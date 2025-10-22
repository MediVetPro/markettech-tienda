'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Save, Eye, EyeOff, CheckCircle, AlertCircle, CreditCard, Key, Globe } from 'lucide-react'

interface MercadoPagoConfig {
  accessToken: string
  publicKey: string
  webhookSecret: string
  isTestMode: boolean
  pixKey: string
  pixKeyType: string
}

export default function MercadoPagoConfigPage() {
  const [config, setConfig] = useState<MercadoPagoConfig>({
    accessToken: '',
    publicKey: '',
    webhookSecret: '',
    isTestMode: true,
    pixKey: '',
    pixKeyType: 'email'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showTokens, setShowTokens] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const { isAdmin, user, isAuthenticated } = useAuth()

  useEffect(() => {
    console.log('🔍 [MERCADOPAGO] Verificando autenticación...')
    console.log('🔍 [MERCADOPAGO] isAdmin:', isAdmin)
    console.log('🔍 [MERCADOPAGO] user:', user)
    
    // No redirigir automáticamente, solo mostrar mensaje si no es admin
    if (!isAdmin) {
      console.log('⚠️ [MERCADOPAGO] Usuario no es admin, pero no redirigiendo automáticamente')
      return
    }
    
    fetchConfig()
  }, [isAdmin])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }

      const response = await fetch('/api/admin/mercado-pago-config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config || {
          accessToken: '',
          publicKey: '',
          webhookSecret: '',
          isTestMode: true,
          pixKey: '',
          pixKeyType: 'email'
        })
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      const response = await fetch('/api/admin/mercado-pago-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ config })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuração salva com sucesso!' })
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao salvar configuração')
      }
    } catch (error) {
      console.error('Error salvando configuración:', error)
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Erro ao salvar configuração' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof MercadoPagoConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuração do MercadoPago</h1>
          <p className="text-gray-600">Configure as credenciais do MercadoPago para pagamentos PIX</p>
        </div>

        {/* Debug Info */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Debug - Estado de Autenticación:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
            <p><strong>isAdmin:</strong> {isAdmin ? 'Sí' : 'No'}</p>
            <p><strong>user:</strong> {user ? user.name : 'No user'}</p>
            <p><strong>user.role:</strong> {user?.role || 'No role'}</p>
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

        {/* Config Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-6">
            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="font-medium text-yellow-800">Modo de Teste</h3>
                  <p className="text-sm text-yellow-700">Ative para usar credenciais de teste do MercadoPago</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isTestMode}
                  onChange={(e) => handleInputChange('isTestMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Access Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                Access Token
              </label>
              <div className="relative">
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={config.accessToken}
                  onChange={(e) => handleInputChange('accessToken', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx"
                />
                <button
                  type="button"
                  onClick={() => setShowTokens(!showTokens)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Token de acesso do MercadoPago (encontrado no painel do desenvolvedor)
              </p>
            </div>

            {/* Public Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Chave Pública
              </label>
              <input
                type={showTokens ? 'text' : 'password'}
                value={config.publicKey}
                onChange={(e) => handleInputChange('publicKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx"
              />
              <p className="text-xs text-gray-500 mt-1">
                Chave pública do MercadoPago (usada no frontend)
              </p>
            </div>

            {/* Webhook Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Webhook Secret
              </label>
              <input
                type={showTokens ? 'text' : 'password'}
                value={config.webhookSecret}
                onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Seu webhook secret"
              />
              <p className="text-xs text-gray-500 mt-1">
                Chave secreta para validar webhooks do MercadoPago
              </p>
            </div>

            {/* PIX Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuração PIX</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    value={config.pixKey}
                    onChange={(e) => handleInputChange('pixKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="seu-email@exemplo.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sua chave PIX (email, CPF, telefone ou chave aleatória)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo da Chave PIX
                  </label>
                  <select
                    value={config.pixKeyType}
                    onChange={(e) => handleInputChange('pixKeyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="cpf">CPF</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Chave Aleatória</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configuração
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Como obter as credenciais:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Acesse o painel do desenvolvedor do MercadoPago</li>
            <li>Vá em "Suas integrações"</li>
            <li>Copie o "Access Token" e "Public Key"</li>
            <li>Configure o webhook secret nas configurações de webhook</li>
            <li>Configure sua chave PIX nas configurações de conta</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
