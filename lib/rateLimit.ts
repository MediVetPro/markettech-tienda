import { NextRequest } from 'next/server'

// Store para rate limiting en memoria (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en ms
  maxRequests: number // Máximo de requests en la ventana
  message?: string // Mensaje de error personalizado
  skipSuccessfulRequests?: boolean // No contar requests exitosos
}

// Función para limpiar entradas expiradas
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, value] of Array.from(rateLimitStore.entries())) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Función principal de rate limiting
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): { allowed: boolean; remaining: number; resetTime: number; error?: string } => {
    // Limpiar entradas expiradas periódicamente
    if (Math.random() < 0.1) { // 10% de probabilidad de limpiar
      cleanupExpiredEntries()
    }

    // Obtener IP del cliente
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'

    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Obtener o crear entrada para esta IP
    let entry = rateLimitStore.get(key)
    
    if (!entry || now > entry.resetTime) {
      // Nueva ventana de tiempo
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }

    // Incrementar contador
    entry.count++
    rateLimitStore.set(key, entry)

    // Verificar si excede el límite
    if (entry.count > config.maxRequests) {
      return {
        allowed: false,
        remaining: Math.max(0, config.maxRequests - entry.count),
        resetTime: entry.resetTime,
        error: config.message || `Demasiadas solicitudes. Intenta de nuevo en ${Math.ceil((entry.resetTime - now) / 1000)} segundos.`
      }
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime
    }
  }
}

// Configuraciones predefinidas
export const rateLimitConfigs = {
  // Login: 20 intentos cada 15 minutos (desarrollo)
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 20,
    message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
  },
  
  // APIs generales: 200 requests cada 15 minutos (desarrollo)
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 200,
    message: 'Demasiadas solicitudes a la API. Intenta de nuevo en 15 minutos.'
  },
  
  // Uploads: 20 uploads cada 15 minutos (desarrollo)
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 20,
    message: 'Demasiados uploads. Intenta de nuevo en 15 minutos.'
  },
  
  // Registro: 10 intentos cada 15 minutos (desarrollo)
  register: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 10,
    message: 'Demasiados intentos de registro. Intenta de nuevo en 15 minutos.'
  }
}

// Middleware helper para usar en API routes
export function withRateLimit(config: RateLimitConfig) {
  return function(handler: (req: NextRequest) => Promise<Response>) {
    return async function(req: NextRequest): Promise<Response> {
      const rateLimiter = rateLimit(config)
      const result = rateLimiter(req)
      
      if (!result.allowed) {
        return new Response(
          JSON.stringify({ 
            error: result.error,
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }), 
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString()
            }
          }
        )
      }
      
      // Añadir headers informativos
      const response = await handler(req)
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
      
      return response
    }
  }
}
