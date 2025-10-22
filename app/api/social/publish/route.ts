import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'

// POST - Publicar en redes sociales
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Solo administradores pueden publicar en redes sociales
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden publicar en redes sociales' },
        { status: 403 }
      )
    }

    const { 
      platforms, 
      content, 
      imageUrl, 
      productId,
      scheduledAt 
    } = await request.json()

    if (!platforms || !Array.isArray(platforms) || !content) {
      return NextResponse.json(
        { error: 'platforms y content son requeridos' },
        { status: 400 }
      )
    }

    console.log('📱 [SOCIAL_PUBLISH] Publicando en redes sociales:', platforms)

    // Obtener información del producto si se proporciona
    let product = null
    if (productId) {
      product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          images: {
            select: {
              path: true,
              alt: true
            },
            take: 1
          }
        }
      })
    }

    // Preparar contenido para cada plataforma
    const platformContent = preparePlatformContent(content, product, imageUrl)

    // Publicar en cada plataforma
    const results = await Promise.allSettled(
      platforms.map((platform: string) => publishToPlatform(platform, platformContent[platform as keyof typeof platformContent]))
    )

    // Procesar resultados
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason)

    console.log(`✅ [SOCIAL_PUBLISH] Publicación completada: ${successful} exitosas, ${failed} fallidas`)

    return NextResponse.json({
      message: 'Publicación en redes sociales completada',
      results: {
        successful,
        failed,
        errors: errors.length > 0 ? errors : undefined
      },
      platforms: platforms.map((platform, index) => ({
        platform,
        status: results[index].status,
        error: results[index].status === 'rejected' ? results[index].reason : undefined
      }))
    })

  } catch (error) {
    console.error('Error publishing to social media:', error)
    return handleError(error)
  }
}

// Función para preparar contenido específico por plataforma
function preparePlatformContent(content: string, product: any, imageUrl?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  
  return {
    facebook: {
      message: content,
      link: product ? `${baseUrl}/products/${product.id}` : undefined,
      picture: imageUrl || product?.images[0]?.path
    },
    instagram: {
      caption: content,
      image_url: imageUrl || product?.images[0]?.path
    },
    twitter: {
      text: content.length > 280 ? content.substring(0, 277) + '...' : content,
      link: product ? `${baseUrl}/products/${product.id}` : undefined
    },
    linkedin: {
      text: content,
      link: product ? `${baseUrl}/products/${product.id}` : undefined,
      image_url: imageUrl || product?.images[0]?.path
    },
    tiktok: {
      description: content,
      video_url: imageUrl // TikTok usa videos, no imágenes
    }
  }
}

// Función para publicar en una plataforma específica
async function publishToPlatform(platform: string, content: any): Promise<any> {
  // En una implementación real, aquí se harían las llamadas a las APIs de cada plataforma
  // Por ahora, simulamos la publicación
  
  console.log(`📱 [SOCIAL_PUBLISH] Publicando en ${platform}:`, content)

  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Simular éxito/fallo aleatorio (90% éxito)
  if (Math.random() < 0.9) {
    return {
      platform,
      success: true,
      postId: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: `https://${platform}.com/post/${Date.now()}`
    }
  } else {
    throw new Error(`Error publicando en ${platform}: Simulated API error`)
  }
}

// GET - Obtener historial de publicaciones
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Solo administradores pueden ver historial de publicaciones
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver historial de publicaciones' },
        { status: 403 }
      )
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const platform = searchParams.get('platform')

    console.log('📱 [SOCIAL_HISTORY] Obteniendo historial de publicaciones')

    // En una implementación real, esto vendría de una tabla de publicaciones
    // Por ahora, retornamos datos simulados
    const mockHistory = [
      {
        id: 'post_1',
        platform: 'facebook',
        content: '¡Nuevo producto disponible!',
        status: 'published',
        publishedAt: new Date(Date.now() - 86400000), // 1 día atrás
        engagement: {
          likes: 45,
          shares: 12,
          comments: 8
        }
      },
      {
        id: 'post_2',
        platform: 'twitter',
        content: 'Oferta especial esta semana',
        status: 'published',
        publishedAt: new Date(Date.now() - 172800000), // 2 días atrás
        engagement: {
          likes: 23,
          retweets: 5,
          replies: 3
        }
      }
    ]

    const filteredHistory = platform 
      ? mockHistory.filter(post => post.platform === platform)
      : mockHistory

    const total = filteredHistory.length
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const paginatedHistory = filteredHistory.slice(
      (page - 1) * limit,
      page * limit
    )

    return NextResponse.json({
      posts: paginatedHistory,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Error getting social media history:', error)
    return handleError(error)
  }
}
