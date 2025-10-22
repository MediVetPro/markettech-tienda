import validator from 'validator'
import DOMPurify from 'isomorphic-dompurify'

// Configuración de límites
export const VALIDATION_LIMITS = {
  // Texto general
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5000,
  SPECIFICATIONS_MAX_LENGTH: 10000,
  COMMENT_MAX_LENGTH: 500,
  NAME_MAX_LENGTH: 100,
  ADDRESS_MAX_LENGTH: 300,
  
  // Números
  PRICE_MIN: 0.01,
  PRICE_MAX: 999999.99,
  STOCK_MIN: 0,
  STOCK_MAX: 9999,
  
  // Teléfono
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  
  // CPF (Brasil)
  CPF_LENGTH: 11,
  
  // CEP (Brasil)
  ZIPCODE_LENGTH: 8
}

// Función para sanitizar HTML
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  // Configuración estricta de DOMPurify
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No permitir ningún tag HTML
    ALLOWED_ATTR: [], // No permitir ningún atributo
    KEEP_CONTENT: true // Mantener solo el contenido de texto
  })
  
  return clean.trim()
}

// Función para sanitizar texto simple
export function sanitizeText(input: string, maxLength?: number): string {
  if (!input || typeof input !== 'string') return ''
  
  let cleaned = input
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
  
  // Aplicar límite de longitud si se especifica
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength)
  }
  
  return cleaned
}

// Validación de email
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email es requerido' }
  }
  
  const trimmedEmail = email.trim().toLowerCase()
  
  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email no puede estar vacío' }
  }
  
  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email es demasiado largo' }
  }
  
  if (!validator.isEmail(trimmedEmail)) {
    return { valid: false, error: 'Formato de email inválido' }
  }
  
  return { valid: true }
}

// Validación de teléfono (Brasil)
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Teléfono es requerido' }
  }
  
  // Remover caracteres no numéricos
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length < VALIDATION_LIMITS.PHONE_MIN_LENGTH) {
    return { valid: false, error: `Teléfono debe tener al menos ${VALIDATION_LIMITS.PHONE_MIN_LENGTH} dígitos` }
  }
  
  if (cleanPhone.length > VALIDATION_LIMITS.PHONE_MAX_LENGTH) {
    return { valid: false, error: `Teléfono no puede tener más de ${VALIDATION_LIMITS.PHONE_MAX_LENGTH} dígitos` }
  }
  
  // Validar formato brasileño (DDD + número)
  if (cleanPhone.length === 11 && !cleanPhone.startsWith('11')) {
    // Celular com DDD (11 dígitos)
    if (!/^[1-9][1-9][9][0-9]{8}$/.test(cleanPhone)) {
      return { valid: false, error: 'Formato de celular inválido' }
    }
  } else if (cleanPhone.length === 10) {
    // Teléfono fixo com DDD (10 dígitos)
    if (!/^[1-9][1-9][2-5][0-9]{7}$/.test(cleanPhone)) {
      return { valid: false, error: 'Formato de teléfono fijo inválido' }
    }
  } else {
    return { valid: false, error: 'Formato de teléfono inválido' }
  }
  
  return { valid: true }
}

// Validación de CPF (Brasil)
export function validateCPF(cpf: string): { valid: boolean; error?: string } {
  if (!cpf || typeof cpf !== 'string') {
    return { valid: false, error: 'CPF es requerido' }
  }
  
  // Remover caracteres no numéricos
  const cleanCPF = cpf.replace(/\D/g, '')
  
  if (cleanCPF.length !== VALIDATION_LIMITS.CPF_LENGTH) {
    return { valid: false, error: 'CPF debe tener 11 dígitos' }
  }
  
  // Verificar se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { valid: false, error: 'CPF inválido' }
  }
  
  // Algoritmo de validação do CPF
  let sum = 0
  let remainder
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) {
    return { valid: false, error: 'CPF inválido' }
  }
  
  // Segundo dígito verificador
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) {
    return { valid: false, error: 'CPF inválido' }
  }
  
  return { valid: true }
}

