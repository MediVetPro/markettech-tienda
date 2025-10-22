/**
 * Calcula el porcentaje de descuento entre dos precios
 */
export function calculateDiscountPercentage(previousPrice: number, currentPrice: number): number {
  if (!previousPrice || previousPrice <= 0) return 0
  if (!currentPrice || currentPrice <= 0) return 0
  
  const discount = ((previousPrice - currentPrice) / previousPrice) * 100
  return Math.round(discount)
}

/**
 * Calcula el porcentaje de incremento entre dos precios
 */
export function calculateIncreasePercentage(previousPrice: number, currentPrice: number): number {
  if (!previousPrice || previousPrice <= 0) return 0
  if (!currentPrice || currentPrice <= 0) return 0
  
  const increase = ((currentPrice - previousPrice) / previousPrice) * 100
  return Math.round(increase)
}

/**
 * Determina si hay descuento o incremento y retorna el porcentaje
 */
export function getPriceChangePercentage(previousPrice: number | string, currentPrice: number | string): {
  type: 'discount' | 'increase' | 'none'
  percentage: number
} {
  // Convertir a números si son strings
  const prevPrice = typeof previousPrice === 'string' ? parseFloat(previousPrice) : previousPrice
  const currPrice = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice
  
  if (!prevPrice || !currPrice || prevPrice === currPrice) {
    return { type: 'none', percentage: 0 }
  }
  
  if (prevPrice > currPrice) {
    return {
      type: 'discount',
      percentage: calculateDiscountPercentage(prevPrice, currPrice)
    }
  } else {
    return {
      type: 'increase',
      percentage: calculateIncreasePercentage(prevPrice, currPrice)
    }
  }
}

/**
 * Formatea el porcentaje para mostrar en la UI
 */
export function formatPriceChange(previousPrice: number | string, currentPrice: number | string): {
  text: string
  className: string
} {
  // Convertir a números si son strings
  const prevPrice = typeof previousPrice === 'string' ? parseFloat(previousPrice) : previousPrice
  const currPrice = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice
  
  const change = getPriceChangePercentage(prevPrice, currPrice)
  
  switch (change.type) {
    case 'discount':
      return {
        text: `-${change.percentage}%`,
        className: 'bg-green-100 text-green-600'
      }
    case 'increase':
      return {
        text: `+${change.percentage}%`,
        className: 'bg-red-100 text-red-600'
      }
    default:
      return {
        text: '',
        className: ''
      }
  }
}
