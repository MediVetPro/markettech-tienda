const FormData = require('form-data')
const fetch = require('node-fetch')

async function testProductCreation() {
  try {
    console.log('🔍 Probando creación de producto...')
    
    // Obtener token de autenticación
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@techstore.com',
        password: 'admin123'
      })
    })
    
    if (!loginResponse.ok) {
      console.error('❌ Error en login:', await loginResponse.text())
      return
    }
    
    const loginData = await loginResponse.json()
    const token = loginData.token
    console.log('✅ Token obtenido:', token.substring(0, 20) + '...')
    
    // Crear FormData para el producto
    const formData = new FormData()
    formData.append('title', 'Producto de Prueba')
    formData.append('description', 'Descripción del producto de prueba')
    formData.append('price', '100')
    formData.append('supplierPrice', '50')
    formData.append('marginPercentage', '50')
    formData.append('condition', 'NEW')
    formData.append('aestheticCondition', '10')
    formData.append('specifications', 'Especificaciones del producto')
    formData.append('categories', 'test')
    formData.append('stock', '10')
    formData.append('status', 'ACTIVE')
    formData.append('manufacturerCode', 'TEST-001')
    formData.append('manufacturer', 'Test Manufacturer')
    formData.append('model', 'Test Model')
    
    // Crear producto
    const productResponse = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    console.log('📊 Status de respuesta:', productResponse.status)
    console.log('📊 Headers de respuesta:', Object.fromEntries(productResponse.headers.entries()))
    
    const productData = await productResponse.text()
    console.log('📊 Respuesta completa:', productData)
    
    if (productResponse.ok) {
      console.log('✅ Producto creado exitosamente!')
    } else {
      console.error('❌ Error creando producto:', productData)
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

testProductCreation()
