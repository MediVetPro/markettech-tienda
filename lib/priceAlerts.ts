import { prisma } from './prisma'
import { createOrderNotification } from './notifications'

// Función para verificar alertas de precio
export async function checkPriceAlerts() {
  console.log('🔔 [PRICE_ALERTS] Verificando alertas de precio...')
  
  try {
    // Obtener todos los items de wishlist con alertas activas
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        priceAlertEnabled: true,
        targetPrice: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            previousPrice: true,
            images: {
              select: {
                path: true,
                alt: true
              },
              take: 1
            }
          }
        }
      }
    })

    console.log(`🔍 [PRICE_ALERTS] Verificando ${wishlistItems.length} alertas activas`)

    const notifications = []

    for (const item of wishlistItems) {
      const currentPrice = parseFloat(item.product.price.toString())
      const targetPrice = parseFloat(item.targetPrice!.toString())
      const previousPrice = item.product.previousPrice ? parseFloat(item.product.previousPrice.toString()) : null

      // Verificar si el precio actual es menor o igual al precio objetivo
      if (currentPrice <= targetPrice) {
        // Verificar si ya se notificó recientemente (evitar spam)
        const lastNotified = item.lastNotifiedAt
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        if (!lastNotified || lastNotified < oneDayAgo) {
          // Calcular descuento
          const discountPercentage = previousPrice 
            ? Math.round(((previousPrice - currentPrice) / previousPrice) * 100 * 100) / 100
            : 0

          // Crear notificación
          const notification = await createOrderNotification(
            item.userId,
            item.id, // orderId
            'ORDER_STATUS_CHANGED',
            {
              status: 'PRICE_ALERT',
              total: currentPrice,
              customerName: item.userId,
              items: [{
                product: {
                  title: item.product.title,
                  images: item.product.images
                },
                quantity: 1,
                price: currentPrice
              }]
            }
          )

          // Actualizar timestamp de última notificación
          await prisma.wishlistItem.update({
            where: { id: item.id },
            data: { lastNotifiedAt: now }
          })

          notifications.push(notification)
          console.log(`✅ [PRICE_ALERTS] Notificación enviada para: ${item.product.title}`)
        }
      }
    }

    console.log(`🎉 [PRICE_ALERTS] ${notifications.length} notificaciones enviadas`)
    return notifications

  } catch (error) {
    console.error('❌ [PRICE_ALERTS] Error verificando alertas:', error)
    throw error
  }
}

// Función para obtener estadísticas de alertas
export async function getPriceAlertStats() {
  try {
    const stats = await prisma.wishlistItem.groupBy({
      by: ['priceAlertEnabled'],
      _count: {
        id: true
      }
    })

    const totalAlerts = await prisma.wishlistItem.count({
      where: {
        priceAlertEnabled: true
      }
    })

    const activeAlerts = await prisma.wishlistItem.count({
      where: {
        priceAlertEnabled: true,
        targetPrice: {
          not: null
        }
      }
    })

    return {
      totalAlerts,
      activeAlerts,
      disabledAlerts: totalAlerts - activeAlerts,
      breakdown: stats
    }

  } catch (error) {
    console.error('Error getting price alert stats:', error)
    throw error
  }
}

// Función para limpiar alertas antiguas
export async function cleanupOldPriceAlerts() {
  console.log('🧹 [PRICE_ALERTS] Limpiando alertas antiguas...')
  
  try {
    // Eliminar alertas de productos que ya no existen o están inactivos
    const deletedAlerts = await prisma.wishlistItem.deleteMany({
      where: {
        product: {
          OR: [
            { status: 'INACTIVE' },
            { status: 'SOLD' }
          ]
        }
      }
    })

    console.log(`🗑️ [PRICE_ALERTS] ${deletedAlerts.count} alertas eliminadas`)

    // Desactivar alertas que no han sido notificadas en 30 días
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deactivatedAlerts = await prisma.wishlistItem.updateMany({
      where: {
        priceAlertEnabled: true,
        lastNotifiedAt: {
          lt: thirtyDaysAgo
        }
      },
      data: {
        priceAlertEnabled: false
      }
    })

    console.log(`⏸️ [PRICE_ALERTS] ${deactivatedAlerts.count} alertas desactivadas`)

    return {
      deleted: deletedAlerts.count,
      deactivated: deactivatedAlerts.count
    }

  } catch (error) {
    console.error('Error cleaning up price alerts:', error)
    throw error
  }
}

// Función para obtener productos con mejores descuentos
export async function getBestDeals(limit: number = 10) {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        previousPrice: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        price: true,
        previousPrice: true,
        categories: true,
        images: {
          select: {
            path: true,
            alt: true
          },
          take: 1
        }
      },
      take: limit
    })

    // Calcular descuentos y ordenar
    const productsWithDiscount = products
      .map(product => {
        const currentPrice = parseFloat(product.price.toString())
        const previousPrice = parseFloat(product.previousPrice!.toString())
        const discountPercentage = ((previousPrice - currentPrice) / previousPrice) * 100

        return {
          ...product,
          currentPrice,
          previousPrice,
          discountPercentage: Math.round(discountPercentage * 100) / 100,
          savings: previousPrice - currentPrice
        }
      })
      .filter(product => product.discountPercentage > 0)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)

    return productsWithDiscount

  } catch (error) {
    console.error('Error getting best deals:', error)
    throw error
  }
}
