// Sistema de caché simple en memoria
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
    this.startCleanup()
  }

  // Obtener datos del caché
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  // Guardar datos en el caché
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // 5 minutos por defecto
    // Si el caché está lleno, eliminar la entrada más antigua
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Eliminar entrada específica
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Limpiar todo el caché
  clear(): void {
    this.cache.clear()
  }

  // Obtener estadísticas del caché
  getStats() {
    const now = Date.now()
    let expired = 0
    let valid = 0
    
    for (const entry of Array.from(this.cache.values())) {
      if (now - entry.timestamp > entry.ttl) {
        expired++
      } else {
        valid++
      }
    }
    
    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.maxSize
    }
  }

  // Iniciar limpieza automática
  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000) // Limpiar cada minuto
  }

  // Limpiar entradas expiradas
  private cleanup() {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key))
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 [CACHE] Limpiadas ${keysToDelete.length} entradas expiradas`)
    }
  }

  // Detener limpieza automática
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Instancia global del caché
export const cache = new MemoryCache(1000) // Máximo 1000 entradas

// Funciones helper para caché
export const cacheHelpers = {
  // Generar clave de caché para productos
  productKey: (id: string) => `product:${id}`,
  
  // Generar clave de caché para lista de productos
  productsListKey: (page: number, limit: number, filters: any) => 
    `products:list:${page}:${limit}:${JSON.stringify(filters)}`,
  
  // Generar clave de caché para búsqueda
  searchKey: (term: string, filters: any, page: number, limit: number) => 
    `search:${term}:${JSON.stringify(filters)}:${page}:${limit}`,
  
  // Generar clave de caché para órdenes del usuario
  userOrdersKey: (userId: string, page: number, limit: number) => 
    `user:orders:${userId}:${page}:${limit}`,
  
  // Generar clave de caché para carrito
  cartKey: (userId: string) => `cart:${userId}`,
  
  // Generar clave de caché para estadísticas
  statsKey: (type: string) => `stats:${type}`
}

// Función para invalidar caché relacionado
export function invalidateRelatedCache(pattern: string) {
  const keysToDelete: string[] = []
  
  for (const key of Array.from(cache['cache'].keys())) {
    if (key.includes(pattern)) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => cache.delete(key))
  
  if (keysToDelete.length > 0) {
    console.log(`🗑️ [CACHE] Invalidadas ${keysToDelete.length} entradas relacionadas con: ${pattern}`)
  }
}

// Función para obtener datos con caché
export async function getCachedData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutos por defecto
): Promise<T> {
  // Intentar obtener del caché
  const cached = cache.get<T>(key)
  if (cached !== null) {
    console.log(`💾 [CACHE] Hit para clave: ${key}`)
    return cached
  }
  
  // Si no está en caché, obtener de la fuente
  console.log(`🔄 [CACHE] Miss para clave: ${key}, obteniendo datos...`)
  const data = await fetchFunction()
  
  // Guardar en caché
  cache.set(key, data, ttl)
  console.log(`💾 [CACHE] Datos guardados en caché: ${key}`)
  
  return data
}

// Configuración de TTL para diferentes tipos de datos
export const CACHE_TTL = {
  PRODUCTS: 10 * 60 * 1000, // 10 minutos
  PRODUCT_DETAIL: 30 * 60 * 1000, // 30 minutos
  USER_ORDERS: 5 * 60 * 1000, // 5 minutos
  CART: 2 * 60 * 1000, // 2 minutos
  SEARCH: 5 * 60 * 1000, // 5 minutos
  STATS: 15 * 60 * 1000, // 15 minutos
  USER_PROFILE: 30 * 60 * 1000, // 30 minutos
  COUPONS: 10 * 60 * 1000, // 10 minutos
  ADMIN_STATS: 30 * 60 * 1000 // 30 minutos
}

// Función para limpiar caché de productos
export function clearProductCache(productId?: string) {
  if (productId) {
    // Limpiar caché específico del producto
    cache.delete(cacheHelpers.productKey(productId))
    invalidateRelatedCache('products:list')
    invalidateRelatedCache('search')
  } else {
    // Limpiar todo el caché relacionado con productos
    invalidateRelatedCache('product')
    invalidateRelatedCache('products')
    invalidateRelatedCache('search')
  }
}

// Función para limpiar caché de usuario
export function clearUserCache(userId: string) {
  invalidateRelatedCache(`user:${userId}`)
  invalidateRelatedCache(`cart:${userId}`)
}

// Función para limpiar caché de cupones
export function clearCouponCache() {
  invalidateRelatedCache('coupons')
  invalidateRelatedCache('coupon_stats')
}

// Función para obtener estadísticas del caché
export function getCacheStats() {
  return cache.getStats()
}

// Función para limpiar todo el caché
export function clearAllCache() {
  cache.clear()
  console.log('🧹 [CACHE] Todo el caché ha sido limpiado')
}
