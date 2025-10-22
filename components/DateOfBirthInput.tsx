'use client'

import { useState, useEffect } from 'react'
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import AgeDisplay from './AgeDisplay'

interface DateOfBirthInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  label?: string
  className?: string
  showValidation?: boolean
  showAgeInfo?: boolean
}

export default function DateOfBirthInput({
  value,
  onChange,
  disabled = false,
  required = false,
  label = 'Data de Nascimento',
  className = '',
  showValidation = true,
  showAgeInfo = false
}: DateOfBirthInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [age, setAge] = useState<number | null>(null)

  // Validar fecha de nacimiento
  useEffect(() => {
    if (!value) {
      setIsValid(null)
      setErrorMessage('')
      setAge(null)
      return
    }

    // Convertir formato DD/MM/AAAA a AAAA-MM-DD para Date
    const convertToDate = (dateStr: string) => {
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

    const birthDate = convertToDate(value)
    
    if (!birthDate || isNaN(birthDate.getTime())) {
      setIsValid(false)
      setErrorMessage('Formato inválido. Use DD/MM/AAAA')
      setAge(null)
      return
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
      setIsValid(false)
      setErrorMessage('A data de nascimento não pode ser futura')
      setAge(null)
      return
    }

    if (exactAge < 13) {
      setIsValid(false)
      setErrorMessage('Você deve ter pelo menos 13 anos')
      setAge(null)
      return
    }

    if (exactAge > 120) {
      setIsValid(false)
      setErrorMessage('A idade informada não é válida')
      setAge(null)
      return
    }

    setIsValid(true)
    setErrorMessage('')
    setAge(exactAge)
  }, [value])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    
    // Remover caracteres no numéricos excepto /
    newValue = newValue.replace(/[^\d/]/g, '')
    
    // Limitar a 10 caracteres máximo
    if (newValue.length > 10) {
      newValue = newValue.slice(0, 10)
    }
    
    // Formatear automáticamente mientras escribe
    if (newValue.length > 0) {
      // Si no tiene / y tiene más de 2 caracteres, agregar /
      if (!newValue.includes('/') && newValue.length > 2) {
        newValue = newValue.slice(0, 2) + '/' + newValue.slice(2)
      }
      // Si tiene una / y después de ella tiene más de 2 caracteres, agregar otra /
      const parts = newValue.split('/')
      if (parts.length === 2 && parts[1].length > 2) {
        newValue = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2)
      }
    }
    
    onChange(newValue)
  }

  const getInputClasses = () => {
    let baseClasses = `w-full px-3 py-2 text-gray-900 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
      disabled ? 'bg-gray-100 cursor-not-allowed' : ''
    }`

    if (showValidation && isValid !== null) {
      if (isValid) {
        baseClasses += ' border-green-300 focus:ring-green-500 focus:border-green-500'
      } else {
        baseClasses += ' border-red-300 focus:ring-red-500 focus:border-red-500'
      }
    } else {
      baseClasses += ' border-gray-300 focus:ring-primary-500 focus:border-primary-500'
    }

    return `${baseClasses} ${className}`
  }

  const getIcon = () => {
    if (!showValidation || isValid === null) return null
    
    if (isValid) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusColor = () => {
    if (!showValidation || isValid === null) return 'text-gray-500'
    return isValid ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={handleDateChange}
          disabled={disabled}
          required={required}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          className={`${getInputClasses()} pl-10`}
          aria-describedby={errorMessage ? `${label}-error` : undefined}
        />
        
        {showValidation && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {getIcon()}
          </div>
        )}
      </div>

      {/* Mensaje de validación */}
      {showValidation && (
        <div className="space-y-1">
          {errorMessage && (
            <p id={`${label}-error`} className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errorMessage}
            </p>
          )}
          
          {isValid && age !== null && (
            <p className={`text-sm ${getStatusColor()} flex items-center`}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Edad: {age} años
            </p>
          )}
        </div>
      )}

      {/* Información adicional */}
      {!value && (
        <p className="text-xs text-gray-500">
          Formato: DD/MM/AAAA
        </p>
      )}

      {/* Mostrar información de edad */}
      {showAgeInfo && value && isValid && (
        <AgeDisplay 
          birthDate={value} 
          showDetails={true}
          className="mt-3"
        />
      )}
    </div>
  )
}