// Validación de CEP (Brasil)
export function validateZipCode(zipCode: string): { valid: boolean; error?: string } {
  if (!zipCode || typeof zipCode !== 'string') {
    return { valid: false, error: 'CEP es requerido' }
  }
  
  // Remover caracteres no numéricos
  const cleanZipCode = zipCode.replace(/\D/g, '')
  
  if (cleanZipCode.length !== VALIDATION_LIMITS.ZIPCODE_LENGTH) {
    return { valid: false, error: 'CEP debe tener 8 dígitos' }
  }
  
  return { valid: true }
}

// Validación de precio
export function validatePrice(price: string | number): { valid: boolean; error?: string; value?: number } {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice)) {
    return { valid: false, error: 'Precio debe ser un número válido' }
  }
  
  if (numPrice < VALIDATION_LIMITS.PRICE_MIN) {
    return { valid: false, error: `Precio debe ser mayor a ${VALIDATION_LIMITS.PRICE_MIN}` }
  }
  
  if (numPrice > VALIDATION_LIMITS.PRICE_MAX) {
    return { valid: false, error: `Precio no puede ser mayor a ${VALIDATION_LIMITS.PRICE_MAX}` }
  }
  
  return { valid: true, value: numPrice }
}

// Validación de stock
export function validateStock(stock: string | number): { valid: boolean; error?: string; value?: number } {
  const numStock = typeof stock === 'string' ? parseInt(stock) : stock
  
  if (isNaN(numStock)) {
    return { valid: false, error: 'Stock debe ser un número válido' }
  }
  
  if (numStock < VALIDATION_LIMITS.STOCK_MIN) {
    return { valid: false, error: `Stock no puede ser menor a ${VALIDATION_LIMITS.STOCK_MIN}` }
  }
  
  if (numStock > VALIDATION_LIMITS.STOCK_MAX) {
    return { valid: false, error: `Stock no puede ser mayor a ${VALIDATION_LIMITS.STOCK_MAX}` }
  }
  
  return { valid: true, value: numStock }
}

// Validación de texto con longitud
export function validateTextLength(
  text: string, 
  fieldName: string, 
  minLength: number = 1, 
  maxLength?: number
): { valid: boolean; error?: string; value?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: `${fieldName} es requerido` }
  }
  
  const trimmedText = text.trim()
  
  if (trimmedText.length < minLength) {
    return { valid: false, error: `${fieldName} debe tener al menos ${minLength} caracteres (actualmente: ${trimmedText.length})` }
  }
  
  if (maxLength && trimmedText.length > maxLength) {
    return { valid: false, error: `${fieldName} no puede tener más de ${maxLength} caracteres` }
  }
  
  return { valid: true, value: trimmedText }
}

// Validación de condición estética (1-10)
export function validateAestheticCondition(condition: string | number): { valid: boolean; error?: string; value?: number } {
  const numCondition = typeof condition === 'string' ? parseInt(condition) : condition
  
  if (isNaN(numCondition)) {
    return { valid: false, error: 'Condición estética debe ser un número válido' }
  }
  
  if (numCondition < 1 || numCondition > 10) {
    return { valid: false, error: 'Condición estética debe estar entre 1 y 10' }
  }
  
  return { valid: true, value: numCondition }
}

