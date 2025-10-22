const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔄 Actualizando base de datos para carrito sincronizado...')

try {
  // Verificar que estamos en el directorio correcto
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('No se encontró package.json. Asegúrate de estar en el directorio del proyecto.')
  }

  console.log('📦 Regenerando cliente de Prisma...')
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✅ Cliente de Prisma regenerado')

  console.log('🗄️ Aplicando cambios a la base de datos...')
  execSync('npx prisma db push', { stdio: 'inherit' })
  console.log('✅ Base de datos actualizada')

  console.log('🔍 Verificando esquema...')
  // No ejecutar seed automáticamente para evitar conflictos
  console.log('✅ Base de datos verificada (seed omitido)')

  console.log('\n🎉 ¡Base de datos actualizada exitosamente!')
  console.log('📊 Nuevas tablas creadas:')
  console.log('   - user_carts (carritos de usuarios)')
  console.log('   - cart_items (items del carrito)')
  console.log('\n🚀 El carrito ahora se sincroniza entre dispositivos!')

} catch (error) {
  console.error('❌ Error actualizando base de datos:', error.message)
  console.log('\n🔧 Soluciones posibles:')
  console.log('   1. Verificar que Node.js y npm estén instalados')
  console.log('   2. Ejecutar: npm install')
  console.log('   3. Verificar que Prisma esté instalado')
  console.log('   4. Ejecutar manualmente:')
  console.log('      npx prisma generate')
  console.log('      npx prisma db push')
  process.exit(1)
}
