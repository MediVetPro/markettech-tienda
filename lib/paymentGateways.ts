import Stripe from 'stripe'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { Client, Environment } from 'squareup'
import Razorpay from 'razorpay'
import { prisma } from './prisma'

// Configuración de Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover'
    })
  : null

// Configuración de Mercado Pago
const mercadoPago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
})

// Configuración de Square
const squareClient = process.env.SQUARE_ACCESS_TOKEN ? new Client({
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN
}) : null

// Configuración de Razorpay
const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null

export interface PaymentGatewayConfig {
  name: string
  displayName: string
  isEnabled: boolean
  supportedCurrencies: string[]
  supportedCountries: string[]
  fees: {
    percentage: number
    fixed: number
  }
  features: string[]
}

export interface PaymentRequest {
  amount: number
  currency: string
  orderId: string
  userId: string
  gateway: string
  customerInfo: {
    email: string
    name: string
    phone?: string
  }
  metadata?: any
}

export interface PaymentResponse {
  success: boolean
  gateway: string
  transactionId?: string
  paymentUrl?: string
  clientSecret?: string
  error?: string
  metadata?: any
}

// Configuración de pasarelas disponibles
export const PAYMENT_GATEWAYS: Record<string, PaymentGatewayConfig> = {
  stripe: {
    name: 'stripe',
    displayName: 'Stripe',
    isEnabled: !!process.env.STRIPE_SECRET_KEY,
    supportedCurrencies: ['USD', 'EUR', 'MXN', 'CAD', 'GBP'],
    supportedCountries: ['US', 'CA', 'MX', 'GB', 'EU'],
    fees: { percentage: 2.9, fixed: 0.30 },
    features: ['cards', 'bank_transfers', 'digital_wallets', 'recurring']
  },
  paypal: {
    name: 'paypal',
    displayName: 'PayPal',
    isEnabled: !!process.env.PAYPAL_CLIENT_ID,
    supportedCurrencies: ['USD', 'EUR', 'MXN', 'CAD', 'GBP'],
    supportedCountries: ['US', 'CA', 'MX', 'GB', 'EU'],
    fees: { percentage: 3.4, fixed: 0.35 },
    features: ['paypal', 'cards', 'bank_transfers', 'recurring']
  },
  mercadopago: {
    name: 'mercadopago',
    displayName: 'Mercado Pago',
    isEnabled: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    supportedCurrencies: ['USD', 'MXN', 'BRL', 'ARS', 'CLP'],
    supportedCountries: ['MX', 'BR', 'AR', 'CL', 'CO'],
    fees: { percentage: 3.99, fixed: 0.00 },
    features: ['cards', 'bank_transfers', 'cash', 'digital_wallets']
  },
  square: {
    name: 'square',
    displayName: 'Square',
    isEnabled: !!process.env.SQUARE_ACCESS_TOKEN,
    supportedCurrencies: ['USD', 'CAD', 'GBP', 'AUD'],
    supportedCountries: ['US', 'CA', 'GB', 'AU'],
    fees: { percentage: 2.9, fixed: 0.30 },
    features: ['cards', 'digital_wallets', 'gift_cards']
  },
  razorpay: {
    name: 'razorpay',
    displayName: 'Razorpay',
    isEnabled: !!process.env.RAZORPAY_KEY_ID,
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
    supportedCountries: ['IN', 'US', 'EU', 'GB'],
    fees: { percentage: 2.0, fixed: 0.00 },
    features: ['cards', 'netbanking', 'upi', 'wallets', 'recurring']
  }
}

// Obtener pasarelas disponibles
export function getAvailableGateways(): PaymentGatewayConfig[] {
  return Object.values(PAYMENT_GATEWAYS).filter(gateway => gateway.isEnabled)
}

// Obtener pasarela recomendada para un país/moneda
export function getRecommendedGateway(country: string, currency: string): string {
  const availableGateways = getAvailableGateways()
  
  // Buscar pasarela que soporte el país y moneda
  const suitableGateways = availableGateways.filter(gateway => 
    gateway.supportedCountries.includes(country) && 
    gateway.supportedCurrencies.includes(currency)
  )
  
  if (suitableGateways.length === 0) {
    return availableGateways[0]?.name || 'stripe'
  }
  
  // Retornar la pasarela con menores comisiones
  return suitableGateways.sort((a, b) => a.fees.percentage - b.fees.percentage)[0].name
}

