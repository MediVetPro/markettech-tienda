import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getMercadoPagoConfigWithFallback } from './mercadoPagoConfig'

// Configuración de Mercado Pago (se inicializa dinámicamente)
let mercadoPagoConfig: MercadoPagoConfig | null = null
let payment: Payment | null = null

/**
 * Inicializar configuración de MercadoPago
 */
async function initializeMercadoPagoConfig() {
  if (mercadoPagoConfig && payment) {
    return { mercadoPagoConfig, payment }
  }

  try {
    const config = await getMercadoPagoConfigWithFallback()
    
    if (!config.accessToken) {
      throw new Error('MercadoPago access token não configurado')
    }

    mercadoPagoConfig = new MercadoPagoConfig({
      accessToken: config.accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    })

    payment = new Payment(mercadoPagoConfig)
    
    return { mercadoPagoConfig, payment }
  } catch (error) {
    console.error('❌ Error inicializando MercadoPago:', error)
    throw error
  }
}

export interface MercadoPagoPixData {
  qrCode: string
  qrCodeText: string
  externalId: string
  pixKey: string
}

export interface MercadoPagoPaymentData {
  transaction_amount: number
  description: string
  payment_method_id: 'pix'
  payer: {
    email: string
  }
  notification_url?: string
}

/**
 * Crear pago PIX con Mercado Pago
 */
export async function createMercadoPagoPixPayment(
  paymentData: MercadoPagoPaymentData,
  pixKey: string
): Promise<MercadoPagoPixData | null> {
  try {
    console.log('🔄 [MercadoPago] Creando pago PIX...')
    
    const { payment } = await initializeMercadoPagoConfig()
    
    const response = await payment.create({
      body: paymentData
    })

    if (!response) {
      throw new Error('No se pudo crear el pago')
    }

    // Extraer datos PIX de la respuesta
    const pixData = response.point_of_interaction?.transaction_data
    
    if (!pixData) {
      throw new Error('No se pudieron obtener los datos PIX')
    }

    const result: MercadoPagoPixData = {
      qrCode: pixData.qr_code || '',
      qrCodeText: pixData.qr_code_base64 || '',
      externalId: response.id?.toString() || '',
      pixKey: pixKey
    }

    console.log('✅ [MercadoPago] Pago PIX creado:', result.externalId)
    return result

  } catch (error) {
    console.error('❌ [MercadoPago] Error creando pago PIX:', error)
    return null
  }
}

/**
 * Verificar estado de pago en Mercado Pago
 */
export async function checkMercadoPagoPaymentStatus(
  paymentId: string
): Promise<{ status: string; paid: boolean } | null> {
  try {
    console.log('🔍 [MercadoPago] Verificando estado del pago:', paymentId)
    
    const { payment } = await initializeMercadoPagoConfig()
    
    const response = await payment.get({ id: paymentId })

    if (!response) {
      throw new Error('No se pudo obtener el pago')
    }

    const status = response.status || 'pending'
    const paid = status === 'approved'

    console.log('✅ [MercadoPago] Estado del pago:', { status, paid })
    return { status, paid }

  } catch (error) {
    console.error('❌ [MercadoPago] Error verificando pago:', error)
    return null
  }
}

/**
 * Validar webhook de Mercado Pago
 */
export function validateMercadoPagoWebhook(
  signature: string,
  body: string,
  secret: string
): boolean {
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    
    return signature === expectedSignature
  } catch (error) {
    console.error('❌ [MercadoPago] Error validando webhook:', error)
    return false
  }
}

export { initializeMercadoPagoConfig }
