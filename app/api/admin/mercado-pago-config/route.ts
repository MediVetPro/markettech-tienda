import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyJWT(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener configuración de MercadoPago
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          startsWith: 'mercado_pago_'
        }
      }
    })

    // Convertir array a objeto
    const config: any = {}
    configs.forEach(item => {
      const key = item.key.replace('mercado_pago_', '')
      if (item.type === 'boolean') {
        config[key] = item.value === 'true'
      } else {
        config[key] = item.value
      }
    })

    return NextResponse.json({ config })

  } catch (error) {
    console.error('Error obteniendo configuración de MercadoPago:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyJWT(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { config } = await request.json()

    if (!config) {
      return NextResponse.json({ error: 'Configuración requerida' }, { status: 400 })
    }

    // Validar campos requeridos
    if (!config.accessToken || !config.publicKey) {
      return NextResponse.json({ 
        error: 'Access Token e Chave Pública são obrigatórios' 
      }, { status: 400 })
    }

    // Guardar configuración en la base de datos
    const configEntries = [
      { key: 'mercado_pago_access_token', value: config.accessToken, type: 'text' },
      { key: 'mercado_pago_public_key', value: config.publicKey, type: 'text' },
      { key: 'mercado_pago_webhook_secret', value: config.webhookSecret || '', type: 'text' },
      { key: 'mercado_pago_is_test_mode', value: config.isTestMode ? 'true' : 'false', type: 'boolean' },
      { key: 'mercado_pago_pix_key', value: config.pixKey || '', type: 'text' },
      { key: 'mercado_pago_pix_key_type', value: config.pixKeyType || 'email', type: 'text' }
    ]

    // Usar transacción para asegurar consistencia
    await prisma.$transaction(async (tx) => {
      for (const entry of configEntries) {
        await tx.siteConfig.upsert({
          where: { key: entry.key },
          update: { 
            value: entry.value,
            type: entry.type,
            updatedAt: new Date()
          },
          create: {
            key: entry.key,
            value: entry.value,
            type: entry.type
          }
        })
      }
    })

    console.log('✅ Configuração do MercadoPago salva com sucesso')

    return NextResponse.json({ 
      message: 'Configuração salva com sucesso',
      config 
    })

  } catch (error) {
    console.error('Error salvando configuración de MercadoPago:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
