// Script para probar el formateo automático de fecha
console.log('🧪 Probando formateo automático de fecha...\n')

// Función para formatear fecha como en el componente
function formatDateInput(input) {
  let value = input
  
  // Remover caracteres no numéricos excepto /
  value = value.replace(/[^\d/]/g, '')
  
  // Limitar a 10 caracteres máximo
  if (value.length > 10) {
    value = value.slice(0, 10)
  }
  
  // Formatear automáticamente mientras escribe
  if (value.length > 0) {
    // Si no tiene / y tiene más de 2 caracteres, agregar /
    if (!value.includes('/') && value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2)
    }
    // Si tiene una / y después de ella tiene más de 2 caracteres, agregar otra /
    const parts = value.split('/')
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2)
    }
  }
  
  return value
}

// Casos de prueba
const testCases = [
  { input: '1', expected: '1' },
  { input: '12', expected: '12' },
  { input: '123', expected: '12/3' },
  { input: '1234', expected: '12/34' },
  { input: '12345', expected: '12/345' },
  { input: '123456', expected: '12/34/56' },
  { input: '1234567', expected: '12/34/567' },
  { input: '12345678', expected: '12/34/5678' },
  { input: '123456789', expected: '12/34/56789' },
  { input: '1234567890', expected: '12/34/567890' },
  { input: '15/03/1990', expected: '15/03/1990' },
  { input: 'abc123def', expected: '12/3' },
  { input: '12abc34', expected: '12/34' },
  { input: '12/34/5678', expected: '12/34/5678' }
]

let passedTests = 0
let totalTests = testCases.length

console.log('📝 Casos de prueba:')
testCases.forEach((testCase, index) => {
  const result = formatDateInput(testCase.input)
  const passed = result === testCase.expected
  
  console.log(`\n${index + 1}. Input: "${testCase.input}"`)
  console.log(`   Esperado: "${testCase.expected}"`)
  console.log(`   Resultado: "${result}"`)
  console.log(`   ${passed ? '✅ PASÓ' : '❌ FALLÓ'}`)
  
  if (passed) passedTests++
})

console.log(`\n📊 Resumen de pruebas:`)
console.log(`   ✅ Pasaron: ${passedTests}/${totalTests}`)
console.log(`   ❌ Fallaron: ${totalTests - passedTests}/${totalTests}`)
console.log(`   📈 Porcentaje: ${Math.round((passedTests / totalTests) * 100)}%`)

if (passedTests === totalTests) {
  console.log(`\n🎉 ¡Todas las pruebas pasaron! El formateo automático funciona correctamente.`)
} else {
  console.log(`\n⚠️  Algunas pruebas fallaron. Revisar la implementación.`)
}
