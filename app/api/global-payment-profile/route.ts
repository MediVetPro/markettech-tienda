import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] GET /api/global-payment-profile - Iniciando...')
    
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

    // Verificar que el usuario sea administrador
    console.log('🔍 [API] Verificando usuario:', payload.userId)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, name: true }
    })

    console.log('🔍 [API] Usuario encontrado:', user)
    
    if (!user) {
      console.error('❌ [API] Usuario no encontrado')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { 
        status: 404,
        headers: corsHeaders
      })
    }
    
    if (user.role !== 'ADMIN') {
      console.error('❌ [API] Usuario no es admin, rol:', user.role)
      return NextResponse.json({ error: 'Acceso denegado - Se requiere rol de administrador' }, { 
        status: 403,
        headers: corsHeaders
      })
    }
    
    console.log('✅ [API] Usuario autorizado:', user.name, 'Rol:', user.role)

    // Buscar perfil de pago global activo
    const globalProfile = await prisma.globalPaymentProfile.findFirst({
      where: { isActive: true },
      include: {
        paymentMethods: true
      }
    })

    return NextResponse.json({ 
      profile: globalProfile,
      message: globalProfile ? 'Perfil cargado exitosamente' : 'No hay perfil de pago global configurado'
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching global payment profile:', error)
    return NextResponse.json({ error: 'Failed to fetch global payment profile' }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 [API] POST /api/global-payment-profile - Iniciando...')
    
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

    // Verificar que el usuario sea administrador
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { 
        status: 403,
        headers: corsHeaders
      })
    }

    const body = await request.json()
    console.log('📊 [API] Datos recibidos:', {
      companyName: body.companyName?.substring(0, 20) + '...',
      cnpj: body.cnpj,
      email: body.email,
      paymentMethodsCount: body.paymentMethods?.length || 0
    })
    
    const { 
      companyName, 
      cnpj, 
      email, 
      address, 
      city, 
      state, 
      zipCode, 
      country,
      bankName,
      bankCode,
      accountType,
      accountNumber,
      agencyNumber,
      accountHolder,
      // Campos PIX
      pixKey,
      pixKeyType,
      pixProvider,
      pixApiKey,
      pixWebhookUrl,
      paymentMethods
    } = body

    // Validar datos requeridos
    if (!companyName || !cnpj || !email || !address || !city || !state || !zipCode || 
        !bankName || !bankCode || !accountType || !accountNumber || !agencyNumber || !accountHolder) {
      console.error('❌ [API] Datos requeridos faltantes')
      return NextResponse.json({ 
        error: 'Faltan datos requeridos' 
      }, { 
        status: 400,
        headers: corsHeaders
      })
    }

    // Desactivar perfiles existentes
    await prisma.globalPaymentProfile.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    // Crear nuevo perfil global
    const globalProfile = await prisma.globalPaymentProfile.create({
      data: {
        companyName,
        cnpj,
        email,
        address,
        city,
        state,
        zipCode,
        country: country || 'Brasil',
        bankName,
        bankCode,
        accountType,
        accountNumber,
        agencyNumber,
        accountHolder,
        // Campos PIX
        pixKey,
        pixKeyType,
        pixProvider,
        pixApiKey,
        pixWebhookUrl,
        isActive: true,
        paymentMethods: {
          create: paymentMethods.map((method: any) => ({
            type: method.type,
            isActive: method.isActive,
            config: method.config ? JSON.stringify(method.config) : null
          }))
        }
      },
      include: {
        paymentMethods: true
      }
    })

    console.log('✅ [API] Perfil de pago global creado exitosamente')
    return NextResponse.json({ profile: globalProfile }, { 
      status: 201,
      headers: corsHeaders
    })
  } catch (error) {
    console.error('❌ [API] Error creating global payment profile:', error)
    console.error('❌ [API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    })
    
    return NextResponse.json({ 
      error: 'Failed to create global payment profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 [API] PUT /api/global-payment-profile - Iniciando...')
    
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

    // Verificar que el usuario sea administrador
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { 
        status: 403,
        headers: corsHeaders
      })
    }

    const body = await request.json()
    const { 
      id,
      companyName, 
      cnpj, 
      email, 
      address, 
      city, 
      state, 
      zipCode, 
      country,
      bankName,
      bankCode,
      accountType,
      accountNumber,
      agencyNumber,
      accountHolder,
      // Campos PIX
      pixKey,
      pixKeyType,
      pixProvider,
      pixApiKey,
      pixWebhookUrl,
      paymentMethods
    } = body

    // Actualizar perfil global
    const globalProfile = await prisma.globalPaymentProfile.update({
      where: { id },
      data: {
        companyName,
        cnpj,
        email,
        address,
        city,
        state,
        zipCode,
        country: country || 'Brasil',
        bankName,
        bankCode,
        accountType,
        accountNumber,
        agencyNumber,
        accountHolder,
        // Campos PIX
        pixKey,
        pixKeyType,
        pixProvider,
        pixApiKey,
        pixWebhookUrl
      }
    })

    // Actualizar métodos de pago
    if (paymentMethods) {
      // Eliminar métodos existentes
      await prisma.globalPaymentMethod.deleteMany({
        where: { globalPaymentProfileId: id }
      })

      // Crear nuevos métodos
      await prisma.globalPaymentMethod.createMany({
        data: paymentMethods.map((method: any) => ({
          globalPaymentProfileId: id,
          type: method.type,
          isActive: method.isActive,
          config: method.config ? JSON.stringify(method.config) : null
        }))
      })
    }

    const updatedProfile = await prisma.globalPaymentProfile.findUnique({
      where: { id },
      include: {
        paymentMethods: true
      }
    })

    console.log('✅ [API] Perfil de pago global actualizado exitosamente')
    return NextResponse.json({ profile: updatedProfile }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error updating global payment profile:', error)
    return NextResponse.json({ error: 'Failed to update global payment profile' }, { 
      status: 500,
      headers: corsHeaders
    })
  }
}
