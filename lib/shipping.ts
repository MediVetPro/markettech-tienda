import { prisma } from './prisma'

export interface ShippingConfig {
  strategy: 'FREE_INCLUDED' | 'CALCULATED' | 'FIXED'
  costCuritiba: number
  costOtherRegions: number
  freeShippingMinimum: number
  message: string
}

export interface ShippingCalculation {
  cost: number
  isFree: boolean
  message: string
  strategy: string
}

/**
 * Obtiene la configuración de envío desde la base de datos
 */
export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            'shipping_strategy',
            'shipping_cost_curitiba',
            'shipping_cost_other_regions',
            'free_shipping_minimum',
            'shipping_message'
          ]
        }
      }
    })

    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value
      return acc
    }, {} as Record<string, string>)

    console.log('🔧 Configuración de envío:', configMap)

    return {
      strategy: (configMap.shipping_strategy as any) || 'FREE_INCLUDED',
      costCuritiba: parseFloat(configMap.shipping_cost_curitiba || '15.00'),
      costOtherRegions: parseFloat(configMap.shipping_cost_other_regions || '25.00'),
      freeShippingMinimum: parseFloat(configMap.free_shipping_minimum || '100.00'),
      message: configMap.shipping_message || 'Frete Grátis para Curitiba - Região Urbana'
    }
  } catch (error) {
    console.error('Error getting shipping config:', error)
    // Configuración por defecto
    return {
      strategy: 'FREE_INCLUDED',
      costCuritiba: 15.00,
      costOtherRegions: 25.00,
      freeShippingMinimum: 100.00,
      message: 'Frete Grátis para Curitiba - Região Urbana'
    }
  }
}

/**
 * Calcula el costo de envío basado en la estrategia configurada
 */
export async function calculateShipping(
  orderTotal: number,
  region: string = 'curitiba'
): Promise<ShippingCalculation> {
  const config = await getShippingConfig()
  console.log('🚚 Configuración obtenida:', config)
  console.log('🚚 Estrategia:', config.strategy)
  
  switch (config.strategy) {
    case 'FREE_INCLUDED':
      return {
        cost: 0,
        isFree: true,
        message: config.message,
        strategy: 'FREE_INCLUDED'
      }
    
    case 'CALCULATED':
      const baseCost = region.toLowerCase().includes('curitiba') 
        ? config.costCuritiba 
        : config.costOtherRegions
      
      const isFree = orderTotal >= config.freeShippingMinimum
      
      return {
        cost: isFree ? 0 : baseCost,
        isFree,
        message: isFree 
          ? `Frete Grátis! (Compra mínima de R$ ${config.freeShippingMinimum.toFixed(2)})`
          : `Frete: R$ ${baseCost.toFixed(2)}`,
        strategy: 'CALCULATED'
      }
    
    case 'FIXED':
      const fixedCost = region.toLowerCase().includes('curitiba') 
        ? config.costCuritiba 
        : config.costOtherRegions
      
      return {
        cost: fixedCost,
        isFree: false,
        message: `Frete: R$ ${fixedCost.toFixed(2)}`,
        strategy: 'FIXED'
      }
    
    default:
      return {
        cost: 0,
        isFree: true,
        message: config.message,
        strategy: 'FREE_INCLUDED'
      }
  }
}

/**
 * Ajusta el precio del producto para incluir el costo de envío
 */
export async function adjustPriceForShipping(
  basePrice: number,
  region: string = 'curitiba'
): Promise<number> {
  const config = await getShippingConfig()
  
  if (config.strategy === 'FREE_INCLUDED') {
    // Incluir el costo de envío en el precio base
    const shippingCost = region.toLowerCase().includes('curitiba') 
      ? config.costCuritiba 
      : config.costOtherRegions
    
    return basePrice + shippingCost
  }
  
  return basePrice
}

/**
 * Obtiene el mensaje de envío para mostrar en la UI
 */
export async function getShippingMessage(): Promise<string> {
  const config = await getShippingConfig()
  return config.message
}

/**
 * Verifica si el envío es gratuito para un monto dado
 */
export async function isShippingFree(orderTotal: number): Promise<boolean> {
  const config = await getShippingConfig()
  
  if (config.strategy === 'FREE_INCLUDED') {
    return true
  }
  
  if (config.strategy === 'CALCULATED') {
    return orderTotal >= config.freeShippingMinimum
  }
  
  return false
}
