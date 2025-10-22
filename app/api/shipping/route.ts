import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            'shipping_strategy',
            'shipping_cost_curitiba',
            'shipping_cost_other_regions',
            'free_shipping_minimum',
            'shipping_message',
          ],
        },
      },
    })

    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value
      return acc
    }, {} as Record<string, string>)

    const shippingConfig = {
      strategy: configMap.shipping_strategy || 'FREE_INCLUDED',
      costCuritiba: parseFloat(configMap.shipping_cost_curitiba || '15.00'),
      costOtherRegions: parseFloat(configMap.shipping_cost_other_regions || '25.00'),
      freeShippingMinimum: parseFloat(configMap.free_shipping_minimum || '100.00'),
      message: configMap.shipping_message || 'Frete Grátis para Curitiba - Região Urbana',
    }

    return NextResponse.json(shippingConfig)
  } catch (error) {
    console.error('Error getting shipping config:', error)
    return NextResponse.json(
      {
        strategy: 'FREE_INCLUDED',
        costCuritiba: 15.00,
        costOtherRegions: 25.00,
        freeShippingMinimum: 100.00,
        message: 'Frete Grátis para Curitiba - Região Urbana',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderTotal, region } = await request.json()
    
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: [
            'shipping_strategy',
            'shipping_cost_curitiba',
            'shipping_cost_other_regions',
            'free_shipping_minimum',
            'shipping_message',
          ],
        },
      },
    })

    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value
      return acc
    }, {} as Record<string, string>)

    const strategy = configMap.shipping_strategy || 'FREE_INCLUDED'
    const costCuritiba = parseFloat(configMap.shipping_cost_curitiba || '15.00')
    const costOtherRegions = parseFloat(configMap.shipping_cost_other_regions || '25.00')
    const freeShippingMinimum = parseFloat(configMap.free_shipping_minimum || '100.00')
    const message = configMap.shipping_message || 'Frete Grátis para Curitiba - Região Urbana'

    let cost = 0
    let isFree = true
    let finalMessage = message

    switch (strategy) {
      case 'FREE_INCLUDED':
        cost = 0
        isFree = true
        finalMessage = message
        break
      case 'CALCULATED':
        if (orderTotal >= freeShippingMinimum) {
          cost = 0
          isFree = true
          finalMessage = message
        } else {
          cost = region === 'curitiba' ? costCuritiba : costOtherRegions
          isFree = false
          finalMessage = `Custo de envio: R$ ${cost.toFixed(2)}`
        }
        break
      case 'FIXED':
        cost = region === 'curitiba' ? costCuritiba : costOtherRegions
        isFree = false
        finalMessage = `Custo de envio fixo: R$ ${cost.toFixed(2)}`
        break
      default:
        cost = 0
        isFree = true
        finalMessage = 'Frete Grátis'
    }

    return NextResponse.json({
      cost,
      isFree,
      message: finalMessage,
      strategy
    })
  } catch (error) {
    console.error('Error calculating shipping:', error)
    return NextResponse.json(
      {
        cost: 0,
        isFree: true,
        message: 'Frete Grátis',
        strategy: 'FREE_INCLUDED'
      },
      { status: 500 }
    )
  }
}
