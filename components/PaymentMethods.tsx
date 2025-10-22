'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Smartphone, Banknote, Shield, Check, AlertCircle } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  processingTime: string
  fee: string
  available: boolean
}

interface PaymentMethodsProps {
  selectedPayment: string
  onPaymentSelect: (paymentId: string) => void
  onPaymentSubmit: () => void
  isProcessing: boolean
  total: number
}

export default function PaymentMethods({ 
  selectedPayment, 
  onPaymentSelect, 
  onPaymentSubmit, 
  isProcessing, 
  total 
}: PaymentMethodsProps) {
  const [showCardForm, setShowCardForm] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true)
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  // Función para cargar métodos de pago habilitados
  const fetchPaymentMethods = async () => {
    try {
      setIsLoadingPaymentMethods(true)
      const response = await fetch('/api/payment-methods')
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods')
      }
      
      const data = await response.json()
      
      // Mapear los métodos con sus iconos correspondientes
      const methodsWithIcons = data.paymentMethods.map((method: any) => ({
        ...method,
        icon: getPaymentMethodIcon(method.type)
      }))
      
      setPaymentMethods(methodsWithIcons)
      console.log('✅ Métodos de pago cargados:', methodsWithIcons.map((m: any) => m.type).join(', '))
    } catch (error) {
      console.error('❌ Error cargando métodos de pago:', error)
      // En caso de error, usar solo PIX como fallback
      setPaymentMethods([{
        id: 'pix',
        name: 'PIX',
        description: 'Pago instantáneo y seguro',
        icon: <Smartphone className="w-6 h-6" />,
        processingTime: 'Instantáneo',
        fee: 'Sin comisión',
        available: true
      }])
    } finally {
      setIsLoadingPaymentMethods(false)
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'PIX':
        return <Smartphone className="w-6 h-6" />
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard className="w-6 h-6" />
      case 'BOLETO':
      case 'BANK_TRANSFER':
        return <Banknote className="w-6 h-6" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

  // Cargar métodos de pago al montar el componente
  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(.{2})/, '$1/')
  }

  return (
    <div className="space-y-6">
      {/* Métodos de Pago */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-primary-600" />
          Método de Pago
        </h2>
        
        {isLoadingPaymentMethods ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
            <span className="text-gray-600">Cargando métodos de pago...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedPayment === method.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => method.available && onPaymentSelect(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedPayment === method.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{method.processingTime}</p>
                  <p className="text-sm font-medium text-gray-700">{method.fee}</p>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario de Tarjeta */}
      {selectedPayment === 'credit_card' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Tarjeta</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de la Tarjeta *
              </label>
              <input
                type="text"
                name="number"
                value={cardData.number}
                onChange={(e) => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={cardData.expiry}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre en la Tarjeta *
              </label>
              <input
                type="text"
                name="name"
                value={cardData.name}
                onChange={handleCardInputChange}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nombre como aparece en la tarjeta"
              />
            </div>
          </div>
        </div>
      )}

      {/* Información de PIX */}
      {selectedPayment === 'pix' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Pago con PIX</h3>
              <p className="text-green-700 text-sm mb-4">
                El pago será procesado instantáneamente. Recibirás un código QR para escanear con tu app bancaria.
              </p>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Código PIX:</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                  00020126580014br.gov.bcb.pix0136a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de Transferencia Bancaria */}
      {selectedPayment === 'bank_transfer' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Banknote className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Transferencia Bancaria</h3>
              <p className="text-blue-700 text-sm mb-4">
                Realiza una transferencia bancaria a nuestra cuenta. El pedido será confirmado una vez recibido el pago.
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-2 text-sm">
                  <p><strong>Banco:</strong> Banco do Brasil</p>
                  <p><strong>Agencia:</strong> 1234-5</p>
                  <p><strong>Conta:</strong> 12345-6</p>
                  <p><strong>CPF/CNPJ:</strong> 12.345.678/0001-90</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Pago */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Total a Pagar</h3>
          <span className="text-2xl font-bold text-primary-600">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <button
          onClick={onPaymentSubmit}
          disabled={isProcessing || !selectedPayment}
          className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Procesando Pago...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-3" />
              Finalizar Pedido
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          <Shield className="w-3 h-3 inline mr-1" />
          Pago 100% seguro y encriptado
        </p>
      </div>
    </div>
  )
}
