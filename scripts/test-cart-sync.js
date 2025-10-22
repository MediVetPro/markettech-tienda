// Script para probar sincronización de carrito entre dispositivos
// Ejecutar en la consola del navegador

console.log('🌐 Probando sincronización de carrito entre dispositivos...')

// Función para simular agregar producto al carrito
async function simulateAddToCart() {
  const testProduct = {
    id: 'test-1',
    title: 'iPhone 15 Pro Max',
    price: 1299.99,
    image: 'https://example.com/phone.jpg',
    condition: 'NEW',
    aestheticCondition: 10
  }
  
  console.log('🛒 Agregando producto al carrito...')
  
  // Simular llamada a la API del carrito
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': 'test-user-123' // Simular usuario autenticado
      },
      body: JSON.stringify({
        items: [{ ...testProduct, quantity: 1 }]
      })
    })
    
    if (response.ok) {
      console.log('✅ Producto agregado al carrito en la base de datos')
    } else {
      console.log('❌ Error agregando producto al carrito')
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error)
  }
}

// Función para simular cargar carrito desde otro dispositivo
async function simulateLoadFromOtherDevice() {
  console.log('📱 Simulando carga desde otro dispositivo...')
  
  try {
    const response = await fetch('/api/cart', {
      headers: {
        'user-id': 'test-user-123'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Carrito cargado desde BD:', data.items?.length || 0, 'items')
      data.items?.forEach(item => {
        console.log(`   - ${item.title} (${item.quantity}x) - $${item.price}`)
      })
    } else {
      console.log('❌ Error cargando carrito')
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error)
  }
}

// Función para simular limpiar carrito
async function simulateClearCart() {
  console.log('🗑️ Limpiando carrito...')
  
  try {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'user-id': 'test-user-123'
      }
    })
    
    if (response.ok) {
      console.log('✅ Carrito limpiado de la base de datos')
    } else {
      console.log('❌ Error limpiando carrito')
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error)
  }
}

// Función para verificar estado del carrito
async function checkCartStatus() {
  console.log('🔍 Verificando estado del carrito...')
  
  try {
    const response = await fetch('/api/cart', {
      headers: {
        'user-id': 'test-user-123'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('📊 Estado del carrito:')
      console.log(`   Items: ${data.items?.length || 0}`)
      console.log(`   Total: $${data.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}`)
    } else {
      console.log('❌ Error verificando carrito')
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error)
  }
}

// Exportar funciones para uso en consola
window.cartSync = {
  add: simulateAddToCart,
  load: simulateLoadFromOtherDevice,
  clear: simulateClearCart,
  check: checkCartStatus
}

console.log('🔧 Funciones disponibles:')
console.log('   cartSync.add() - Agregar producto al carrito')
console.log('   cartSync.load() - Cargar carrito desde BD')
console.log('   cartSync.clear() - Limpiar carrito')
console.log('   cartSync.check() - Verificar estado del carrito')

console.log('\n💡 Flujo de prueba:')
console.log('   1. cartSync.add() - Agregar producto')
console.log('   2. cartSync.check() - Verificar estado')
console.log('   3. cartSync.load() - Simular carga desde otro dispositivo')
console.log('   4. cartSync.clear() - Limpiar carrito')

// Verificar estado inicial
checkCartStatus()
