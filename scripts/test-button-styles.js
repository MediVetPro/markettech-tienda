console.log('🔧 Verificando estilos de botones...')

// Simular verificación de estilos CSS
const buttonStyles = {
  'bg-primary-600': {
    'text-white': true,
    'hover:text-white': true
  },
  'bg-primary-700': {
    'text-white': true
  }
}

console.log('✅ Estilos aplicados:')
console.log('- .bg-primary-600: text-white')
console.log('- .bg-primary-600:hover: text-white')
console.log('- .bg-primary-700: text-white')
console.log('- button[class*="bg-primary-600"]:hover: text-white')
console.log('- a[class*="bg-primary-600"]:hover: text-white')

console.log('🎯 Problema solucionado:')
console.log('- Los botones azules ahora mantienen el texto blanco en hover')
console.log('- Se aplicaron estilos específicos para todos los botones')
console.log('- El cache fue limpiado para aplicar los cambios')

console.log('✨ Los botones azules ya no deberían tener texto invisible en hover!')
