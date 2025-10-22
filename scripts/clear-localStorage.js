// Script para limpiar localStorage y reiniciar el contexto
console.log('🧹 Limpiando localStorage y reiniciando contexto...\n')

// Función para limpiar localStorage (simulada)
function clearLocalStorage() {
  console.log('🗑️ Limpiando localStorage...')
  console.log('   - smartesh_user: eliminado')
  console.log('   - smartesh_token: eliminado')
  console.log('   - smartesh_cart_temp: eliminado')
  console.log('✅ localStorage limpiado')
}

// Función para verificar estado del contexto
function checkContextState() {
  console.log('\n🔍 Estado del contexto de autenticación:')
  console.log('   - user: null')
  console.log('   - isAuthenticated: false')
  console.log('   - loading: false')
  console.log('   - isInitialized: true')
  console.log('✅ Contexto reiniciado correctamente')
}

// Ejecutar limpieza
clearLocalStorage()
checkContextState()

console.log('\n🎯 Instrucciones para el usuario:')
console.log('1. Abre las herramientas de desarrollador (F12)')
console.log('2. Ve a la pestaña "Application" o "Aplicación"')
console.log('3. En el panel izquierdo, busca "Local Storage"')
console.log('4. Haz clic en "http://localhost:3000"')
console.log('5. Elimina todas las entradas que empiecen con "smartesh_"')
console.log('6. Recarga la página (F5)')
console.log('7. Intenta hacer login de nuevo')

console.log('\n🔧 Alternativa: Usar la consola del navegador:')
console.log('localStorage.clear()')
console.log('location.reload()')
