// Script para probar la validación de progreso del registro
console.log('🧪 Probando validación de progreso del registro...\n')

// Función para validar progreso como en el componente
function validateProgress(formData) {
  let step = 1

  // Validar email con regex básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidEmail = emailRegex.test(formData.email)

  // Validar CPF (formato básico)
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
  const isValidCPF = cpfRegex.test(formData.cpf)

  // Validar data de nascimento (formato DD/MM/AAAA)
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
  const isValidDate = dateRegex.test(formData.birthDate)

  // Validar CEP (formato brasileño)
  const zipRegex = /^\d{5}-?\d{3}$/
  const isValidZip = zipRegex.test(formData.zipCode)

  // Paso 1: Informações Básicas (nome, email, telefone)
  if (formData.name.trim() && isValidEmail && formData.phone.trim()) {
    step = 2
  }

  // Paso 2: Informações Pessoais (CPF, data de nascimento, gênero)
  if (step === 2 && isValidCPF && isValidDate && formData.gender.trim()) {
    step = 3
  }

  // Paso 3: Endereço (endereço, cidade, estado, CEP)
  if (step === 3 && formData.address.trim() && formData.city.trim() && formData.state.trim() && isValidZip) {
    step = 4
  }

  return step
}

// Casos de prueba
const testCases = [
  {
    name: 'Formulário vazio',
    formData: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      birthDate: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    expected: 1
  },
  {
    name: 'Só nome preenchido',
    formData: {
      name: 'João Silva',
      email: '',
      phone: '',
      cpf: '',
      birthDate: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    expected: 1
  },
  {
    name: 'Informações básicas completas',
    formData: {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      cpf: '',
      birthDate: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    expected: 2
  },
  {
    name: 'Informações pessoais completas',
    formData: {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      birthDate: '15/03/1990',
      gender: 'masculino',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    expected: 3
  },
  {
    name: 'Formulário completo',
    formData: {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      birthDate: '15/03/1990',
      gender: 'masculino',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    expected: 4
  },
  {
    name: 'Email inválido',
    formData: {
      name: 'João Silva',
      email: 'email-invalido',
      phone: '(11) 99999-9999',
      cpf: '',
      birthDate: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    expected: 1
  },
  {
    name: 'CPF inválido',
    formData: {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      cpf: '12345678900',
      birthDate: '15/03/1990',
      gender: 'masculino',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    expected: 2
  },
  {
    name: 'Data inválida',
    formData: {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      birthDate: '15-03-1990',
      gender: 'masculino',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    expected: 2
  },
  {
    name: 'CEP inválido',
    formData: {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      birthDate: '15/03/1990',
      gender: 'masculino',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '12345'
    },
    expected: 3
  }
]

let passedTests = 0
let totalTests = testCases.length

console.log('📝 Casos de prueba:')
testCases.forEach((testCase, index) => {
  const result = validateProgress(testCase.formData)
  const passed = result === testCase.expected
  
  console.log(`\n${index + 1}. ${testCase.name}`)
  console.log(`   Esperado: Paso ${testCase.expected}`)
  console.log(`   Resultado: Paso ${result}`)
  console.log(`   ${passed ? '✅ PASÓ' : '❌ FALLÓ'}`)
  
  if (passed) passedTests++
})

console.log(`\n📊 Resumen de pruebas:`)
console.log(`   ✅ Pasaron: ${passedTests}/${totalTests}`)
console.log(`   ❌ Fallaron: ${totalTests - passedTests}/${totalTests}`)
console.log(`   📈 Porcentaje: ${Math.round((passedTests / totalTests) * 100)}%`)

if (passedTests === totalTests) {
  console.log(`\n🎉 ¡Todas las pruebas pasaron! La validación de progreso funciona correctamente.`)
} else {
  console.log(`\n⚠️  Algunas pruebas fallaron. Revisar la implementación.`)
}
