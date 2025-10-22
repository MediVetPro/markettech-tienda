'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  Package, 
  ShoppingCart,
  CreditCard,
  Users,
  Image,
  TrendingDown,
  Clock,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface Alert {
  id: string
  type: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  message: string
  count: number
  createdAt: string
  details?: any[]
}

interface AlertsData {
  total: number
  critical: number
  warnings: number
  info: number
  alerts: Alert[]
}

export default function AlertsPage() {
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { isAdmin, isAnyAdmin } = useAuth()

  useEffect(() => {
    if (!isAnyAdmin) {
      window.location.href = '/'
      return
    }
    
    fetchAlerts()
  }, [isAnyAdmin])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al obtener alertas')
      }
      
      const data = await response.json()
      setAlertsData(data.alerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAlerts()
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'MEDIUM': return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'LOW': return <Info className="w-5 h-5 text-blue-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'ALTO'
      case 'MEDIUM': return 'MÉDIO'
      case 'LOW': return 'BAIXO'
      default: return severity
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INVENTORY': return <Package className="w-5 h-5" />
      case 'ORDERS': return <ShoppingCart className="w-5 h-5" />
      case 'PAYMENTS': return <CreditCard className="w-5 h-5" />
      case 'USERS': return <Users className="w-5 h-5" />
      case 'PRODUCTS': return <Image className="w-5 h-5" />
      default: return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INVENTORY': return 'text-orange-600 bg-orange-100'
      case 'ORDERS': return 'text-blue-600 bg-blue-100'
      case 'PAYMENTS': return 'text-green-600 bg-green-100'
      case 'USERS': return 'text-purple-600 bg-purple-100'
      case 'PRODUCTS': return 'text-pink-600 bg-pink-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'INVENTORY': return 'ESTOQUE'
      case 'ORDERS': return 'PEDIDOS'
      case 'PAYMENTS': return 'PAGAMENTOS'
      case 'USERS': return 'USUÁRIOS'
      case 'PRODUCTS': return 'PRODUTOS'
      default: return type
    }
  }

  const getActionLinks = (alert: Alert) => {
    const links: Array<{ href: string; label: string; icon: React.ReactNode }> = []
    
    if (alert.type === 'INVENTORY' && alert.details) {
      // Para alertas de inventario, agregar enlaces a productos
      alert.details.slice(0, 3).forEach((detail: any) => {
        if (detail.id) {
          links.push({
            href: `/admin/products/${detail.id}/edit`,
            label: `Editar ${detail.title || 'Produto'}`,
            icon: <Edit className="w-4 h-4" />
          })
        }
      })
    } else if (alert.type === 'PRODUCTS' && alert.details) {
      // Para alertas de productos, agregar enlaces a productos
      alert.details.slice(0, 3).forEach((detail: any) => {
        if (detail.id) {
          links.push({
            href: `/admin/products/${detail.id}/edit`,
            label: `Editar ${detail.title || 'Produto'}`,
            icon: <Edit className="w-4 h-4" />
          })
        }
      })
    } else if (alert.type === 'ORDERS' && alert.details) {
      // Para alertas de órdenes, agregar enlaces a órdenes
      alert.details.slice(0, 2).forEach((detail: any) => {
        if (detail.id) {
          links.push({
            href: `/admin/orders/${detail.id}`,
            label: `Ver Pedido ${detail.id.slice(-6)}`,
            icon: <ExternalLink className="w-4 h-4" />
          })
        }
      })
    } else if (alert.type === 'USERS' && alert.details) {
      // Para alertas de usuarios, agregar enlaces a usuarios
      alert.details.slice(0, 2).forEach((detail: any) => {
        if (detail.id) {
          links.push({
            href: `/admin/users/${detail.id}/edit`,
            label: `Editar ${detail.name || 'Usuário'}`,
            icon: <Edit className="w-4 h-4" />
          })
        }
      })
    }
    
    return links
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando alertas do sistema...</p>
        </div>
      </div>
    )
  }

  if (!alertsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Erro ao carregar as alertas</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Alertas do Sistema</h1>
              <p className="text-gray-600">Monitoramento de problemas e notificações</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Resumo de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{alertsData.critical}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avisos</p>
                <p className="text-2xl font-bold text-yellow-600">{alertsData.warnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Informativas</p>
                <p className="text-2xl font-bold text-blue-600">{alertsData.info}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{alertsData.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Alertas */}
        {alertsData.alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excelente!</h3>
            <p className="text-gray-600">Não há alertas ativos no sistema.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {alertsData.alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {getSeverityText(alert.severity)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
                          {getTypeText(alert.type)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{alert.message}</p>
                      
                      {/* Botones de acción rápida para casos específicos */}
                      {alert.type === 'INVENTORY' && alert.details && alert.details.length > 0 && (
                        <div className="mb-3">
                          <Link
                            href="/admin/products"
                            className="inline-flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 hover:text-white transition-colors mr-2"
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Gerenciar Produtos
                          </Link>
                          {alert.details[0] && (
                            <Link
                              href={`/admin/products/${alert.details[0].id}/edit`}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 hover:text-white transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar Primeiro Produto
                            </Link>
                          )}
                        </div>
                      )}
                      
                      {alert.type === 'ORDERS' && (
                        <div className="mb-3">
                          <Link
                            href="/admin/orders"
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 hover:text-white transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Gerenciar Pedidos
                          </Link>
                        </div>
                      )}
                      
                      {alert.type === 'USERS' && (
                        <div className="mb-3">
                          <Link
                            href="/admin/users"
                            className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 hover:text-white transition-colors"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Gerenciar Usuários
                          </Link>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Detectado: {new Date(alert.createdAt).toLocaleString()}</span>
                        <span className="mx-2">•</span>
                        <span>Quantidade: {alert.count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getTypeIcon(alert.type)}
                  </div>
                </div>

                {alert.details && alert.details.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Ver detalhes ({alert.details.length})
                      </summary>
                      <div className="mt-3 space-y-3">
                        {/* Enlaces de acción rápida */}
                        {getActionLinks(alert).length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Ações Rápidas:</h4>
                            <div className="flex flex-wrap gap-2">
                              {getActionLinks(alert).map((link, index) => (
                                <Link
                                  key={index}
                                  href={link.href}
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 hover:text-white transition-colors"
                                >
                                  {link.icon}
                                  <span className="ml-1">{link.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Detalles técnicos */}
                        <div className="space-y-2">
                          {alert.details.map((detail, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                {JSON.stringify(detail, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
