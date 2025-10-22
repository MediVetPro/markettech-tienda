// Script para simular el comportamiento del frontend
console.log('🧪 Simulando comportamiento del frontend...\n')

// Simular localStorage
const localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null
  },
  setItem: function(key, value) {
    this.data[key] = value
  },
  removeItem: function(key) {
    delete this.data[key]
  }
}

// Simular función de login del AuthContext
async function simulateLogin(email, password) {
  try {
    console.log(`📡 [AUTH] Intentando login para: ${email}`)
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    console.log(`📊 [AUTH] Status de respuesta: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      const userData = data.user
      const token = data.token
      
      console.log('✅ [AUTH] Respuesta del servidor exitosa')
      console.log('👤 [AUTH] Usuario recibido:', userData?.name)
      console.log('🔑 [AUTH] Token recibido:', !!token)
      
      // Validar que los datos son válidos antes de guardar
      if (userData && token) {
        console.log('✅ [AUTH] Datos válidos, guardando en localStorage...')
        
        // Simular guardado en localStorage
        localStorage.setItem('smartesh_user', JSON.stringify(userData))
        localStorage.setItem('smartesh_token', token)
        
        console.log('✅ [AUTH] Datos guardados exitosamente')
        console.log('📦 [AUTH] Usuario guardado:', localStorage.getItem('smartesh_user') ? 'Sí' : 'No')
        console.log('📦 [AUTH] Token guardado:', localStorage.getItem('smartesh_token') ? 'Sí' : 'No')
        
        return true
      } else {
        console.error('❌ [AUTH] Datos de login inválidos')
        console.error('   - userData:', !!userData)
        console.error('   - token:', !!token)
        return false
      }
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      console.error('❌ [AUTH] Error del servidor:', response.status, response.statusText)
      console.error('❌ [AUTH] Detalles del error:', errorData)
      return false
    }
  } catch (error) {
    console.error('❌ [AUTH] Error during login:', error.message)
    return false
  }
}

// Simular verificación de usuario guardado
function simulateCheckSavedUser() {
  console.log('\n🔄 [AUTH] Verificando usuario guardado...')
  
  const savedUser = localStorage.getItem('smartesh_user')
  const savedToken = localStorage.getItem('smartesh_token')
  
  console.log('📦 [AUTH] Usuario guardado:', savedUser ? 'Sí' : 'No')
  console.log('📦 [AUTH] Token guardado:', savedToken ? 'Sí' : 'No')
  
  if (savedUser && savedToken) {
    try {
      const parsedUser = JSON.parse(savedUser)
      console.log('✅ [AUTH] Usuario parseado:', parsedUser.name)
      
      // Verificar que el token no haya expirado
      try {
        const tokenPayload = JSON.parse(atob(savedToken.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        
        console.log('🔍 [AUTH] Token exp:', new Date(tokenPayload.exp * 1000).toISOString())
        console.log('🔍 [AUTH] Current time:', new Date(currentTime * 1000).toISOString())
        
        if (tokenPayload.exp && tokenPayload.exp > currentTime) {
          console.log('✅ [AUTH] Token válido, usuario autenticado')
          return parsedUser
        } else {
          console.log('❌ [AUTH] Token expirado, limpiando datos')
          localStorage.removeItem('smartesh_user')
          localStorage.removeItem('smartesh_token')
          return null
        }
      } catch (tokenError) {
        console.error('❌ [AUTH] Error verificando token:', tokenError.message)
        localStorage.removeItem('smartesh_user')
        localStorage.removeItem('smartesh_token')
        return null
      }
    } catch (error) {
      console.error('❌ [AUTH] Error parsing saved user:', error.message)
      localStorage.removeItem('smartesh_user')
      localStorage.removeItem('smartesh_token')
      return null
    }
  } else {
    console.log('ℹ️ [AUTH] No hay usuario guardado')
    return null
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🧪 Prueba 1: Login inicial')
  const loginSuccess = await simulateLogin('cliente@teste.com', 'cliente123')
  console.log('Resultado:', loginSuccess ? '✅ Éxito' : '❌ Falló')
  
  console.log('\n🧪 Prueba 2: Verificación de usuario guardado')
  const savedUser = simulateCheckSavedUser()
  console.log('Resultado:', savedUser ? `✅ Usuario encontrado: ${savedUser.name}` : '❌ No hay usuario')
  
  console.log('\n🧪 Prueba 3: Login con credenciales incorrectas')
  const wrongLogin = await simulateLogin('cliente@teste.com', 'password123')
  console.log('Resultado:', wrongLogin ? '✅ Éxito (inesperado)' : '❌ Falló (esperado)')
  
  console.log('\n🧪 Prueba 4: Verificación después de login fallido')
  const userAfterFailed = simulateCheckSavedUser()
  console.log('Resultado:', userAfterFailed ? `✅ Usuario encontrado: ${userAfterFailed.name}` : '❌ No hay usuario')
}

runTests()
