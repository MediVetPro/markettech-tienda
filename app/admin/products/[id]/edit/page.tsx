'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Save, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CategorySelector } from '@/components/CategorySelector'
import { Combobox } from '@/components/Combobox'

interface Product {
  id: string
  title: string
  description: string
  price: number
  supplierPrice: number
  marginPercentage: number
  previousPrice?: number
  condition: string
  aestheticCondition: number
  specifications: string
  categories?: string
  stock: number
  status: string
  images: string[]
  manufacturerCode?: string
  manufacturer?: string
  model?: string
  publishedAt?: string
  publishedBy?: string
}

export default function AdminEditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    supplierPrice: '',
    marginPercentage: 50,
    previousPrice: '',
    condition: 'NEW',
    aestheticCondition: 10,
    specifications: '',
    categories: '',
    stock: 0,
    status: 'ACTIVE',
    manufacturerCode: '',
    manufacturer: '',
    model: '',
    defaultMarginValue: 50
  })
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
    const { canManageProducts } = useAuth()

  useEffect(() => {
    console.log('🔍 [EDIT] Verificando permisos:', { canManageProducts })
    if (!canManageProducts) {
      console.log('❌ [EDIT] Sin permisos, redirigiendo a /')
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      return
    }
    
    console.log('✅ [EDIT] Permisos OK, cargando producto...')
    fetchProduct()
  }, [canManageProducts])

  // Cargar fabricantes y modelos existentes
  useEffect(() => {
    const loadManufacturersAndModels = async () => {
      try {
        const response = await fetch('/api/products/manufacturers')
        if (response.ok) {
          const data = await response.json()
          setManufacturers(data.manufacturers || [])
          setModels(data.models || [])
        }
      } catch (error) {
        console.error('Error loading manufacturers and models:', error)
      }
    }
    
    loadManufacturersAndModels()
  }, [])

  // Cargar configuración de margen por defecto al inicializar
  useEffect(() => {
    const loadDefaultMargin = async () => {
      try {
        console.log('Loading commission settings...')
        
        // Obtener token de autenticación
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('No token found, using default margin')
          return
        }

        const response = await fetch('/api/commission-settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const settings = await response.json()
          console.log('Commission settings loaded:', settings)
          // Guardar la configuración para uso posterior
          setFormData(prev => ({
            ...prev,
            defaultMarginValue: settings.totalPercentage
          }))
        } else {
          console.log('Failed to load commission settings, using current value')
        }
      } catch (error) {
        console.error('Error loading commission settings:', error)
      }
    }

    if (canManageProducts) {
      loadDefaultMargin()
    }
  }, [canManageProducts])

  const fetchProduct = async () => {
    try {
      setIsLoadingProduct(true)
      
      // Cargar producto real desde la base de datos
      console.log('🔍 [EDIT] Cargando producto con ID:', params.id)
      
      // Obtener token de autenticación para cargar productos inactivos
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.error('No hay token de autenticación')
        alert('Token de autenticación no encontrado')
        return
      }
      
      const response = await fetch(`/api/products/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [EDIT] Producto cargado:', data.title)
        
        setProduct(data)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          supplierPrice: data.supplierPrice !== null && data.supplierPrice !== undefined ? data.supplierPrice.toString() : '',
          marginPercentage: data.marginPercentage || 50,
          previousPrice: data.previousPrice !== null && data.previousPrice !== undefined ? data.previousPrice.toString() : '',
          condition: data.condition || 'NEW',
          aestheticCondition: data.aestheticCondition || 10,
          specifications: data.specifications || '',
          categories: data.categories || '',
          stock: data.stock || 0,
          status: data.status || 'ACTIVE',
          manufacturerCode: data.manufacturerCode || '',
          manufacturer: data.manufacturer || '',
          model: data.model || '',
          defaultMarginValue: data.defaultMarginValue || 50
        })
        setImages(data.images?.map((img: any) => img.path) || [])
      } else {
        console.error('❌ [EDIT] Error cargando producto:', response.status)
        alert('Error al cargar el producto. Intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Erro ao carregar produto. Tente novamente.')
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      
      // Calcular precio final automáticamente si cambian supplierPrice o marginPercentage
      if (name === 'supplierPrice' || name === 'marginPercentage') {
        const supplierPrice = parseFloat(name === 'supplierPrice' ? value : String(prev.supplierPrice))
        const marginPercentage = parseFloat(name === 'marginPercentage' ? value : String(prev.marginPercentage))
        
        if (!isNaN(supplierPrice) && !isNaN(marginPercentage)) {
          const finalPrice = supplierPrice * (1 + marginPercentage / 100)
          newData.price = finalPrice.toFixed(2)
        }
      }
      
      return newData
    })
  }


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newImages = Array.from(files).slice(0, 5 - images.length)
      const imageUrls = newImages.map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...imageUrls])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación completa de campos obligatorios
    const errors = []
    const warnings = []
    
    // Validaciones obligatorias
    if (!formData.title || formData.title.trim() === '') {
      errors.push('Título del producto es obligatorio')
    } else if (formData.title.trim().length < 3) {
      errors.push('El título debe tener al menos 3 caracteres')
    }
    
    if (!formData.description || formData.description.trim() === '') {
      errors.push('Descripción del producto es obligatoria')
    } else if (formData.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres')
    }
    
    if (!formData.price || formData.price.trim() === '') {
      errors.push('Precio del producto es obligatorio')
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      errors.push('El precio debe ser un número válido mayor a 0')
    }
    
    if (!formData.supplierPrice || formData.supplierPrice.trim() === '') {
      errors.push('Precio del proveedor es obligatorio')
    } else if (isNaN(parseFloat(formData.supplierPrice)) || parseFloat(formData.supplierPrice) <= 0) {
      errors.push('El precio del proveedor debe ser un número válido mayor a 0')
    }
    
    if (!formData.condition || formData.condition.trim() === '') {
      errors.push('Condición del producto es obligatoria')
    }
    
    // Validaciones de especificaciones (recomendado pero no obligatorio)
    if (!formData.specifications || formData.specifications.trim() === '') {
      warnings.push('Especificaciones técnicas (recomendado para mejor descripción del producto)')
    }
    
    // Validaciones de stock
    if (formData.stock < 0) {
      errors.push('El stock no puede ser negativo')
    }
    
    // Validaciones de códigos
    if (formData.manufacturerCode && formData.manufacturerCode.trim().length < 3) {
      warnings.push('El código del fabricante debe tener al menos 3 caracteres')
    }
    
    // Validar que el precio del proveedor sea menor al precio de venta
    if (formData.price && formData.supplierPrice && 
        parseFloat(formData.supplierPrice) >= parseFloat(formData.price)) {
      errors.push('El precio del proveedor debe ser menor al precio de venta')
    }
    
    if (errors.length > 0) {
      let errorMessage = '❌ Campos obligatorios faltantes:\n\n'
      errors.forEach((error, index) => {
        errorMessage += `${index + 1}. ${error}\n`
      })
      
      if (warnings.length > 0) {
        errorMessage += '\n⚠️ Recomendaciones:\n'
        warnings.forEach((warning, index) => {
          errorMessage += `${index + 1}. ${warning}\n`
        })
      }
      
      alert(errorMessage)
      return
    }
    
    // Mostrar advertencias si las hay pero permitir continuar
    if (warnings.length > 0) {
      const shouldContinue = confirm(
        `⚠️ Advertencias detectadas:\n\n${warnings.map((w, i) => `${i + 1}. ${w}`).join('\n')}\n\n¿Desea continuar guardando el producto?`
      )
      if (!shouldContinue) {
        return
      }
    }
    
    setIsLoading(true)

    try {
      console.log('🚀 [EDIT] Iniciando actualización de producto...')
      console.log('📊 [EDIT] Datos del formulario:', {
        title: formData.title,
        price: formData.price,
        stock: formData.stock
      })
      console.log('🖼️ [EDIT] Imágenes actuales:', images.length)

      // Check if there are new files (blob URLs)
      const hasNewFiles = images.some(img => img.startsWith('blob:'))
      console.log('📁 [EDIT] Tiene archivos nuevos:', hasNewFiles)

      if (hasNewFiles) {
        // Send FormData for file upload
        console.log('📤 [EDIT] Enviando FormData con archivos...')
        const formDataToSend = new FormData()
        
        // Add form fields
        formDataToSend.append('title', formData.title)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('price', formData.price.toString())
        formDataToSend.append('supplierPrice', formData.supplierPrice.toString())
        formDataToSend.append('marginPercentage', formData.marginPercentage.toString())
        formDataToSend.append('previousPrice', formData.previousPrice.toString())
        formDataToSend.append('condition', formData.condition)
        formDataToSend.append('aestheticCondition', formData.aestheticCondition.toString())
        formDataToSend.append('specifications', formData.specifications)
        formDataToSend.append('categories', formData.categories)
        formDataToSend.append('stock', formData.stock.toString())
        formDataToSend.append('status', formData.status)
        formDataToSend.append('manufacturerCode', formData.manufacturerCode)
        formDataToSend.append('manufacturer', formData.manufacturer)
        formDataToSend.append('model', formData.model)

        // Add image files (only new files)
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput && fileInput.files) {
          Array.from(fileInput.files).forEach((file, index) => {
            formDataToSend.append(`images[${index}]`, file)
            console.log(`📸 [EDIT] Archivo ${index}:`, {
              name: file.name,
              size: file.size,
              type: file.type
            })
          })
        }

        // Add information about existing images to keep
        const existingImages = images.filter(img => !img.startsWith('blob:'))
        formDataToSend.append('existingImages', JSON.stringify(existingImages))
        console.log('📸 [EDIT] Imágenes existentes a mantener:', existingImages)

        console.log('📤 [EDIT] Enviando FormData a /api/products/' + params.id)
        const response = await fetch(`/api/products/${params.id}`, {
          method: 'PUT',
          body: formDataToSend
        })

        console.log('📡 [EDIT] Respuesta recibida:', response.status, response.ok)

        if (response.ok) {
          console.log('✅ [EDIT] Producto actualizado exitosamente')
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/products'
          }
        } else {
          const errorData = await response.json()
          console.error('❌ [EDIT] Error del servidor:', errorData)
          // Mostrar mensaje de error específico y amigable
          let errorMessage = errorData.error || 'Error desconocido'
          let errorDetails = errorData.details || ''
          let errorSuggestion = errorData.suggestion || ''
          
          // Si hay campos faltantes, mostrarlos específicamente
          if (errorData.missingFields && errorData.missingFields.length > 0) {
            errorMessage = 'Faltan algunos campos requeridos'
            errorDetails = `Por favor, completa: ${errorData.missingFields.join(', ')}`
          }
          
          // Si hay un campo específico con error, resaltarlo
          if (errorData.field) {
            errorDetails += `\n\nCampo con problema: ${errorData.field}`
          }
          
          // Construir mensaje completo
          let fullMessage = `❌ ${errorMessage}`
          if (errorDetails) {
            fullMessage += `\n\n📝 ${errorDetails}`
          }
          if (errorSuggestion) {
            fullMessage += `\n\n💡 ${errorSuggestion}`
          }
          
          alert(fullMessage)
        }
      } else {
        // Send JSON for text-only updates
        console.log('📄 [EDIT] Enviando JSON sin archivos...')
        const response = await fetch(`/api/products/${params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock.toString()),
            aestheticCondition: formData.aestheticCondition,
            images: images
          })
        })

        console.log('📡 [EDIT] Respuesta JSON recibida:', response.status, response.ok)

        if (response.ok) {
          console.log('✅ [EDIT] Producto actualizado exitosamente')
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/products'
          }
        } else {
          const errorData = await response.json()
          console.error('❌ [EDIT] Error del servidor:', errorData)
          // Mostrar mensaje de error específico y amigable
          let errorMessage = errorData.error || 'Error desconocido'
          let errorDetails = errorData.details || ''
          let errorSuggestion = errorData.suggestion || ''
          
          // Si hay campos faltantes, mostrarlos específicamente
          if (errorData.missingFields && errorData.missingFields.length > 0) {
            errorMessage = 'Faltan algunos campos requeridos'
            errorDetails = `Por favor, completa: ${errorData.missingFields.join(', ')}`
          }
          
          // Si hay un campo específico con error, resaltarlo
          if (errorData.field) {
            errorDetails += `\n\nCampo con problema: ${errorData.field}`
          }
          
          // Construir mensaje completo
          let fullMessage = `❌ ${errorMessage}`
          if (errorDetails) {
            fullMessage += `\n\n📝 ${errorDetails}`
          }
          if (errorSuggestion) {
            fullMessage += `\n\n💡 ${errorSuggestion}`
          }
          
          alert(fullMessage)
        }
      }
    } catch (error) {
      console.error('❌ [EDIT] Error actualizando producto:', error)
      if (error instanceof Error) {
        console.error('❌ [EDIT] Stack trace:', error.stack)
      }
      
      // Mensaje de error de conexión más amigable
      alert(`❌ Error de conexión\n\nNo se pudo conectar con el servidor. Por favor:\n\n• Verifica tu conexión a internet\n• Intenta nuevamente en unos momentos\n• Si el problema persiste, contacta al administrador`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`/api/products/${params.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/products'
          }
        } else {
          alert('Erro ao excluir produto. Tente novamente.')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Erro ao excluir produto. Tente novamente.')
      }
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <p className="text-gray-600 mb-8">O produto que você está procurando não existe.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Produto</h1>
          <p className="text-gray-600">Editar informações do produto</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Produto *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: iPhone 15 Pro Max 256GB"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código do Fabricante
                </label>
                <input
                  type="text"
                  name="manufacturerCode"
                  value={formData.manufacturerCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Código de barras do fabricante (se autogera se deixado vazio)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Código de barras do fabricante. Se deixado vazio, será gerado automaticamente.
                </p>
              </div>

              <Combobox
                value={formData.manufacturer}
                onChange={(value) => setFormData(prev => ({ ...prev, manufacturer: value }))}
                placeholder="Ej: Samsung, Apple, Sony"
                options={manufacturers}
                label="Fabricante"
                description="Nombre del fabricante del producto"
              />

              <Combobox
                value={formData.model}
                onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                placeholder="Ej: Galaxy S23, iPhone 15, WH-1000XM4"
                options={models}
                label="Modelo"
                description="Modelo específico del producto"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço do Fornecedor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="supplierPrice"
                  value={formData.supplierPrice}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Preço de compra ao fornecedor
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentagem de Margem *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="marginPercentage"
                  value={formData.marginPercentage}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="50"
                />
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className="text-sm text-gray-500">
                      Porcentagem de margem de lucro (configurado em Configurações de Comissão)
                    </p>
                    <p className="text-xs text-blue-600">
                      💡 Este valor é carregado automaticamente desde a "Porcentagem Total de Lucro"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('smartesh_token')
                        if (!token) {
                          alert('Token de autenticação não encontrado')
                          return
                        }

                        const response = await fetch('/api/commission-settings', {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        })

                        if (response.ok) {
                          const settings = await response.json()
                          console.log('Reloaded commission settings:', settings)
                          setFormData(prev => ({
                            ...prev,
                            marginPercentage: settings.totalPercentage,
                            defaultMarginValue: settings.totalPercentage
                          }))
                          alert(`Configuração recarregada: ${settings.totalPercentage}%`)
                        } else {
                          alert('Erro ao carregar configurações de comissão')
                        }
                      } catch (error) {
                        console.error('Error loading commission settings:', error)
                        alert('Erro ao carregar configurações')
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    🔄 Recarregar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Final (Calculado)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  readOnly
                  className="w-full px-3 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Preço final calculado automaticamente
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Anterior (Opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="previousPrice"
                  value={formData.previousPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Preço de venda anterior"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Preço anterior para mostrar desconto
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Disponível *
              </label>
              <input
                type="number"
                name="stock"
                required
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="5"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Cantidad de unidades disponibles para la venta
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição do Produto *
              </label>
              <textarea
                name="description"
                required
                rows={6}
                maxLength={5000}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descreva o produto em detalhes..."
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">
                  Descreva o produto em detalhes para ajudar os clientes a entender melhor o produto
                </p>
                <span className="text-sm text-gray-500">
                  {formData.description.length}/5000 caracteres
                </span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Produto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condição *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="NEW">Novo</option>
                  <option value="USED">Usado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condição Estética (1-10) *
                </label>
                <input
                  type="number"
                  name="aestheticCondition"
                  required
                  value={formData.aestheticCondition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="SOLD">Vendido</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificações do Produto
              </label>
              <textarea
                name="specifications"
                rows={8}
                maxLength={10000}
                value={formData.specifications}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: 256GB, 6.1 polegadas, A17 Pro, 48MP"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">
                  Especifique todas las características técnicas del producto
                </p>
                <span className="text-sm text-gray-500">
                  {formData.specifications.length}/10000 caracteres
                </span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorias do Produto
              </label>
              <CategorySelector
                value={formData.categories}
                onChange={(value) => setFormData(prev => ({ ...prev, categories: value }))}
                multiple={true}
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Imagens do Produto</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.startsWith('blob:') ? image : `/api/images${image}`}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Máximo 5 imagens. Formatos suportados: JPG, PNG
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Atualizando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Atualizar Produto
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Excluir Produto
            </button>
            
            <Link
              href="/admin/products"
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
