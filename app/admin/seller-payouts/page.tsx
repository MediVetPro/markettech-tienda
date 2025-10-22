'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users,
  Package,
  Eye
} from 'lucide-react'

interface Payout {
  id: string
  amount: number
  commission: number
  status: string
  paidAt?: string
  createdAt: string
  seller: {
    id: string
    name: string
    email: string
  }
  order: {
    id: string
    customerName: string
    customerEmail: string
    total: number
    status: string
    createdAt: string
  }
}

interface PayoutSummary {
  totalEarnings: number
  totalCommission: number
  pendingPayouts: number
  paidPayouts: number
  totalPayouts: number
}

export default function SellerPayoutsPage() {
  const { user, isAuthenticated, isAdmin } = useAuth()
    const router = useRouter()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [summary, setSummary] = useState<PayoutSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // ALL, PENDING, PAID, FAILED

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isAdmin) {
      router.push('/')
      return
    }

    fetchPayouts()
  }, [isAuthenticated, isAdmin, router])

  const fetchPayouts = async () => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) return

      const response = await fetch('/api/seller-payouts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPayouts(data.payouts)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (payoutId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) return

      const response = await fetch('/api/seller-payouts', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payoutId, status: newStatus })
      })

      if (response.ok) {
        await fetchPayouts()
      }
    } catch (error) {
      console.error('Error updating payout status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente'
      case 'PAID':
        return 'Pagado'
      case 'FAILED':
        return 'Fallido'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredPayouts = payouts.filter(payout => {
    if (filter === 'ALL') return true
    return payout.status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pagos...</p>
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
            <DollarSign className="w-8 h-8 mr-3 text-primary-600" />
            Gestión de Pagos a Vendedores
          </h1>
          <p className="text-gray-600 mt-2">
            Administra los pagos y comisiones de los vendedores
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pagado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {summary.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Comisiones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {summary.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.pendingPayouts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pagados</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.paidPayouts}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="PAID">Pagados</option>
              <option value="FAILED">Fallidos</option>
            </select>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pagos a Vendedores</h2>
          </div>

          {filteredPayouts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos</h3>
              <p className="text-gray-600">
                Los pagos aparecerán aquí cuando haya ventas confirmadas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payout.seller.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payout.seller.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{payout.order.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payout.order.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          R$ {payout.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          R$ {payout.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {getStatusIcon(payout.status)}
                          <span className="ml-1">{getStatusText(payout.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </div>
                        {payout.paidAt && (
                          <div className="text-sm text-gray-500">
                            Pagado: {new Date(payout.paidAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {payout.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(payout.id, 'PAID')}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Marcar como Pagado
                              </button>
                              <button
                                onClick={() => handleStatusChange(payout.id, 'FAILED')}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Marcar como Fallido
                              </button>
                            </>
                          )}
                          {payout.status === 'PAID' && (
                            <span className="text-sm text-green-600 font-medium">
                              Completado
                            </span>
                          )}
                          {payout.status === 'FAILED' && (
                            <button
                              onClick={() => handleStatusChange(payout.id, 'PENDING')}
                              className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                            >
                              Reintentar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
