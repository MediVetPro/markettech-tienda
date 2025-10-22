'use client'

import { useState, useEffect } from 'react'
import { QrCode, Copy, Check, Clock, Smartphone } from 'lucide-react'

interface PixPaymentProps {
  paymentId: string
  amount: number
  description: string
  onPaymentConfirmed?: () => void
  onCartClear?: () => void
}

export default function PixPayment({ 
  paymentId, 
  amount, 
  description, 
  onPaymentConfirmed,
  onCartClear
}: PixPaymentProps) {
  const [payment, setPayment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutos en segundos
  const [isSimulating, setIsSimulating] = useState(false)

  // Cargar datos del pago PIX
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        console.log('🔍 [PixPayment] Cargando datos del pago:', paymentId)
        const token = localStorage.getItem('smartesh_token')
        const response = await fetch(`/api/pix/check-payment?paymentId=${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('🔍 [PixPayment] Datos del pago cargados:', data.payment)
          setPayment(data.payment)
        } else {
          console.error('❌ [PixPayment] Error en respuesta:', response.status)
        }
      } catch (error) {
        console.error('❌ [PixPayment] Error fetching payment:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayment()
  }, [paymentId])

  // Verificar estado del pago cada 10 segundos
  useEffect(() => {
    if (!payment || payment.status !== 'PENDING') return

    console.log('🔍 [PixPayment] Iniciando polling para pago:', paymentId)

    const interval = setInterval(async () => {
      if (isChecking) return
      
      console.log('🔍 [PixPayment] Verificando estado del pago...')
      setIsChecking(true)
      try {
        const token = localStorage.getItem('smartesh_token')
        const response = await fetch(`/api/pix/check-payment?paymentId=${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('🔍 [PixPayment] Estado del pago:', data.payment.status)
          setPayment(data.payment)
          
          if (data.payment.status === 'PAID' && onPaymentConfirmed) {
            console.log('✅ [PixPayment] Pago confirmado, cerrando modal...')
            // Primero confirmar el pago (redirigir), luego limpiar el carrito
            onPaymentConfirmed()
            // Limpiar carrito después de la redirección
            if (onCartClear) {
              console.log('🧹 [PixPayment] Limpiando carrito después de redirección...')
              setTimeout(() => {
                onCartClear()
              }, 100) // Pequeño delay para asegurar que la redirección se ejecute primero
            }
          }
        }
      } catch (error) {
        console.error('❌ [PixPayment] Error checking payment:', error)
      } finally {
        setIsChecking(false)
      }
    }, 10000) // Verificar cada 10 segundos

    return () => {
      console.log('🔍 [PixPayment] Limpiando polling...')
      clearInterval(interval)
    }
  }, [paymentId, payment, onPaymentConfirmed])

  // Contador regresivo
  useEffect(() => {
    if (!payment || payment.status !== 'PENDING') return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [payment])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const simulatePayment = async () => {
    setIsSimulating(true)
    try {
      const token = localStorage.getItem('smartesh_token')
      const response = await fetch('/api/pix/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentId })
      })

      if (response.ok) {
        const data = await response.json()
        setPayment((prev: any) => ({ ...prev, status: 'PAID', paidAt: data.payment.paidAt }))
        // Primero confirmar el pago (redirigir), luego limpiar el carrito
        if (onPaymentConfirmed) {
          console.log('✅ [PixPayment] Confirmando pago y redirigiendo...')
          onPaymentConfirmed()
        }
        // Limpiar carrito después de la redirección
        if (onCartClear) {
          console.log('🧹 [PixPayment] Limpiando carrito después de redirección...')
          setTimeout(() => {
            onCartClear()
          }, 100) // Pequeño delay para asegurar que la redirección se ejecute primero
        }
      } else {
        alert('Erro ao simular pagamento')
      }
    } catch (error) {
      console.error('Error simulating payment:', error)
      alert('Erro ao simular pagamento')
    } finally {
      setIsSimulating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        <span className="text-gray-600">Carregando dados do pagamento...</span>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <Clock className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erro ao carregar o pagamento
        </h3>
        <p className="text-gray-600">
          Não foi possível carregar os dados do pagamento PIX.
        </p>
      </div>
    )
  }

  if (payment.status === 'PAID') {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 mb-4">
          <Check className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pagamento Confirmado!
        </h3>
        <p className="text-gray-600">
          Seu pagamento foi processado com sucesso.
        </p>
      </div>
    )
  }

  if (payment.status === 'EXPIRED') {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <Clock className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pagamento Expirado
        </h3>
        <p className="text-gray-600">
          O tempo para realizar o pagamento expirou.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8 text-primary-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">
            Pagamento PIX
          </h3>
        </div>
        <p className="text-gray-600">
          Escaneie o código QR ou copie a chave PIX para realizar o pagamento
        </p>
      </div>

      {/* Informação do pagamento */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Valor:</span>
          <span className="text-lg font-semibold text-gray-900">
            R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Descrição:</span>
          <span className="text-sm text-gray-900">{description}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tempo restante:</span>
          <span className={`text-sm font-medium ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* QR Code */}
      {payment.qrCode && (
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
            <img 
              src={payment.qrCode} 
              alt="QR Code PIX" 
              className="w-48 h-48 mx-auto"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Escaneie com seu app bancário
          </p>
        </div>
      )}

      {/* Código PIX */}
      {payment.qrCodeText && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código PIX (Copiar e Colar)
          </label>
          <div className="flex">
            <input
              type="text"
              value={payment.qrCodeText}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono"
            />
            <button
              onClick={() => copyToClipboard(payment.qrCodeText)}
              className="px-3 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Copie este código e cole no seu app bancário
          </p>
        </div>
      )}

      {/* Chave PIX */}
      {payment.pixKey && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chave PIX
          </label>
          <div className="flex">
            <input
              type="text"
              value={payment.pixKey}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
            />
            <button
              onClick={() => copyToClipboard(payment.pixKey)}
              className="px-3 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use esta chave PIX para fazer o pagamento
          </p>
        </div>
      )}

      {/* Estado do pagamento */}
      <div className="text-center">
        {isChecking && (
          <div className="flex items-center justify-center text-primary-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
            <span className="text-sm">Verificando pagamento...</span>
          </div>
        )}
        
        {!isChecking && payment.status === 'PENDING' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <Clock className="w-4 h-4 inline mr-1" />
              Aguardando confirmação do pagamento
            </div>
            
            {/* Botão de simulação para testes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-3">
                <strong>🧪 Modo Teste:</strong> Use este botão para simular um pagamento PIX real
              </p>
              <button
                onClick={simulatePayment}
                disabled={isSimulating}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSimulating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                    Simulando...
                  </>
                ) : (
                  'Simular Pagamento PIX'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
