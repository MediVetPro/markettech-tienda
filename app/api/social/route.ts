import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { getCachedData, cacheHelpers, CACHE_TTL } from '@/lib/cache'

// GET - Obtener configuración de redes sociales
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

    // Solo administradores pueden ver configuración de redes sociales
    if (decoded.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver configuración de redes sociales' },
        { status: 403 }
      )
    }

    console.log('📱 [SOCIAL] Obteniendo configuración de redes sociales')

    // Configuración de redes sociales (en una implementación real, esto vendría de la base de datos)
    const socialConfig = {
      facebook: {
        enabled: true,
        pageId: process.env.FACEBOOK_PAGE_ID || '',
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
        appId: process.env.FACEBOOK_APP_ID || '',
        appSecret: process.env.FACEBOOK_APP_SECRET || ''
      },
      instagram: {
        enabled: true,
        accountId: process.env.INSTAGRAM_ACCOUNT_ID || '',
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || ''
      },
      twitter: {
        enabled: true,
        apiKey: process.env.TWITTER_API_KEY || '',
        apiSecret: process.env.TWITTER_API_SECRET || '',
        accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
      },
      linkedin: {
        enabled: true,
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN || ''
      },
      tiktok: {
        enabled: true,
        clientKey: process.env.TIKTOK_CLIENT_KEY || '',
        clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
        accessToken: process.env.TIKTOK_ACCESS_TOKEN || ''
      }
    }

    return NextResponse.json({
      socialConfig,
      message: 'Configuración de redes sociales obtenida exitosamente'
    })

  } catch (error) {
    console.error('Error getting social media config:', error)
    return handleError(error)
  }
}

// POST - Compartir producto en redes sociales
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

    const { 
      productId, 
      platforms, 
      message, 
      hashtags 
    } = await request.json()

    if (!productId || !platforms || !Array.isArray(platforms)) {
      return NextResponse.json(
        { error: 'productId y platforms son requeridos' },
        { status: 400 }
      )
    }

    console.log('📱 [SOCIAL] Compartiendo producto en redes sociales:', platforms)

    // Obtener información del producto
    const product = await prisma.product.findUnique({
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

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Generar enlaces de compartir
    const shareLinks = generateShareLinks(product, message, hashtags)

    // Filtrar solo las plataformas solicitadas
    const filteredLinks = platforms.reduce((acc, platform) => {
      if (shareLinks[platform as keyof typeof shareLinks]) {
        acc[platform] = shareLinks[platform as keyof typeof shareLinks]
      }
      return acc
    }, {} as any)

    return NextResponse.json({
      message: 'Enlaces de compartir generados exitosamente',
      shareLinks: filteredLinks,
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        image: product.images[0]?.path
      }
    })

  } catch (error) {
    console.error('Error sharing product:', error)
    return handleError(error)
  }
}

// Función para generar enlaces de compartir
function generateShareLinks(product: any, message?: string, hashtags?: string[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  const productUrl = `${baseUrl}/products/${product.id}`
  
  const defaultMessage = `¡Mira este increíble producto: ${product.title}!`
  const finalMessage = message || defaultMessage
  const finalHashtags = hashtags ? hashtags.join(' ') : '#MarketTech #Productos'
  
  const fullMessage = `${finalMessage} ${finalHashtags} ${productUrl}`

  return {
    facebook: {
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      method: 'popup'
    },
    twitter: {
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullMessage)}`,
      method: 'popup'
    },
    linkedin: {
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
      method: 'popup'
    },
    whatsapp: {
      url: `https://wa.me/?text=${encodeURIComponent(fullMessage)}`,
      method: 'popup'
    },
    telegram: {
      url: `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(finalMessage)}`,
      method: 'popup'
    },
    email: {
      url: `mailto:?subject=${encodeURIComponent(finalMessage)}&body=${encodeURIComponent(fullMessage)}`,
      method: 'direct'
    },
    copy: {
      text: fullMessage,
      method: 'clipboard'
    }
  }
}
