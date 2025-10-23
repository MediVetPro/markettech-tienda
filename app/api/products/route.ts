import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadMultipleFiles } from '@/lib/fileStorage'
import { canViewAllProducts, verifyToken } from '@/lib/auth'
// import { validateProductData } from '@/lib/validation' // Removed to fix webidl-conversions error
import { createProductWithImages, executeTransaction } from '@/lib/transactions'
import { handleError } from '@/lib/errorHandler'
import { optimizedQueries } from '@/lib/databaseOptimization'
import { getCachedData, cacheHelpers, CACHE_TTL, clearProductCache } from '@/lib/cache'
import { createTolerantSearchConditions } from '@/lib/textNormalization'
// No necesitamos importar Decimal, usaremos strings

export async function GET(request: NextRequest) {
  console.log('🚀 [API] GET /api/products - Iniciando...')
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')
    const condition = searchParams.get('condition')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const manufacturer = searchParams.get('manufacturer')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const adminOnly = searchParams.get('admin') === 'true'

    const where: any = {}

    // Búsqueda de texto mejorada y tolerante
    if (search) {
      console.log('🔍 Search term original:', search)
      
      // Crear condiciones de búsqueda tolerantes
      const searchConditions = createTolerantSearchConditions(search, [
        'title', 'description', 'manufacturer', 'model', 'specifications', 'categories'
      ])
      
      console.log('🔍 Total search conditions:', searchConditions.length)
      
      // Mostrar ejemplos de variaciones para debugging
      if (searchConditions.length > 0) {
        const sampleConditions = searchConditions.slice(0, 6) // Mostrar solo las primeras 6
        console.log('🔍 Sample search conditions:', sampleConditions.map(c => {
          const firstKey = Object.keys(c)[0]
          const firstValue = Object.values(c)[0] as any
          return {
            field: firstKey,
            value: firstValue?.contains,
            mode: firstValue?.mode
          }
        }))
      }
      
      // Aplicar la búsqueda como condición AND con otros filtros
      where.AND = where.AND || []
      where.AND.push({
        OR: searchConditions
      })
    }

    // Filtrado por categoría
    if (category && category !== 'all') {
      console.log('🔍 Filtering by category:', category)
      where.categories = {
        contains: category
      }
    }

    if (condition && condition !== 'all') {
      where.condition = condition
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Filtrado por fabricante
    if (manufacturer && manufacturer !== 'all') {
      where.manufacturer = manufacturer
    }

    // Si es una consulta de administración, verificar permisos y aplicar filtros según rol
    if (adminOnly) {
      console.log('🔍 [API] Consulta de administración detectada')
      const token = request.headers.get('authorization')?.replace('Bearer ', '')
      console.log('🔍 [API] Token recibido:', token ? 'Sí' : 'No')
      if (token) {
        const { user, error } = verifyToken(token)
        console.log('🔍 [API] Resultado de verificación de token:', { user: user ? 'OK' : 'NULL', error })
        
        if (error || !user) {
          console.log('❌ [API] Token inválido o error:', error)
          return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
        }
        
        // Verificar que el usuario tenga permisos de administración
        if (user.role !== 'ADMIN' && user.role !== 'ADMIN_VENDAS') {
          return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
        }
        
        // Aplicar filtros según el rol del usuario
        console.log('🔍 [API] Usuario decodificado:', { userId: user.userId, role: user.role, email: user.email })
        
        if (canViewAllProducts(user)) {
          // ADMIN: Puede ver todos los productos de todos los usuarios (incluyendo inactivos)
          console.log('🔍 [API] ADMIN - Mostrando todos los productos de todos los usuarios')
        } else {
          // ADMIN_VENDAS: Solo puede ver sus propios productos (incluyendo inactivos)
          where.userId = user.userId
          console.log('🔍 [API] ADMIN_VENDAS - Filtrando por usuario:', user.userId)
          console.log('🔍 [API] Where clause después del filtro:', JSON.stringify(where, null, 2))
        }
      } else {
        return NextResponse.json({ error: 'Token requerido para consultas de administración' }, { status: 401 })
      }
    } else {
      // Para consultas públicas (no admin), filtrar automáticamente productos inactivos
      where.status = 'ACTIVE'
      console.log('🔍 [API] PUBLIC - Filtrando solo productos activos')
    }

    console.log('🔍 Where clause final:', JSON.stringify(where, null, 2))
    
    try {
      // Usar consulta optimizada con caché
      const cacheKey = search 
        ? cacheHelpers.searchKey(search, where, page, limit)
        : cacheHelpers.productsListKey(page, limit, where)

      const result = await getCachedData(
        cacheKey,
        async () => {
          // Usar consulta optimizada
          const products = await optimizedQueries.getProductsPaginated(page, limit, where)
          
          // Obtener total de productos para paginación
          const total = await prisma.product.count({ where })

          return {
            products,
            total
          }
        },
        CACHE_TTL.PRODUCTS
      )

      const products = result.products
      const total = result.total
    
      console.log('📦 Products found:', products.length)
      console.log('📊 Total products in database:', total)
      if (products.length > 0) {
        console.log('📱 First product userId:', products[0].user?.id)
        console.log('📱 First product title:', products[0].title)
      }
      if (products.length > 0) {
        console.log('📱 First product categories:', products[0].categories)
      }

      console.log('✅ [API] Respuesta enviada:', { productsCount: products.length, total })
      return NextResponse.json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json(
        { 
          error: 'Error en la base de datos',
          details: dbError instanceof Error ? dbError.message : 'Error desconocido',
          searchTerm: search
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 [API] Iniciando creación de producto...')
  
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    let userId: string
    try {
      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch (error) {
      console.error('Error verifying token:', error)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    console.log('📝 [API] Obteniendo FormData...')
    const formData = await request.formData()
    console.log('✅ [API] FormData obtenido correctamente')
    
    // Extraer datos del formulario
    console.log('🔍 [API] Extrayendo datos del formulario...')
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const supplierPrice = formData.get('supplierPrice') as string
    const marginPercentage = formData.get('marginPercentage') as string || '50'
    const previousPrice = formData.get('previousPrice') as string
    const previousPriceValue = previousPrice && previousPrice.trim() !== '' ? previousPrice : null
    const condition = formData.get('condition') as string
    const aestheticCondition = parseInt(formData.get('aestheticCondition') as string)
    const specifications = formData.get('specifications') as string
    const categories = formData.get('categories') as string
    const stock = parseInt(formData.get('stock') as string) || 0
    const status = formData.get('status') as string || 'ACTIVE'
    // paymentProfileId removido - ahora se usa perfil global
    const manufacturerCode = formData.get('manufacturerCode') as string
    const manufacturer = formData.get('manufacturer') as string
    const model = formData.get('model') as string
    
    // Autogenerar manufacturerCode si no se proporciona
    const finalManufacturerCode = manufacturerCode && manufacturerCode.trim() !== '' 
      ? manufacturerCode 
      : `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Validar y sanitizar datos del producto
    const productData = {
      title,
      description,
      price,
      supplierPrice,
      stock,
      aestheticCondition,
      specifications,
      categories
    }
    
    // Validación simple de datos del producto
    if (!productData.title || !productData.price || parseFloat(productData.price) <= 0) {
      console.error('❌ [API] Datos del producto inválidos')
      return NextResponse.json(
        { 
          error: 'Datos del producto inválidos: título y precio son requeridos'
        },
        { status: 400 }
      )
    }
    
    const priceNum = productData.price
    const supplierPriceNum = productData.supplierPrice || 0
    
    if (supplierPriceNum >= priceNum) {
      return NextResponse.json(
        { 
          error: 'El precio del proveedor debe ser menor al precio de venta',
          field: 'supplierPrice'
        },
        { status: 400 }
      )
    }

    console.log('📊 [API] Datos extraídos:', {
      title: title?.substring(0, 50) + '...',
      price,
      condition,
      aestheticCondition,
      stock,
      status,
      categories: categories?.substring(0, 30) + '...',
      manufacturer: manufacturer || 'NULL',
      model: model || 'NULL',
      manufacturerCode: finalManufacturerCode
    })
    
    // Extraer archivos de imagen
    console.log('🖼️ [API] Extrayendo archivos de imagen...')
    const imageFiles: File[] = []
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image_${i}`) as File
      if (file && file.size > 0) {
        console.log(`📁 [API] Imagen ${i} encontrada:`, {
          name: file.name,
          size: file.size,
          type: file.type
        })
        imageFiles.push(file)
      }
    }
    
    console.log(`📸 [API] Total de imágenes encontradas: ${imageFiles.length}`)

    // Subir imágenes primero si las hay
    let imageData: Array<{ path: string; filename: string; alt?: string; order: number }> = []
    
    if (imageFiles.length > 0) {
      console.log('📤 [API] Iniciando subida de imágenes...')
      const uploadResult = await uploadMultipleFiles(imageFiles, 'temp') // Usar ID temporal
      console.log('📤 [API] Resultado de subida:', uploadResult)
      
      if (!uploadResult.success) {
        console.error('❌ [API] Error en subida de imágenes:', uploadResult.error)
        return NextResponse.json(
          { error: uploadResult.error },
          { status: 500 }
        )
      }
      
      // Preparar datos de imágenes
      imageData = uploadResult.results!.map((result, index) => ({
        path: result.path,
        filename: result.filename,
        alt: `Imagen ${index + 1}`,
        order: index
      }))
    }

    // Crear producto con imágenes usando transacción
    console.log('💾 [API] Creando producto con imágenes usando transacción...')
    const { product, images } = await createProductWithImages(
      {
        title: productData.title,
        description: productData.description,
        price: priceNum,
        supplierPrice: supplierPriceNum,
        marginPercentage,
        previousPrice: previousPriceValue,
        condition,
        aestheticCondition: productData.aestheticCondition,
        specifications: productData.specifications,
        categories: productData.categories || null,
        stock: productData.stock,
        status,
        manufacturerCode: finalManufacturerCode,
        manufacturer: manufacturer || null,
        model: model || null,
        publishedAt: new Date(),
        publishedBy: userId,
        user: { connect: { id: userId } }
        // Removido: images: { create: imageData } - se maneja en createProductWithImages
      },
      imageData
    )
    
    console.log('✅ [API] Producto creado con ID:', product.id)
    console.log('✅ [API] Imágenes creadas:', images.length)
    console.log('📸 [API] Verificando que no hay duplicación de imágenes...')
    
    // Verificar que las imágenes se crearon correctamente
    const productWithImages = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true }
    })
    
    console.log('🔍 [API] Imágenes en base de datos:', productWithImages?.images.length || 0)
    if (productWithImages?.images.length !== images.length) {
      console.warn('⚠️ [API] Posible duplicación detectada:', {
        expected: images.length,
        actual: productWithImages?.images.length
      })
    }

    // Limpiar caché relacionado con productos
    clearProductCache()

    console.log('🎉 [API] Producto creado exitosamente!')
    return NextResponse.json({ ...product, images }, { status: 201 })
  } catch (error) {
    console.error('❌ [API] Error creando producto:', error)
    return handleError(error)
  }
}
