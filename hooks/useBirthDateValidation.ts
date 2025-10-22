import { useState, useEffect } from 'react'

interface BirthDateValidation {
  isValid: boolean | null
  error: string
  age: number | null
  isDirty: boolean
}

export function useBirthDateValidation(initialValue: string = '') {
  const [validation, setValidation] = useState<BirthDateValidation>({
    isValid: null,
    error: '',
    age: null,
    isDirty: false
  })

  const validateBirthDate = (birthDate: string): BirthDateValidation => {
    if (!birthDate) {
      return {
        isValid: null,
        error: '',
        age: null,
        isDirty: false
      }
    }

    const date = new Date(birthDate)
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: 'Fecha de nacimiento inválida',
        age: null,
        isDirty: true
      }
    }

    const today = new Date()
    
    // Verificar que no sea una fecha futura
    if (date > today) {
      return {
        isValid: false,
        error: 'La fecha de nacimiento no puede ser futura',
        age: null,
        isDirty: true
      }
    }

    // Calcular edad exacta
    const ageInYears = today.getFullYear() - date.getFullYear()
    const monthDiff = today.getMonth() - date.getMonth()
    const dayDiff = today.getDate() - date.getDate()
    
    let age = ageInYears
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--
    }

    // Verificar edad mínima (13 años)
    if (age < 13) {
      return {
        isValid: false,
        error: 'Debes tener al menos 13 años para registrarte',
        age,
        isDirty: true
      }
    }

    // Verificar edad máxima razonable (120 años)
    if (age > 120) {
      return {
        isValid: false,
        error: 'La edad ingresada no es válida',
        age,
        isDirty: true
      }
    }

    return {
      isValid: true,
      error: '',
      age,
      isDirty: true
    }
  }

  const validate = (birthDate: string) => {
    const result = validateBirthDate(birthDate)
    setValidation(result)
    return result
  }

  const reset = () => {
    setValidation({
      isValid: null,
      error: '',
      age: null,
      isDirty: false
    })
  }

  // Validar automáticamente cuando cambia el valor inicial
  useEffect(() => {
    if (initialValue) {
      validate(initialValue)
    } else {
      reset()
    }
  }, [initialValue])

  return {
    validation,
    validate,
    reset,
    isValid: validation.isValid,
    error: validation.error,
    age: validation.age,
    isDirty: validation.isDirty
  }
}
