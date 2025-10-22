'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Smartphone, Banknote, Shield, Check, AlertCircle, QrCode, ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

export default function PaymentPage() {
  const router = useRouter()
  const { items: cartItems, getTotalPrice, clearCart } = useCart()
  const { user, isAuthenticated, loading, isInitialized } = useAuth()
  
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [showEmptyCart, setShowEmptyCart] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({
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

  useEffect(() => {
    console.log('PaymentPage useEffect:', {
      isAuthenticated,
      loading,
      cartItemsLength: cartItems.length,
      user: user?.name
    })
    
    // Solo redirigir si no está autenticado y el contexto ya se inicializó
    if (!isAuthenticated && isInitialized) {
      console.log('Redirigiendo a login - no autenticado')
      router.push('/login?redirect=/checkout/payment')
      return
    }
    
    if (cartItems.length === 0 && isAuthenticated) {
      console.log('Carrito vacío - mostrando mensaje')
      setShowEmptyCart(true)
      return
    }
  }, [isAuthenticated, isInitialized, cartItems.length, router])

  // Cargar información del usuario cuando esté disponible
  useEffect(() => {
    if (user && isAuthenticated) {
      setCustomerInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || ''
      })
    }
  }, [user, isAuthenticated])

  const handlePaymentSubmit = async () => {
    if (!selectedPayment) {
      alert('Por favor selecciona un método de pago')
      return
    }

    // Validar que todos los campos obligatorios estén completos
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
    const missingFields = requiredFields.filter(field => !customerInfo[field as keyof typeof customerInfo]?.trim())
    
    if (missingFields.length > 0) {
      const fieldNames = {
        name: 'Nombre Completo',
        email: 'Email',
        phone: 'Teléfono',
        address: 'Dirección',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: 'CEP'
      }
      
      const missingFieldNames = missingFields.map(field => fieldNames[field as keyof typeof fieldNames])
      alert(`Por favor completa los siguientes campos obligatorios:\n${missingFieldNames.join(', ')}`)
      return
    }

    setIsProcessing(true)

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Crear orden
      const orderData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} - ${customerInfo.zipCode}`,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: getTotalPrice(), // TODO: Incluir costo de envío aquí también
        paymentMethod: selectedPayment,
        status: 'PENDING'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        // Limpiar carrito
        clearCart()
        
        // Redirigir a página de confirmación
        router.push('/checkout/success')
      } else {
        throw new Error('Error al procesar el pedido')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error al procesar el pago. Inténtalo de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (showEmptyCart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Carrito Vacío</h1>
          <p className="text-gray-600 mb-6">No tienes productos en tu carrito para proceder al pago.</p>
          <button
            onClick={() => router.push('/cart')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Ver Carrito
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Método de Pago</h1>
          <p className="text-gray-600 mt-2">Selecciona tu forma de pago preferida</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Métodos de Pago */}
          <div className="lg:col-span-2">
            {/* Información del Cliente */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Información del Cliente
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Todos los campos son obligatorios para completar tu pedido
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={customerInfo.zipCode}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={customerInfo.state}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* PIX */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPayment === 'pix'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment('pix')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      selectedPayment === 'pix' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">PIX</h3>
                      <p className="text-gray-600">Pago instantáneo y seguro</p>
                      <p className="text-sm text-green-600 font-medium">Sin comisión • Instantáneo</p>
                    </div>
                  </div>
                  {selectedPayment === 'pix' && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </div>

              {/* Tarjeta de Crédito */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPayment === 'credit_card'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment('credit_card')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      selectedPayment === 'credit_card' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Tarjeta de Crédito</h3>
                      <p className="text-gray-600">Visa, Mastercard, American Express</p>
                      <p className="text-sm text-gray-500">2.9% + R$ 0.39 • 2-3 días</p>
                    </div>
                  </div>
                  {selectedPayment === 'credit_card' && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </div>

              {/* Tarjeta de Débito */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPayment === 'debit_card'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment('debit_card')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      selectedPayment === 'debit_card' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Tarjeta de Débito</h3>
                      <p className="text-gray-600">Débito en línea</p>
                      <p className="text-sm text-gray-500">1.9% + R$ 0.39 • 1-2 días</p>
                    </div>
                  </div>
                  {selectedPayment === 'debit_card' && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </div>

              {/* Transferencia Bancaria */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPayment === 'bank_transfer'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment('bank_transfer')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      selectedPayment === 'bank_transfer' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Transferencia Bancaria</h3>
                      <p className="text-gray-600">Transferencia directa</p>
                      <p className="text-sm text-green-600 font-medium">Sin comisión • 1-3 días</p>
                    </div>
                  </div>
                  {selectedPayment === 'bank_transfer' && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Formulario de Tarjeta */}
            {selectedPayment === 'credit_card' && (
              <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
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
              <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Pago con PIX</h3>
                    <p className="text-green-700 mb-4">
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
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Banknote className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Transferencia Bancaria</h3>
                    <p className="text-blue-700 mb-4">
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
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-gray-600 text-sm">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">R$ {getTotalPrice().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Envío:</span>
                  <span className="text-gray-900">Gratis</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-primary-600">R$ {getTotalPrice().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <button
                onClick={handlePaymentSubmit}
                disabled={isProcessing || !selectedPayment}
                className="w-full mt-6 bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg"
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
        </div>
      </div>
    </div>
  )
}
