import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('✅ [MERCADOPAGO_WEBHOOK] Webhook recibido:', body.type)

    switch (body.type) {
      case 'payment':
        await handlePayment(body.data)
        break
      case 'preference':
        await handlePreference(body.data)
        break
      default:
        console.log(`ℹ️ [MERCADOPAGO_WEBHOOK] Evento no manejado: ${body.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ [MERCADOPAGO_WEBHOOK] Error procesando webhook:', error)
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}

async function handlePayment(data: any) {
  try {
    console.log('💳 [MERCADOPAGO_WEBHOOK] Procesando pago:', data.id)

    const payment = await prisma.payment.findFirst({
      where: { providerId: data.id }
    })

    if (payment) {
      let status = 'PENDING'
      let failureReason = null

      switch (data.status) {
        case 'approved':
          status = 'COMPLETED'
          break
        case 'rejected':
          status = 'FAILED'
          failureReason = 'Pago rechazado por Mercado Pago'
          break
        case 'cancelled':
          status = 'CANCELLED'
          break
        case 'pending':
          status = 'PENDING'
          break
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          failureReason,
          processedAt: status === 'COMPLETED' ? new Date() : undefined
        }
      })

      if (status === 'COMPLETED') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'CONFIRMED' }
        })
      }

      console.log(`✅ [MERCADOPAGO_WEBHOOK] Pago ${data.id} actualizado: ${status}`)
    }

  } catch (error) {
    console.error('❌ [MERCADOPAGO_WEBHOOK] Error manejando pago:', error)
  }
}

async function handlePreference(data: any) {
  try {
    console.log('⚙️ [MERCADOPAGO_WEBHOOK] Procesando preferencia:', data.id)

    // Aquí podrías manejar eventos relacionados con preferencias
    // como cuando se crea una preferencia o se actualiza

  } catch (error) {
    console.error('❌ [MERCADOPAGO_WEBHOOK] Error manejando preferencia:', error)
  }
}
