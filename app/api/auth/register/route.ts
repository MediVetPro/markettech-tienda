import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signJWT } from '@/lib/jwt'
import { isLocationAllowed, GeographicRestrictions } from '@/lib/brazilianStates'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'
import { rateLimit, rateLimitConfigs } from '@/lib/rateLimit'
import { validateUserData } from '@/lib/validation'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function POST(request: NextRequest) {
  try {
    // Aplicar rate limiting para registro
    const rateLimiter = rateLimit(rateLimitConfigs.register)
    const rateLimitResult = rateLimiter(request)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.error,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429, 
          headers: {
            ...corsHeaders,
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimitConfigs.register.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      )
    }

    const body = await request.json()
    
    // Validar y sanitizar datos de entrada
    const validation = validateUserData(body)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: validation.errors
        },
        { status: 400, headers: corsHeaders }
      )
    }
    
    const sanitizedData = validation.sanitizedData!
    const { 
      name, 
      email, 
      phone, 
      cpf, 
      address, 
      city, 
      state, 
      zipCode
    } = sanitizedData
    
    const { 
      password, 
      birthDate, 
      gender, 
      country, 
      newsletter 
    } = body

    // Validar campos requeridos adicionales
    if (!password || !birthDate || !gender || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    // Validar contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verificar restricciones geográficas
    try {
      const restrictionsConfig = await prisma.siteConfig.findFirst({
        where: { key: 'geographic_restrictions' }
      })

      let restrictions: GeographicRestrictions = {
        enabled: false, // Deshabilitado para desarrollo
        type: 'none',
        allowedStates: [],
        allowedCities: []
      }

      if (restrictionsConfig) {
        try {
          restrictions = JSON.parse(restrictionsConfig.value)
        } catch (error) {
          console.error('Error parsing geographic restrictions:', error)
        }
      }

      // Validar ubicación si hay restricciones habilitadas
      if (restrictions.enabled && !isLocationAllowed(state, city, restrictions)) {
        let errorMessage = 'Registro no permitido en esta ubicación.'
        
        if (restrictions.type === 'state') {
          errorMessage = `El registro solo está permitido en los siguientes estados: ${restrictions.allowedStates.join(', ')}`
        } else if (restrictions.type === 'city') {
          errorMessage = `El registro solo está permitido en las siguientes ciudades: ${restrictions.allowedCities.join(', ')}`
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 400, headers: corsHeaders }
        )
      }
    } catch (error) {
      console.error('Error checking geographic restrictions:', error)
      // Continuar con el registro si hay error al verificar restricciones
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verificar si el CPF ya existe
    const existingCpf = await prisma.user.findFirst({
      where: { cpf }
    })

    if (existingCpf) {
      return NextResponse.json(
        { error: 'El CPF ya está registrado' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone,
        cpf: cpf,
        birthDate: new Date(birthDate).toISOString(),
        gender: gender,
        address: address,
        city: city,
        state: state,
        zipCode: zipCode,
        country: country || 'Brasil',
        newsletter: newsletter || false,
        role: 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        cpf: true,
        birthDate: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        newsletter: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Generar token JWT
    const token = signJWT({
      userId: newUser.id,
      role: newUser.role
    })

    console.log('✅ [AUTH] Registro exitoso para usuario:', newUser.email)
    console.log('✅ [AUTH] Token JWT generado')

    return NextResponse.json({
      user: newUser,
      token: token
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    )
  }
}