// Procesar pago con Stripe
async function processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log('💳 [STRIPE] Procesando pago:', request.orderId)

    if (!stripe) {
      return {
        success: false,
        gateway: 'stripe',
        error: 'Stripe no está configurado. Configura STRIPE_SECRET_KEY'
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100),
      currency: request.currency.toLowerCase(),
      metadata: {
        orderId: request.orderId,
        userId: request.userId,
        ...request.metadata
      }
    })

    return {
      success: true,
      gateway: 'stripe',
      transactionId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
      metadata: { paymentIntent }
    }

  } catch (error) {
    console.error('❌ [STRIPE] Error procesando pago:', error)
    return {
      success: false,
      gateway: 'stripe',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Procesar pago con PayPal
async function processPayPalPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log('💳 [PAYPAL] Procesando pago:', request.orderId)

    // En una implementación real, aquí usarías el SDK de PayPal
    // Por ahora, simulamos la creación de un pago
    const paymentData = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      transactions: [{
        amount: {
          total: request.amount.toFixed(2),
          currency: request.currency
        },
        description: `Pago para orden ${request.orderId}`,
        custom: request.orderId
      }],
      redirect_urls: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`
      }
    }

    // Simular respuesta de PayPal
    const paymentId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const approvalUrl = `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=${paymentId}`

    return {
      success: true,
      gateway: 'paypal',
      transactionId: paymentId,
      paymentUrl: approvalUrl,
      metadata: { paymentData }
    }

  } catch (error) {
    console.error('❌ [PAYPAL] Error procesando pago:', error)
    return {
      success: false,
      gateway: 'paypal',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Procesar pago con Mercado Pago
async function processMercadoPagoPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log('💳 [MERCADOPAGO] Procesando pago:', request.orderId)

    const preference = new Preference(mercadoPago)

    const preferenceData = {
      items: [{
        id: request.orderId,
        title: `Orden ${request.orderId}`,
        quantity: 1,
        unit_price: request.amount,
        currency_id: request.currency
      }],
      payer: {
        name: request.customerInfo.name,
        email: request.customerInfo.email,
        phone: request.customerInfo.phone ? {
          number: request.customerInfo.phone
        } : undefined
      },
      external_reference: request.orderId,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/pending`
      },
      auto_return: 'approved'
    }

    const result = await preference.create({ body: preferenceData })

    return {
      success: true,
      gateway: 'mercadopago',
      transactionId: result.id,
      paymentUrl: result.init_point,
      metadata: { preference: result }
    }

  } catch (error) {
    console.error('❌ [MERCADOPAGO] Error procesando pago:', error)
    return {
      success: false,
      gateway: 'mercadopago',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Procesar pago con Square
async function processSquarePayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log('💳 [SQUARE] Procesando pago:', request.orderId)

    if (!squareClient) {
      return {
        success: false,
        gateway: 'square',
        error: 'Square no está configurado. Configura SQUARE_ACCESS_TOKEN'
      }
    }

    const { paymentsApi } = squareClient

    const paymentRequest = {
      sourceId: 'cnon:card-nonce-ok', // En producción, esto vendría del frontend
      idempotencyKey: `${request.orderId}_${Date.now()}`,
      amountMoney: {
        amount: BigInt(Math.round(request.amount * 100)),
        currency: request.currency
      },
      note: `Pago para orden ${request.orderId}`,
      referenceId: request.orderId
    }

    const { result } = await paymentsApi.createPayment(paymentRequest)

    return {
      success: true,
      gateway: 'square',
      transactionId: result.payment?.id,
      metadata: { payment: result.payment }
    }

  } catch (error) {
    console.error('❌ [SQUARE] Error procesando pago:', error)
    return {
      success: false,
      gateway: 'square',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Procesar pago con Razorpay
async function processRazorpayPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log('💳 [RAZORPAY] Procesando pago:', request.orderId)

    if (!razorpay) {
      return {
        success: false,
        gateway: 'razorpay',
        error: 'Razorpay no está configurado. Configura RAZORPAY_KEY_ID y RAZORPAY_KEY_SECRET'
      }
    }

    const options = {
      amount: Math.round(request.amount * 100), // Razorpay usa paise
      currency: request.currency,
      receipt: request.orderId,
      notes: {
        orderId: request.orderId,
        userId: request.userId
      }
    }

    const order = await razorpay.orders.create(options)

    return {
      success: true,
      gateway: 'razorpay',
      transactionId: order.id,
      metadata: { order }
    }

  } catch (error) {
    console.error('❌ [RAZORPAY] Error procesando pago:', error)
    return {
      success: false,
      gateway: 'razorpay',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Procesar pago con la pasarela especificada
export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log('💳 [PAYMENT] Procesando pago con pasarela:', request.gateway)

    // Validar que la pasarela esté disponible
    const gateway = PAYMENT_GATEWAYS[request.gateway]
    if (!gateway || !gateway.isEnabled) {
      return {
        success: false,
        gateway: request.gateway,
        error: 'Pasarela de pago no disponible'
      }
    }

    // Validar moneda soportada
    if (!gateway.supportedCurrencies.includes(request.currency)) {
      return {
        success: false,
        gateway: request.gateway,
        error: `Moneda ${request.currency} no soportada por ${gateway.displayName}`
      }
    }

    // Procesar pago según la pasarela
    let response: PaymentResponse

    switch (request.gateway) {
      case 'stripe':
        response = await processStripePayment(request)
        break
      case 'paypal':
        response = await processPayPalPayment(request)
        break
      case 'mercadopago':
        response = await processMercadoPagoPayment(request)
        break
      case 'square':
        response = await processSquarePayment(request)
        break
      case 'razorpay':
        response = await processRazorpayPayment(request)
        break
      default:
        return {
          success: false,
          gateway: request.gateway,
          error: 'Pasarela de pago no implementada'
        }
    }

    // Guardar pago en la base de datos
    if (response.success) {
      await prisma.payment.create({
        data: {
          orderId: request.orderId,
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          status: 'PENDING',
          paymentMethod: request.gateway.toUpperCase(),
          provider: request.gateway,
          providerId: response.transactionId,
          providerData: JSON.stringify(response.metadata)
        }
      })
    }

    return response

  } catch (error) {
    console.error('❌ [PAYMENT] Error procesando pago:', error)
    return {
      success: false,
      gateway: request.gateway,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Confirmar pago
export async function confirmPayment(gateway: string, transactionId: string): Promise<PaymentResponse> {
  try {
    console.log('💳 [CONFIRM] Confirmando pago:', transactionId)

    // Buscar pago en la base de datos
    const payment = await prisma.payment.findFirst({
      where: {
        provider: gateway,
        providerId: transactionId
      }
    })

    if (!payment) {
      return {
        success: false,
        gateway,
        error: 'Pago no encontrado'
      }
    }

    // Confirmar según la pasarela
    let confirmed = false

    switch (gateway) {
      case 'stripe':
        if (!stripe) {
          confirmed = false
        } else {
          const stripePayment = await stripe.paymentIntents.retrieve(transactionId)
          confirmed = stripePayment.status === 'succeeded'
        }
        break
      case 'paypal':
        // En producción, verificarías el estado del pago con PayPal
        confirmed = true
        break
      case 'mercadopago':
        const mpPayment = new Payment(mercadoPago)
        const mpResult = await mpPayment.get({ id: transactionId })
        confirmed = mpResult.status === 'approved'
        break
      case 'square':
        if (!squareClient) {
          confirmed = false
        } else {
          const { paymentsApi } = squareClient
          const squareResult = await paymentsApi.getPayment(transactionId)
          confirmed = squareResult.result.payment?.status === 'COMPLETED'
        }
        break
      case 'razorpay':
        if (!razorpay) {
          confirmed = false
        } else {
          const razorpayPayment = await razorpay.payments.fetch(transactionId)
          confirmed = razorpayPayment.status === 'captured'
        }
        break
    }

    if (confirmed) {
      // Actualizar pago en la base de datos
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date()
        }
      })

      // Actualizar orden
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' }
      })
    }

    return {
      success: confirmed,
      gateway,
      transactionId,
      metadata: { confirmed }
    }

  } catch (error) {
    console.error('❌ [CONFIRM] Error confirmando pago:', error)
    return {
      success: false,
      gateway,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Obtener historial de pagos por pasarela
export async function getPaymentHistoryByGateway(gateway: string, userId: string) {
  try {
    console.log('💳 [HISTORY] Obteniendo historial de pagos para pasarela:', gateway)

    const payments = await prisma.payment.findMany({
      where: {
        userId,
        provider: gateway
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      payments,
      gateway
    }

  } catch (error) {
    console.error('❌ [HISTORY] Error obteniendo historial:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Obtener estadísticas de pasarelas
export async function getGatewayStats() {
  try {
    console.log('💳 [STATS] Obteniendo estadísticas de pasarelas')

    const stats = await prisma.payment.groupBy({
      by: ['provider'],
      _count: { id: true },
      _sum: { amount: true },
      _avg: { amount: true }
    })

    const gatewayStats = stats.map(stat => ({
      gateway: stat.provider,
      totalPayments: stat._count.id,
      totalAmount: parseFloat(stat._sum.amount?.toString() || '0'),
      averageAmount: parseFloat(stat._avg.amount?.toString() || '0')
    }))

    return {
      success: true,
      stats: gatewayStats
    }

  } catch (error) {
    console.error('❌ [STATS] Error obteniendo estadísticas:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}
