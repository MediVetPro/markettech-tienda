import { NextResponse } from 'next/server'

// Headers de seguridad estándar
export const securityHeaders = {
  // Prevenir XSS
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // Content Security Policy (CSP) básico
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Necesario para Next.js
    "style-src 'self' 'unsafe-inline'", // Necesario para Tailwind
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self'"
  ].join('; '),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (antes Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '),
  
  // Strict Transport Security (solo en HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin Policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
}

// Headers más estrictos para APIs
export const apiSecurityHeaders = {
  ...securityHeaders,
  
  // CSP más estricto para APIs
  'Content-Security-Policy': [
    "default-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'"
  ].join('; '),
  
  // No permitir embedding en APIs
  'X-Frame-Options': 'DENY',
  
  // Cache control para APIs
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}

// Headers para páginas estáticas
export const staticSecurityHeaders = {
  ...securityHeaders,
  
  // Cache control para assets estáticos
  'Cache-Control': 'public, max-age=31536000, immutable',
  
  // CSP más permisivo para páginas con contenido dinámico
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
}

// Función para aplicar headers de seguridad a una respuesta
export function applySecurityHeaders(response: NextResponse, type: 'api' | 'static' | 'default' = 'default'): NextResponse {
  const headers = type === 'api' ? apiSecurityHeaders : 
                 type === 'static' ? staticSecurityHeaders : 
                 securityHeaders
  
  // Aplicar cada header
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Función para crear respuesta con headers de seguridad
export function createSecureResponse(
  data: any, 
  status: number = 200, 
  type: 'api' | 'static' | 'default' = 'default'
): NextResponse {
  const response = NextResponse.json(data, { status })
  return applySecurityHeaders(response, type)
}

// Función para verificar si la request es HTTPS
export function isHttps(request: Request): boolean {
  const url = new URL(request.url)
  // No forzar HTTPS en localhost
  if (url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1')) {
    return false
  }
  
  const protocol = request.headers.get('x-forwarded-proto') || 
                   (request.url.startsWith('https://') ? 'https' : 'http')
  return protocol === 'https'
}

// Función para redirigir a HTTPS si es necesario
export function redirectToHttps(request: Request): NextResponse | null {
  if (!isHttps(request)) {
    const url = new URL(request.url)
    url.protocol = 'https:'
    return NextResponse.redirect(url.toString(), 301)
  }
  return null
}

// Headers específicos para diferentes tipos de contenido
export const contentTypeHeaders = {
  json: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  html: {
    'Content-Type': 'text/html; charset=utf-8'
  },
  text: {
    'Content-Type': 'text/plain; charset=utf-8'
  },
  image: {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'public, max-age=31536000'
  }
}

// Función para combinar headers de seguridad con headers de contenido
export function combineHeaders(securityType: 'api' | 'static' | 'default', contentType: keyof typeof contentTypeHeaders) {
  return {
    ...(securityType === 'api' ? apiSecurityHeaders : 
        securityType === 'static' ? staticSecurityHeaders : 
        securityHeaders),
    ...contentTypeHeaders[contentType]
  }
}
