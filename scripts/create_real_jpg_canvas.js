const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const path = require('path')

async function createRealJPGWithCanvas() {
  try {
    console.log('🖼️ Creando imágenes JPG reales con Canvas...')

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
        textColor: '#ffffff',
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
        textColor: '#1d1d1f',
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
        textColor: '#ffffff',
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
        textColor: '#ffffff',
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
        textColor: '#ffffff',
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
        textColor: '#ffffff',
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
        
        // Crear canvas
        const canvas = createCanvas(400, 300)
        const ctx = canvas.getContext('2d')
        
        // Fondo con gradiente
        const gradient = ctx.createLinearGradient(0, 0, 400, 300)
        gradient.addColorStop(0, product.bgColor)
        gradient.addColorStop(1, '#e9ecef')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 400, 300)
        
        // Borde decorativo
        ctx.strokeStyle = product.accentColor
        ctx.lineWidth = 3
        ctx.strokeRect(15, 15, 370, 270)
        
        // Contenedor principal
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillRect(30, 30, 340, 240)
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        
        // Título
        ctx.fillStyle = product.textColor
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(image.title, 200, 80)
        
        // Descripción
        ctx.font = '14px Arial'
        ctx.fillStyle = '#6c757d'
        ctx.fillText(image.description, 200, 120)
        
        // Precio destacado
        ctx.fillStyle = product.accentColor
        ctx.fillRect(50, 200, 300, 40)
        ctx.fillStyle = product.textColor
        ctx.font = 'bold 18px Arial'
        ctx.fillText(`R$ ${product.price}`, 200, 225)
        
        // Icono del producto
        ctx.fillStyle = product.accentColor
        ctx.globalAlpha = 0.2
        ctx.beginPath()
        ctx.arc(80, 80, 30, 0, 2 * Math.PI)
        ctx.fill()
        ctx.globalAlpha = 1
        
        // Marca de agua
        ctx.font = '10px Arial'
        ctx.fillStyle = '#dee2e6'
        ctx.textAlign = 'right'
        ctx.fillText('MarketTech', 390, 290)
        
        // Guardar como JPG
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.8 })
        fs.writeFileSync(imagePath, buffer)
        
        console.log(`  ✅ ${image.filename} creada exitosamente`)
      }
    }

    console.log('\n🎉 Imágenes JPG reales creadas exitosamente!')
    console.log('📁 Ubicación: public/uploads/products/')
    console.log('🖼️ Imágenes JPG reales generadas con Canvas')

  } catch (error) {
    console.error('❌ Error creando imágenes:', error)
  }
}

createRealJPGWithCanvas()
