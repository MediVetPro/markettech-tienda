const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestCoupons() {
  try {
    console.log('🎫 Creando cupones de prueba...')
    
    const coupons = [
      {
        code: 'WELCOME10',
        name: 'Bienvenida 10%',
        description: 'Descuento del 10% para nuevos usuarios',
        type: 'PERCENTAGE',
        value: 10.0,
        minOrderAmount: 50.0,
        maxDiscount: 100.0,
        usageLimit: 100,
        userLimit: 1,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      },
      {
        code: 'FREESHIP',
        name: 'Envío Gratis',
        description: 'Envío gratis en compras superiores a $100',
        type: 'FREE_SHIPPING',
        value: 0.0,
        minOrderAmount: 100.0,
        usageLimit: 50,
        userLimit: 1,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 días
      },
      {
        code: 'SAVE20',
        name: 'Ahorra $20',
        description: 'Descuento fijo de $20 en compras superiores a $150',
        type: 'FIXED_AMOUNT',
        value: 20.0,
        minOrderAmount: 150.0,
        usageLimit: 25,
        userLimit: 1,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      },
      {
        code: 'TECH15',
        name: 'Tecnología 15%',
        description: '15% de descuento en productos de tecnología',
        type: 'PERCENTAGE',
        value: 15.0,
        category: 'wearables,robotics',
        minOrderAmount: 200.0,
        maxDiscount: 50.0,
        usageLimit: 30,
        userLimit: 2,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) // 20 días
      }
    ]
    
    for (const couponData of coupons) {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: couponData.code }
      })
      
      if (!existingCoupon) {
        const coupon = await prisma.coupon.create({
          data: couponData
        })
        console.log(`✅ Cupón creado: ${coupon.code} - ${coupon.name}`)
      } else {
        console.log(`⚠️  Cupón ya existe: ${couponData.code}`)
      }
    }
    
    console.log('🎉 Cupones de prueba creados exitosamente!')
    
  } catch (error) {
    console.error('❌ Error creando cupones de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestCoupons()
