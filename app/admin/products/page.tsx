'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Edit, Trash2, Eye, Search, Filter, Download, ChevronDown, Upload, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: string
  title: string
  description?: string
  price: number
  supplierPrice?: number
  marginPercentage?: number
  previousPrice?: number
  condition: string
  status: string
  stock: number
  createdAt: string
  updatedAt: string
  images: Array<{ path: string; filename: string; alt?: string }>
  aestheticCondition: number
  specifications: string
  productCode?: string
  manufacturerCode?: string
  manufacturer?: string
  model?: string
  categories?: string
  barcode?: string
  publishedAt?: string
  publishedBy?: string
  userId: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [tempSearchTerm, setTempSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCondition, setFilterCondition] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isAnyAdmin, loading, canViewAllProducts, user: currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Esperar a que termine de cargar el contexto
    
    if (!isAnyAdmin) {
      router.push('/')
      return
    }
    
    fetchProducts(1)
  }, [isAnyAdmin, loading])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown) {
        const target = event.target as HTMLElement
        if (!target.closest('.export-dropdown')) {
          setShowExportDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportDropdown])

  // Recargar productos cuando cambien los filtros (excepto searchTerm)
  useEffect(() => {
    if (loading || !isAnyAdmin) return
    fetchProducts(1)
  }, [filterStatus, filterCondition, loading, isAnyAdmin])

  const handleSearch = () => {
    const trimmedTerm = tempSearchTerm.trim()
    setSearchTerm(trimmedTerm)
    setCurrentPage(1)
    fetchProducts(1, trimmedTerm)
  }

  const handleClearSearch = () => {
    setTempSearchTerm('')
    setSearchTerm('')
    setCurrentPage(1)
    fetchProducts(1, '')
  }

  const handleFixProducts = async () => {
    try {
      setIsLoading(true)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        alert('Token de autenticación no encontrado')
        return
      }
      
      console.log('🔧 Corrigiendo productos...')
      
      const response = await fetch('/api/fix-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Productos corregidos:', data)
        alert(`Productos corregidos: ${data.fixed}`)
        
        // Recargar productos
        fetchProducts(1)
      } else {
        const errorData = await response.json()
        console.error('❌ Error corrigiendo productos:', errorData)
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('❌ Error:', error)
      alert('Error al corregir productos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportProducts = async (format: 'csv' | 'sql' = 'csv') => {
    try {
      setIsLoading(true)
      
      // Obtener token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        alert('Token de autenticación no encontrado')
        return
      }
      
      // Construir parámetros de búsqueda (igual que fetchProducts pero sin paginación)
      const params = new URLSearchParams()
      if (searchTerm && searchTerm.trim()) params.append('search', searchTerm.trim())
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCondition !== 'all') params.append('condition', filterCondition)
      params.append('admin', 'true')
      params.append('limit', '1000') // Obtener más productos para exportar
      
      const url = `/api/products?${params.toString()}`
      console.log('🔍 Exporting products from:', url)
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      const productsToExport = data.products || []
      
      if (productsToExport.length === 0) {
        alert('No hay productos para exportar')
        return
      }
      
      if (format === 'csv') {
        // Crear CSV
        const csvContent = createCSVContent(productsToExport)
        downloadCSV(csvContent, 'productos.csv')
        console.log(`✅ Exportados ${productsToExport.length} productos en CSV`)
      } else if (format === 'sql') {
        // Crear SQL
        const sqlContent = createSQLContent(productsToExport)
        downloadSQL(sqlContent, 'productos.sql')
        console.log(`✅ Exportados ${productsToExport.length} productos en SQL`)
      }
      
    } catch (error) {
      console.error('Error al exportar productos:', error)
      alert('Error al exportar productos: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setIsLoading(false)
      setShowExportDropdown(false) // Cerrar dropdown después de exportar
    }
  }

  const createCSVContent = (products: Product[]) => {
    // Encabezados del CSV
    const headers = [
      'ID',
      'Título',
      'Descripción',
      'Precio',
      'Precio de Compra',
      'Margen (%)',
      'Precio Anterior',
      'Fabricante',
      'Modelo',
      'Categorías',
      'Condición',
      'Estado',
      'Stock',
      'Código de Barras',
      'Especificaciones',
      'Imágenes (JSON)',
      'Fecha de Publicación',
      'Publicado por',
      'Fecha de Creación',
      'Fecha de Actualización'
    ]
    
    // Crear filas de datos
    const rows = products.map(product => {
      // Convertir precios a números y formatear
      const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0
      const supplierPrice = typeof product.supplierPrice === 'number' ? product.supplierPrice : parseFloat(product.supplierPrice || '0') || 0
      const previousPrice = typeof product.previousPrice === 'number' ? product.previousPrice : parseFloat(product.previousPrice || '0') || 0
      const marginPercentage = typeof product.marginPercentage === 'number' ? product.marginPercentage : parseFloat(product.marginPercentage || '50') || 50
      const stock = product.stock ? 
        (typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0) : 
        null

      return [
        product.id,
        `"${product.title}"`,
        `"${product.description || ''}"`,
        price.toFixed(2),
        supplierPrice.toFixed(2),
        marginPercentage.toFixed(2),
        previousPrice > 0 ? previousPrice.toFixed(2) : '',
        `"${product.manufacturer || ''}"`,
        `"${product.model || ''}"`,
        `"${product.categories || ''}"`,
        product.condition,
        product.status,
        stock ? stock.toString() : '',
        `"${product.barcode || ''}"`,
        `"${product.specifications || ''}"`,
        `"${JSON.stringify(product.images || [])}"`,
        product.publishedAt ? new Date(product.publishedAt).toLocaleDateString('pt-BR') : '',
        `"${product.publishedBy || ''}"`,
        new Date(product.createdAt).toLocaleDateString('pt-BR'),
        new Date(product.updatedAt).toLocaleDateString('pt-BR')
      ]
    })
    
    // Combinar encabezados y filas
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    
    return csvContent
  }

  const downloadCSV = (content: string, filename: string) => {
    // Crear blob con el contenido CSV
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    
    // Crear enlace de descarga
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Limpiar URL
    URL.revokeObjectURL(url)
  }

  const createSQLContent = (products: Product[]) => {
    // Crear SQL INSERT statements
    const sqlStatements = products.map(product => {
      // Convertir precios a números y formatear
      const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0
      const stock = product.stock ? 
        (typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0) : 
        null

      // Obtener valores reales del producto
      const supplierPrice = typeof product.supplierPrice === 'number' ? product.supplierPrice : parseFloat(product.supplierPrice || '0') || 0
      const marginPercentage = typeof product.marginPercentage === 'number' ? product.marginPercentage : parseFloat(product.marginPercentage || '50') || 50
      const previousPrice = typeof product.previousPrice === 'number' ? product.previousPrice : parseFloat(product.previousPrice || '0') || 0

      const values = [
        `'${product.id}'`,
        `'${product.title.replace(/'/g, "''")}'`,
        `'${(product.description || '').replace(/'/g, "''")}'`,
        price.toFixed(2),
        supplierPrice > 0 ? supplierPrice.toFixed(2) : 'NULL',
        marginPercentage > 0 ? marginPercentage.toFixed(2) : 'NULL',
        previousPrice > 0 ? previousPrice.toFixed(2) : 'NULL',
        `'${(product.manufacturer || '').replace(/'/g, "''")}'`,
        `'${(product.model || '').replace(/'/g, "''")}'`,
        `'${(product.categories || '').replace(/'/g, "''")}'`,
        `'${product.condition}'`,
        `'${product.status}'`,
        stock ? stock.toString() : 'NULL',
        `'${(product.barcode || '').replace(/'/g, "''")}'`,
        `'${(product.specifications || '').replace(/'/g, "''")}'`,
        `'${JSON.stringify(product.images || []).replace(/'/g, "''")}'`,
        product.publishedAt ? `'${new Date(product.publishedAt).toISOString()}'` : 'NULL',
        `'${(product.publishedBy || '').replace(/'/g, "''")}'`,
        `'${product.userId}'`,
        `'${new Date(product.createdAt).toISOString()}'`,
        `'${new Date(product.updatedAt).toISOString()}'`
      ]
      
      return `INSERT INTO Product (id, title, description, price, supplierPrice, marginPercentage, previousPrice, manufacturer, model, categories, condition, status, stock, barcode, specifications, images, publishedAt, publishedBy, userId, createdAt, updatedAt) VALUES (${values.join(', ')});`
    })
    
    // Agregar encabezado con comentarios
    const header = `-- Exportación de productos
-- Fecha: ${new Date().toLocaleString('pt-BR')}
-- Total de productos: ${products.length}

-- Deshabilitar verificaciones de clave foránea temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar productos existentes (opcional - descomenta si quieres limpiar la tabla)
-- DELETE FROM Product;

`
    
    const footer = `
-- Rehabilitar verificaciones de clave foránea
SET FOREIGN_KEY_CHECKS = 1;

-- Exportación completada
-- Total de productos insertados: ${products.length}
`
    
    return header + sqlStatements.join('\n') + footer
  }

  const downloadSQL = (content: string, filename: string) => {
    // Crear blob con el contenido SQL
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    
    // Crear enlace de descarga
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Limpiar URL
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = async () => {
    await handleExportProducts('csv')
  }

  const handleExportSQL = async () => {
    await handleExportProducts('sql')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.sql')) {
      alert('Por favor, selecciona un archivo SQL (.sql)')
      return
    }

    try {
      setIsImporting(true)
      const content = await file.text()
      await importProducts(content)
    } catch (error) {
      console.error('Error al importar productos:', error)
      alert('Error al importar productos: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setIsImporting(false)
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const importProducts = async (sqlContent: string) => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        alert('Token de autenticación no encontrado')
        return
      }

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sqlContent })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ ${data.message}`)
        // Recargar la lista de productos
        fetchProducts(1)
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error al importar productos:', error)
      alert('Error al importar productos: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    }
  }

  const fetchProducts = async (page = 1, searchOverride?: string) => {
    try {
      setIsLoading(true)
      
      // Obtener token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        setProducts([])
        return
      }
      
      // Construir parámetros de búsqueda
      const params = new URLSearchParams()
      const effectiveSearch = searchOverride !== undefined ? searchOverride : searchTerm
      if (effectiveSearch && effectiveSearch.trim()) {
        params.append('search', effectiveSearch.trim())
        console.log('🔍 [ADMIN] Búsqueda activa:', effectiveSearch.trim())
      } else {
        console.log('🔍 [ADMIN] Sin búsqueda - mostrando todos los productos')
      }
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCondition !== 'all') params.append('condition', filterCondition)
      params.append('page', page.toString())
      params.append('limit', '12')
      params.append('admin', 'true') // Indicar que es una consulta de administración
      
      const url = `/api/products?${params.toString()}`
      console.log('🔍 Fetching admin products from:', url)
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setCurrentPage(data.pagination?.page || 1)
        setTotalPages(data.pagination?.pages || 1)
        setTotalProducts(data.pagination?.total || 0)
        console.log('✅ Productos del usuario cargados desde la API:', data.products?.length || 0)
        console.log('📊 Paginación:', data.pagination)
      } else {
        console.error('Error al cargar productos:', response.status)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'SOLD':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
      case 'INACTIVE':
        return 'Inativo'
      case 'SOLD':
        return 'Vendido'
      default:
        return status
    }
  }

  const getConditionText = (condition: string) => {
    return condition === 'NEW' ? 'Novo' : 'Usado'
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProducts(page)
  }

  const handleDelete = async (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        // Obtener token de autenticación
        const token = localStorage.getItem('smartesh_token')
        if (!token) {
          console.error('No hay token de autenticación')
          alert('Token de autenticación no encontrado')
          return
        }

        console.log('🗑️ [FRONTEND] Eliminando producto:', productId)
        
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ [FRONTEND] Producto eliminado:', data)
          alert(`Producto "${data.productTitle}" eliminado exitosamente por ${data.deletedBy}`)
          
          // Recargar la página actual después de eliminar
          fetchProducts(currentPage)
        } else {
          const errorData = await response.json()
          console.error('❌ [FRONTEND] Error eliminando producto:', errorData)
          alert(`Error: ${errorData.error}`)
        }
      } catch (error) {
        console.error('❌ [FRONTEND] Error al eliminar:', error)
        alert('Error al eliminar el producto')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Produtos</h1>
          <p className="text-gray-600">
            {canViewAllProducts 
              ? 'Gerenciar Todos os Produtos (Incluindo de outros administradores)' 
              : 'Gerenciar Seus Produtos'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/admin/products/new"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Produto
            </Link>
            <button
              onClick={handleFixProducts}
              disabled={isLoading}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Corregir Productos
            </button>
            <div className="relative export-dropdown">
              <button 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Exportar Produtos
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-sm z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Filter className="w-4 h-4 mr-3" />
                      Exportar como CSV
                    </button>
                    <button
                      onClick={handleExportSQL}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4 mr-3" />
                      Exportar como SQL
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleImportClick}
                      disabled={isImporting}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4 mr-3" />
                      {isImporting ? 'Importando...' : 'Importar SQL'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Input de archivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".sql"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          {/* Search - Top right */}
          <div className="flex justify-end mb-6">
            <div className="w-full max-w-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Produtos
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={tempSearchTerm}
                    onChange={(e) => setTempSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Buscar por nome, código ou descrição..."
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  Buscar
                </button>
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-1">
                  Buscando por: "{searchTerm}"
                </p>
              )}
            </div>
          </div>
          
          {/* Filters - Below search */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todos os status</option>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="SOLD">Vendido</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Condição
              </label>
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todas as condições</option>
                <option value="NEW">Novo</option>
                <option value="USED">Usado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Produtos ({totalProducts} total)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Página {currentPage} de {totalPages}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                    Produto
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Preço
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Estoque
                  </th>
                  {canViewAllProducts && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Proprietário
                    </th>
                  )}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 ${
                    product.status === 'INACTIVE' 
                      ? 'bg-gray-100 opacity-75 border-l-4 border-l-red-400' 
                      : ''
                  }`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <img
                          src={product.images[0]?.path ? (product.images[0].path.startsWith('http') ? product.images[0].path : `/api/images${product.images[0].path}`) : '/placeholder.jpg'}
                          alt={product.title}
                          className={`w-10 h-10 rounded object-cover ${
                            product.status === 'INACTIVE' 
                              ? 'opacity-50 grayscale' 
                              : ''
                          }`}
                        />
                        <div className="ml-3 min-w-0 flex-1">
                          <div className={`text-sm font-medium truncate ${
                            product.status === 'INACTIVE' 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-900'
                          }`}>
                            {product.title}
                            {product.status === 'INACTIVE' && (
                              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                INATIVO
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {product.manufacturer && `${product.manufacturer}`}
                            {product.model && ` ${product.model}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className={`text-sm font-medium ${
                        product.status === 'INACTIVE' 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-900'
                      }`}>
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `${product.stock}` : '0'}
                      </span>
                    </td>
                    {canViewAllProducts && (
                      <td className="px-3 py-3">
                        {product.user ? (
                          <div className="text-xs">
                            <div className="font-medium text-gray-900 truncate">
                              {product.user.name}
                            </div>
                            {product.user.id === currentUser?.id && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Você
                              </span>
                            )}
                            {product.user.id !== currentUser?.id && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                Outro
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Sistema</span>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <div className="flex space-x-1">
                        <Link
                          href={`/admin/products/${product.id}/view`}
                          className="text-primary-600 hover:text-primary-900 p-1"
                          title="Ver Produto"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Editar Produto"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando página {currentPage} de {totalPages} ({totalProducts} produtos total)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
Anterior
                </button>
                
                {/* Números de página */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (page > totalPages) return null
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
