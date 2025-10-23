import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyJWT } from '@/lib/jwt'
import { sanitizeHtml, validateTextLength } from '@/lib/validation'

const prisma = new PrismaClient()

// Función para crear la tabla si no existe
async function ensureRatingTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS product_ratings (
        id TEXT PRIMARY KEY,
        rating INTEGER NOT NULL,
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        userId TEXT NOT NULL,
        productId TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(userId, productId)
      )
    `
  } catch (error) {
    console.log('Tabla product_ratings ya existe o error creándola:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando proceso de valoración...')
    
    // Asegurar que la tabla existe
    await ensureRatingTable()
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No hay token de autorización')
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('🔑 Token recibido:', token.substring(0, 20) + '...')
    console.log('🔑 Token completo:', token)
    
    const decoded = verifyJWT(token)
    console.log('🔍 Token decodificado:', decoded)
    
    if (!decoded) {
      console.log('❌ Token inválido o expirado')
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
    }
    
    const userId = decoded.user.userId
    console.log('👤 User ID:', userId)

    const body = await request.json()
    console.log('📝 Datos recibidos:', body)
    
    const { productId, rating, comment } = body

    if (!productId || !rating || rating < 1 || rating > 5) {
      console.log('❌ Datos inválidos:', { productId, rating })
      return NextResponse.json({ error: 'Datos de valoración inválidos' }, { status: 400 })
    }

    // Validar y sanitizar comentario si existe
    let sanitizedComment = null
    if (comment && comment.trim()) {
      const commentValidation = validateTextLength(comment, 'Comentario', 1, 500)
      if (!commentValidation.valid) {
        return NextResponse.json({ error: commentValidation.error }, { status: 400 })
      }
      sanitizedComment = sanitizeHtml(commentValidation.value!)
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      console.log('❌ Producto no encontrado:', productId)
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    console.log('✅ Producto encontrado:', product.title)

    // Crear o actualizar la valoración usando Prisma ORM
    let savedRating
    try {
      const existingRating = await prisma.productRating.findUnique({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId
          }
        }
      })

      if (existingRating) {
        // Actualizar valoración existente
        savedRating = await prisma.productRating.update({
          where: {
            id: existingRating.id
          },
          data: {
            rating: rating,
            comment: sanitizedComment,
            updatedAt: new Date()
          }
        })
        console.log('✅ Valoración actualizada')
      } else {
        // Crear nueva valoración
        savedRating = await prisma.productRating.create({
          data: {
            rating: rating,
            comment: sanitizedComment,
            userId: userId,
            productId: productId
          }
        })
        console.log('✅ Nueva valoración creada')
      }
    } catch (dbError) {
      console.error('❌ Error en base de datos:', dbError)
      return NextResponse.json({ 
        error: 'Error guardando valoración en base de datos',
        details: dbError instanceof Error ? dbError.message : 'Error desconocido'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Valoración guardada exitosamente',
      rating: { id: savedRating.id, rating: savedRating.rating, comment: savedRating.comment, userId: savedRating.userId, productId: savedRating.productId }
    })

  } catch (error) {
    console.error('❌ Error general:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Obteniendo valoraciones...')
    
    // Asegurar que la tabla existe
    await ensureRatingTable()
    
    const { searchParams } = request.nextUrl
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 })
    }

    console.log('📦 Product ID:', productId)

    // Obtener valoraciones del producto usando Prisma ORM
    const ratings = await prisma.productRating.findMany({
      where: {
        productId: productId
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📊 Valoraciones encontradas:', ratings.length)

    // Calcular promedio
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0

    const result = {
      ratings: ratings.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          name: r.user.name
        }
      })),
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length
    }

    console.log('✅ Resultado:', { averageRating: result.averageRating, totalRatings: result.totalRatings })

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Error obteniendo valoraciones:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
