import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'
import QRCode from 'qrcode'
import { createMercadoPagoPixPayment } from '@/lib/mercadoPago'
import { getMercadoPagoConfig } from '@/lib/mercadoPagoConfig'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function POST(request: NextRequest) {
  try {
    console.log('💰 [API] POST /api/pix/create-payment - Iniciando...')
    
    // Verificar autenticación JWT
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { 
        status: 401,
        headers: corsHeaders
      })
    }
    
    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders
      })
    }

    const body = await request.json()
    const { orderId, amount, description } = body

    console.log('📊 [API] Datos recibidos:', {
      orderId,
      amount,
      description: description?.substring(0, 50) + '...'
    })

    // Validar datos requeridos
    if (!orderId || !amount || !description) {
      return NextResponse.json({ 
        error: 'Faltan datos requeridos (orderId, amount, description)' 
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Obtener configuración de MercadoPago
    const mercadoPagoConfig = await getMercadoPagoConfig()
    
    if (!mercadoPagoConfig) {
      return NextResponse.json({ 
        error: 'MercadoPago não está configurado. Configure as credenciais no painel de administração.' 
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Obtener perfil de pago global activo
    const globalProfile = await prisma.globalPaymentProfile.findFirst({
      where: { isActive: true }
    })

    if (!globalProfile) {
      return NextResponse.json({ 
        error: 'No hay perfil de pago global configurado' 
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Obtener la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    })

    if (!order) {
      return NextResponse.json({ 
        error: 'Orden no encontrada' 
      }, { 
        status: 404,
        headers: corsHeaders
      })
    }

    // Generar ID único para el pago PIX
    const pixPaymentId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Crear registro de pago PIX en la base de datos
    const pixPayment = await prisma.pixPayment.create({
      data: {
        id: pixPaymentId,
        orderId: order.id,
        amount: parseFloat(amount),
        description,
        pixKey: globalProfile.pixKey || '',
        pixKeyType: globalProfile.pixKeyType || 'EMAIL',
        pixProvider: globalProfile.pixProvider || 'MERCADOPAGO',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
      }
    })

    console.log('✅ [API] Pago PIX creado:', pixPayment.id)

    // Generar QR Code y código PIX usando MercadoPago
    let pixData = null

    // Usar MercadoPago con configuración de la base de datos
    pixData = await createMercadoPagoPixReal(pixPayment, globalProfile, mercadoPagoConfig)
    
    // Si MercadoPago falla, usar PIX estático como fallback
    if (!pixData) {
      console.log('🔄 [PIX] MercadoPago falló, usando PIX estático como fallback...')
      pixData = await createStaticPix(pixPayment, globalProfile)
    }

    if (!pixData) {
      return NextResponse.json({ 
        error: 'Error al generar datos PIX' 
      }, { 
        status: 500,
        headers: corsHeaders
      })
    }

    // Actualizar el pago con los datos generados
    await prisma.pixPayment.update({
      where: { id: pixPaymentId },
      data: {
        qrCode: pixData.qrCode,
        qrCodeText: pixData.qrCodeText,
        pixKey: pixData.pixKey,
        externalId: pixData.externalId
      }
    })

    console.log('✅ [API] Pago PIX generado exitosamente')

    return NextResponse.json({
      success: true,
      payment: {
        id: pixPaymentId,
        amount: pixPayment.amount,
        description: pixPayment.description,
        qrCode: pixData.qrCode,
        qrCodeText: pixData.qrCodeText,
        pixKey: pixData.pixKey,
        expiresAt: pixPayment.expiresAt,
        status: pixPayment.status
      }
    }, { 
      status: 201,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('❌ [API] Error creating PIX payment:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

// Función para crear PIX con Mercado Pago REAL
async function createMercadoPagoPixReal(pixPayment: any, globalProfile: any, mercadoPagoConfig: any) {
  try {
    console.log('🔄 [PIX] Creando PIX con Mercado Pago REAL...')
    
    // Verificar que tenemos las credenciales necesarias
    if (!mercadoPagoConfig.accessToken) {
      console.error('❌ [PIX] No hay access token de MercadoPago configurado')
      return null
    }

    // Crear pago PIX con Mercado Pago
    const pixData = await createMercadoPagoPixPayment({
      transaction_amount: pixPayment.amount,
      description: pixPayment.description,
      payment_method_id: 'pix',
      payer: {
        email: globalProfile.email
      },
      notification_url: globalProfile.pixWebhookUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/pix`
    }, mercadoPagoConfig.pixKey || globalProfile.pixKey)

    if (!pixData) {
      console.error('❌ [PIX] Error creando pago con Mercado Pago')
      return null
    }

    return pixData
  } catch (error) {
    console.error('❌ [PIX] Error con Mercado Pago:', error)
    return null
  }
}

// Función para crear PIX con PagSeguro
async function createPagSeguroPix(pixPayment: any, globalProfile: any) {
  try {
    console.log('🔄 [PIX] Creando PIX con PagSeguro...')
    
    // Implementar integración con PagSeguro
    // Por ahora, generar PIX estático con QR real
    const pixCode = `00020126580014br.gov.bcb.pix0114${globalProfile.pixKey}520400005303986540${pixPayment.amount.toFixed(2)}5802BR5913${globalProfile.companyName || 'MarketTech'}6008Brasilia62070503***6304`
    
    // Generar QR Code real
    const qrCodeDataURL = await QRCode.toDataURL(pixCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    return {
      qrCode: qrCodeDataURL,
      qrCodeText: pixCode,
      pixKey: globalProfile.pixKey,
      externalId: `pagseguro_${Date.now()}`
    }
  } catch (error) {
    console.error('❌ [PIX] Error con PagSeguro:', error)
    return null
  }
}

// Función para crear PIX con Stone
async function createStonePix(pixPayment: any, globalProfile: any) {
  try {
    console.log('🔄 [PIX] Creando PIX con Stone...')
    
    // Implementar integración con Stone
    // Por ahora, generar PIX estático con QR real
    const pixCode = `00020126580014br.gov.bcb.pix0114${globalProfile.pixKey}520400005303986540${pixPayment.amount.toFixed(2)}5802BR5913${globalProfile.companyName || 'MarketTech'}6008Brasilia62070503***6304`
    
    // Generar QR Code real
    const qrCodeDataURL = await QRCode.toDataURL(pixCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    return {
      qrCode: qrCodeDataURL,
      qrCodeText: pixCode,
      pixKey: globalProfile.pixKey,
      externalId: `stone_${Date.now()}`
    }
  } catch (error) {
    console.error('❌ [PIX] Error con Stone:', error)
    return null
  }
}

// Función para crear PIX estático (para otros proveedores)
async function createStaticPix(pixPayment: any, globalProfile: any) {
  try {
    console.log('🔄 [PIX] Creando PIX estático...')
    
    // Generar código PIX estático
    const pixCode = `00020126580014br.gov.bcb.pix0114${globalProfile.pixKey}520400005303986540${pixPayment.amount.toFixed(2)}5802BR5913${globalProfile.companyName || 'MarketTech'}6008Brasilia62070503***6304`
    
    // Generar QR Code real
    const qrCodeDataURL = await QRCode.toDataURL(pixCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    return {
      qrCode: qrCodeDataURL,
      qrCodeText: pixCode,
      pixKey: globalProfile.pixKey,
      externalId: `static_${Date.now()}`
    }
  } catch (error) {
    console.error('❌ [PIX] Error creando PIX estático:', error)
    return null
  }
}
