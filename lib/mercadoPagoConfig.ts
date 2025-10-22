import { prisma } from './prisma'

export interface MercadoPagoConfig {
  accessToken: string
  publicKey: string
  webhookSecret: string
  isTestMode: boolean
  pixKey: string
  pixKeyType: string
}

/**
 * Obtener configuración de MercadoPago desde la base de datos
 */
export async function getMercadoPagoConfig(): Promise<MercadoPagoConfig | null> {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          startsWith: 'mercado_pago_'
        }
      }
    })

    if (configs.length === 0) {
      return null
    }

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

    // Validar que tenemos los campos mínimos
    if (!config.accessToken || !config.publicKey) {
      console.warn('⚠️ Configuração do MercadoPago incompleta')
      return null
    }

    return config as MercadoPagoConfig

  } catch (error) {
    console.error('❌ Error obteniendo configuración de MercadoPago:', error)
    return null
  }
}

/**
 * Verificar si la configuración de MercadoPago está completa
 */
export async function isMercadoPagoConfigured(): Promise<boolean> {
  const config = await getMercadoPagoConfig()
  return config !== null && 
         !!config.accessToken && 
         !!config.publicKey
}

/**
 * Obtener configuración de MercadoPago con fallback a variables de entorno
 */
export async function getMercadoPagoConfigWithFallback(): Promise<MercadoPagoConfig> {
  const dbConfig = await getMercadoPagoConfig()
  
  if (dbConfig) {
    return dbConfig
  }

  // Fallback a variables de entorno
  return {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
    isTestMode: process.env.MERCADOPAGO_TEST_MODE === 'true',
    pixKey: process.env.MERCADOPAGO_PIX_KEY || '',
    pixKeyType: process.env.MERCADOPAGO_PIX_KEY_TYPE || 'email'
  }
}
