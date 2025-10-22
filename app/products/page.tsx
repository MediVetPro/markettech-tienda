'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  title: string
  description: string
  price: number
  previousPrice?: number
  supplierPrice: number
  marginPercentage: number
  condition: string
  aestheticCondition: number
  specifications: string
  categories?: string
  status: string
  stock: number
  manufacturer?: string
  model?: string
  images: Array<{ path: string; filename: string; alt?: string }>
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [tempSearchTerm, setTempSearchTerm] = useState('')
  const [filterCondition, setFilterCondition] = useState('all')
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') || 'all')
  const [filterManufacturer, setFilterManufacturer] = useState('all')
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const isInitialLoad = useRef(true)

  // Cargar productos iniciales solo una vez
  useEffect(() => {
    fetchProducts(1)
    fetchManufacturers()
    isInitialLoad.current = false
  }, [])

  // Debug logging for pagination
  useEffect(() => {
    console.log('🔍 Pagination state changed:', { totalPages, currentPage, totalProducts })
  }, [totalPages, currentPage, totalProducts])

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      console.log('🔍 Category from URL:', category)
      setFilterCategory(category)
    }
  }, [searchParams])

  const fetchManufacturers = async () => {
    try {
      const response = await fetch('/api/products/manufacturers')
      const data = await response.json()
      setManufacturers(data.manufacturers || [])
    } catch (error) {
      console.error('Error fetching manufacturers:', error)
    }
  }

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterCondition !== 'all') params.append('condition', filterCondition)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (filterManufacturer !== 'all') params.append('manufacturer', filterManufacturer)
      // Usar paginación con límite de 12 productos por página
      params.append('page', page.toString())
      params.append('limit', '12')
      
      const url = params.toString() ? `/api/products?${params.toString()}` : '/api/products'
      console.log('🔍 Fetching products from:', url)
      console.log('🔍 Current filterCategory:', filterCategory)
      console.log('🔍 Current searchTerm:', searchTerm)
      console.log('🔍 Current filterCondition:', filterCondition)
      console.log('🔍 Current filterManufacturer:', filterManufacturer)
      console.log('🔍 Current page:', page)
      
      const response = await fetch(url)
      const data = await response.json()
      console.log('📦 Products received:', data.products?.length || 0)
      console.log('📊 Pagination info:', data.pagination)
      if (data.products && data.products.length > 0) {
        console.log('📱 First product categories:', data.products[0].categories)
      }
      setProducts(data.products || [])
      setCurrentPage(data.pagination?.page || 1)
      setTotalPages(data.pagination?.pages || 1)
      setTotalProducts(data.pagination?.total || 0)
      
      // Debug logging
      console.log('🔍 Frontend state after API call:')
      console.log('  - Current page:', data.pagination?.page || 1)
      console.log('  - Total pages:', data.pagination?.pages || 1)
      console.log('  - Total products:', data.pagination?.total || 0)
      console.log('  - Products count:', data.products?.length || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }


  // Actualizar productos cuando cambien los filtros
  useEffect(() => {
    // Solo ejecutar si no es la carga inicial
    if (!isInitialLoad.current) {
      setCurrentPage(1) // Resetear a la primera página cuando cambien los filtros
      fetchProducts(1)
    }
  }, [searchTerm, filterCondition, filterCategory, filterManufacturer])

  // Funciones para manejar búsqueda
  const handleSearch = () => {
    setSearchTerm(tempSearchTerm)
  }

  const handleClearAllFilters = () => {
    setTempSearchTerm('')
    setSearchTerm('')
    setFilterCondition('all')
    setFilterCategory('all')
    setFilterManufacturer('all')
  }

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'condition':
        return b.aestheticCondition - a.aestheticCondition
      default:
        return 0
    }
  })

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Produtos</h1>
          <p className="text-gray-600">Descubra nossa seleção de produtos tecnológicos</p>
        </div>

        {/* Search Bar - Moved to top right */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Active Filters Status */}
        {(searchTerm || filterCondition !== 'all' || filterCategory !== 'all' || filterManufacturer !== 'all') && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-blue-800 font-medium">Filtros ativos:</span>
                
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <Search className="w-3 h-3 mr-1" />
                    Buscar: "{searchTerm}"
                  </span>
                )}
                
                {filterCategory !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Categoria: {filterCategory}
                  </span>
                )}
                
                {filterManufacturer !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Fabricante: {filterManufacturer}
                  </span>
                )}
                
                {filterCondition !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    Condição: {filterCondition === 'NEW' ? 'Novo' : 'Usado'}
                  </span>
                )}
              </div>
              
              <button
                onClick={handleClearAllFilters}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar tudo
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todas as categorias</option>
              <option value="smartphones">Smartphones</option>
              <option value="laptops">Laptops</option>
              <option value="audio">Áudio</option>
              <option value="cameras">Câmeras</option>
              <option value="gaming">Gaming</option>
              <option value="wearables">Wearables</option>
              <option value="chargers">Carregadores</option>
              <option value="cables">Cabos</option>
              <option value="gadgets">Gadgets</option>
              <option value="motherboards">Placas Mãe</option>
              <option value="monitors">Monitores</option>
              <option value="storage">Armazenamento</option>
              <option value="graphics">Placas de Vídeo</option>
              <option value="processors">Processadores</option>
              <option value="memory">Memória RAM</option>
              <option value="powerSupplies">Fontes de Alimentação</option>
              <option value="cooling">Refrigeração</option>
              <option value="drones">Drones</option>
              <option value="backpacks">Mochilas e Bolsos</option>
              <option value="defense">Defesa Pessoal</option>
              <option value="tools">Ferramentas</option>
              <option value="health">Saúde</option>
              <option value="sports">Esporte</option>
              <option value="portable_batteries">Baterias Portáteis</option>
              <option value="retro">Retro</option>
              <option value="stands">Suportes</option>
              <option value="usb_hubs">HUB USB</option>
              <option value="peripherals">Periféricos</option>
              <option value="lighting">Iluminação</option>
              <option value="adapters">Adaptadores</option>
              <option value="robotics">Robótica</option>
              <option value="iot">IoT</option>
              <option value="vr_ar">VR/AR</option>
              <option value="smart_home">Casa Inteligente</option>
              <option value="automotive">Automotivo</option>
              <option value="security">Segurança</option>
              <option value="networking">Rede</option>
              <option value="desktop">PC de Escritório</option>
            </select>

            {/* Manufacturer Filter */}
            <select
              value={filterManufacturer}
              onChange={(e) => setFilterManufacturer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos os fabricantes</option>
              {manufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todas as condições</option>
              <option value="NEW">Novo</option>
              <option value="USED">Usado</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Mais recentes</option>
              <option value="price-low">Menor preço</option>
              <option value="price-high">Maior preço</option>
              <option value="condition">Condição</option>
            </select>

            {/* Results count */}
            <div className="flex items-center text-gray-600">
              <Filter className="w-5 h-5 mr-2" />
              <span className="text-sm">
                {sortedProducts.length} produtos encontrados
                {!searchTerm && filterCondition === 'all' && filterCategory === 'all' && filterManufacturer === 'all' && (
                  <span className="text-gray-500 ml-1">(todos)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              showQuantitySelector={true}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center space-x-2">
            <button
              onClick={() => fetchProducts(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchProducts(pageNum)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => fetchProducts(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {totalProducts > 0 && (
          <div className="mt-6 text-center text-gray-600">
            <p>
              Mostrando {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, totalProducts)} de {totalProducts} produtos
            </p>
          </div>
        )}

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
            <p className="text-gray-400">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  )
}
