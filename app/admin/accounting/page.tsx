'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AccountingData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  revenueGrowth: number
  ordersGrowth: number
  monthlyRevenue: Array<{
    month: string
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    id: string
    title: string
    revenue: number
    sales: number
  }>
  recentTransactions: Array<{
    id: string
    type: 'sale' | 'commission' | 'payout'
    amount: number
    description: string
    date: string
  }>
}

interface FinancialReport {
  totalRevenue: number
  totalCosts: number
  grossProfit: number
  profitMargin: number
  averageOrderValue: number
  revenueByMonth: Array<{
    month: string
    revenue: number
    costs: number
    profit: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
}

export default function AccountingPage() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<AccountingData | null>(null)
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState('30')
  const [periodFilter, setPeriodFilter] = useState('days')

  useEffect(() => {
    // Verificar que el usuario sea administrador completo
    if (!isAuthenticated || !isAdmin) {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated && isAdmin) {
      fetchAccountingData()
    }
  }, [isAuthenticated, isAdmin, dateFilter, periodFilter])

  const fetchAccountingData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        setError('No hay token de autenticación')
        return
      }

      const queryParams = new URLSearchParams({
        period: periodFilter,
        days: dateFilter
      })

      // Calcular fechas para el reporte financiero
      const endDate = new Date()
      const startDate = new Date()
      if (periodFilter === 'days') {
        startDate.setDate(endDate.getDate() - parseInt(dateFilter))
      } else if (periodFilter === 'months') {
        startDate.setMonth(endDate.getMonth() - parseInt(dateFilter))
      }

      const [accountingResponse, financialResponse] = await Promise.all([
        fetch(`/api/accounting?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/reports/financial?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (!accountingResponse.ok) {
        throw new Error('Error al cargar datos contables')
      }

      const accountingData = await accountingResponse.json()
      setData(accountingData)

      if (financialResponse.ok) {
        const financialData = await financialResponse.json()
        setFinancialReport(financialData.report)
      }
    } catch (err) {
      console.error('Error fetching accounting data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const calculateAdvancedMetrics = () => {
    if (!financialReport || !data) return null

    const roi = financialReport.totalCosts > 0 
      ? ((financialReport.grossProfit / financialReport.totalCosts) * 100) 
      : 0

    const revenuePerOrder = data.totalOrders > 0 
      ? financialReport.totalRevenue / data.totalOrders 
      : 0

    const profitPerOrder = data.totalOrders > 0 
      ? financialReport.grossProfit / data.totalOrders 
      : 0

    const monthlyGrowth = data.revenueGrowth / 100
    const projectedRevenue = financialReport.totalRevenue * (1 + monthlyGrowth)
    const projectedProfit = projectedRevenue * (financialReport.profitMargin / 100)

    return {
      roi: roi.toFixed(1),
      revenuePerOrder: revenuePerOrder,
      profitPerOrder: profitPerOrder,
      projectedRevenue: projectedRevenue,
      projectedProfit: projectedProfit,
      efficiency: financialReport.profitMargin > 20 ? 'Alta' : financialReport.profitMargin > 10 ? 'Média' : 'Baixa'
    }
  }

  const handleExportData = () => {
    if (!data || !financialReport) return

    const exportData = {
      basicData: data,
      financialReport: financialReport,
      advancedMetrics: calculateAdvancedMetrics(),
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-contabilidade-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'text-green-600'
      case 'commission':
        return 'text-blue-600'
      case 'payout':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  // Verificar acceso antes de mostrar contenido
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder a la sección de contabilidad.</p>
          <p className="text-sm text-gray-500 mb-6">Solo los administradores completos pueden ver esta información.</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos contables...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAccountingData}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  const advancedMetrics = calculateAdvancedMetrics()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contabilidade</h1>
              <p className="text-gray-600 mt-2">Análise financeira e métricas de vendas</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAccountingData}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </button>
              <button
                onClick={handleExportData}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="365">Último año</option>
              </select>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="days">Días</option>
                <option value="months">Meses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{formatPercentage(data.revenueGrowth)}</span>
              <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{formatPercentage(data.ordersGrowth)}</span>
              <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.averageOrderValue)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ganancia Bruta</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financialReport ? formatCurrency(financialReport.grossProfit) : 'R$ 0,00'}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Costos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financialReport ? formatCurrency(financialReport.totalCosts) : 'R$ 0,00'}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Margem de Lucro</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financialReport ? `${financialReport.profitMargin.toFixed(1)}%` : '0.0%'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Informação sobre Método de Cálculo de Custos */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">ℹ️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Método de Cálculo de Custos
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                O sistema utiliza uma <strong>lógica híbrida inteligente</strong> baseada nas melhores práticas da indústria para calcular os custos dos produtos:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span className="text-blue-800"><strong>1. Custo de inventário</strong> (mais preciso)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span className="text-blue-800"><strong>2. Preço do fornecedor</strong> (confiável)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                    <span className="text-blue-800"><strong>3. Margem individual</strong> (configurável)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    <span className="text-blue-800"><strong>4. Margem global</strong> (padrão)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    <span className="text-blue-800"><strong>5. Sem custo</strong> (sem informação)</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">
                💡 <strong>Dica:</strong> Para obter cálculos mais precisos, configure o custo real no inventário de cada produto.
              </p>
            </div>
          </div>
        </div>

        {/* Análise Financeiro Avançado */}
        {financialReport && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise Financeiro Avançado</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {formatCurrency(financialReport.grossProfit)}
                </div>
                <div className="text-sm text-gray-600">Lucro Bruto</div>
                <div className="text-xs text-gray-500">Receita - Custos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {financialReport.profitMargin.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Margem de Lucro</div>
                <div className="text-xs text-gray-500">Eficiência</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatCurrency(financialReport.averageOrderValue)}
                </div>
                <div className="text-sm text-gray-600">Ticket Médio</div>
                <div className="text-xs text-gray-500">Por pedido</div>
              </div>
            </div>
          </div>
        )}

        {/* Métricas Avançadas de Rentabilidade */}
        {advancedMetrics && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas Avançadas de Rentabilidade</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  {advancedMetrics.roi}%
                </div>
                <div className="text-sm text-gray-600">ROI</div>
                <div className="text-xs text-gray-500">Retorno sobre Investimento</div>
                <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                  parseFloat(advancedMetrics.roi) > 20 ? 'bg-green-100 text-green-800' :
                  parseFloat(advancedMetrics.roi) > 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {parseFloat(advancedMetrics.roi) > 20 ? 'Alto' : parseFloat(advancedMetrics.roi) > 10 ? 'Médio' : 'Baixo'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatCurrency(advancedMetrics.revenuePerOrder)}
                </div>
                <div className="text-sm text-gray-600">Receita por Pedido</div>
                <div className="text-xs text-gray-500">Média de vendas</div>
                <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                  advancedMetrics.revenuePerOrder > 1000 ? 'bg-green-100 text-green-800' :
                  advancedMetrics.revenuePerOrder > 500 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {advancedMetrics.revenuePerOrder > 1000 ? 'Alto valor' : 
                   advancedMetrics.revenuePerOrder > 500 ? 'Médio valor' : 'Baixo valor'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {formatCurrency(advancedMetrics.profitPerOrder)}
                </div>
                <div className="text-sm text-gray-600">Lucro por Pedido</div>
                <div className="text-xs text-gray-500">Ganância média</div>
                <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                  advancedMetrics.profitPerOrder > 200 ? 'bg-green-100 text-green-800' :
                  advancedMetrics.profitPerOrder > 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {advancedMetrics.profitPerOrder > 200 ? 'Muito rentável' : 
                   advancedMetrics.profitPerOrder > 100 ? 'Rentável' : 'Pouco rentável'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {advancedMetrics.efficiency}
                </div>
                <div className="text-sm text-gray-600">Eficiência</div>
                <div className="text-xs text-gray-500">Nível de rentabilidade</div>
                <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                  advancedMetrics.efficiency === 'Alta' ? 'bg-green-100 text-green-800' :
                  advancedMetrics.efficiency === 'Média' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  Margem {financialReport ? (financialReport.profitMargin > 20 ? '> 20%' : 
                   financialReport.profitMargin > 10 ? '10-20%' : '< 10%') : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projeções Financeiras */}
        {advancedMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Projeções Financeiras</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Receita Projetada:</span>
                  <span className="text-lg font-semibold text-emerald-600">
                    {formatCurrency(advancedMetrics.projectedRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lucro Projetado:</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {formatCurrency(advancedMetrics.projectedProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Crescimento:</span>
                  <span className={`text-lg font-semibold ${data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(data.revenueGrowth)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Tendência</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status Atual:</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    data.revenueGrowth > 0 ? 'bg-green-100 text-green-800' : 
                    data.revenueGrowth < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {data.revenueGrowth > 0 ? 'Crescimento' : 
                     data.revenueGrowth < 0 ? 'Declínio' : 'Estável'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Eficiência:</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    financialReport && financialReport.profitMargin > 15 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {financialReport && financialReport.profitMargin > 15 ? 'Alta' : 'Média'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ROI:</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    advancedMetrics && parseFloat(advancedMetrics.roi) > 15 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {advancedMetrics ? `${advancedMetrics.roi}%` : '0.0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Análise por Método de Pagamento */}
        {financialReport && financialReport.paymentMethods && financialReport.paymentMethods.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise por Método de Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {financialReport.paymentMethods.map((method, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{method.method}</span>
                    <span className="text-sm text-gray-500">{method.count} transações</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(method.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((method.amount / financialReport.totalRevenue) * 100).toFixed(1)}% do total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Análise de Rentabilidade por Mês */}
        {financialReport && financialReport.revenueByMonth && financialReport.revenueByMonth.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise de Rentabilidade por Mês</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {financialReport.revenueByMonth.map((month, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">{month.month}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Receita:</span>
                      <div className="text-sm font-semibold text-blue-600">{formatCurrency(month.revenue)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Custos:</span>
                      <div className="text-sm font-semibold text-red-600">{formatCurrency(month.costs)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Lucro:</span>
                      <div className="text-sm font-semibold text-green-600">{formatCurrency(month.profit)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Ingresos Mensuales */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Ingresos Mensuales</h3>
            <div className="space-y-4">
              {data.monthlyRevenue.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(month.revenue)}</div>
                    <div className="text-xs text-gray-500">{month.orders} pedidos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productos Top */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Productos Top</h3>
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-600">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      <div className="text-xs text-gray-500">{product.sales} ventas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transacciones recientes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          transaction.type === 'sale' ? 'bg-green-500' : 
                          transaction.type === 'commission' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="text-sm text-gray-900 capitalize">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
