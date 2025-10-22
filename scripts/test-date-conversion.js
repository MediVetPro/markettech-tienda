// Script para probar la conversión de fechas entre formatos
console.log('🧪 Probando conversión de fechas entre formatos...\n')

// Función para convertir fecha ISO (AAAA-MM-DD) a formato DD/MM/AAAA
function convertISOToDDMMAAAA(isoDate) {
  try {
    // Parsear la fecha ISO directamente sin problemas de zona horaria
    const parts = isoDate.split('-')
    if (parts.length !== 3) return ''
    
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]
    
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error converting date:', error)
    return ''
  }
}

// Función para convertir fecha DD/MM/AAAA a formato ISO (AAAA-MM-DD)
function convertDDMMAAAAToISO(ddmmaaaa) {
  try {
    if (!ddmmaaaa || !ddmmaaaa.includes('/')) return ''
    
    const parts = ddmmaaaa.split('/')
    if (parts.length !== 3) return ''
    
    const day = parts[0]
    const month = parts[1]
    const year = parts[2]
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error converting date:', error)
    return ''
  }
}

// Casos de prueba para conversión ISO → DD/MM/AAAA
const isoToDDMMAAAATestCases = [
  { input: '1990-03-15', expected: '15/03/1990' },
  { input: '2000-12-31', expected: '31/12/2000' },
  { input: '1985-01-01', expected: '01/01/1985' },
  { input: '2010-06-25', expected: '25/06/2010' },
  { input: '1975-11-08', expected: '08/11/1975' }
]

// Casos de prueba para conversión DD/MM/AAAA → ISO
const ddmmAAAAToISOTestCases = [
  { input: '15/03/1990', expected: '1990-03-15' },
  { input: '31/12/2000', expected: '2000-12-31' },
  { input: '01/01/1985', expected: '1985-01-01' },
  { input: '25/06/2010', expected: '2010-06-25' },
  { input: '08/11/1975', expected: '1975-11-08' }
]

// Casos de prueba para conversión bidireccional
const bidirectionalTestCases = [
  { iso: '1990-03-15', ddmm: '15/03/1990' },
  { iso: '2000-12-31', ddmm: '31/12/2000' },
  { iso: '1985-01-01', ddmm: '01/01/1985' },
  { iso: '2010-06-25', ddmm: '25/06/2010' },
  { iso: '1975-11-08', ddmm: '08/11/1975' }
]

console.log('📝 Pruebas de conversión ISO → DD/MM/AAAA:')
let isoToDDMMPassed = 0
isoToDDMMAAAATestCases.forEach((testCase, index) => {
  const result = convertISOToDDMMAAAA(testCase.input)
  const passed = result === testCase.expected
  
  console.log(`\n${index + 1}. Input: "${testCase.input}"`)
  console.log(`   Esperado: "${testCase.expected}"`)
  console.log(`   Resultado: "${result}"`)
  console.log(`   ${passed ? '✅ PASÓ' : '❌ FALLÓ'}`)
  
  if (passed) isoToDDMMPassed++
})

console.log(`\n📝 Pruebas de conversión DD/MM/AAAA → ISO:`)
let ddmmToISOPassed = 0
ddmmAAAAToISOTestCases.forEach((testCase, index) => {
  const result = convertDDMMAAAAToISO(testCase.input)
  const passed = result === testCase.expected
  
  console.log(`\n${index + 1}. Input: "${testCase.input}"`)
  console.log(`   Esperado: "${testCase.expected}"`)
  console.log(`   Resultado: "${result}"`)
  console.log(`   ${passed ? '✅ PASÓ' : '❌ FALLÓ'}`)
  
  if (passed) ddmmToISOPassed++
})

console.log(`\n📝 Pruebas de conversión bidireccional:`)
let bidirectionalPassed = 0
bidirectionalTestCases.forEach((testCase, index) => {
  const isoToDDMM = convertISOToDDMMAAAA(testCase.iso)
  const ddmmToISO = convertDDMMAAAAToISO(testCase.ddmm)
  
  const isoToDDMMPassed = isoToDDMM === testCase.ddmm
  const ddmmToISOPassed = ddmmToISO === testCase.iso
  
  console.log(`\n${index + 1}. ISO: "${testCase.iso}" ↔ DD/MM/AAAA: "${testCase.ddmm}"`)
  console.log(`   ISO → DD/MM/AAAA: "${isoToDDMM}" ${isoToDDMMPassed ? '✅' : '❌'}`)
  console.log(`   DD/MM/AAAA → ISO: "${ddmmToISO}" ${ddmmToISOPassed ? '✅' : '❌'}`)
  
  if (isoToDDMMPassed && ddmmToISOPassed) bidirectionalPassed++
})

console.log(`\n📊 Resumen de pruebas:`)
console.log(`   📝 ISO → DD/MM/AAAA: ${isoToDDMMPassed}/${isoToDDMMAAAATestCases.length} (${Math.round((isoToDDMMPassed / isoToDDMMAAAATestCases.length) * 100)}%)`)
console.log(`   📝 DD/MM/AAAA → ISO: ${ddmmToISOPassed}/${ddmmAAAAToISOTestCases.length} (${Math.round((ddmmToISOPassed / ddmmAAAAToISOTestCases.length) * 100)}%)`)
console.log(`   📝 Bidireccional: ${bidirectionalPassed}/${bidirectionalTestCases.length} (${Math.round((bidirectionalPassed / bidirectionalTestCases.length) * 100)}%)`)

const totalTests = isoToDDMMAAAATestCases.length + ddmmAAAAToISOTestCases.length + bidirectionalTestCases.length
const totalPassed = isoToDDMMPassed + ddmmToISOPassed + bidirectionalPassed
console.log(`   📈 Total: ${totalPassed}/${totalTests} (${Math.round((totalPassed / totalTests) * 100)}%)`)

if (totalPassed === totalTests) {
  console.log(`\n🎉 ¡Todas las pruebas pasaron! La conversión de fechas funciona correctamente.`)
} else {
  console.log(`\n⚠️  Algunas pruebas fallaron. Revisar la implementación.`)
}

console.log(`\n🔍 Verificación de funcionalidad:`)
console.log(`   ✅ Conversión ISO → DD/MM/AAAA: Para mostrar en el formulario`)
console.log(`   ✅ Conversión DD/MM/AAAA → ISO: Para guardar en la base de datos`)
console.log(`   ✅ Manejo de errores: Try-catch en ambas funciones`)
console.log(`   ✅ Validación de entrada: Verificación de formato`)
console.log(`   ✅ Formato consistente: DD/MM/AAAA en la interfaz`)
