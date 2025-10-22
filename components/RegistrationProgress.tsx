'use client'

import { CheckCircle, Circle, User, CreditCard, MapPin, Clock } from 'lucide-react'

interface RegistrationProgressProps {
  currentStep: number
  className?: string
}

export default function RegistrationProgress({ currentStep, className = '' }: RegistrationProgressProps) {
  const steps = [
    {
      id: 1,
      title: 'Informações Básicas',
      description: 'Nome, e-mail e telefone',
      icon: User,
      color: 'purple'
    },
    {
      id: 2,
      title: 'Informações Pessoais',
      description: 'CPF, data de nascimento e gênero',
      icon: CreditCard,
      color: 'blue'
    },
    {
      id: 3,
      title: 'Endereço',
      description: 'Endereço de entrega',
      icon: MapPin,
      color: 'green'
    }
  ]

  const getStepColor = (stepId: number, color: string) => {
    if (stepId < currentStep) {
      return 'text-green-600 bg-green-100'
    } else if (stepId === currentStep) {
      return `text-${color}-600 bg-${color}-100`
    } else {
      return 'text-gray-400 bg-gray-100'
    }
  }

  const getLineColor = (stepId: number) => {
    if (stepId < currentStep) {
      return 'bg-green-500'
    } else {
      return 'bg-gray-300'
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
        Progresso do Registro
      </h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          
          return (
            <div key={step.id} className="flex items-center space-x-4">
              {/* Icono del paso */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-100 text-green-600' 
                  : isCurrent 
                    ? `bg-${step.color}-100 text-${step.color}-600` 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              
              {/* Información del paso */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-sm font-medium ${
                    isCompleted 
                      ? 'text-green-800' 
                      : isCurrent 
                        ? `text-${step.color}-800` 
                        : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  {isCurrent && (
                    <span className={`text-xs px-2 py-1 rounded-full bg-${step.color}-100 text-${step.color}-800 font-medium`}>
                      Atual
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                      Concluído
                    </span>
                  )}
                </div>
                <p className={`text-xs ${
                  isCompleted 
                    ? 'text-green-600' 
                    : isCurrent 
                      ? `text-${step.color}-600` 
                      : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
              
              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <div className="flex-shrink-0 w-8 flex justify-center">
                  <div className={`w-0.5 h-8 transition-all duration-200 ${getLineColor(step.id)}`}></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Barra de progreso */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progresso</span>
          <span>{Math.round(((currentStep - 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
