import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-09-30.clover'
}) : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      console.log('⚠️ [STRIPE_WEBHOOK] Stripe no configurado, saltando webhook')
      return NextResponse.json({ error: 'Stripe no configurado' }, { status: 503 })
    }

    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('❌ [STRIPE_WEBHOOK] Firma no encontrada')
      return NextResponse.json({ error: 'Firma no encontrada' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('❌ [STRIPE_WEBHOOK] Error verificando webhook:', err)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    console.log('✅ [STRIPE_WEBHOOK] Webhook recibido:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break
      default:
        console.log(`ℹ️ [STRIPE_WEBHOOK] Evento no manejado: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ [STRIPE_WEBHOOK] Error procesando webhook:', error)
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('✅ [STRIPE_WEBHOOK] Pago exitoso:', paymentIntent.id)

    const payment = await prisma.payment.findFirst({
      where: { providerId: paymentIntent.id }
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date()
        }
      })

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' }
      })

      console.log(`✅ [STRIPE_WEBHOOK] Pago ${paymentIntent.id} actualizado exitosamente`)
    }

  } catch (error) {
    console.error('❌ [STRIPE_WEBHOOK] Error manejando pago exitoso:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('❌ [STRIPE_WEBHOOK] Pago fallido:', paymentIntent.id)

    const payment = await prisma.payment.findFirst({
      where: { providerId: paymentIntent.id }
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: paymentIntent.last_payment_error?.message || 'Pago fallido'
        }
      })

      console.log(`❌ [STRIPE_WEBHOOK] Pago ${paymentIntent.id} marcado como fallido`)
    }

  } catch (error) {
    console.error('❌ [STRIPE_WEBHOOK] Error manejando pago fallido:', error)
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('⚠️ [STRIPE_WEBHOOK] Pago cancelado:', paymentIntent.id)

    const payment = await prisma.payment.findFirst({
      where: { providerId: paymentIntent.id }
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CANCELLED'
        }
      })

      console.log(`⚠️ [STRIPE_WEBHOOK] Pago ${paymentIntent.id} marcado como cancelado`)
    }

  } catch (error) {
    console.error('❌ [STRIPE_WEBHOOK] Error manejando pago cancelado:', error)
  }
}
