import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/fileStorage'
import { clearProductCache } from '@/lib/cache'
// import { validateProductData } from '@/lib/validation' // Removed to fix webidl-conversions error
// No necesitamos importar Decimal, usaremos strings

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si es una consulta de administración
    const authHeader = request.headers.get('authorization')
    const isAdminQuery = authHeader && authHeader.startsWith('Bearer ')
    
    const whereClause: any = { id: params.id }
    
    // Si no es una consulta de administración, filtrar solo productos activos
    if (!isAdminQuery) {
      whereClause.status = 'ACTIVE'
      console.log('🔍 [API] PUBLIC - Filtrando solo productos activos para detalle')
    } else {
      console.log('🔍 [API] ADMIN - Mostrando producto (incluyendo inactivos)')
    }

    const product = await prisma.product.findUnique({
      where: whereClause,
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔄 [API] PUT /api/products/[id] - Iniciando actualización...')
  console.log('🔄 [API] Product ID:', params.id)
  
  try {
    // Check if request has FormData (file upload) or JSON
    const contentType = request.headers.get('content-type') || ''
    console.log('📋 [API] Content-Type:', contentType)
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      console.log('📁 [API] Procesando FormData con archivos...')
      const formData = await request.formData()
      
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
      const stock = parseInt(formData.get('stock') as string)
      const status = formData.get('status') as string
      const manufacturerCode = formData.get('manufacturerCode') as string
      const manufacturer = formData.get('manufacturer') as string
      const model = formData.get('model') as string
      const existingImagesJson = formData.get('existingImages') as string
      
      // Parse existing images to keep
      let existingImagesToKeep: string[] = []
      if (existingImagesJson) {
        try {
          existingImagesToKeep = JSON.parse(existingImagesJson)
          console.log('📸 [API] Imágenes existentes a mantener:', existingImagesToKeep)
        } catch (error) {
          console.error('❌ [API] Error parseando imágenes existentes:', error)
        }
      }
      
      // Autogenerar manufacturerCode si no se proporciona
      const finalManufacturerCode = manufacturerCode && manufacturerCode.trim() !== '' 
        ? manufacturerCode 
        : `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      console.log('📊 [API] Datos del formulario:', {
        title: title?.substring(0, 50) + '...',
        price,
        condition,
        stock
      })
      
      // Extract image files
      const imageFiles: File[] = []
      let fileIndex = 0
      while (formData.has(`images[${fileIndex}]`)) {
        const file = formData.get(`images[${fileIndex}]`) as File
        if (file && file.size > 0) {
          imageFiles.push(file)
          console.log(`📸 [API] Archivo ${fileIndex}:`, {
            name: file.name,
            size: file.size,
            type: file.type
          })
        }
        fileIndex++
      }
      
      console.log(`📸 [API] Total de archivos encontrados: ${imageFiles.length}`)
      
      // Eliminar imágenes que no están en la lista de imágenes a mantener
      if (existingImagesToKeep.length > 0) {
        console.log('🗑️ [API] Eliminando imágenes que no están en la lista de mantener...')
        
        // Obtener todas las imágenes actuales del producto
        const currentImages = await prisma.productImage.findMany({
          where: { productId: params.id },
          select: { id: true, path: true }
        })
        
        console.log('📸 [API] Imágenes actuales en BD:', currentImages.map(img => img.path))
        
        // Identificar imágenes a eliminar (las que no están en existingImagesToKeep)
        const imagesToDelete = currentImages.filter(currentImg => 
          !existingImagesToKeep.includes(currentImg.path)
        )
        
        console.log('🗑️ [API] Imágenes a eliminar:', imagesToDelete.map(img => img.path))
        
        if (imagesToDelete.length > 0) {
          // Eliminar archivos físicos antes de eliminar registros de BD
          console.log('🗑️ [API] Eliminando archivos físicos...')
          for (const imageToDelete of imagesToDelete) {
            try {
              const fileDeleted = await deleteFile(imageToDelete.path)
              if (fileDeleted) {
                console.log(`✅ [API] Archivo físico eliminado: ${imageToDelete.path}`)
              } else {
                console.log(`⚠️ [API] No se pudo eliminar archivo físico: ${imageToDelete.path}`)
              }
            } catch (error) {
              console.error(`❌ [API] Error eliminando archivo físico ${imageToDelete.path}:`, error)
            }
          }
          
          // Eliminar imágenes específicas de la BD
          await prisma.productImage.deleteMany({
            where: {
              id: { in: imagesToDelete.map(img => img.id) }
            }
          })
          console.log(`✅ [API] ${imagesToDelete.length} imágenes eliminadas de BD`)
        }
      } else {
        console.log('🗑️ [API] No hay imágenes existentes a mantener, eliminando todas...')
        
        // Obtener todas las imágenes actuales para eliminar archivos físicos
        const allCurrentImages = await prisma.productImage.findMany({
          where: { productId: params.id },
          select: { id: true, path: true }
        })
        
        // Eliminar archivos físicos antes de eliminar registros de BD
        if (allCurrentImages.length > 0) {
          console.log('🗑️ [API] Eliminando todos los archivos físicos...')
          for (const imageToDelete of allCurrentImages) {
            try {
              const fileDeleted = await deleteFile(imageToDelete.path)
              if (fileDeleted) {
                console.log(`✅ [API] Archivo físico eliminado: ${imageToDelete.path}`)
              } else {
                console.log(`⚠️ [API] No se pudo eliminar archivo físico: ${imageToDelete.path}`)
              }
            } catch (error) {
              console.error(`❌ [API] Error eliminando archivo físico ${imageToDelete.path}:`, error)
            }
          }
        }
        
        // Si no hay imágenes a mantener, eliminar todas de la BD
        await prisma.productImage.deleteMany({
          where: { productId: params.id }
        })
        console.log('✅ [API] Todas las imágenes existentes eliminadas de BD')
      }
      
      let imageRecords: any[] = []
      
      if (imageFiles.length > 0) {
        // Upload new images
        console.log('📤 [API] Subiendo nuevas imágenes...')
        const { uploadMultipleFiles } = await import('@/lib/fileStorage')
        
        const uploadResult = await uploadMultipleFiles(imageFiles, params.id)
        
        if (uploadResult.success && uploadResult.results) {
          // Obtener el número de imágenes que se mantienen para calcular el order correcto
          const remainingImagesCount = existingImagesToKeep.length
          
          imageRecords = uploadResult.results.map((result, index) => ({
            path: result.path, // Usar ruta directa sin /api/images
            filename: result.filename,
            alt: title,
            order: remainingImagesCount + index // Continuar numeración desde las que se mantienen
          }))
          console.log('✅ [API] Imágenes subidas exitosamente:', imageRecords.length)
        } else {
          console.error('❌ [API] Error subiendo imágenes:', uploadResult.error)
          return NextResponse.json(
            { error: 'Failed to upload images' },
            { status: 500 }
          )
        }
      }
      
      console.log('💾 [API] Actualizando producto en base de datos...')
      
      // Preparar datos de actualización
      const updateData: any = {
        title,
        description,
        price,
        supplierPrice,
        marginPercentage,
        previousPrice: previousPriceValue,
        condition,
        aestheticCondition,
        specifications,
        categories: categories || null,
        stock: stock || 0,
        status,
        manufacturerCode: finalManufacturerCode,
        manufacturer: manufacturer || null,
        model: model || null
      }
      
      // Solo agregar imágenes si hay nuevas
      if (imageRecords.length > 0) {
        updateData.images = {
          create: imageRecords
        }
      }
      
      // Validar datos del producto antes de actualizar
      // Validación simple de datos del producto
      if (updateData.name && updateData.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'El nombre del producto no puede estar vacío' },
          { status: 400 }
        )
      }
      if (updateData.price && updateData.price <= 0) {
        return NextResponse.json(
          { error: 'El precio debe ser mayor a 0' },
          { status: 400 }
        )
      }
      
      const product = await prisma.product.update({
        where: { id: params.id },
        data: updateData,
        include: {
          images: true
        }
      })

      console.log('✅ [API] Producto actualizado exitosamente:', {
        id: product.id,
        title: product.title,
        imagesCount: product.images.length
      })

      // Limpiar caché de productos para que se actualice la lista
      await clearProductCache()
      console.log('🗑️ [CACHE] Caché de productos limpiado después de actualización')

      return NextResponse.json(product)
      
    } else {
      // Handle JSON data (no file upload)
      console.log('📄 [API] Procesando datos JSON...')
      const body = await request.json()
      const { title, description, price, supplierPrice, marginPercentage, previousPrice, condition, aestheticCondition, specifications, categories, stock, status, images, manufacturerCode, manufacturer, model } = body
      const previousPriceValue = previousPrice && previousPrice.trim() !== '' ? previousPrice : null
      
      // Autogenerar manufacturerCode si no se proporciona
      const finalManufacturerCode = manufacturerCode && manufacturerCode.trim() !== '' 
        ? manufacturerCode 
        : `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      console.log('📊 [API] Datos recibidos:', {
        title: title?.substring(0, 50) + '...',
        price,
        condition,
        stock,
        imagesCount: images?.length || 0
      })
      
      console.log('🖼️ [API] Imágenes recibidas:', images)

      // Handle image updates selectively
      console.log('🗑️ [API] Procesando actualización de imágenes...')
      
      // Obtener imágenes actuales en BD
      const currentImages = await prisma.productImage.findMany({
        where: { productId: params.id },
        select: { id: true, path: true }
      })
      
      console.log('📸 [API] Imágenes actuales en BD:', currentImages.map(img => img.path))
      console.log('📸 [API] Imágenes a mantener:', images)
      
      // Identificar imágenes a eliminar (las que no están en la lista de mantener)
      const imagesToDelete = currentImages.filter(currentImg => 
        !images.includes(currentImg.path)
      )
      
      console.log('🗑️ [API] Imágenes a eliminar:', imagesToDelete.map(img => img.path))
      
      // Eliminar archivos físicos de las imágenes que se van a eliminar
      if (imagesToDelete.length > 0) {
        console.log('🗑️ [API] Eliminando archivos físicos...')
        for (const imageToDelete of imagesToDelete) {
          try {
            const fileDeleted = await deleteFile(imageToDelete.path)
            if (fileDeleted) {
              console.log(`✅ [API] Archivo físico eliminado: ${imageToDelete.path}`)
            } else {
              console.log(`⚠️ [API] No se pudo eliminar archivo físico: ${imageToDelete.path}`)
            }
          } catch (error) {
            console.error(`❌ [API] Error eliminando archivo físico ${imageToDelete.path}:`, error)
          }
        }
        
        // Eliminar registros de BD de las imágenes eliminadas
        await prisma.productImage.deleteMany({
          where: {
            id: { in: imagesToDelete.map(img => img.id) }
          }
        })
        console.log(`✅ [API] ${imagesToDelete.length} imágenes eliminadas de BD`)
      } else {
        console.log('✅ [API] No hay imágenes para eliminar')
      }

      // Solo crear registros para imágenes nuevas (blob URLs)
      const newImageRecords = images
        .map((imageUrl: string, index: number) => {
          const isBlob = imageUrl.startsWith('blob:')
          if (isBlob) {
            return {
              path: '/placeholder.jpg',
              filename: 'placeholder.jpg',
              alt: title,
              order: index
            }
          }
          return null
        })
        .filter((record: any) => record !== null)

      console.log('💾 [API] Actualizando producto en base de datos...')
      const updateData: any = {
        title,
        description,
        price,
        supplierPrice,
        marginPercentage,
        previousPrice: previousPriceValue,
        condition,
        aestheticCondition,
        specifications,
        categories: categories || null,
        stock: parseInt(stock) || 0,
        status,
        manufacturerCode: finalManufacturerCode,
        manufacturer: manufacturer || null,
        model: model || null
      }
      
      // Solo agregar imágenes si hay nuevas
      if (newImageRecords.length > 0) {
        updateData.images = {
          create: newImageRecords
        }
        console.log(`📸 [API] Creando ${newImageRecords.length} nuevas imágenes`)
      } else {
        console.log('📸 [API] No hay nuevas imágenes para crear')
      }
      
      // Validar datos del producto antes de actualizar
      // Validación simple de datos del producto
      if (updateData.name && updateData.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'El nombre del producto no puede estar vacío' },
          { status: 400 }
        )
      }
      if (updateData.price && updateData.price <= 0) {
        return NextResponse.json(
          { error: 'El precio debe ser mayor a 0' },
          { status: 400 }
        )
      }
      
      const product = await prisma.product.update({
        where: { id: params.id },
        data: updateData,
        include: {
          images: true
        }
      })

      console.log('✅ [API] Producto actualizado exitosamente:', {
        id: product.id,
        title: product.title,
        imagesCount: product.images.length
      })

      // Limpiar caché de productos para que se actualice la lista
      await clearProductCache()
      console.log('🗑️ [CACHE] Caché de productos limpiado después de actualización')

      return NextResponse.json(product)
    }
  } catch (error) {
    console.error('❌ [API] Error actualizando producto:', error)
    if (error instanceof Error) {
      console.error('❌ [API] Stack trace:', error.stack)
    }
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ [API] Iniciando eliminación de producto:', params.id)
    
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('❌ [API] No hay token de autorización')
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    let userId: string
    try {
      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      userId = decoded.userId
      console.log('👤 [API] Usuario autenticado:', userId)
    } catch (error) {
      console.error('❌ [API] Error verificando token:', error)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar que el producto existe y obtener información
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        userId: true,
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    })

    if (!product) {
      console.log('❌ [API] Producto no encontrado:', params.id)
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    console.log('🔍 [API] Producto encontrado:', {
      title: product.title,
      ownerId: product.userId,
      ownerName: product.user?.name,
      ownerRole: product.user?.role
    })

    // Verificar permisos de eliminación
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, name: true }
    })

    if (!currentUser) {
      console.log('❌ [API] Usuario actual no encontrado')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    console.log('👤 [API] Usuario actual:', {
      name: currentUser.name,
      role: currentUser.role
    })

    // Verificar si puede eliminar el producto
    const canDelete = currentUser.role === 'ADMIN' || 
                     (currentUser.role === 'ADMIN_VENDAS' && product.userId === userId)

    if (!canDelete) {
      console.log('❌ [API] Sin permisos para eliminar producto')
      return NextResponse.json({ 
        error: 'No tienes permisos para eliminar este producto' 
      }, { status: 403 })
    }

    console.log('✅ [API] Permisos verificados, procediendo con eliminación')

    // Primero eliminar todas las relaciones del producto
    await prisma.$transaction(async (tx) => {
      // Eliminar imágenes del producto
      await tx.productImage.deleteMany({
        where: { productId: params.id }
      })

      // Eliminar items del carrito que referencian este producto
      await tx.cartItem.deleteMany({
        where: { productId: params.id }
      })

      // Eliminar ratings del producto
      await tx.productRating.deleteMany({
        where: { productId: params.id }
      })

      // Eliminar items de órdenes que referencian este producto
      await tx.orderItem.deleteMany({
        where: { productId: params.id }
      })

      // Finalmente eliminar el producto
      await tx.product.delete({
        where: { id: params.id }
      })
    })

    console.log('✅ [API] Producto eliminado exitosamente:', params.id)
    console.log('🗑️ [API] Eliminación completada por:', currentUser.name)
    
    // Limpiar caché de productos
    const { clearProductCache } = await import('@/lib/cache')
    await clearProductCache()
    console.log('🗑️ [CACHE] Caché de productos limpiado después de eliminación')
    
    return NextResponse.json({ 
      message: 'Producto eliminado exitosamente',
      deletedBy: currentUser.name,
      productTitle: product.title
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
