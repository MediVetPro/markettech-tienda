/**
 * Generador de CPF válido para Brasil
 * Genera un CPF con dígitos verificadores correctos
 */

export function generateValidCPF(): string {
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

function calculateFirstDigit(digits: number[]): number {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function calculateSecondDigit(digits: number[]): number {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function formatCPF(digits: number[]): string {
  return `${digits.slice(0, 3).join('')}.${digits.slice(3, 6).join('')}.${digits.slice(6, 9).join('')}-${digits.slice(9, 11).join('')}`;
}

/**
 * Valida si un CPF es válido
 */
export function validateCPF(cpf: string): boolean {
  // Remover caracteres no numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verificar si tiene 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verificar se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Converter para array de números
  const digits = cleanCPF.split('').map(Number);
  
  // Calcular e verificar o primeiro dígito
  const firstDigit = calculateFirstDigit(digits.slice(0, 9));
  if (digits[9] !== firstDigit) return false;
  
  // Calcular e verificar o segundo dígito
  const secondDigit = calculateSecondDigit(digits.slice(0, 10));
  if (digits[10] !== secondDigit) return false;
  
  return true;
}

/**
 * Genera múltiples CPFs válidos
 */
export function generateMultipleCPFs(count: number): string[] {
  const cpfs: string[] = [];
  for (let i = 0; i < count; i++) {
    cpfs.push(generateValidCPF());
  }
  return cpfs;
}

// Ejemplo de uso:
// const cpf = generateValidCPF();
// console.log('CPF generado:', cpf);
// console.log('Es válido:', validateCPF(cpf));
