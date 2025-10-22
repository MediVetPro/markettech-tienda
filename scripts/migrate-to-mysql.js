const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Script para migrar datos de SQLite a PostgreSQL
async function migrateData() {
  console.log('🔄 Iniciando migración de SQLite a PostgreSQL...');
  
  // Cliente para SQLite (desarrollo)
  const sqliteClient = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./dev.db'
      }
    },
    __internal: {
      engine: {
        binaryTargets: ['native']
      }
    }
  });
  
  // Cliente para PostgreSQL (producción)
  const postgresClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    // 1. Migrar usuarios
    console.log('📦 Migrando usuarios...');
    const users = await sqliteClient.user.findMany();
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`✅ ${users.length} usuarios migrados`);
    
    // 2. Migrar productos
    console.log('📦 Migrando productos...');
    const products = await sqliteClient.product.findMany();
    for (const product of products) {
      await postgresClient.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`✅ ${products.length} productos migrados`);
    
    // 3. Migrar imágenes de productos
    console.log('📦 Migrando imágenes...');
    const productImages = await sqliteClient.productImage.findMany();
    for (const image of productImages) {
      await postgresClient.productImage.upsert({
        where: { id: image.id },
        update: image,
        create: image
      });
    }
    console.log(`✅ ${productImages.length} imágenes migradas`);
    
    // 4. Migrar configuración del sitio
    console.log('📦 Migrando configuración...');
    const siteConfig = await sqliteClient.siteConfig.findMany();
    for (const config of siteConfig) {
      await postgresClient.siteConfig.upsert({
        where: { key: config.key },
        update: config,
        create: config
      });
    }
    console.log(`✅ ${siteConfig.length} configuraciones migradas`);
    
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Ejecutar migración
migrateData();
