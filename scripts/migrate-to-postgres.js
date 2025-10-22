const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Script para migrar datos de SQLite a PostgreSQL
async function migrateData() {
  console.log('🔄 Iniciando migración de SQLite a PostgreSQL...');
  
  // Cliente para SQLite (desarrollo) - usando schema separado
  const sqliteSchema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  phone     String?
  password  String
  role      String   @default("CLIENT")
  cpf       String?
  birthDate DateTime?
  gender    String?
  address   String?
  city      String?
  state     String?
  zipCode   String?
  country   String?  @default("Brasil")
  newsletter Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastLoginAt DateTime?

  @@map("users")
}

model Product {
  id          String   @id @default(cuid())
  title       String
  description String
  price       Decimal
  supplierPrice Decimal
  marginPercentage Decimal @default(50.0)
  previousPrice Decimal?
  condition   String
  aestheticCondition Int
  specifications String
  categories  String?
  stock       Int      @default(0)
  status      String   @default("ACTIVE")
  manufacturerCode String
  manufacturer String?
  model       String?
  publishedAt DateTime?
  publishedBy String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId String?
  user   User?   @relation(fields: [userId], references: [id])

  @@map("products")
}

model ProductImage {
  id        String  @id @default(cuid())
  path      String
  filename  String
  alt       String?
  order     Int     @default(0)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model SiteConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  type      String   @default("text")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("site_config")
}
`;

  // Escribir schema temporal para SQLite
  fs.writeFileSync('./prisma/schema-sqlite.prisma', sqliteSchema);
  
  try {
    // Leer datos directamente del archivo SQLite
    const sqlite = require('sqlite3').verbose();
    const db = new sqlite.Database('./prisma/dev.db');
    
    // Cliente para PostgreSQL (producción)
    const postgresClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    // 1. Migrar usuarios
    console.log('📦 Migrando usuarios...');
    const users = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const user of users) {
      try {
        await postgresClient.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
            name: user.name,
            phone: user.phone,
            password: user.password,
            role: user.role,
            cpf: user.cpf,
            birthDate: user.birthDate ? new Date(user.birthDate) : null,
            gender: user.gender,
            address: user.address,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
            country: user.country,
            newsletter: user.newsletter === 1,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            password: user.password,
            role: user.role,
            cpf: user.cpf,
            birthDate: user.birthDate ? new Date(user.birthDate) : null,
            gender: user.gender,
            address: user.address,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
            country: user.country,
            newsletter: user.newsletter === 1,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null
          }
        });
      } catch (error) {
        console.log(`⚠️  Error migrando usuario ${user.id}:`, error.message);
      }
    }
    console.log(`✅ ${users.length} usuarios migrados`);
    
    // 2. Migrar productos
    console.log('📦 Migrando productos...');
    const products = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM products", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const product of products) {
      try {
        await postgresClient.product.upsert({
          where: { id: product.id },
          update: {
            title: product.title,
            description: product.description,
            price: parseFloat(product.price),
            supplierPrice: parseFloat(product.supplierPrice),
            marginPercentage: parseFloat(product.marginPercentage),
            previousPrice: product.previousPrice ? parseFloat(product.previousPrice) : null,
            condition: product.condition,
            aestheticCondition: parseInt(product.aestheticCondition),
            specifications: product.specifications,
            categories: product.categories,
            stock: parseInt(product.stock),
            status: product.status,
            manufacturerCode: product.manufacturerCode,
            manufacturer: product.manufacturer,
            model: product.model,
            publishedAt: product.publishedAt ? new Date(product.publishedAt) : null,
            publishedBy: product.publishedBy,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),
            userId: product.userId
          },
          create: {
            id: product.id,
            title: product.title,
            description: product.description,
            price: parseFloat(product.price),
            supplierPrice: parseFloat(product.supplierPrice),
            marginPercentage: parseFloat(product.marginPercentage),
            previousPrice: product.previousPrice ? parseFloat(product.previousPrice) : null,
            condition: product.condition,
            aestheticCondition: parseInt(product.aestheticCondition),
            specifications: product.specifications,
            categories: product.categories,
            stock: parseInt(product.stock),
            status: product.status,
            manufacturerCode: product.manufacturerCode,
            manufacturer: product.manufacturer,
            model: product.model,
            publishedAt: product.publishedAt ? new Date(product.publishedAt) : null,
            publishedBy: product.publishedBy,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),
            userId: product.userId
          }
        });
      } catch (error) {
        console.log(`⚠️  Error migrando producto ${product.id}:`, error.message);
      }
    }
    console.log(`✅ ${products.length} productos migrados`);
    
    // 3. Migrar imágenes
    console.log('📦 Migrando imágenes...');
    const images = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM product_images", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const image of images) {
      try {
        await postgresClient.productImage.upsert({
          where: { id: image.id },
          update: {
            path: image.path,
            filename: image.filename,
            alt: image.alt,
            order: parseInt(image.order),
            productId: image.productId
          },
          create: {
            id: image.id,
            path: image.path,
            filename: image.filename,
            alt: image.alt,
            order: parseInt(image.order),
            productId: image.productId
          }
        });
      } catch (error) {
        console.log(`⚠️  Error migrando imagen ${image.id}:`, error.message);
      }
    }
    console.log(`✅ ${images.length} imágenes migradas`);
    
    // 4. Migrar configuración
    console.log('📦 Migrando configuración...');
    const configs = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM site_config", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const config of configs) {
      try {
        await postgresClient.siteConfig.upsert({
          where: { key: config.key },
          update: {
            value: config.value,
            type: config.type,
            createdAt: new Date(config.createdAt),
            updatedAt: new Date(config.updatedAt)
          },
          create: {
            id: config.id,
            key: config.key,
            value: config.value,
            type: config.type,
            createdAt: new Date(config.createdAt),
            updatedAt: new Date(config.updatedAt)
          }
        });
      } catch (error) {
        console.log(`⚠️  Error migrando configuración ${config.key}:`, error.message);
      }
    }
    console.log(`✅ ${configs.length} configuraciones migradas`);
    
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    // Limpiar archivo temporal
    if (fs.existsSync('./prisma/schema-sqlite.prisma')) {
      fs.unlinkSync('./prisma/schema-sqlite.prisma');
    }
    db.close();
  }
}

// Ejecutar migración
migrateData();