// Función para validar fecha de nacimiento
export function validateBirthDate(birthDate: string): { valid: boolean; error?: string; age?: number } {
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

// Función para validar datos de usuario
export function validateUserData(userData: any): { valid: boolean; errors: string[]; sanitizedData?: any } {
  const errors: string[] = []
  const sanitizedData: any = {}

  // Validar nombre
  const nameValidation = validateTextLength(userData.name, 'Nombre', 2, VALIDATION_LIMITS.NAME_MAX_LENGTH)
  if (!nameValidation.valid) {
    errors.push(nameValidation.error!)
  } else {
    sanitizedData.name = sanitizeText(nameValidation.value!)
  }

  // Validar email
  const emailValidation = validateEmail(userData.email)
  if (!emailValidation.valid) {
    errors.push(emailValidation.error!)
  } else {
    sanitizedData.email = userData.email.trim().toLowerCase()
  }

  // Validar teléfono
  if (userData.phone) {
    const phoneValidation = validatePhone(userData.phone)
    if (!phoneValidation.valid) {
      errors.push(phoneValidation.error!)
    } else {
      sanitizedData.phone = userData.phone.replace(/\D/g, '')
    }
  }

  // Validar CPF
  if (userData.cpf) {
    const cpfValidation = validateCPF(userData.cpf)
    if (!cpfValidation.valid) {
      errors.push(cpfValidation.error!)
    } else {
      sanitizedData.cpf = userData.cpf.replace(/\D/g, '')
    }
  }

  // Validar CEP
  if (userData.zipCode) {
    const zipCodeValidation = validateZipCode(userData.zipCode)
    if (!zipCodeValidation.valid) {
      errors.push(zipCodeValidation.error!)
    } else {
      sanitizedData.zipCode = userData.zipCode.replace(/\D/g, '')
    }
  }

  // Validar fecha de nacimiento
  if (userData.birthDate) {
    const birthDateValidation = validateBirthDate(userData.birthDate)
    if (!birthDateValidation.valid) {
      errors.push(birthDateValidation.error!)
    } else {
      sanitizedData.birthDate = userData.birthDate
    }
  }

  // Validar contraseña
  if (userData.password) {
    if (userData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres')
    } else {
      sanitizedData.password = userData.password
    }
  } else {
    errors.push('La contraseña es requerida')
  }

  // Sanitizar otros campos de texto
  if (userData.address) {
    sanitizedData.address = sanitizeText(userData.address, VALIDATION_LIMITS.ADDRESS_MAX_LENGTH)
  }

  if (userData.city) {
    sanitizedData.city = sanitizeText(userData.city, 50)
  }

  if (userData.state) {
    sanitizedData.state = sanitizeText(userData.state, 2)
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  }
}

// Función para validar datos de producto
export function validateProductData(productData: any): { valid: boolean; errors: string[]; sanitizedData?: any } {
  const errors: string[] = []
  const sanitizedData: any = {}
  
  // Validar título
  const titleValidation = validateTextLength(productData.title, 'Título', 3, VALIDATION_LIMITS.TITLE_MAX_LENGTH)
  if (!titleValidation.valid) {
    errors.push(titleValidation.error!)
  } else {
    sanitizedData.title = sanitizeText(titleValidation.value!)
  }
  
  // Validar descripción
  const descriptionValidation = validateTextLength(productData.description, 'Descripción', 5, VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH)
  if (!descriptionValidation.valid) {
    errors.push(descriptionValidation.error!)
  } else {
    sanitizedData.description = sanitizeText(descriptionValidation.value!)
  }
  
  // Validar precio
  const priceValidation = validatePrice(productData.price)
  if (!priceValidation.valid) {
    errors.push(priceValidation.error!)
  } else {
    sanitizedData.price = priceValidation.value
  }
  
  // Validar precio del proveedor
  if (productData.supplierPrice) {
    const supplierPriceValidation = validatePrice(productData.supplierPrice)
    if (!supplierPriceValidation.valid) {
      errors.push(`Precio del proveedor: ${supplierPriceValidation.error}`)
    } else {
      sanitizedData.supplierPrice = supplierPriceValidation.value
    }
  }
  
  // Validar stock
  const stockValidation = validateStock(productData.stock)
  if (!stockValidation.valid) {
    errors.push(stockValidation.error!)
  } else {
    sanitizedData.stock = stockValidation.value
  }
  
  // Validar condición estética
  if (productData.aestheticCondition) {
    const conditionValidation = validateAestheticCondition(productData.aestheticCondition)
    if (!conditionValidation.valid) {
      errors.push(conditionValidation.error!)
    } else {
      sanitizedData.aestheticCondition = conditionValidation.value
    }
  }
  
  // Sanitizar especificaciones
  if (productData.specifications) {
    sanitizedData.specifications = sanitizeText(productData.specifications, VALIDATION_LIMITS.SPECIFICATIONS_MAX_LENGTH)
  }
  
  // Sanitizar categorías
  if (productData.categories) {
    sanitizedData.categories = sanitizeText(productData.categories, 200)
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  }
}
