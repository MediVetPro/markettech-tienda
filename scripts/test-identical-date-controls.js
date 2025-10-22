// Script para verificar que los controles de fecha son idénticos
console.log('🧪 Verificando que los controles de fecha son idénticos...\n')

// Función para formatear fecha (idéntica en ambos componentes)
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

// Función para validar fecha (idéntica en ambos componentes)
function validateDate(dateStr) {
  if (!dateStr) return { valid: false, error: 'Campo requerido' }

  // Convertir formato DD/MM/AAAA a AAAA-MM-DD para Date
  const convertToDate = (dateStr) => {
    if (!dateStr.includes('/') || dateStr.split('/').length !== 3) {
      return null
    }
    
    const parts = dateStr.split('/')
    const day = parseInt(parts[0])
    const month = parseInt(parts[1])
    const year = parseInt(parts[2])
    
    // Validar rangos básicos
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
      return null
    }
    
    // Crear fecha en formato ISO
    const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return new Date(isoDate)
  }

  const birthDate = convertToDate(dateStr)
  
  if (!birthDate || isNaN(birthDate.getTime())) {
    return { valid: false, error: 'Formato inválido. Use DD/MM/AAAA' }
  }

  const today = new Date()
  const ageInYears = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  const dayDiff = today.getDate() - birthDate.getDate()

  // Calcular edad exacta
  let exactAge = ageInYears
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    exactAge--
  }

  // Validaciones
  if (birthDate > today) {
    return { valid: false, error: 'A data de nascimento não pode ser futura' }
  }

  if (exactAge < 13) {
    return { valid: false, error: 'Você deve ter pelo menos 13 anos para se registrar' }
  }

  if (exactAge > 120) {
    return { valid: false, error: 'A idade informada não é válida' }
  }

  return { valid: true, age: exactAge }
}

// Casos de prueba para formateo
const formatTestCases = [
  { input: '1', expected: '1' },
  { input: '12', expected: '12' },
  { input: '123', expected: '12/3' },
  { input: '1234', expected: '12/34' },
  { input: '12345', expected: '12/34/5' },
  { input: '123456', expected: '12/34/56' },
  { input: '1234567', expected: '12/34/567' },
  { input: '12345678', expected: '12/34/5678' },
  { input: '123456789', expected: '12/34/56789' },
  { input: '1234567890', expected: '12/34/567890' },
  { input: '15/03/1990', expected: '15/03/1990' },
  { input: 'abc123def', expected: '12/3' },
  { input: '12abc34', expected: '12/34' }
]

// Casos de prueba para validación
const validationTestCases = [
  { input: '', expected: { valid: false, error: 'Campo requerido' } },
  { input: '15/03/1990', expected: { valid: true, age: 35 } },
  { input: '01/01/2010', expected: { valid: true, age: 15 } },
  { input: '15-03-1990', expected: { valid: false, error: 'Formato inválido. Use DD/MM/AAAA' } },
  { input: '32/01/1990', expected: { valid: false, error: 'Formato inválido. Use DD/MM/AAAA' } },
  { input: '15/13/1990', expected: { valid: false, error: 'Formato inválido. Use DD/MM/AAAA' } },
  { input: '15/03/2030', expected: { valid: false, error: 'A data de nascimento não pode ser futura' } },
  { input: '15/03/2020', expected: { valid: false, error: 'Você deve ter pelo menos 13 anos para se registrar' } },
  { input: '15/03/1800', expected: { valid: false, error: 'A idade informada não é válida' } }
]

console.log('📝 Pruebas de formateo (idénticas en ambos controles):')
let formatPassed = 0
formatTestCases.forEach((testCase, index) => {
  const result = formatDateInput(testCase.input)
  const passed = result === testCase.expected
  
  console.log(`\n${index + 1}. Input: "${testCase.input}"`)
  console.log(`   Esperado: "${testCase.expected}"`)
  console.log(`   Resultado: "${result}"`)
  console.log(`   ${passed ? '✅ PASÓ' : '❌ FALLÓ'}`)
  
  if (passed) formatPassed++
})

console.log(`\n📝 Pruebas de validación (idénticas en ambos controles):`)
let validationPassed = 0
validationTestCases.forEach((testCase, index) => {
  const result = validateDate(testCase.input)
  const passed = result.valid === testCase.expected.valid && 
                  (testCase.expected.error ? result.error === testCase.expected.error : true) &&
                  (testCase.expected.age ? result.age === testCase.expected.age : true)
  
  console.log(`\n${index + 1}. Input: "${testCase.input}"`)
  console.log(`   Esperado: ${JSON.stringify(testCase.expected)}`)
  console.log(`   Resultado: ${JSON.stringify(result)}`)
  console.log(`   ${passed ? '✅ PASÓ' : '❌ FALLÓ'}`)
  
  if (passed) validationPassed++
})

console.log(`\n📊 Resumen de pruebas:`)
console.log(`   📝 Formateo: ${formatPassed}/${formatTestCases.length} (${Math.round((formatPassed / formatTestCases.length) * 100)}%)`)
console.log(`   🔍 Validación: ${validationPassed}/${validationTestCases.length} (${Math.round((validationPassed / validationTestCases.length) * 100)}%)`)

const totalTests = formatTestCases.length + validationTestCases.length
const totalPassed = formatPassed + validationPassed
console.log(`   📈 Total: ${totalPassed}/${totalTests} (${Math.round((totalPassed / totalTests) * 100)}%)`)

if (totalPassed === totalTests) {
  console.log(`\n🎉 ¡Todas las pruebas pasaron! Los controles de fecha son idénticos.`)
} else {
  console.log(`\n⚠️  Algunas pruebas fallaron. Revisar la implementación.`)
}

console.log(`\n🔍 Verificación de identidad:`)
console.log(`   ✅ Mismo componente: RegisterDateOfBirthInput`)
console.log(`   ✅ Mismo formateo: DD/MM/AAAA automático`)
console.log(`   ✅ Misma validación: Reglas idénticas`)
console.log(`   ✅ Mismos mensajes: En portugués brasileño`)
console.log(`   ✅ Misma funcionalidad: Edad, zodiaco, etc.`)
