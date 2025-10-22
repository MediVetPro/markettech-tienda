'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Users, 
  Package, 
  ShoppingCart,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface HealthMetrics {
  users: number
  products: number
  orders: number
  activeOrders: number
  pendingPayments: number
  lowStockProducts: number
  outOfStockProducts: number
}

interface CriticalIssue {
  type: string
  count: number
  message: string
}

interface Recommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  title: string
  description: string
  action: string
}

interface HealthCheck {
  status: 'HEALTHY' | 'WARNING' | 'ERROR'
  timestamp: string
  responseTime: string
  metrics: HealthMetrics
  criticalIssues: CriticalIssue[]
  recommendations: Recommendation[]
}

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { isAdmin, isAnyAdmin } = useAuth()

  useEffect(() => {
    if (!isAnyAdmin) {
      window.location.href = '/'
      return
    }
    
    fetchHealthData()
  }, [isAnyAdmin])

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/health-check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al obtener datos de salud')
      }
      
      const data = await response.json()
      setHealthData(data.healthCheck)
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHealthData()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="w-8 h-8 text-green-600" />
      case 'WARNING': return <AlertTriangle className="w-8 h-8 text-yellow-600" />
      case 'ERROR': return <XCircle className="w-8 h-8 text-red-600" />
      default: return <Clock className="w-8 h-8 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 bg-green-50'
      case 'WARNING': return 'text-yellow-600 bg-yellow-50'
      case 'ERROR': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'SAUDÁVEL'
      case 'WARNING': return 'AVISO'
      case 'ERROR': return 'ERRO'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'ALTO'
      case 'MEDIUM': return 'MÉDIO'
      case 'LOW': return 'BAIXO'
      default: return priority
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando saúde do sistema...</p>
        </div>
      </div>
    )
  }

  if (!healthData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Erro ao carregar os dados de saúde</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegação */}
        <div className="mb-6">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Saúde do Sistema</h1>
              <p className="text-gray-600">Monitoramento rápido do estado da loja</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {getStatusIcon(healthData.status)}
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData.status)}`}>
                  {getStatusText(healthData.status)}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Verificando...' : 'Atualizar'}
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>Última verificação: {new Date(healthData.timestamp).toLocaleString()}</span>
            <span className="mx-2">•</span>
            <span>Tempo de resposta: {healthData.responseTime}</span>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{healthData.metrics.users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{healthData.metrics.products}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pedidos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{healthData.metrics.activeOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{healthData.metrics.pendingPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Problemas Críticos */}
        {healthData.criticalIssues.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Problemas Críticos</h3>
            </div>
            <div className="space-y-3">
              {healthData.criticalIssues.map((issue, index) => (
                <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">{issue.message}</p>
                      <p className="text-sm text-red-600">Cantidad: {issue.count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendações */}
        {healthData.recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Recomendações</h3>
            </div>
            <div className="space-y-4">
              {healthData.recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {getPriorityText(rec.priority)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">{rec.category}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        {rec.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Métricas Adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventário</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Produtos sem estoque</span>
                <span className={`font-medium ${healthData.metrics.outOfStockProducts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {healthData.metrics.outOfStockProducts}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Produtos com estoque baixo</span>
                <span className={`font-medium ${healthData.metrics.lowStockProducts > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {healthData.metrics.lowStockProducts}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado do Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estado geral</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthData.status)}`}>
                  {getStatusText(healthData.status)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tempo de resposta</span>
                <span className="font-medium text-gray-900">{healthData.responseTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Problemas detectados</span>
                <span className={`font-medium ${healthData.criticalIssues.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {healthData.criticalIssues.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
