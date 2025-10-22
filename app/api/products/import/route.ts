import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyJWT(token)
    
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const currentUserId = payload.userId
    console.log('🔍 [IMPORT] Usuario actual:', currentUserId)

    // Obtener datos del cuerpo de la petición
    const { sqlContent } = await request.json()
    
    if (!sqlContent) {
      return NextResponse.json({ error: 'Contenido SQL requerido' }, { status: 400 })
    }

    // Parsear el contenido SQL para extraer los productos
    const products = await parseSQLContent(sqlContent, currentUserId)
    
    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No se encontraron productos válidos en el SQL' }, { status: 400 })
    }

    console.log(`📦 [IMPORT] Productos a importar: ${products.length}`)

    // Importar productos en lote
    const result = await importProducts(products, currentUserId)
    
    console.log(`✅ [IMPORT] Productos procesados: ${result.total} total, ${result.imported.length} importados, ${result.skipped.length} saltados`)

    return NextResponse.json({
      success: true,
      message: `Se procesaron ${result.total} productos: ${result.imported.length} importados, ${result.skipped.length} ya existían`,
      importedCount: result.imported.length,
      skippedCount: result.skipped.length,
      totalCount: result.total,
      products: result.imported,
      skipped: result.skipped
    })

  } catch (error) {
    console.error('❌ [IMPORT] Error al importar productos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al importar productos' },
      { status: 500 }
    )
  }
}

async function parseSQLContent(sqlContent: string, currentUserId: string) {
  const products = []
  
  // Buscar líneas INSERT en el SQL (flexible con mayúsculas/minúsculas)
  const insertLines = sqlContent.split('\n').filter(line => 
    line.trim().toUpperCase().startsWith('INSERT INTO PRODUCT')
  )
  
  console.log(`🔍 [IMPORT] Líneas INSERT encontradas: ${insertLines.length}`)
  
  for (const line of insertLines) {
    try {
      console.log(`🔍 [IMPORT] Procesando línea: ${line.substring(0, 100)}...`)
      
      // Extraer valores de la línea INSERT
      const valuesMatch = line.match(/VALUES\s*\(([^)]+)\)/i)
      if (!valuesMatch) {
        console.log(`⚠️ [IMPORT] No se encontraron valores en la línea`)
        continue
      }
      
      const valuesString = valuesMatch[1]
      const values = parseSQLValues(valuesString)
      
      console.log(`🔍 [IMPORT] Valores extraídos: ${values.length}`)
      
      if (values.length >= 20) { // Verificar que tenga al menos los campos básicos (20 campos sin purchasePrice)
        // Mapeo flexible según el número de campos disponibles
        const isNewFormat = values.length >= 21; // 21 campos incluye previousPrice
        console.log(`🔍 [IMPORT] Formato detectado: ${isNewFormat ? 'Nuevo (21 campos)' : 'Antiguo (20 campos)'}`)
        
        const product = {
          id: values[0].replace(/'/g, ''),
          title: values[1].replace(/'/g, ''),
          description: values[2].replace(/'/g, ''),
          price: parseFloat(values[3]) || 0,
          supplierPrice: values[4] === 'NULL' ? null : parseFloat(values[4]) || null,
          marginPercentage: values[5] === 'NULL' ? null : parseFloat(values[5]) || null,
          previousPrice: isNewFormat ? (values[6] === 'NULL' ? null : parseFloat(values[6]) || null) : null,
          manufacturer: isNewFormat ? values[7].replace(/'/g, '') : values[6].replace(/'/g, ''),
          model: isNewFormat ? values[8].replace(/'/g, '') : values[7].replace(/'/g, ''),
          categories: isNewFormat ? values[9].replace(/'/g, '') : values[8].replace(/'/g, ''),
          condition: isNewFormat ? values[10].replace(/'/g, '') : values[9].replace(/'/g, ''),
          status: isNewFormat ? values[11].replace(/'/g, '') : values[10].replace(/'/g, ''),
          stock: isNewFormat ? (values[12] === 'NULL' ? null : parseInt(values[12]) || null) : (values[11] === 'NULL' ? null : parseInt(values[11]) || null),
          barcode: isNewFormat ? values[13].replace(/'/g, '') : values[12].replace(/'/g, ''),
          specifications: isNewFormat ? values[14].replace(/'/g, '') : values[13].replace(/'/g, ''),
          images: isNewFormat ? (values[15] === 'NULL' ? [] : JSON.parse(values[15].replace(/'/g, ''))) : (values[14] === 'NULL' ? [] : JSON.parse(values[14].replace(/'/g, ''))),
          publishedAt: isNewFormat ? (values[16] === 'NULL' ? null : new Date(values[16].replace(/'/g, ''))) : (values[15] === 'NULL' ? null : new Date(values[15].replace(/'/g, ''))),
          publishedBy: isNewFormat ? values[17].replace(/'/g, '') : values[16].replace(/'/g, ''),
          originalUserId: isNewFormat ? values[18].replace(/'/g, '') : values[17].replace(/'/g, ''),
          userId: '', // Se asignará más tarde
          createdAt: isNewFormat ? new Date(values[19].replace(/'/g, '')) : new Date(values[18].replace(/'/g, '')),
          updatedAt: isNewFormat ? new Date(values[20].replace(/'/g, '')) : new Date(values[19].replace(/'/g, ''))
        }
        
        // Verificar si el usuario original existe
        const shouldUseCurrentUser = !await userExists(product.originalUserId)
        
        if (shouldUseCurrentUser) {
          console.log(`🔄 [IMPORT] Usuario original ${product.originalUserId} no existe, usando usuario actual ${currentUserId}`)
          product.userId = currentUserId
        } else {
          product.userId = product.originalUserId
        }
        
        // Generar nuevo ID para evitar conflictos
        product.id = generateNewId()
        
        products.push(product)
        console.log(`✅ [IMPORT] Producto parseado: ${product.title}`)
      } else {
        console.log(`⚠️ [IMPORT] Línea con campos insuficientes: ${values.length}/20-21`)
      }
    } catch (error) {
      console.error('❌ [IMPORT] Error al parsear línea SQL:', line, error)
    }
  }
  
  console.log(`📦 [IMPORT] Total de productos parseados: ${products.length}`)
  return products
}

function parseSQLValues(valuesString: string): string[] {
  const values = []
  let current = ''
  let inQuotes = false
  let quoteChar = ''
  
  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i]
    
    if ((char === "'" || char === '"') && !inQuotes) {
      inQuotes = true
      quoteChar = char
      current += char
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false
      quoteChar = ''
      current += char
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  if (current.trim()) {
    values.push(current.trim())
  }
  
  return values
}

async function userExists(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })
    return !!user
  } catch (error) {
    console.error('❌ [IMPORT] Error al verificar usuario:', error)
    return false
  }
}

