import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signJWT } from '@/lib/jwt'
import { corsHeaders, handleCorsOptions } from '@/lib/cors'
import { rateLimit, rateLimitConfigs } from '@/lib/rateLimit'
import { createSecureResponse } from '@/lib/securityHeaders'

// Manejar preflight requests para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions()
}

export async function POST(request: NextRequest) {
  try {
    // Aplicar rate limiting para login
    const rateLimiter = rateLimit(rateLimitConfigs.login)
    const rateLimitResult = rateLimiter(request)
    
    if (!rateLimitResult.allowed) {
      const response = createSecureResponse(
        { 
          error: rateLimitResult.error,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        429,
        'api'
      )
      
      // Añadir headers de rate limiting
      response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString())
      response.headers.set('X-RateLimit-Limit', rateLimitConfigs.login.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
      
      // Añadir CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      const response = createSecureResponse(
        { error: 'Email y contraseña son requeridos' },
        400,
        'api'
      )
      
      // Añadir CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        password: true,
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

    if (!user) {
      const response = createSecureResponse(
        { error: 'Credenciales inválidas' },
        401,
        'api'
      )
      
      // Añadir CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      const response = createSecureResponse(
        { error: 'Credenciales inválidas' },
        401,
        'api'
      )
      
      // Añadir CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    }

    // Actualizar último acceso
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
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
        updatedAt: true,
        lastLoginAt: true
      }
    })

    // Remover la contraseña del objeto de respuesta
    const userWithoutPassword = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      cpf: updatedUser.cpf,
      birthDate: updatedUser.birthDate,
      gender: updatedUser.gender,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      zipCode: updatedUser.zipCode,
      country: updatedUser.country,
      newsletter: updatedUser.newsletter,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastLoginAt: updatedUser.lastLoginAt
    }

    // Generar token JWT
    const token = signJWT({
      userId: user.id,
      role: user.role
    })

    console.log('✅ [AUTH] Login exitoso para usuario:', user.email)
    console.log('✅ [AUTH] Token JWT generado')

    const response = createSecureResponse({
      user: userWithoutPassword,
      token: token
    }, 200, 'api')
    
    // Añadir CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  } catch (error) {
    console.error('Error during login:', error)
    const response = createSecureResponse(
      { error: 'Error interno del servidor' },
      500,
      'api'
    )
    
    // Añadir CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
}