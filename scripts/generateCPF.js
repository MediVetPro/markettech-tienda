/**
 * Script para generar un CPF válido
 */

function generateValidCPF() {
  // Generar los primeros 9 dígitos aleatoriamente
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  
  // Calcular el primer dígito verificador
  const firstDigit = calculateFirstDigit(digits);
  digits.push(firstDigit);
  
  // Calcular el segundo dígito verificador
  const secondDigit = calculateSecondDigit(digits);
  digits.push(secondDigit);
  
  // Formatear como CPF (XXX.XXX.XXX-XX)
  return formatCPF(digits);
}

function calculateFirstDigit(digits) {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function calculateSecondDigit(digits) {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function formatCPF(digits) {
  return `${digits.slice(0, 3).join('')}.${digits.slice(3, 6).join('')}.${digits.slice(6, 9).join('')}-${digits.slice(9, 11).join('')}`;
}

// Generar y mostrar un CPF válido
const cpf = generateValidCPF();
console.log('CPF válido generado:', cpf);

// Generar múltiples CPFs
console.log('\nGenerando 5 CPFs válidos:');
for (let i = 0; i < 5; i++) {
  console.log(`${i + 1}. ${generateValidCPF()}`);
}
