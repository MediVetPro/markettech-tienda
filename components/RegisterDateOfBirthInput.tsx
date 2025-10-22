'use client'

import { useState, useEffect } from 'react'
import { Calendar, AlertCircle, CheckCircle, Cake, Star, Clock, User } from 'lucide-react'

interface RegisterDateOfBirthInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

export default function RegisterDateOfBirthInput({
  value,
  onChange,
  disabled = false,
  required = false,
  className = ''
}: RegisterDateOfBirthInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [age, setAge] = useState<number | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showAgeInfo, setShowAgeInfo] = useState(false)

  // Validar fecha de nacimiento
  useEffect(() => {
    if (!value) {
      setIsValid(null)
      setErrorMessage('')
      setAge(null)
      setShowAgeInfo(false)
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
      setShowAgeInfo(false)
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
      setShowAgeInfo(false)
      return
    }

    if (exactAge < 13) {
      setIsValid(false)
      setErrorMessage('Você deve ter pelo menos 13 anos para se registrar')
      setAge(null)
      setShowAgeInfo(false)
      return
    }

    if (exactAge > 120) {
      setIsValid(false)
      setErrorMessage('A idade informada não é válida')
      setAge(null)
      setShowAgeInfo(false)
      return
    }

    setIsValid(true)
    setErrorMessage('')
    setAge(exactAge)
    setShowAgeInfo(true)
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
    let baseClasses = `w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 ${
      disabled ? 'bg-gray-100 cursor-not-allowed' : ''
    }`

    if (isFocused) {
      baseClasses += ' transform scale-[1.02] shadow-sm'
    }

    if (isValid !== null) {
      if (isValid) {
        baseClasses += ' border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
      } else {
        baseClasses += ' border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
      }
    } else {
      baseClasses += ' border-gray-300 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-300'
    }

    return `${baseClasses} ${className}`
  }

  const getIcon = () => {
    if (isValid === null) return <Calendar className="w-5 h-5 text-gray-400" />
    if (isValid) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <AlertCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusColor = () => {
    if (isValid === null) return 'text-gray-500'
    return isValid ? 'text-green-600' : 'text-red-600'
  }

  const getZodiacSign = (month: number, day: number): string => {
    const signs = [
      { name: 'Capricornio', start: [12, 22], end: [1, 19] },
      { name: 'Acuario', start: [1, 20], end: [2, 18] },
      { name: 'Piscis', start: [2, 19], end: [3, 20] },
      { name: 'Aries', start: [3, 21], end: [4, 19] },
      { name: 'Tauro', start: [4, 20], end: [5, 20] },
      { name: 'Géminis', start: [5, 21], end: [6, 20] },
      { name: 'Cáncer', start: [6, 21], end: [7, 22] },
      { name: 'Leo', start: [7, 23], end: [8, 22] },
      { name: 'Virgo', start: [8, 23], end: [9, 22] },
      { name: 'Libra', start: [9, 23], end: [10, 22] },
      { name: 'Escorpio', start: [10, 23], end: [11, 21] },
      { name: 'Sagitario', start: [11, 22], end: [12, 21] }
    ]

    for (const sign of signs) {
      if (
        (month === sign.start[0] && day >= sign.start[1]) ||
        (month === sign.end[0] && day <= sign.end[1])
      ) {
        return sign.name
      }
    }
    return 'Capricornio'
  }

  const getZodiacSignFromDate = (dateString: string) => {
    if (!dateString || !dateString.includes('/')) return ''
    
    const parts = dateString.split('/')
    if (parts.length !== 3) return ''
    
    const day = parseInt(parts[0])
    const month = parseInt(parts[1])
    
    if (isNaN(day) || isNaN(month)) return ''
    
    return getZodiacSign(month, day)
  }

  return (
    <div className="space-y-4">
      {/* Label con diseño mejorado */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          <label className="text-lg font-semibold text-gray-800">
            Data de Nascimento
          </label>
        </div>
        {required && <span className="text-red-500 text-xl">*</span>}
      </div>
      
      {/* Input con diseño mejorado */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {getIcon()}
        </div>
        
        <input
          type="text"
          value={value}
          onChange={handleDateChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          required={required}
          className={`${getInputClasses()} pl-12 pr-4`}
          placeholder="DD/MM/AAAA"
          maxLength={10}
        />
        
        {/* Indicador de estado */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {isValid !== null && (
            <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          )}
        </div>
      </div>

      {/* Mensajes de validación con diseño mejorado */}
      {isValid !== null && (
        <div className="space-y-2">
          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
            </div>
          )}
          
          {isValid && age !== null && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">
                Perfeito! Você tem {age} anos
              </p>
            </div>
          )}
        </div>
      )}


      {/* Información de ayuda */}
      {!value && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-600 text-center">
            📅 Digite sua data de nascimento no formato DD/MM/AAAA
          </p>
        </div>
      )}
    </div>
  )
}
