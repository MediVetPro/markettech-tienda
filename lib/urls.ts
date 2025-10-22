/**
 * Utilidades para manejo de URLs dinámicas
 * Asegura que la aplicación funcione tanto en desarrollo como en producción
 */

/**
 * Obtiene la URL base de la aplicación
 * Funciona tanto en cliente como en servidor
 */
export function getBaseUrl(): string {
  // En el cliente
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // En el servidor, usar variable de entorno o fallback
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
}

/**
 * Genera una URL completa para una ruta
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Genera URLs para compartir productos
 */
export function getProductShareUrl(productId: string): string {
  return getFullUrl(`/products/${productId}`)
}

/**
 * Genera URLs para imágenes
 */
export function getImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  return getFullUrl(`/api/images${imagePath}`)
}

/**
 * Genera URLs para el panel de administración
 */
export function getAdminUrl(path: string = ''): string {
  return getFullUrl(`/admin${path.startsWith('/') ? path : `/${path}`}`)
}

/**
 * Verifica si estamos en desarrollo
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Verifica si estamos en producción
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
