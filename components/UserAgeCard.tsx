'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Star, Cake } from 'lucide-react'
import AgeDisplay from './AgeDisplay'

interface UserAgeCardProps {
  birthDate: string
  className?: string
}

export default function UserAgeCard({ birthDate, className = '' }: UserAgeCardProps) {
  const [ageInfo, setAgeInfo] = useState<{
    years: number
    months: number
    days: number
    totalDays: number
    nextBirthday: string
    daysUntilBirthday: number
    zodiacSign: string
    isBirthdayToday: boolean
  } | null>(null)

  useEffect(() => {
    if (!birthDate) {
      setAgeInfo(null)
      return
    }

    const calculateAgeInfo = (birthDate: string) => {
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

      const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))

      // Calcular próximo cumpleaños
      const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
      const isBirthdayToday = nextBirthday.getMonth() === today.getMonth() && nextBirthday.getDate() === today.getDate()
      
      if (nextBirthday <= today && !isBirthdayToday) {
        nextBirthday.setFullYear(today.getFullYear() + 1)
      }

      const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Signo zodiacal
      const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate())

      return {
        years,
        months,
        days,
        totalDays,
        nextBirthday: nextBirthday.toLocaleDateString(),
        daysUntilBirthday,
        zodiacSign,
        isBirthdayToday
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

    const age = calculateAgeInfo(birthDate)
    setAgeInfo(age)
  }, [birthDate])

  if (!ageInfo) {
    return null
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">Información de Edad</h3>
        </div>
        {ageInfo.isBirthdayToday && (
          <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            <Cake className="w-4 h-4" />
            <span>¡Cumpleaños!</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Edad principal */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-800">{ageInfo.years}</p>
              <p className="text-sm text-blue-600">años</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>{ageInfo.months} meses</p>
              <p>{ageInfo.days} días</p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Días vividos</span>
            </div>
            <p className="text-lg font-semibold text-blue-800">
              {ageInfo.totalDays.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center space-x-2 mb-1">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Signo</span>
            </div>
            <p className="text-sm font-semibold text-blue-800">
              {ageInfo.zodiacSign}
            </p>
          </div>
        </div>

        {/* Próximo cumpleaños */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Próximo cumpleaños</p>
              <p className="text-sm text-gray-600">{ageInfo.nextBirthday}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-800">
                {ageInfo.daysUntilBirthday}
              </p>
              <p className="text-xs text-gray-600">días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
