'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Package, ShoppingCart, Users, TrendingUp, Settings, CreditCard, BarChart3, Truck, Database, Shield, Heart, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'


export default function AdminPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    newOrders: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const { isAdmin, isAdminVendas, isAnyAdmin, canManageUsers, canManageSiteSettings } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAnyAdmin) {
      router.push('/')
      return
    }
    
    fetchDashboardData()
  }, [isAnyAdmin])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Obtener token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }
      
      // Fetch products del usuario actual
      const productsResponse = await fetch('/api/products?admin=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!productsResponse.ok) {
        throw new Error('Failed to fetch products')
      }
      const productsData = await productsResponse.json()

      // Fetch orders from real API
      const ordersResponse = await fetch('/api/orders')
      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders')
      }
      const ordersData = await ordersResponse.json()

      // Fetch users count
      const usersResponse = await fetch('/api/users')
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users')
      }
      const usersData = await usersResponse.json()
      const totalUsers = usersData.users?.length || 0

      // Calculate stats
      setStats({
        totalProducts: productsData.products?.length || 0,
        totalOrders: ordersData.orders?.length || 0,
        newOrders: ordersData.orders?.filter((o: any) => o.status === 'PENDING').length || 0,
        totalUsers: totalUsers
      })
      
      console.log('✅ Dashboard data loaded successfully from database')
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      
      // Solo usar datos reales de la base de datos
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        newOrders: 0,
        totalUsers: 0
      })
    } finally {
      setLoading(false)
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel</h1>
          <p className="text-gray-600">Gerenciar Store</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Novos Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Adicionar Novo Produto */}
            <Link
              href="/admin/products/new"
              className="group bg-blue-500 text-white p-6 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
            >
              <Plus className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
              <span className="text-sm font-medium text-white">Adicionar Novo Produto</span>
            </Link>

            {/* Gerenciar Produtos */}
            <Link
              href="/admin/products"
              className="group bg-green-500 text-white p-6 rounded-lg font-medium hover:bg-green-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
            >
              <Package className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
              <span className="text-sm font-medium text-white">Gerenciar Produtos</span>
            </Link>

            {/* Gerenciar Pedidos */}
            <Link
              href="/admin/orders"
              className="group bg-orange-500 text-white p-6 rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
            >
              <ShoppingCart className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
              <span className="text-sm font-medium text-white">Gerenciar Pedidos</span>
            </Link>

            {/* Perfil de Pagamento Global - Solo para ADMIN */}
            {isAdmin && (
              <Link
                href="/admin/global-payment-profile"
                className="group bg-purple-500 text-white p-6 rounded-lg font-medium hover:bg-purple-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <CreditCard className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Perfil de Pagamento Global</span>
              </Link>
            )}

            {/* Gerenciar Usuários */}
            {canManageUsers && (
              <Link
                href="/admin/users"
                className="group bg-red-500 text-white p-6 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <Users className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Gerenciar Usuários</span>
              </Link>
            )}

            {/* Configuração de Frete - Solo para ADMIN */}
            {isAdmin && (
              <Link
                href="/admin/shipping"
                className="group bg-orange-500 text-white p-6 rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <Truck className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Configuração de Frete</span>
              </Link>
            )}

            {/* Configurações do Site */}
            {canManageSiteSettings && (
              <Link
                href="/admin/settings"
                className="group bg-indigo-500 text-white p-6 rounded-lg font-medium hover:bg-indigo-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <Settings className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Configurações do Site</span>
              </Link>
            )}

            {/* Contabilidade - Solo para ADMIN */}
            {isAdmin && (
              <Link
                href="/admin/accounting"
                className="group bg-teal-500 text-white p-6 rounded-lg font-medium hover:bg-teal-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <BarChart3 className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Contabilidade</span>
              </Link>
            )}

            {/* Administração da Base de Dados */}
            {isAdmin && (
              <Link
                href="/admin/database"
                className="group bg-red-500 text-white p-6 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <Database className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Base de Dados</span>
              </Link>
            )}

            {/* Diagnóstico del Sistema */}
            {isAdmin && (
              <Link
                href="/admin/diagnostics"
                className="group bg-amber-500 text-white p-6 rounded-lg font-medium hover:bg-amber-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <Shield className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Diagnóstico del Sistema</span>
              </Link>
            )}

            {/* Salud del Sistema */}
            {isAdmin && (
              <Link
                href="/admin/health"
                className="group bg-green-500 text-white p-6 rounded-lg font-medium hover:bg-green-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <Heart className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Salud del Sistema</span>
              </Link>
            )}

            {/* Configuração do MercadoPago */}
            {isAdmin && (
              <Link
                href="/admin/mercado-pago"
                className="group bg-green-500 text-white p-6 rounded-lg font-medium hover:bg-green-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <CreditCard className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Configuração do MercadoPago</span>
              </Link>
            )}

            {/* Alertas del Sistema */}
            {isAdmin && (
              <Link
                href="/admin/alerts"
                className="group bg-red-500 text-white p-6 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <Bell className="w-8 h-8 mb-3 group-hover:scale-105 transition-transform duration-200 text-white" />
                <span className="text-sm font-medium text-white">Alertas del Sistema</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}