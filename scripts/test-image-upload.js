const fs = require('fs')
const path = require('path')

// Script para probar la subida de imágenes
console.log('🧪 Script de prueba de subida de imágenes')
console.log('=====================================')

// Verificar que existe el directorio de uploads
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
console.log('📁 Directorio de uploads:', uploadsDir)
console.log('📁 Existe:', fs.existsSync(uploadsDir))

if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creando directorio de uploads...')
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('✅ Directorio creado')
} else {
  console.log('✅ Directorio ya existe')
}

// Verificar permisos de escritura
try {
  const testFile = path.join(uploadsDir, 'test.txt')
  fs.writeFileSync(testFile, 'test')
  fs.unlinkSync(testFile)
  console.log('✅ Permisos de escritura OK')
} catch (error) {
  console.error('❌ Error de permisos:', error.message)
}

// Verificar estructura de directorios
console.log('\n📂 Estructura actual:')
function listDir(dir, prefix = '') {
  try {
    const items = fs.readdirSync(dir)
    items.forEach(item => {
      const itemPath = path.join(dir, item)
      const stats = fs.statSync(itemPath)
      if (stats.isDirectory()) {
        console.log(`${prefix}📁 ${item}/`)
        listDir(itemPath, prefix + '  ')
      } else {
        console.log(`${prefix}📄 ${item} (${stats.size} bytes)`)
      }
    })
  } catch (error) {
    console.log(`${prefix}❌ Error leyendo directorio:`, error.message)
  }
}

listDir(uploadsDir)

console.log('\n🎯 Prueba completada')
console.log('💡 Si hay errores, revisa los permisos del directorio')
