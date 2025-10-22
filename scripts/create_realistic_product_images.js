const fs = require('fs')
const path = require('path')

// Función para crear una imagen SVG realista de un producto
function createRealisticProductImage(title, description, price, width = 400, height = 300, bgColor = '#f8f9fa', accentColor = '#007bff') {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${accentColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Fondo -->
    <rect width="100%" height="100%" fill="url(#bg)"/>
    
    <!-- Borde decorativo -->
    <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="url(#accent)" stroke-width="2" rx="10"/>
    
    <!-- Título del producto -->
    <text x="50%" y="30%" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#212529" text-anchor="middle" dominant-baseline="middle">
      ${title}
    </text>
    
    <!-- Descripción -->
    <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="12" fill="#6c757d" text-anchor="middle" dominant-baseline="middle">
      ${description}
    </text>
    
    <!-- Precio -->
    <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${accentColor}" text-anchor="middle" dominant-baseline="middle">
      R$ ${price}
    </text>
    
    <!-- Icono del producto -->
    <circle cx="50%" cy="75%" r="25" fill="url(#accent)" opacity="0.1"/>
    <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="24" fill="${accentColor}" text-anchor="middle" dominant-baseline="middle">📱</text>
    
    <!-- Marca de agua -->
    <text x="95%" y="95%" font-family="Arial, sans-serif" font-size="8" fill="#dee2e6" text-anchor="end" dominant-baseline="middle">
      MarketTech
    </text>
  </svg>`
}

async function createRealisticProductImages() {
  try {
    console.log('🎨 Creando imágenes realistas de productos...')

    const products = [
      {
        code: 'iph15pm256',
        name: 'iPhone 15 Pro Max',
        description: 'El iPhone más avanzado',
        price: '8.999,99',
        images: [
          { filename: 'iphone15pro-front.jpg', title: 'iPhone 15 Pro Max - Vista Frontal', description: 'Pantalla Super Retina XDR' },
          { filename: 'iphone15pro-back.jpg', title: 'iPhone 15 Pro Max - Vista Trasera', description: 'Cámara de 48MP' },
          { filename: 'iphone15pro-side.jpg', title: 'iPhone 15 Pro Max - Vista Lateral', description: 'Diseño premium' }
        ],
        bgColor: '#1d1d1f',
        accentColor: '#007aff'
      },
      {
        code: 'mbpm314512',
        name: 'MacBook Pro M3',
        description: 'Potencia profesional',
        price: '12.999,99',
        images: [
          { filename: 'macbookpro-front.jpg', title: 'MacBook Pro M3 - Vista Frontal', description: 'Pantalla Liquid Retina' },
          { filename: 'macbookpro-open.jpg', title: 'MacBook Pro M3 - Abierto', description: 'Teclado retroiluminado' },
          { filename: 'macbookpro-side.jpg', title: 'MacBook Pro M3 - Vista Lateral', description: 'Diseño elegante' }
        ],
        bgColor: '#f5f5f7',
        accentColor: '#1d1d1f'
      },
      {
        code: 'app2gen',
        name: 'AirPods Pro 2da Gen',
        description: 'Audio espacial',
        price: '1.899,99',
        images: [
          { filename: 'airpodspro-case.jpg', title: 'AirPods Pro - Con Estuche', description: 'Estuche de carga MagSafe' },
          { filename: 'airpodspro-earbuds.jpg', title: 'AirPods Pro - Auriculares', description: 'Cancelación de ruido' },
          { filename: 'airpodspro-charging.jpg', title: 'AirPods Pro - Cargando', description: 'Carga rápida' }
        ],
        bgColor: '#000000',
        accentColor: '#ffffff'
      },
      {
        code: 'sgs24u512',
        name: 'Galaxy S24 Ultra',
        description: 'Innovación Samsung',
        price: '6.999,99',
        images: [
          { filename: 'galaxys24-front.jpg', title: 'Galaxy S24 Ultra - Vista Frontal', description: 'Pantalla Dynamic AMOLED' },
          { filename: 'galaxys24-back.jpg', title: 'Galaxy S24 Ultra - Vista Trasera', description: 'Cámara de 200MP' },
          { filename: 'galaxys24-pen.jpg', title: 'Galaxy S24 Ultra - Con S Pen', description: 'S Pen incluido' }
        ],
        bgColor: '#1a1a1a',
        accentColor: '#0066cc'
      },
      {
        code: 'ps5digital',
        name: 'PlayStation 5 Digital',
        description: 'Gaming de próxima generación',
        price: '3.999,99',
        images: [
          { filename: 'ps5-front.jpg', title: 'PlayStation 5 - Vista Frontal', description: 'Diseño futurista' },
          { filename: 'ps5-side.jpg', title: 'PlayStation 5 - Vista Lateral', description: 'SSD ultra rápido' },
          { filename: 'ps5-controller.jpg', title: 'PlayStation 5 - Con Controlador', description: 'DualSense incluido' }
        ],
        bgColor: '#003791',
        accentColor: '#ffffff'
      },
      {
        code: 'nswoled64',
        name: 'Nintendo Switch OLED',
        description: 'Gaming portátil',
        price: '2.499,99',
        images: [
          { filename: 'switch-front.jpg', title: 'Nintendo Switch OLED - Vista Frontal', description: 'Pantalla OLED de 7"' },
          { filename: 'switch-handheld.jpg', title: 'Nintendo Switch - Modo Portátil', description: 'Gaming en movimiento' },
          { filename: 'switch-docked.jpg', title: 'Nintendo Switch - En Dock', description: 'Gaming en TV' }
        ],
        bgColor: '#e60012',
        accentColor: '#ffffff'
      }
    ]

    for (const product of products) {
      console.log(`\n📦 Procesando: ${product.name}`)
      
      const productDir = path.join('public', 'uploads', 'products', product.code)
      
      // Crear directorio si no existe
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true })
      }

      for (const image of product.images) {
        const imagePath = path.join(productDir, image.filename)
        
        console.log(`  🎨 Creando: ${image.filename}`)
        
        // Crear imagen SVG realista
        const svgContent = createRealisticProductImage(
          image.title,
          image.description,
          product.price,
          400,
          300,
          product.bgColor,
          product.accentColor
        )
        
        fs.writeFileSync(imagePath, svgContent)
        console.log(`  ✅ ${image.filename} creada exitosamente`)
      }
    }

    console.log('\n🎉 Imágenes realistas creadas exitosamente!')
    console.log('📁 Ubicación: public/uploads/products/')
    console.log('🖼️ Imágenes SVG con diseño profesional')

  } catch (error) {
    console.error('❌ Error creando imágenes:', error)
  }
}

createRealisticProductImages()
