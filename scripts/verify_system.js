const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function verifySystem() {
  try {
    console.log('🔍 Verificando sistema completo...')

    // 1. Verificar usuarios
    console.log('\n👥 Verificando usuarios...')
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true
      }
    })
    
    console.log(`✅ ${users.length} usuarios encontrados:`)
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`)
    })

    // 2. Verificar productos
    console.log('\n📦 Verificando productos...')
    const products = await prisma.product.findMany({
      include: {
        images: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`✅ ${products.length} productos encontrados:`)
    for (const product of products) {
      console.log(`   - ${product.title} (${product.user.name})`)
      console.log(`     Precio: R$ ${product.price}`)
      console.log(`     Stock: ${product.stock}`)
      console.log(`     Imágenes: ${product.images.length}`)
      
      // Verificar que las imágenes existen físicamente
      for (const image of product.images) {
        const imagePath = path.join('public', image.path)
        const exists = fs.existsSync(imagePath)
        console.log(`       ${image.filename}: ${exists ? '✅' : '❌'}`)
      }
    }

    // 3. Verificar perfiles de pago
    console.log('\n💳 Verificando perfiles de pago...')
    const paymentProfiles = await prisma.paymentProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`✅ ${paymentProfiles.length} perfiles de pago encontrados:`)
    paymentProfiles.forEach(profile => {
      console.log(`   - ${profile.name} (${profile.user.name})`)
      console.log(`     Empresa: ${profile.companyName}`)
      console.log(`     Banco: ${profile.bankName}`)
    })

    // 4. Verificar configuración de comisiones
    console.log('\n💰 Verificando configuración de comisiones...')
    const commissionSettings = await prisma.commissionSettings.findMany()
    
    console.log(`✅ ${commissionSettings.length} configuraciones de comisión encontradas:`)
    commissionSettings.forEach(setting => {
      console.log(`   - ${setting.name}: ${(setting.rate * 100).toFixed(1)}%`)
      console.log(`     Activa: ${setting.isActive ? 'Sí' : 'No'}`)
    })

    // 5. Verificar estructura de archivos
    console.log('\n📁 Verificando estructura de archivos...')
    const productsDir = 'public/uploads/products'
    
    if (fs.existsSync(productsDir)) {
      const productDirs = fs.readdirSync(productsDir)
      console.log(`✅ ${productDirs.length} directorios de productos encontrados:`)
      
      for (const productDir of productDirs) {
        const fullPath = path.join(productsDir, productDir)
        const files = fs.readdirSync(fullPath)
        console.log(`   - ${productDir}: ${files.length} archivos`)
      }
    } else {
      console.log('❌ Directorio de productos no encontrado')
    }

    console.log('\n🎉 Verificación del sistema completada!')
    console.log('\n📋 Resumen:')
    console.log(`   👥 Usuarios: ${users.length}`)
    console.log(`   📦 Productos: ${products.length}`)
    console.log(`   💳 Perfiles de pago: ${paymentProfiles.length}`)
    console.log(`   💰 Configuraciones de comisión: ${commissionSettings.length}`)
    
    console.log('\n🚀 Sistema listo para usar!')
    console.log('🌐 Accede a: http://localhost:3000')
    console.log('🔐 Credenciales: Todos los usuarios usan la contraseña "Romero12345@"')

  } catch (error) {
    console.error('❌ Error verificando sistema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifySystem()