function generateNewId(): string {
  // Generar ID similar al formato de Prisma
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 25; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function importProducts(products: any[], currentUserId: string) {
  const importedProducts = []
  const skippedProducts = []
  
  for (const product of products) {
    try {
      // Verificar si el producto ya existe
      const existingProduct = await prisma.product.findUnique({
        where: { id: product.id }
      })
      
      if (existingProduct) {
        console.log(`⚠️ [IMPORT] Producto ya existe, saltando: ${product.title}`)
        skippedProducts.push({
          ...product,
          reason: 'already_exists'
        })
        continue
      }
      
      const createdProduct = await prisma.product.create({
        data: {
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          supplierPrice: product.supplierPrice || 0,
          marginPercentage: product.marginPercentage || 50,
          previousPrice: product.previousPrice || null,
          condition: product.condition,
          aestheticCondition: 5, // Valor por defecto 5 (medio)
          specifications: product.specifications,
          categories: product.categories,
          stock: product.stock || 0,
          status: product.status,
          manufacturerCode: product.barcode || '',
          manufacturer: product.manufacturer,
          model: product.model,
          images: {
            create: (product.images || []).map((img: any) => ({
              path: img.path,
              filename: img.filename,
              alt: img.alt || product.title,
              order: img.order || 0
            }))
          },
          publishedAt: product.publishedAt || null,
          publishedBy: product.publishedBy || null,
          userId: product.userId,
          createdAt: product.createdAt || new Date(),
          updatedAt: product.updatedAt || new Date()
        }
      })
      
      importedProducts.push(createdProduct)
      console.log(`✅ [IMPORT] Producto importado: ${createdProduct.title}`)
      
    } catch (error) {
      console.error(`❌ [IMPORT] Error al importar producto ${product.title}:`, error)
      console.error(`❌ [IMPORT] Detalles del error:`, error instanceof Error ? error.message : 'Error desconocido')
      // Continuar con el siguiente producto
    }
  }
  
  console.log(`📊 [IMPORT] Resumen: ${importedProducts.length} importados, ${skippedProducts.length} saltados`)
  return {
    imported: importedProducts,
    skipped: skippedProducts,
    total: importedProducts.length + skippedProducts.length
  }
}
