const fs = require('fs')
const path = require('path')

// Crear un archivo de prueba PNG simple
const testPngBuffer = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
  0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
  0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
])

async function testUpload() {
  try {
    console.log('🧪 [TEST] Iniciando teste de upload...')
    
    // Crear archivo de prueba
    const testFilePath = path.join(__dirname, 'test-icon.png')
    fs.writeFileSync(testFilePath, testPngBuffer)
    console.log('✅ [TEST] Arquivo de teste criado:', testFilePath)
    
    // Crear FormData
    const FormData = require('form-data')
    const formData = new FormData()
    formData.append('file', fs.createReadStream(testFilePath))
    formData.append('folder', 'site-config')
    
    console.log('📤 [TEST] Enviando requisição para /api/upload...')
    
    // Hacer la petición
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ [TEST] Upload bem-sucedido!')
      console.log('📄 [TEST] Resultado:', result)
    } else {
      console.error('❌ [TEST] Erro no upload:', result)
    }
    
    // Limpiar archivo de prueba
    fs.unlinkSync(testFilePath)
    console.log('🧹 [TEST] Arquivo de teste removido')
    
  } catch (error) {
    console.error('❌ [TEST] Erro no teste:', error)
  }
}

testUpload()
