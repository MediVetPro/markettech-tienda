// Simular la función de validación para el test
function validateBirthDate(birthDate) {
  if (!birthDate) {
    return { valid: false, error: 'La fecha de nacimiento es requerida' }
  }

  const date = new Date(birthDate)
  
  // Verificar que la fecha sea válida
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Fecha de nacimiento inválida' }
  }

  const today = new Date()
  
  // Verificar que no sea una fecha futura
  if (date > today) {
    return { valid: false, error: 'La fecha de nacimiento no puede ser futura' }
  }

  // Calcular edad
  const ageInYears = today.getFullYear() - date.getFullYear()
  const monthDiff = today.getMonth() - date.getMonth()
  const dayDiff = today.getDate() - date.getDate()
  
  let age = ageInYears
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--
  }

  // Verificar edad mínima (13 años)
  if (age < 13) {
    return { valid: false, error: 'Debes tener al menos 13 años para registrarte', age }
  }

  // Verificar edad máxima razonable (120 años)
  if (age > 120) {
    return { valid: false, error: 'La edad ingresada no es válida', age }
  }

  return { valid: true, age }
}

console.log('🧪 Probando validación de fecha de nacimiento...\n')

// Casos de prueba
const testCases = [
  {
    name: 'Fecha válida - 25 años',
    date: '2000-01-15',
    expected: { valid: true, age: 25 }
  },
  {
    name: 'Fecha válida - 18 años',
    date: '2007-01-15',
    expected: { valid: true, age: 18 }
  },
  {
    name: 'Fecha válida - 13 años (mínimo)',
    date: '2012-01-15',
    expected: { valid: true, age: 13 }
  },
  {
    name: 'Fecha inválida - menor de 13 años',
    date: '2015-01-15',
    expected: { valid: false, error: 'Debes tener al menos 13 años para registrarte' }
  },
  {
    name: 'Fecha inválida - fecha futura',
    date: '2030-01-15',
    expected: { valid: false, error: 'La fecha de nacimiento no puede ser futura' }
  },
  {
    name: 'Fecha inválida - formato incorrecto',
    date: 'invalid-date',
    expected: { valid: false, error: 'Fecha de nacimiento inválida' }
  },
  {
    name: 'Fecha inválida - edad muy alta',
    date: '1800-01-15',
    expected: { valid: false, error: 'La edad ingresada no es válida' }
  },
  {
    name: 'Fecha vacía',
    date: '',
    expected: { valid: false, error: 'La fecha de nacimiento es requerida' }
  }
]

let passedTests = 0
let totalTests = testCases.length

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`)
  console.log(`   Fecha: ${testCase.date}`)
  
  try {
    const result = validateBirthDate(testCase.date)
    
    console.log(`   Resultado: ${JSON.stringify(result)}`)
    
    // Verificar si el resultado coincide con lo esperado
    const isValid = result.valid === testCase.expected.valid
    
    if (testCase.expected.error) {
      const hasCorrectError = result.error === testCase.expected.error
      if (isValid && hasCorrectError) {
        console.log(`   ✅ PASÓ`)
        passedTests++
      } else {
        console.log(`   ❌ FALLÓ - Error esperado: "${testCase.expected.error}", obtenido: "${result.error}"`)
      }
    } else if (testCase.expected.age) {
      const hasCorrectAge = result.age === testCase.expected.age
      if (isValid && hasCorrectAge) {
        console.log(`   ✅ PASÓ`)
        passedTests++
      } else {
        console.log(`   ❌ FALLÓ - Edad esperada: ${testCase.expected.age}, obtenida: ${result.age}`)
      }
    } else {
      if (isValid) {
        console.log(`   ✅ PASÓ`)
        passedTests++
      } else {
        console.log(`   ❌ FALLÓ`)
      }
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
  }
})

console.log(`\n📊 Resumen de pruebas:`)
console.log(`   ✅ Pasaron: ${passedTests}/${totalTests}`)
console.log(`   ❌ Fallaron: ${totalTests - passedTests}/${totalTests}`)
console.log(`   📈 Porcentaje: ${Math.round((passedTests / totalTests) * 100)}%`)

if (passedTests === totalTests) {
  console.log(`\n🎉 ¡Todas las pruebas pasaron! La validación de fecha de nacimiento funciona correctamente.`)
} else {
  console.log(`\n⚠️  Algunas pruebas fallaron. Revisar la implementación.`)
}
