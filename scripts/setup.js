#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando MarketTech...\n');

// Crear archivo .env.local si no existe
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-secreto-super-seguro-aqui-${Math.random().toString(36).substring(2, 15)}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-nextauth-aqui-${Math.random().toString(36).substring(2, 15)}"`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env.local creado');
}

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Directorio de uploads creado');
}

// Generar Prisma client
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generado');
} catch (error) {
  console.log('⚠️  Error generando Prisma client:', error.message);
}

// Crear base de datos
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Base de datos creada');
} catch (error) {
  console.log('⚠️  Error creando base de datos:', error.message);
}

console.log('\n🎉 ¡Configuración completada!');
console.log('\nPara iniciar el proyecto:');
console.log('  npm run dev');
console.log('\nPara acceder al panel de administración:');
console.log('  http://localhost:3000/admin');
console.log('\n¡Disfruta tu nueva tienda de tecnología! 🛍️');
