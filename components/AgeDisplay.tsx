'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User } from 'lucide-react'

interface AgeDisplayProps {
  birthDate: string
  showDetails?: boolean
  className?: string
}

export default function AgeDisplay({ 
  birthDate, 
  showDetails = false, 
  className = '' 
}: AgeDisplayProps) {
  const [ageInfo, setAgeInfo] = useState<{
    years: number
    months: number
    days: number
    totalDays: number
    nextBirthday: string
    zodiacSign?: string
  } | null>(null)

  useEffect(() => {
    if (!birthDate) {
      setAgeInfo(null)
      return
    }

    const calculateAge = (birthDate: string) => {
      const birth = new Date(birthDate)
      const today = new Date()
      
      if (isNaN(birth.getTime())) {
        return null
      }

      let years = today.getFullYear() - birth.getFullYear()
      let months = today.getMonth() - birth.getMonth()
      let days = today.getDate() - birth.getDate()

      if (days < 0) {
        months--
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        days += lastMonth.getDate()
      }

      if (months < 0) {
        years--
        months += 12
      }

      // Calcular días totales vividos
      const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))

      // Calcular próximo cumpleaños
      const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
      if (nextBirthday <= today) {
        nextBirthday.setFullYear(today.getFullYear() + 1)
      }

      // Signo zodiacal (simplificado)
      const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate())

      return {
        years,
        months,
        days,
        totalDays,
        nextBirthday: nextBirthday.toLocaleDateString(),
        zodiacSign
      }
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

    const age = calculateAge(birthDate)
    setAgeInfo(age)
  }, [birthDate])

  if (!ageInfo) {
    return null
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <User className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">
          Información de Edad
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            <strong>{ageInfo.years} años</strong>
            {showDetails && (
              <span className="text-gray-600">
                , {ageInfo.months} meses y {ageInfo.days} días
              </span>
            )}
          </span>
        </div>

        {showDetails && (
          <>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                <strong>{ageInfo.totalDays.toLocaleString()}</strong> días vividos
              </span>
            </div>

            <div className="text-sm text-blue-700">
              <strong>Próximo cumpleaños:</strong> {ageInfo.nextBirthday}
            </div>

            {ageInfo.zodiacSign && (
              <div className="text-sm text-blue-700">
                <strong>Signo zodiacal:</strong> {ageInfo.zodiacSign}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
