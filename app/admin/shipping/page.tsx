'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Truck, MapPin, DollarSign, Settings, Save, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface ShippingConfig {
  strategy: string
  costCuritiba: number
  costOtherRegions: number
  freeShippingMinimum: number
  message: string
}

export default function AdminShippingPage() {
  const { canViewAllOrders, canManageProducts, user } = useAuth()
  const [config, setConfig] = useState<ShippingConfig>({
    strategy: 'FREE_INCLUDED',
    costCuritiba: 15.00,
    costOtherRegions: 25.00,
    freeShippingMinimum: 100.00,
    message: 'Frete Grátis para Curitiba - Região Urbana'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!canViewAllOrders && !canManageProducts) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      return
    }
    
    loadConfig()
  }, [canViewAllOrders, canManageProducts])

  const loadConfig = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings')
      
      if (response.ok) {
        const data = await response.json()
        const configs = data.configs || []
        
        const configMap = configs.reduce((acc: any, config: any) => {
          acc[config.key] = config.value
          return acc
        }, {})
        
        setConfig({
          strategy: configMap.shipping_strategy || 'FREE_INCLUDED',
          costCuritiba: parseFloat(configMap.shipping_cost_curitiba || '15.00'),
          costOtherRegions: parseFloat(configMap.shipping_cost_other_regions || '25.00'),
          freeShippingMinimum: parseFloat(configMap.free_shipping_minimum || '100.00'),
          message: configMap.shipping_message || 'Frete Grátis para Curitiba - Região Urbana'
        })
      }
    } catch (error) {
      console.error('Error loading shipping config:', error)
      setMessage('Erro ao carregar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setMessage('')
      
      const configs = [
        { key: 'shipping_strategy', value: config.strategy, type: 'text' },
        { key: 'shipping_cost_curitiba', value: config.costCuritiba.toString(), type: 'number' },
        { key: 'shipping_cost_other_regions', value: config.costOtherRegions.toString(), type: 'number' },
        { key: 'free_shipping_minimum', value: config.freeShippingMinimum.toString(), type: 'number' },
        { key: 'shipping_message', value: config.message, type: 'text' }
      ]
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ configs })
      })
      
      if (response.ok) {
        setMessage('Configurações salvas com sucesso!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ShippingConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuração de Frete</h1>
          <p className="text-gray-600">Configure as opções de envio e frete da sua loja</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('sucesso') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Estratégia de Frete</h2>
              <p className="text-gray-600">Escolha como o frete será calculado</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Estratégia de Frete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Estratégia de Frete
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="strategy"
                    value="FREE_INCLUDED"
                    checked={config.strategy === 'FREE_INCLUDED'}
                    onChange={(e) => handleInputChange('strategy', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Frete Grátis Incluído</div>
                    <div className="text-sm text-gray-600">
                      O custo do frete já está incluído no preço do produto. Ideal para Curitiba região urbana.
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="strategy"
                    value="CALCULATED"
                    checked={config.strategy === 'CALCULATED'}
                    onChange={(e) => handleInputChange('strategy', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Frete Calculado</div>
                    <div className="text-sm text-gray-600">
                      Frete gratuito a partir de um valor mínimo, senão cobra o valor configurado.
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="strategy"
                    value="FIXED"
                    checked={config.strategy === 'FIXED'}
                    onChange={(e) => handleInputChange('strategy', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Frete Fixo</div>
                    <div className="text-sm text-gray-600">
                      Sempre cobra o valor de frete configurado, sem exceções.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Custos de Frete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Custo para Curitiba (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.costCuritiba}
                  onChange={(e) => handleInputChange('costCuritiba', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="15.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Custo para Outras Regiões (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.costOtherRegions}
                  onChange={(e) => handleInputChange('costOtherRegions', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="25.00"
                />
              </div>
            </div>

            {/* Frete Grátis Mínimo */}
            {config.strategy === 'CALCULATED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Valor Mínimo para Frete Grátis (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.freeShippingMinimum}
                  onChange={(e) => handleInputChange('freeShippingMinimum', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="100.00"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Pedidos acima deste valor terão frete gratuito
                </p>
              </div>
            )}

            {/* Mensagem de Frete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem de Frete
              </label>
                <input
                  type="text"
                  value={config.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Frete Grátis para Curitiba - Região Urbana"
                />
              <p className="text-sm text-gray-600 mt-1">
                Esta mensagem será exibida no checkout
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={loadConfig}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Recomendações</h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>Frete Grátis Incluído:</strong> Ideal para Curitiba região urbana, onde você pode incluir o custo de envio no preço do produto.</p>
            <p><strong>Frete Calculado:</strong> Bom para vendas nacionais, oferece frete grátis para pedidos maiores.</p>
            <p><strong>Frete Fixo:</strong> Simples e transparente, sempre o mesmo valor.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
