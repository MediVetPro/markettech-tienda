import { NextRequest, NextResponse } from 'next/server'
import { securityHeaders, redirectToHttps } from '@/lib/securityHeaders'
import { corsHeaders } from '@/lib/cors'

export function middleware(request: NextRequest) {
  // No aplicar redirección HTTPS en localhost
  if (request.nextUrl.hostname.includes('localhost') || 
      request.nextUrl.hostname.includes('127.0.0.1')) {
    // En localhost, solo aplicar headers de CORS para APIs
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const response = NextResponse.next()
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }
    // Para páginas en localhost, no aplicar headers de seguridad que causen problemas
    return NextResponse.next()
  }

  // Crear respuesta
  const response = NextResponse.next()

  // Aplicar headers de seguridad según el tipo de ruta
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Headers para APIs (sin headers que bloqueen CORS)
    const safeHeaders = { ...securityHeaders }
    delete (safeHeaders as any)['Cross-Origin-Resource-Policy']
    delete (safeHeaders as any)['Cross-Origin-Embedder-Policy']
    delete (safeHeaders as any)['Cross-Origin-Opener-Policy']
    
    Object.entries(safeHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Headers adicionales para APIs
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
  } else {
    // Headers para páginas
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

// Configurar qué rutas deben pasar por el middleware
export const config = {
  matcher: [
    /*
     * Aplicar a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - public folder (archivos públicos)
     */
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
