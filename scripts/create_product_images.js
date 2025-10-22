const fs = require('fs')
const path = require('path')

// Función para crear una imagen SVG placeholder
function createSVGPlaceholder(title, width = 400, height = 300, bgColor = '#f3f4f6', textColor = '#374151') {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
      ${title}
    </text>
    <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
      ${width}x${height}
    </text>
  </svg>`
}

async function createProductImages() {
  try {
    console.log('🖼️ Creando imágenes de productos...')

    const products = [
      {
        code: 'iph15pm256',
        name: 'iPhone 15 Pro Max',
        images: [
          { filename: 'iphone15pro-front.jpg', title: 'iPhone 15 Pro Max - Vista Frontal' },
          { filename: 'iphone15pro-back.jpg', title: 'iPhone 15 Pro Max - Vista Trasera' },
          { filename: 'iphone15pro-side.jpg', title: 'iPhone 15 Pro Max - Vista Lateral' }
        ],
        bgColor: '#1d1d1f',
        textColor: '#ffffff'
      },
      {
        code: 'mbpm314512',
        name: 'MacBook Pro M3',
        images: [
          { filename: 'macbookpro-front.jpg', title: 'MacBook Pro M3 - Vista Frontal' },
          { filename: 'macbookpro-open.jpg', title: 'MacBook Pro M3 - Abierto' },
          { filename: 'macbookpro-side.jpg', title: 'MacBook Pro M3 - Vista Lateral' }
        ],
        bgColor: '#f5f5f7',
        textColor: '#1d1d1f'
      },
      {
        code: 'app2gen',
        name: 'AirPods Pro 2da Gen',
        images: [
          { filename: 'airpodspro-case.jpg', title: 'AirPods Pro - Con Estuche' },
          { filename: 'airpodspro-earbuds.jpg', title: 'AirPods Pro - Auriculares' },
          { filename: 'airpodspro-charging.jpg', title: 'AirPods Pro - Cargando' }
        ],
        bgColor: '#000000',
        textColor: '#ffffff'
      },
      {
        code: 'sgs24u512',
        name: 'Galaxy S24 Ultra',
        images: [
          { filename: 'galaxys24-front.jpg', title: 'Galaxy S24 Ultra - Vista Frontal' },
          { filename: 'galaxys24-back.jpg', title: 'Galaxy S24 Ultra - Vista Trasera' },
          { filename: 'galaxys24-pen.jpg', title: 'Galaxy S24 Ultra - Con S Pen' }
        ],
        bgColor: '#1a1a1a',
        textColor: '#ffffff'
      },
      {
        code: 'ps5digital',
        name: 'PlayStation 5 Digital',
        images: [
          { filename: 'ps5-front.jpg', title: 'PlayStation 5 - Vista Frontal' },
          { filename: 'ps5-side.jpg', title: 'PlayStation 5 - Vista Lateral' },
          { filename: 'ps5-controller.jpg', title: 'PlayStation 5 - Con Controlador' }
        ],
        bgColor: '#003791',
        textColor: '#ffffff'
      },
      {
        code: 'nswoled64',
        name: 'Nintendo Switch OLED',
        images: [
          { filename: 'switch-front.jpg', title: 'Nintendo Switch OLED - Vista Frontal' },
          { filename: 'switch-handheld.jpg', title: 'Nintendo Switch - Modo Portátil' },
          { filename: 'switch-docked.jpg', title: 'Nintendo Switch - En Dock' }
        ],
        bgColor: '#e60012',
        textColor: '#ffffff'
      }
    ]

    for (const product of products) {
      const productDir = path.join('public', 'uploads', 'products', product.code)
      
      // Crear directorio si no existe
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true })
      }

      console.log(`📸 Creando imágenes para ${product.name}...`)

      for (const image of product.images) {
        const imagePath = path.join(productDir, image.filename)
        
        // Crear imagen SVG
        const svgContent = createSVGPlaceholder(
          image.title,
          400,
          300,
          product.bgColor,
          product.textColor
        )
        
        fs.writeFileSync(imagePath, svgContent)
        console.log(`  ✅ ${image.filename}`)
      }
    }

    console.log('\n🎉 Imágenes de productos creadas exitosamente!')
    console.log('📁 Ubicación: public/uploads/products/')
    console.log('🖼️ Formato: SVG con placeholders personalizados')

  } catch (error) {
    console.error('❌ Error creando imágenes:', error)
  }
}

createProductImages()
