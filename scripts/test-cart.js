// Script para probar la persistencia del carrito
// Ejecutar en la consola del navegador

console.log('🧪 Probando persistencia del carrito...')

// Función para verificar carritos en localStorage
function checkCarts() {
  console.log('📦 Carritos en localStorage:')
  
  const keys = Object.keys(localStorage)
  const cartKeys = keys.filter(key => key.startsWith('smartesh_cart_'))
  
  cartKeys.forEach(key => {
    const cart = localStorage.getItem(key)
    try {
      const items = JSON.parse(cart)
      console.log(`   ${key}: ${items.length} items`)
      items.forEach(item => {
        console.log(`     - ${item.title} (${item.quantity}x) - $${item.price}`)
      })
    } catch (error) {
      console.log(`   ${key}: Error parsing`)
    }
  })
  
  if (cartKeys.length === 0) {
    console.log('   No hay carritos guardados')
  }
}

// Función para simular agregar producto al carrito
function simulateAddToCart() {
  const testProduct = {
    id: 'test-1',
    title: 'iPhone 15 Pro Max',
    price: 1299.99,
    image: 'https://example.com/phone.jpg',
    condition: 'NEW',
    aestheticCondition: 10
  }
  
  // Simular carrito temporal
  const tempCartKey = 'smartesh_cart_temp'
  const existingCart = localStorage.getItem(tempCartKey)
  let cart = existingCart ? JSON.parse(existingCart) : []
  
  // Agregar producto
  const existingItem = cart.find(item => item.id === testProduct.id)
  if (existingItem) {
    cart = cart.map(item =>
      item.id === testProduct.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  } else {
    cart.push({ ...testProduct, quantity: 1 })
  }
  
  localStorage.setItem(tempCartKey, JSON.stringify(cart))
  console.log('✅ Producto agregado al carrito temporal')
  checkCarts()
}

// Función para simular login de usuario
function simulateUserLogin() {
  const userId = 'test-user-123'
  const userCartKey = `smartesh_cart_${userId}`
  const tempCartKey = 'smartesh_cart_temp'
  
  // Simular migración
  const tempCart = localStorage.getItem(tempCartKey)
  if (tempCart) {
    localStorage.setItem(userCartKey, tempCart)
    localStorage.removeItem(tempCartKey)
    console.log('✅ Carrito temporal migrado al usuario')
  }
  
  checkCarts()
}

// Función para limpiar todos los carritos
function clearAllCarts() {
  const keys = Object.keys(localStorage)
  const cartKeys = keys.filter(key => key.startsWith('smartesh_cart_'))
  
  cartKeys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  console.log('🗑️ Todos los carritos limpiados')
  checkCarts()
}

// Exportar funciones para uso en consola
window.testCart = {
  check: checkCarts,
  add: simulateAddToCart,
  login: simulateUserLogin,
  clear: clearAllCarts
}

console.log('🔧 Funciones disponibles:')
console.log('   testCart.check() - Verificar carritos')
console.log('   testCart.add() - Agregar producto de prueba')
console.log('   testCart.login() - Simular login de usuario')
console.log('   testCart.clear() - Limpiar todos los carritos')

// Verificar estado inicial
checkCarts()
