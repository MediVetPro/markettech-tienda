'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Upload, X, Save, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CategorySelector } from '@/components/CategorySelector'
import { Combobox } from '@/components/Combobox'

function AdminNewProductPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    supplierPrice: '',
    marginPercentage: 50, // Valor por defecto, se actualizará desde la configuración
    previousPrice: '',
    condition: 'NEW',
    aestheticCondition: 10,
    specifications: '',
    categories: '',
    stock: 0,
    status: 'ACTIVE',
    // paymentProfileId removido - ahora se usa perfil global
    manufacturerCode: '',
    manufacturer: '',
    model: ''
  })
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  // paymentProfiles removido - ahora se usa perfil global
  const { isAnyAdmin } = useAuth()
  const router = useRouter()

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
        const response = await fetch('/api/commission-settings')

        if (response.ok) {
          const settings = await response.json()
          console.log('Commission settings loaded:', settings)
          setFormData(prev => ({
            ...prev,
            marginPercentage: settings.totalPercentage
          }))
        } else {
          console.log('Failed to load commission settings, using default value 50')
        }
      } catch (error) {
        console.error('Error loading commission settings:', error)
      }
    }

    if (isAnyAdmin) {
      loadDefaultMargin()
    }
  }, [isAnyAdmin])

  // fetchPaymentProfiles removido - ahora se usa perfil global

  if (!isAnyAdmin) {
    router.push('/')
    return null
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
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newFiles = Array.from(files).slice(0, 5 - images.length)
      
      // Validar archivos
      const validFiles = newFiles.filter(file => {
        const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
        const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
        return isValidType && isValidSize
      })
      
      if (validFiles.length !== newFiles.length) {
        alert('Algunos archivos no son válidos. Por favor, selecciona solo imágenes JPG, PNG o WEBP de máximo 5MB cada una.')
      }
      
      // Crear URLs temporales para preview
      const imageUrls = validFiles.map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...imageUrls])
      setImageFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevenir múltiples envíos
    if (isSubmitting) {
      console.log('⚠️ [FRONTEND] Ya hay un envío en progreso, ignorando...')
      return
    }
    
    console.log('🚀 [FRONTEND] Iniciando envío de formulario...')
    
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
    setIsSubmitting(true)

    try {
      // Crear FormData para enviar archivos
      console.log('📝 [FRONTEND] Creando FormData...')
      const formDataToSend = new FormData()
      
      // Agregar datos del formulario
      console.log('📊 [FRONTEND] Datos del formulario:', formData)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('supplierPrice', formData.supplierPrice)
      formDataToSend.append('marginPercentage', formData.marginPercentage.toString())
      formDataToSend.append('previousPrice', formData.previousPrice)
      formDataToSend.append('condition', formData.condition)
      formDataToSend.append('aestheticCondition', formData.aestheticCondition.toString())
      formDataToSend.append('specifications', formData.specifications)
      formDataToSend.append('categories', formData.categories)
      formDataToSend.append('stock', formData.stock.toString())
      formDataToSend.append('status', formData.status)
      formDataToSend.append('manufacturerCode', formData.manufacturerCode)
      formDataToSend.append('manufacturer', formData.manufacturer)
      formDataToSend.append('model', formData.model)
      // paymentProfileId removido - ahora se usa perfil global
      
      // Agregar archivos de imagen
      console.log('🖼️ [FRONTEND] Archivos de imagen:', imageFiles.length)
      imageFiles.forEach((file, index) => {
        console.log(`📁 [FRONTEND] Agregando imagen ${index}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        })
        formDataToSend.append(`image_${index}`, file)
      })

      console.log('📤 [FRONTEND] Enviando formulario a /api/products...')
      
      // Obtener token de autenticación
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        alert('No hay sesión activa. Por favor, inicia sesión nuevamente.')
        return
      }
      
      // Enviar formulario con archivos
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend // No headers Content-Type, se establece automáticamente
      })

      console.log('📡 [FRONTEND] Respuesta recibida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (response.ok) {
        console.log('✅ [FRONTEND] Producto creado exitosamente, redirigiendo...')
        router.push('/admin/products')
      } else {
        const errorData = await response.json()
        console.error('❌ [FRONTEND] Error del servidor:', errorData)
        
        // Mostrar mensaje de error específico y amigable
        let errorMessage = errorData.error || 'Error desconocido'
        let errorDetails = errorData.details || ''
        let errorSuggestion = errorData.suggestion || ''
        
        // Si hay campos faltantes, mostrarlos específicamente
        if (errorData.missingFields && errorData.missingFields.length > 0) {
          errorMessage = 'Campos faltantes'
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
    } catch (error) {
      console.error('❌ [FRONTEND] Error creando producto:', error)
      if (error instanceof Error) {
        console.error('❌ [FRONTEND] Stack trace:', error.stack)
      }
      
      // Mensaje de error de conexión más amigable
      alert(`❌ Error de conexión\n\nNo se pudo conectar al servidor.\n\nVerifica tu conexión a internet e intenta de nuevo.\nSi el problema persiste, contacta al administrador.`)
    } finally {
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/products" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Produtos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Produto</h1>
          <p className="text-gray-600">Criar um novo produto</p>
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
                  className={`w-full px-3 py-2 text-gray-900 bg-white border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    fieldErrors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite o título do produto"
                />
                {fieldErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>
                )}
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
                  placeholder="Código de barras do fabricante"
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
                  placeholder="Preço de compra ao fornecedor"
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
                  placeholder="Porcentagem de margem de lucro"
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
                            marginPercentage: settings.totalPercentage
                          }))
                          alert(`Configuração recarregada: ${settings.totalPercentage}%`)
                        } else {
                          alert('Erro ao carregar configurações de comissão')
                        }
                      } catch (error) {
                        console.error('Error reloading commission settings:', error)
                        alert('Erro ao recarregar configuração')
                      }
                    }}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
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
                  placeholder="Preço de compra ao fornecedor"
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
                placeholder="Quantidade em estoque"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Quantidade de produtos disponíveis para venda
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  fieldErrors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descreva o produto em detalhes"
              />
              {fieldErrors.description && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.description}</p>
              )}
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
                Especificações Técnicas
              </label>
              <textarea
                name="specifications"
                rows={8}
                maxLength={10000}
                value={formData.specifications}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Processador, Memória RAM, Armazenamento, etc."
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

          {/* Payment Profile removido - ahora se usa perfil global */}

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Imagens do Produto</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Imagem do produto ${index + 1}`}
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
              Máximo 5 imágenes. Formatos soportados: JPG, PNG, WEBP (máximo 5MB cada una)
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading || isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSubmitting ? 'Enviando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Producto
                </>
              )}
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

export default dynamic(() => Promise.resolve(AdminNewProductPage), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
})