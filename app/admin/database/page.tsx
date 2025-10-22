'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Database, Trash2, Download, Upload, Eye, AlertTriangle, Shield, Users, Package, ShoppingCart, MessageSquare, Bell } from 'lucide-react'

export default function DatabaseAdminPage() {
  const [loading, setLoading] = useState(false)
  const [dbStats, setDbStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalMessages: 0,
    totalNotifications: 0,
    totalImages: 0
  })
  const [dbStructure, setDbStructure] = useState<any>(null)
  const [showStructure, setShowStructure] = useState(false)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [tableVerification, setTableVerification] = useState<any>(null)
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/'
      return
    }
    
    fetchDatabaseStats()
    fetchConfigStatus()
  }, [isAdmin])

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true)
      
      // Obter token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/database/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDbStats(data)
      } else {
        console.error('Erro ao buscar estatísticas:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConfigStatus = async () => {
    try {
      // Obter token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/database/test-config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setConfigStatus(data.data)
      } else {
        console.error('Erro ao buscar status das configurações:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar status das configurações:', error)
    }
  }

  const verifyAllTables = async () => {
    try {
      setLoading(true)
      
      // Obter token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/database/verify-backup', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTableVerification(data)
        console.log('✅ Verificación de tablas completada:', data.summary)
      } else {
        console.error('Erro ao verificar tablas:', response.status)
      }
    } catch (error) {
      console.error('Erro ao verificar tablas:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables)
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName)
    } else {
      newExpanded.add(tableName)
    }
    setExpandedTables(newExpanded)
  }

  const fetchDatabaseStructure = async () => {
    try {
      setLoading(true)
      
      // Obter token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/database/structure', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDbStructure(data)
        setShowStructure(true)
      } else {
        console.error('Erro ao buscar estrutura:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar estrutura:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePartialClean = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá limpar TODOS os dados exceto usuários e configurações do sistema. Isso inclui:\n\n• Todos os produtos e suas imagens\n• Todos os pedidos\n• Todas as mensagens\n• Todas as notificações\n• Todos os dados de carrinho\n• Todos os reviews e ratings\n\nMANTÉM:\n• Todos os usuários\n• Configurações do site (SiteConfig)\n• Perfis de pagamento global (GlobalPaymentProfile)\n• Configurações de comissão (CommissionSettings)\n\nTem certeza que deseja continuar?')) {
      return
    }

    try {
      setLoading(true)
      
      // Obter token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/database/clean-partial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('✅ Limpeza parcial realizada com sucesso!')
        fetchDatabaseStats()
      } else {
        const error = await response.json()
        alert(`❌ Erro: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro na limpeza parcial:', error)
      alert('❌ Erro ao realizar limpeza parcial')
    } finally {
      setLoading(false)
    }
  }

  const handleFullClean = async () => {
    if (!confirm('🚨 PERIGO: Esta ação irá LIMPAR COMPLETAMENTE a base de dados, mantendo apenas a conta do administrador atual.\n\nIsso irá deletar:\n• TODOS os usuários (exceto admin atual)\n• TODOS os produtos\n• TODOS os pedidos\n• TODAS as mensagens\n• TODAS as notificações\n• TODOS os dados\n\nEsta ação é IRREVERSÍVEL!\n\nTem certeza absoluta?')) {
      return
    }

    const confirmText = prompt('Para confirmar, digite "LIMPAR TUDO" (em maiúsculas):')
    if (confirmText !== 'LIMPAR TUDO') {
      alert('❌ Confirmação incorreta. Operação cancelada.')
      return
    }

    try {
      setLoading(true)
      
      // Obter token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/database/clean-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('✅ Limpeza completa realizada com sucesso!')
        fetchDatabaseStats()
      } else {
        const error = await response.json()
        alert(`❌ Erro: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro na limpeza completa:', error)
      alert('❌ Erro ao realizar limpeza completa')
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    try {
      setLoading(true)
      
      // Obter token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup-${new Date().toISOString().split('T')[0]}.sql`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        alert('✅ Backup criado e baixado com sucesso!')
      } else {
        const error = await response.json()
        alert(`❌ Erro: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no backup:', error)
      alert('❌ Erro ao criar backup')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('⚠️ ATENÇÃO: Esta ação irá substituir TODOS os dados atuais pelos dados do arquivo de backup.\n\nTem certeza que deseja continuar?')) {
      return
    }

    try {
      setLoading(true)
      
      // Obter token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/database/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        alert('✅ Restore realizado com sucesso!')
        fetchDatabaseStats()
      } else {
        const error = await response.json()
        alert(`❌ Erro: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no restore:', error)
      alert('❌ Erro ao restaurar backup')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administração da Base de Dados</h1>
          <p className="text-gray-600">Gerenciar dados, backups e estrutura da base de dados</p>
        </div>

        {/* Estatísticas da Base de Dados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{dbStats.totalUsers}</p>
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
                <p className="text-2xl font-bold text-gray-900">{dbStats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{dbStats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mensagens</p>
                <p className="text-2xl font-bold text-gray-900">{dbStats.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notificações</p>
                <p className="text-2xl font-bold text-gray-900">{dbStats.totalNotifications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Imagens</p>
                <p className="text-2xl font-bold text-gray-900">{dbStats.totalImages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações de Limpeza */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Limpeza de Dados</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Limpeza Parcial */}
            <div className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
              <div className="flex items-center mb-4">
                <Trash2 className="w-6 h-6 text-yellow-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Limpeza Parcial</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Remove todos os dados exceto usuários e configurações do sistema. Inclui produtos, pedidos, mensagens, notificações, etc. Mantém: SiteConfig, GlobalPaymentProfile, CommissionSettings.
              </p>
              <button
                onClick={handlePartialClean}
                disabled={loading}
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Limpar Dados (Manter Usuários)'}
              </button>
            </div>

            {/* Limpeza Completa */}
            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Limpeza Completa</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Remove TODOS os dados, mantendo apenas a conta do administrador atual.
              </p>
              <button
                onClick={handleFullClean}
                disabled={loading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Limpar Tudo (Só Admin)'}
              </button>
            </div>
          </div>
        </div>

        {/* Backup e Restore */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Backup e Restore</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup */}
            <div className="border border-green-200 rounded-lg p-6 bg-green-50">
              <div className="flex items-center mb-4">
                <Download className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Criar Backup</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Cria um backup completo da base de dados para download.
              </p>
              <button
                onClick={handleBackup}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Criar Backup'}
              </button>
            </div>

            {/* Restore */}
            <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
              <div className="flex items-center mb-4">
                <Upload className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Restaurar Backup</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Restaura a base de dados a partir de um arquivo de backup.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                disabled={loading}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Status das Configurações */}
        {configStatus && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Status das Configurações</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="font-medium text-gray-900 mb-2">SiteConfig</h3>
                <p className="text-sm text-gray-600">
                  {configStatus.siteConfigs?.count || 0} configurações
                </p>
                {configStatus.siteConfigs?.count > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Incluídas no backup: ✅</p>
                  </div>
                )}
              </div>

              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-medium text-gray-900 mb-2">GlobalPaymentProfile</h3>
                <p className="text-sm text-gray-600">
                  {configStatus.globalPaymentProfiles?.count || 0} perfis
                </p>
                {configStatus.globalPaymentProfiles?.count > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Incluídos no backup: ✅</p>
                  </div>
                )}
              </div>

              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h3 className="font-medium text-gray-900 mb-2">CommissionSettings</h3>
                <p className="text-sm text-gray-600">
                  {configStatus.commissionSettings?.count || 0} configurações
                </p>
                {configStatus.commissionSettings?.count > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Incluídas no backup: ✅</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Verificação de Todas as Tabelas */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Verificação Completa das Tabelas</h2>
            <button
              onClick={verifyAllTables}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Database className="w-4 h-4 mr-2" />
              {loading ? 'Verificando...' : 'Verificar Todas as Tabelas'}
            </button>
          </div>

          {tableVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900">Total de Tabelas</h3>
                  <p className="text-2xl font-bold text-blue-600">{tableVerification.summary.totalTables}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900">Tabelas com Dados</h3>
                  <p className="text-2xl font-bold text-green-600">{tableVerification.summary.tablesWithData}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900">Total de Registros</h3>
                  <p className="text-2xl font-bold text-purple-600">{tableVerification.summary.totalRecords}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {Object.entries(tableVerification.tables).map(([tableName, tableInfo]: [string, any]) => (
                  <div key={tableName} className={`border rounded-lg p-3 ${
                    tableInfo.status === 'HAS_DATA' ? 'border-green-200 bg-green-50' :
                    tableInfo.status === 'EMPTY' ? 'border-yellow-200 bg-yellow-50' :
                    'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-900">{tableName}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        tableInfo.status === 'HAS_DATA' ? 'bg-green-100 text-green-800' :
                        tableInfo.status === 'EMPTY' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tableInfo.status === 'HAS_DATA' ? '✅' : 
                         tableInfo.status === 'EMPTY' ? '⚠️' : '❌'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {tableInfo.count} registros
                    </p>
                    {tableInfo.error && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {tableInfo.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Estrutura da Base de Dados */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Estrutura da Base de Dados</h2>
            <button
              onClick={fetchDatabaseStructure}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              {loading ? 'Carregando...' : 'Ver Estrutura'}
            </button>
          </div>

          {showStructure && dbStructure && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dbStructure.tables?.map((table: any) => {
                  const isExpanded = expandedTables.has(table.name)
                  const visibleColumns = isExpanded ? table.columns : table.columns?.slice(0, 3)
                  
                  return (
                    <div key={table.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{table.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {table.rows} registros
                          </span>
                          {table.columns?.length > 3 && (
                            <button
                              onClick={() => toggleTableExpansion(table.name)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title={isExpanded ? "Ocultar campos" : "Ver todos los campos"}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {visibleColumns?.map((column: any) => (
                          <div key={column.name} className="text-xs text-gray-500 flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="font-mono">{column.name}</span>
                              <span className="ml-2 text-gray-400">({column.type})</span>
                            </div>
                            {column.nullable && (
                              <span className="text-orange-500 text-xs">nullable</span>
                            )}
                          </div>
                        ))}
                        
                        {!isExpanded && table.columns?.length > 3 && (
                          <div className="text-xs text-gray-400 mt-2 flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            +{table.columns.length - 3} mais campos... (click no ícone para ver)
                          </div>
                        )}
                        
                        {isExpanded && table.columns?.length > 3 && (
                          <div className="text-xs text-gray-400 mt-2 flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Mostrando todos os {table.columns.length} campos
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
