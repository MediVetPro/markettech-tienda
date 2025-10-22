const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function updateSchema() {
  console.log('🔄 Actualizando esquema de base de datos...')
  
  try {
    const prisma = new PrismaClient()
    
    // Verificar si la tabla product_ratings existe
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='product_ratings'
    `
    
    if (tables.length === 0) {
      console.log('📝 Creando tabla product_ratings...')
      
      // Crear la tabla product_ratings
      await prisma.$executeRaw`
        CREATE TABLE product_ratings (
          id TEXT PRIMARY KEY,
          rating INTEGER NOT NULL,
          comment TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          userId TEXT NOT NULL,
          productId TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
          UNIQUE(userId, productId)
        )
      `
      
      console.log('✅ Tabla product_ratings creada exitosamente')
    } else {
      console.log('ℹ️ La tabla product_ratings ya existe')
    }
    
    // Verificar si la columna categories existe en products
    const columns = await prisma.$queryRaw`
      PRAGMA table_info(products)
    `
    
    const hasCategories = columns.some(col => col.name === 'categories')
    
    if (!hasCategories) {
      console.log('📝 Agregando columna categories a products...')
      
      await prisma.$executeRaw`
        ALTER TABLE products ADD COLUMN categories TEXT
      `
      
      console.log('✅ Columna categories agregada exitosamente')
    } else {
      console.log('ℹ️ La columna categories ya existe')
    }
    
    await prisma.$disconnect()
    console.log('✅ Esquema actualizado exitosamente')
    
  } catch (error) {
    console.error('❌ Error actualizando esquema:', error)
    process.exit(1)
  }
}

updateSchema()
