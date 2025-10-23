#!/usr/bin/env node

/**
 * Script para verificar que el despliegue en Netlify funcione correctamente
 */

const { PrismaClient } = require('@prisma/client')

async function verifyDeployment() {
  console.log('🔍 Verificando despliegue en Netlify...')
  
  try {
    // Verificar conexión a la base de datos
    const prisma = new PrismaClient()
    
    console.log('📊 Verificando conexión a la base de datos...')
    await prisma.$connect()
    console.log('✅ Conexión a la base de datos exitosa')
    
    // Verificar que hay productos
    const productCount = await prisma.product.count()
    console.log(`📦 Productos en la base de datos: ${productCount}`)
    
    // Verificar que hay usuarios
    const userCount = await prisma.user.count()
    console.log(`👥 Usuarios en la base de datos: ${userCount}`)
    
    // Verificar usuario admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      console.log(`👤 Usuario admin encontrado: ${adminUser.email}`)
    } else {
      console.log('⚠️  No se encontró usuario admin')
    }
    
    await prisma.$disconnect()
    console.log('🎉 Verificación completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
    process.exit(1)
  }
}

verifyDeployment()
