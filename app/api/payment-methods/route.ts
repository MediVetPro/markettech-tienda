import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] GET /api/payment-methods - Obteniendo métodos de pago habilitados...')
    
    // Buscar perfil de pago global activo
    const globalProfile = await prisma.globalPaymentProfile.findFirst({
      where: { isActive: true },
      include: {
        paymentMethods: {
          where: { isActive: true }
        }
      }
    })

    // Siempre incluir la opción "Directo con el vendedor" al inicio
    const directSellerOption = {
      id: 'direct-seller',
      type: 'DIRECT_SELLER',
      name: 'Directo con el vendedor',
      description: 'No se le cobrará hasta recibir el producto después de hablar con el vendedor',
      processingTime: 'Coordinado con vendedor',
      fee: 'Sin comisión',
      available: true,
      isDirectSeller: true
    }

    if (!globalProfile) {
      console.log('⚠️ [API] No hay perfil de pago global configurado, usando solo opción directa')
      // Si no hay configuración, devolver solo la opción directa
      return NextResponse.json({ 
        paymentMethods: [directSellerOption]
      }, { headers: corsHeaders })
    }

    // Mapear los métodos de pago habilitados a la estructura del frontend
    const enabledMethods = globalProfile.paymentMethods.map(method => {
      const methodConfig = {
        id: method.type.toLowerCase(),
        type: method.type,
        name: getPaymentMethodName(method.type),
        description: getPaymentMethodDescription(method.type),
        processingTime: getProcessingTime(method.type),
        fee: getFee(method.type),
        available: method.isActive
      }
      return methodConfig
    })

    // Combinar la opción directa con los métodos configurados
    const allMethods = [directSellerOption, ...enabledMethods]
    
    console.log('✅ [API] Métodos de pago habilitados:', allMethods.map(m => m.type).join(', '))
    
    return NextResponse.json({ 
      paymentMethods: allMethods
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('❌ [API] Error fetching payment methods:', error)
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

function getPaymentMethodName(type: string): string {
  switch (type) {
    case 'PIX':
      return 'PIX'
    case 'CREDIT_CARD':
      return 'Tarjeta de Crédito'
    case 'DEBIT_CARD':
      return 'Tarjeta de Débito'
    case 'BOLETO':
      return 'Boleto Bancario'
    case 'BANK_TRANSFER':
      return 'Transferencia Bancaria'
    default:
      return type
  }
}

function getPaymentMethodDescription(type: string): string {
  switch (type) {
    case 'PIX':
      return 'Pago instantáneo y seguro'
    case 'CREDIT_CARD':
      return 'Visa, Mastercard, American Express'
    case 'DEBIT_CARD':
      return 'Débito en línea'
    case 'BOLETO':
      return 'Pago en efectivo'
    case 'BANK_TRANSFER':
      return 'Transferencia directa'
    default:
      return 'Método de pago'
  }
}

function getProcessingTime(type: string): string {
  switch (type) {
    case 'PIX':
      return 'Instantáneo'
    case 'CREDIT_CARD':
      return '2-3 días'
    case 'DEBIT_CARD':
      return '1-2 días'
    case 'BOLETO':
      return '1-3 días'
    case 'BANK_TRANSFER':
      return '1-3 días'
    default:
      return '1-3 días'
  }
}

function getFee(type: string): string {
  switch (type) {
    case 'PIX':
      return 'Sin comisión'
    case 'CREDIT_CARD':
      return '2.9% + R$ 0.39'
    case 'DEBIT_CARD':
      return '1.9% + R$ 0.39'
    case 'BOLETO':
      return 'Sin comisión'
    case 'BANK_TRANSFER':
      return 'Sin comisión'
    default:
      return 'Sin comisión'
  }
}
