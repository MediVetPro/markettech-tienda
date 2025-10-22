import Stripe from 'stripe'
import { prisma } from './prisma'

// Configurar Stripe solo si la API key está disponible
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-09-30.clover'
}) : null

export interface PaymentIntentData {
  amount: number
  currency: string
  orderId: string
  userId: string
  paymentMethodId?: string
  metadata?: any
}

export interface PaymentMethodData {
  userId: string
  provider: string
  providerId: string
  type: string
  last4?: string
  brand?: string
  expMonth?: number
  expYear?: number
  metadata?: any
}

// Crear Payment Intent con Stripe
export async function createPaymentIntent(data: PaymentIntentData) {
  try {
    console.log('💳 [PAYMENT] Creando Payment Intent para orden:', data.orderId)

    if (!stripe) {
      console.log('⚠️ [PAYMENT] Stripe no configurado, saltando creación de Payment Intent')
      return {
        success: false,
        error: 'Stripe no está configurado'
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convertir a centavos
      currency: data.currency.toLowerCase(),
      metadata: {
        orderId: data.orderId,
        userId: data.userId,
        ...data.metadata
      },
      payment_method: data.paymentMethodId,
      confirmation_method: 'manual',
      confirm: false
    })

    // Guardar pago en la base de datos
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        status: 'PENDING',
        paymentMethod: 'STRIPE',
        provider: 'stripe',
        providerId: paymentIntent.id,
        providerData: JSON.stringify(paymentIntent)
      }
    })

    console.log(`✅ [PAYMENT] Payment Intent creado: ${paymentIntent.id}`)

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
      },
      payment: {
        id: payment.id,
        status: payment.status
      }
    }

  } catch (error) {
    console.error('❌ [PAYMENT] Error creando Payment Intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Confirmar Payment Intent
export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    console.log('💳 [PAYMENT] Confirmando Payment Intent:', paymentIntentId)

    if (!stripe) {
      console.log('⚠️ [PAYMENT] Stripe no configurado, saltando confirmación')
      return {
        success: false,
        error: 'Stripe no está configurado'
      }
    }

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)

    // Actualizar pago en la base de datos
    const payment = await prisma.payment.updateMany({
      where: { providerId: paymentIntentId },
      data: {
        status: paymentIntent.status.toUpperCase(),
        providerData: JSON.stringify(paymentIntent),
        processedAt: new Date(),
        transactionId: paymentIntent.latest_charge as string
      }
    })

    // Si el pago fue exitoso, actualizar el estado de la orden
    if (paymentIntent.status === 'succeeded') {
      const paymentRecord = await prisma.payment.findFirst({
        where: { providerId: paymentIntentId },
        select: { orderId: true }
      })

      if (paymentRecord) {
        await prisma.order.update({
          where: { id: paymentRecord.orderId },
          data: { status: 'CONFIRMED' }
        })
      }
    }

    console.log(`✅ [PAYMENT] Payment Intent confirmado: ${paymentIntent.status}`)

    return {
      success: true,
      status: paymentIntent.status,
      paymentIntent
    }

  } catch (error) {
    console.error('❌ [PAYMENT] Error confirmando Payment Intent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Crear método de pago
export async function createPaymentMethod(data: PaymentMethodData) {
  try {
    console.log('💳 [PAYMENT_METHOD] Creando método de pago para usuario:', data.userId)

    // Desactivar otros métodos por defecto si este es el nuevo por defecto
    if (data.metadata?.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { 
          userId: data.userId,
          isDefault: true
        },
        data: { isDefault: false }
      })
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: data.userId,
        provider: data.provider,
        providerId: data.providerId,
        type: data.type,
        last4: data.last4,
        brand: data.brand,
        expMonth: data.expMonth,
        expYear: data.expYear,
        isDefault: data.metadata?.isDefault || false,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    })

    console.log(`✅ [PAYMENT_METHOD] Método de pago creado: ${paymentMethod.id}`)

    return {
      success: true,
      paymentMethod
    }

  } catch (error) {
    console.error('❌ [PAYMENT_METHOD] Error creando método de pago:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Obtener métodos de pago del usuario
export async function getUserPaymentMethods(userId: string) {
  try {
    console.log('💳 [PAYMENT_METHODS] Obteniendo métodos de pago para usuario:', userId)

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId,
        isActive: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return {
      success: true,
      paymentMethods
    }

  } catch (error) {
    console.error('❌ [PAYMENT_METHODS] Error obteniendo métodos de pago:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Procesar reembolso
export async function processRefund(paymentId: string, amount?: number, reason?: string) {
  try {
    console.log('💳 [REFUND] Procesando reembolso para pago:', paymentId)

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        providerId: true,
        amount: true,
        status: true
      }
    })

    if (!payment) {
      return {
        success: false,
        error: 'Pago no encontrado'
      }
    }

    if (payment.status !== 'COMPLETED') {
      return {
        success: false,
        error: 'Solo se pueden reembolsar pagos completados'
      }
    }

    if (!stripe) {
      return {
        success: false,
        error: 'Stripe no está configurado'
      }
    }

    // Crear reembolso en Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.providerId as string,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || 'requested_by_customer'
    } as any)

    // Actualizar pago en la base de datos
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        refundAmount: amount || payment.amount,
        refundReason: reason,
        refundedAt: new Date()
      }
    })

    console.log(`✅ [REFUND] Reembolso procesado: ${refund.id}`)

    return {
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    }

  } catch (error) {
    console.error('❌ [REFUND] Error procesando reembolso:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Obtener historial de pagos
export async function getPaymentHistory(userId: string, page: number = 1, limit: number = 20) {
  try {
    console.log('💳 [PAYMENT_HISTORY] Obteniendo historial para usuario:', userId)

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.payment.count({ where: { userId } })
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNextPage,
        hasPrevPage
      }
    }

  } catch (error) {
    console.error('❌ [PAYMENT_HISTORY] Error obteniendo historial:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Webhook de Stripe
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    console.log('🔔 [WEBHOOK] Procesando webhook de Stripe:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute)
        break
      
      default:
        console.log(`⚠️ [WEBHOOK] Evento no manejado: ${event.type}`)
    }

    return { success: true }

  } catch (error) {
    console.error('❌ [WEBHOOK] Error procesando webhook:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  await prisma.payment.updateMany({
    where: { providerId: paymentIntent.id },
    data: {
      status: 'COMPLETED',
      processedAt: new Date(),
      transactionId: paymentIntent.latest_charge as string
    }
  })

  // Actualizar orden
  const payment = await prisma.payment.findFirst({
    where: { providerId: paymentIntent.id },
    select: { orderId: true }
  })

  if (payment) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CONFIRMED' }
    })
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  await prisma.payment.updateMany({
    where: { providerId: paymentIntent.id },
    data: {
      status: 'FAILED',
      failureReason: paymentIntent.last_payment_error?.message || 'Pago fallido'
    }
  })
}

async function handleChargeDispute(dispute: Stripe.Dispute) {
  console.log('⚠️ [DISPUTE] Disputa creada:', dispute.id)
  // Implementar lógica de disputa
}
