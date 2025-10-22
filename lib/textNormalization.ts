/**
 * Funciones para normalizar texto y hacer búsquedas más tolerantes
 */

/**
 * Normaliza un texto para búsquedas tolerantes
 * - Convierte a minúsculas
 * - Remueve tildes y acentos
 * - Reemplaza ñ por n
 * - Reemplaza ç por c
 * - Remueve caracteres especiales
 */
export function normalizeTextForSearch(text: string): string {
  if (!text || typeof text !== 'string') return ''
  
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remueve marcas diacríticas (tildes, acentos)
    .replace(/ñ/g, 'n') // Reemplaza ñ por n
    .replace(/ç/g, 'c') // Reemplaza ç por c
    .replace(/[^\w\s]/g, '') // Remueve caracteres especiales excepto letras, números y espacios
    .trim()
}

/**
 * Crea múltiples variaciones de un término de búsqueda
 * para hacer búsquedas más tolerantes
 */
export function createSearchVariations(searchTerm: string): string[] {
  if (!searchTerm || typeof searchTerm !== 'string') return []
  
  const variations = [
    searchTerm, // Término original
    searchTerm.toLowerCase(), // Minúsculas
    searchTerm.toUpperCase(), // Mayúsculas
    normalizeTextForSearch(searchTerm), // Normalizado completo
    searchTerm.toLowerCase().replace(/ñ/g, 'n').replace(/ç/g, 'c'), // Solo ñ/ç
    searchTerm.toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u'), // Solo tildes
  ]
  
  // Eliminar duplicados y términos vacíos
  return Array.from(new Set(variations.filter(term => term && term.trim())))
}

/**
 * Crea condiciones de búsqueda tolerantes para Prisma
 */
export function createTolerantSearchConditions(searchTerm: string, fields: string[] = ['title', 'description', 'manufacturer', 'model', 'specifications', 'categories']) {
  const variations = createSearchVariations(searchTerm)
  const conditions: any[] = []
  
  variations.forEach(term => {
    fields.forEach(field => {
      conditions.push({
        [field]: { 
          contains: term, 
          mode: 'insensitive' 
        }
      })
    })
  })
  
  return conditions
}

/**
 * Ejemplos de uso:
 * 
 * // Búsqueda simple
 * const normalized = normalizeTextForSearch("Café")
 * // Resultado: "cafe"
 * 
 * // Variaciones de búsqueda
 * const variations = createSearchVariations("Niño")
 * // Resultado: ["Niño", "niño", "NIÑO", "nino", "nino", "nino"]
 * 
 * // Condiciones para Prisma
 * const conditions = createTolerantSearchConditions("Café", ['title', 'description'])
 * // Resultado: Array de condiciones para búsqueda tolerante
 */
