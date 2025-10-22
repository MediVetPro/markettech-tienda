'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database, 
  Users, 
  Package, 
  ShoppingCart,
  TrendingUp,
  Shield,
  Clock,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Edit,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface DiagnosticIssue {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  details?: any[]
}

interface DiagnosticResult {
  status: 'HEALTHY' | 'ISSUES_FOUND' | 'ERROR'
  issues: DiagnosticIssue[]
}

interface SystemDiagnostics {
  timestamp: string
  database: DiagnosticResult
  dataIntegrity: DiagnosticResult
  userData: DiagnosticResult
  systemPerformance: DiagnosticResult
  inconsistencies: DiagnosticResult
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { isAdmin, isAnyAdmin } = useAuth()

  useEffect(() => {
    if (!isAnyAdmin) {
      window.location.href = '/'
      return
    }
    
    fetchDiagnostics()
  }, [isAnyAdmin])

  const fetchDiagnostics = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/diagnostics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al obtener diagnósticos')
      }
      
      const data = await response.json()
      setDiagnostics(data.diagnostics)
    } catch (error) {
      console.error('Error fetching diagnostics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDiagnostics()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-100'
      case 'HIGH': return 'text-red-600 bg-red-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'CRÍTICO'
      case 'HIGH': return 'ALTO'
      case 'MEDIUM': return 'MÉDIO'
      case 'LOW': return 'BAIXO'
      default: return severity
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <XCircle className="w-5 h-5" />
      case 'HIGH': return <AlertTriangle className="w-5 h-5" />
      case 'MEDIUM': return <AlertCircle className="w-5 h-5" />
      case 'LOW': return <Clock className="w-5 h-5" />
      default: return <CheckCircle className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'ISSUES_FOUND': return <AlertTriangle className="w-6 h-6 text-yellow-600" />
      case 'ERROR': return <XCircle className="w-6 h-6 text-red-600" />
      default: return <Clock className="w-6 h-6 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 bg-green-50'
      case 'ISSUES_FOUND': return 'text-yellow-600 bg-yellow-50'
      case 'ERROR': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'SAUDÁVEL'
      case 'ISSUES_FOUND': return 'PROBLEMAS ENCONTRADOS'
      case 'ERROR': return 'ERRO'
      default: return status
    }
  }

  const getActionLinks = (issue: DiagnosticIssue) => {
    const links = []
    
    if (issue.type === 'DATA_INTEGRITY' && issue.details) {
      // Para órdenes sin items
      if (issue.message.includes('órdenes sin items') && issue.details.length > 0) {
        links.push({
          href: '/admin/orders',
          label: 'Gerenciar Pedidos',
          icon: <ShoppingCart className="w-4 h-4" />
        })
        // Enlace al primer pedido problemático
        if (issue.details[0]?.id) {
          links.push({
            href: `/admin/orders/${issue.details[0].id}`,
            label: `Ver Pedido ${issue.details[0].id.slice(-6)}`,
            icon: <Eye className="w-4 h-4" />
          })
        }
      }
      
      // Para productos sin imágenes
      if (issue.message.includes('productos sin imágenes') && issue.details.length > 0) {
        links.push({
          href: '/admin/products',
          label: 'Gerenciar Produtos',
          icon: <Package className="w-4 h-4" />
        })
        // Mostrar botones para todos los productos sin imagen (máximo 3)
        issue.details.slice(0, 3).forEach((detail: any, index: number) => {
          if (detail.id) {
            links.push({
              href: `/admin/products/${detail.id}/edit`,
              label: `Editar ${detail.title || `Produto ${index + 1}`}`,
              icon: <Edit className="w-4 h-4" />
            })
          }
        })
        // Si hay más de 3 productos, mostrar un botón adicional
        if (issue.details.length > 3) {
          links.push({
            href: '/admin/products',
            label: `Ver mais ${issue.details.length - 3} produtos`,
            icon: <ExternalLink className="w-4 h-4" />
          })
        }
      }
    }
    
    if (issue.type === 'USER_DATA' && issue.details) {
      // Para usuarios con datos faltantes
      if (issue.message.includes('usuarios con datos faltantes') && issue.details.length > 0) {
        links.push({
          href: '/admin/users',
          label: 'Gerenciar Usuários',
          icon: <Users className="w-4 h-4" />
        })
        // Mostrar botones para todos los usuarios con datos faltantes (máximo 3)
        issue.details.slice(0, 3).forEach((detail: any, index: number) => {
          if (detail.id) {
            links.push({
              href: `/admin/users/${detail.id}/edit`,
              label: `Editar ${detail.name || `Usuário ${index + 1}`}`,
              icon: <Edit className="w-4 h-4" />
            })
          }
        })
        // Si hay más de 3 usuarios, mostrar un botón adicional
        if (issue.details.length > 3) {
          links.push({
            href: '/admin/users',
            label: `Ver mais ${issue.details.length - 3} usuários`,
            icon: <ExternalLink className="w-4 h-4" />
          })
        }
      }
      
      // Para usuarios con CPF inválido
      if (issue.message.includes('usuarios con CPF inválido') && issue.details.length > 0) {
        links.push({
          href: '/admin/users',
          label: 'Gerenciar Usuários',
          icon: <Users className="w-4 h-4" />
        })
        // Mostrar botones para todos los usuarios con CPF inválido (máximo 3 para no saturar)
        issue.details.slice(0, 3).forEach((detail: any, index: number) => {
          if (detail.id) {
            links.push({
              href: `/admin/users/${detail.id}/edit`,
              label: `Corrigir CPF de ${detail.name || `Usuário ${index + 1}`}`,
              icon: <Edit className="w-4 h-4" />
            })
          }
        })
        // Si hay más de 3 usuarios, mostrar un botón adicional
        if (issue.details.length > 3) {
          links.push({
            href: '/admin/users',
            label: `Ver mais ${issue.details.length - 3} usuários`,
            icon: <ExternalLink className="w-4 h-4" />
          })
        }
      }
    }
    
    if (issue.type === 'PERFORMANCE' && issue.details) {
      // Para órdenes pendientes antiguas
      if (issue.message.includes('órdenes pendientes') && issue.details.length > 0) {
        links.push({
          href: '/admin/orders',
          label: 'Gerenciar Pedidos',
          icon: <ShoppingCart className="w-4 h-4" />
        })
        if (issue.details[0]?.id) {
          links.push({
            href: `/admin/orders/${issue.details[0].id}`,
            label: `Ver Pedido ${issue.details[0].id.slice(-6)}`,
            icon: <Eye className="w-4 h-4" />
          })
        }
      }
      
      // Para productos sin stock
      if (issue.message.includes('productos sin stock') && issue.details.length > 0) {
        links.push({
          href: '/admin/products',
          label: 'Gerenciar Produtos',
          icon: <Package className="w-4 h-4" />
        })
        if (issue.details[0]?.id) {
          links.push({
            href: `/admin/products/${issue.details[0].id}/edit`,
            label: `Reponer Stock de ${issue.details[0].title || 'Produto'}`,
            icon: <Edit className="w-4 h-4" />
          })
        }
      }
    }
    
    if (issue.type === 'INCONSISTENCY' && issue.details) {
      // Para órdenes con totales inconsistentes
      if (issue.message.includes('órdenes con totales inconsistentes') && issue.details.length > 0) {
        links.push({
          href: '/admin/orders',
          label: 'Gerenciar Pedidos',
          icon: <ShoppingCart className="w-4 h-4" />
        })
        if (issue.details[0]?.id) {
          links.push({
            href: `/admin/orders/${issue.details[0].id}`,
            label: `Revisar Pedido ${issue.details[0].id.slice(-6)}`,
            icon: <Eye className="w-4 h-4" />
          })
        }
      }
    }
    
    return links
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Executando diagnósticos do sistema...</p>
        </div>
      </div>
    )
  }

  if (!diagnostics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Erro ao carregar os diagnósticos</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:text-white"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  const allIssues = [
    ...diagnostics.database.issues,
    ...diagnostics.dataIntegrity.issues,
    ...diagnostics.userData.issues,
    ...diagnostics.systemPerformance.issues,
    ...diagnostics.inconsistencies.issues
  ]

  const criticalIssues = allIssues.filter(issue => issue.severity === 'CRITICAL').length
  const highIssues = allIssues.filter(issue => issue.severity === 'HIGH').length
  const mediumIssues = allIssues.filter(issue => issue.severity === 'MEDIUM').length
  const lowIssues = allIssues.filter(issue => issue.severity === 'LOW').length

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagnóstico do Sistema</h1>
              <p className="text-gray-600">Monitoramento de saúde e detecção de problemas</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Executando...' : 'Atualizar'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Última atualização: {new Date(diagnostics.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Resumo de Problemas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalIssues}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Altos</p>
                <p className="text-2xl font-bold text-orange-600">{highIssues}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Médios</p>
                <p className="text-2xl font-bold text-yellow-600">{mediumIssues}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Baixos</p>
                <p className="text-2xl font-bold text-blue-600">{lowIssues}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnósticos por Categoria */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Base de Dados */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Base de Dados</h3>
              <div className="ml-auto">
                {getStatusIcon(diagnostics.database.status)}
              </div>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(diagnostics.database.status)}`}>
              {getStatusText(diagnostics.database.status)}
            </div>
            {diagnostics.database.issues.length > 0 && (
              <div className="mt-4 space-y-2">
                {diagnostics.database.issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getSeverityIcon(issue.severity)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                        {getSeverityText(issue.severity)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{issue.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Integridad de Datos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Integridade de Dados</h3>
              <div className="ml-auto">
                {getStatusIcon(diagnostics.dataIntegrity.status)}
              </div>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(diagnostics.dataIntegrity.status)}`}>
              {getStatusText(diagnostics.dataIntegrity.status)}
            </div>
            {diagnostics.dataIntegrity.issues.length > 0 && (
              <div className="mt-4 space-y-2">
                {diagnostics.dataIntegrity.issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getSeverityIcon(issue.severity)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                        {getSeverityText(issue.severity)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{issue.message}</p>
                    
                    {/* Enlaces de acción */}
                    {getActionLinks(issue).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getActionLinks(issue).map((link, linkIndex) => (
                          <Link
                            key={linkIndex}
                            href={link.href}
                            className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 hover:text-white transition-colors"
                            style={{ color: 'white' }}
                          >
                            {link.icon}
                            <span className="ml-1" style={{ color: 'white' }}>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Datos de Usuarios */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Dados de Usuários</h3>
              <div className="ml-auto">
                {getStatusIcon(diagnostics.userData.status)}
              </div>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(diagnostics.userData.status)}`}>
              {getStatusText(diagnostics.userData.status)}
            </div>
            {diagnostics.userData.issues.length > 0 && (
              <div className="mt-4 space-y-2">
                {diagnostics.userData.issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getSeverityIcon(issue.severity)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                        {getSeverityText(issue.severity)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{issue.message}</p>
                    
                    {/* Enlaces de acción */}
                    {getActionLinks(issue).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getActionLinks(issue).map((link, linkIndex) => (
                          <Link
                            key={linkIndex}
                            href={link.href}
                            className="inline-flex items-center px-2 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 hover:text-white transition-colors"
                            style={{ color: 'white' }}
                          >
                            {link.icon}
                            <span className="ml-1" style={{ color: 'white' }}>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {issue.details && issue.details.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <details>
                          <summary className="cursor-pointer">Ver detalhes</summary>
                          <div className="mt-2 space-y-1">
                            {issue.details.slice(0, 5).map((detail, detailIndex) => (
                              <div key={detailIndex} className="p-2 bg-white rounded border">
                                <pre className="text-xs">{JSON.stringify(detail, null, 2)}</pre>
                              </div>
                            ))}
                            {issue.details.length > 5 && (
                              <p className="text-xs text-gray-400">... e {issue.details.length - 5} mais</p>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rendimiento del Sistema */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Desempenho</h3>
              <div className="ml-auto">
                {getStatusIcon(diagnostics.systemPerformance.status)}
              </div>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(diagnostics.systemPerformance.status)}`}>
              {getStatusText(diagnostics.systemPerformance.status)}
            </div>
            {diagnostics.systemPerformance.issues.length > 0 && (
              <div className="mt-4 space-y-2">
                {diagnostics.systemPerformance.issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getSeverityIcon(issue.severity)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                        {getSeverityText(issue.severity)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{issue.message}</p>
                    
                    {/* Enlaces de acción */}
                    {getActionLinks(issue).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getActionLinks(issue).map((link, linkIndex) => (
                          <Link
                            key={linkIndex}
                            href={link.href}
                            className="inline-flex items-center px-2 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 hover:text-white transition-colors"
                            style={{ color: 'white' }}
                          >
                            {link.icon}
                            <span className="ml-1" style={{ color: 'white' }}>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inconsistencias */}
          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Inconsistências</h3>
              <div className="ml-auto">
                {getStatusIcon(diagnostics.inconsistencies.status)}
              </div>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(diagnostics.inconsistencies.status)}`}>
              {getStatusText(diagnostics.inconsistencies.status)}
            </div>
            {diagnostics.inconsistencies.issues.length > 0 && (
              <div className="mt-4 space-y-2">
                {diagnostics.inconsistencies.issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getSeverityIcon(issue.severity)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                        {getSeverityText(issue.severity)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{issue.message}</p>
                    
                    {/* Enlaces de acción */}
                    {getActionLinks(issue).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getActionLinks(issue).map((link, linkIndex) => (
                          <Link
                            key={linkIndex}
                            href={link.href}
                            className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 hover:text-white transition-colors"
                            style={{ color: 'white' }}
                          >
                            {link.icon}
                            <span className="ml-1" style={{ color: 'white' }}>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {issue.details && issue.details.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <details>
                          <summary className="cursor-pointer">Ver detalhes</summary>
                          <div className="mt-2 space-y-1">
                            {issue.details.slice(0, 3).map((detail, detailIndex) => (
                              <div key={detailIndex} className="p-2 bg-white rounded border">
                                <pre className="text-xs">{JSON.stringify(detail, null, 2)}</pre>
                              </div>
                            ))}
                            {issue.details.length > 3 && (
                              <p className="text-xs text-gray-400">... e {issue.details.length - 3} mais</p>
                            )}
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
      </div>
    </div>
  )
}
