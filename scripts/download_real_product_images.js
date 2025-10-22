const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// URLs de imágenes reales de productos (usando URLs de ejemplo de productos reales)
const productImages = {
  'iph15pm256': {
    name: 'iPhone 15 Pro Max',
    images: [
      {
        filename: 'iphone15pro-front.jpg',
        url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279823',
        title: 'iPhone 15 Pro Max - Vista Frontal'
      },
      {
        filename: 'iphone15pro-back.jpg',
        url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium_AV1?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279823',
        title: 'iPhone 15 Pro Max - Vista Trasera'
      },
      {
        filename: 'iphone15pro-side.jpg',
        url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium_AV2?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279823',
        title: 'iPhone 15 Pro Max - Vista Lateral'
      }
    ]
  },
  'mbpm314512': {
    name: 'MacBook Pro M3',
    images: [
      {
        filename: 'macbookpro-front.jpg',
        url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1697230830200',
        title: 'MacBook Pro M3 - Vista Frontal'
      },
      {
        filename: 'macbookpro-open.jpg',
        url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310_AV1?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1697230830200',
        title: 'MacBook Pro M3 - Abierto'
      },
      {
        filename: 'macbookpro-side.jpg',
        url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310_AV2?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1697230830200',
        title: 'MacBook Pro M3 - Vista Lateral'
      }
    ]
  },
  'app2gen': {
    name: 'AirPods Pro 2da Gen',
    images: [
      {
        filename: 'airpodspro-case.jpg',
        url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1660803972361',
        title: 'AirPods Pro - Con Estuche'
      },
      {
        filename: 'airpodspro-earbuds.jpg',
        url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83_AV1?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1660803972361',
        title: 'AirPods Pro - Auriculares'
      },
      {
        filename: 'airpodspro-charging.jpg',
        url: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83_AV2?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1660803972361',
        title: 'AirPods Pro - Cargando'
      }
    ]
  },
  'sgs24u512': {
    name: 'Galaxy S24 Ultra',
    images: [
      {
        filename: 'galaxys24-front.jpg',
        url: 'https://images.samsung.com/is/image/samsung/p6pim/latin/sm-s928bztjzto/gallery/latin-galaxy-s24-s928-sm-s928bztjzto-537126177?$650_519_PNG$',
        title: 'Galaxy S24 Ultra - Vista Frontal'
      },
      {
        filename: 'galaxys24-back.jpg',
        url: 'https://images.samsung.com/is/image/samsung/p6pim/latin/sm-s928bztjzto/gallery/latin-galaxy-s24-s928-sm-s928bztjzto-537126178?$650_519_PNG$',
        title: 'Galaxy S24 Ultra - Vista Trasera'
      },
      {
        filename: 'galaxys24-pen.jpg',
        url: 'https://images.samsung.com/is/image/samsung/p6pim/latin/sm-s928bztjzto/gallery/latin-galaxy-s24-s928-sm-s928bztjzto-537126179?$650_519_PNG$',
        title: 'Galaxy S24 Ultra - Con S Pen'
      }
    ]
  },
  'ps5digital': {
    name: 'PlayStation 5 Digital',
    images: [
      {
        filename: 'ps5-front.jpg',
        url: 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$facebook$',
        title: 'PlayStation 5 - Vista Frontal'
      },
      {
        filename: 'ps5-side.jpg',
        url: 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-02-en-14sep21?$facebook$',
        title: 'PlayStation 5 - Vista Lateral'
      },
      {
        filename: 'ps5-controller.jpg',
        url: 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-03-en-14sep21?$facebook$',
        title: 'PlayStation 5 - Con Controlador'
      }
    ]
  },
  'nswoled64': {
    name: 'Nintendo Switch OLED',
    images: [
      {
        filename: 'switch-front.jpg',
        url: 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/en_US/switch/site-design-update/switch-oled-hero',
        title: 'Nintendo Switch OLED - Vista Frontal'
      },
      {
        filename: 'switch-handheld.jpg',
        url: 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/en_US/switch/site-design-update/switch-oled-hero-handheld',
        title: 'Nintendo Switch - Modo Portátil'
      },
      {
        filename: 'switch-docked.jpg',
        url: 'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto:best/f_auto/dpr_2.0/ncom/en_US/switch/site-design-update/switch-oled-hero-docked',
        title: 'Nintendo Switch - En Dock'
      }
    ]
  }
}

// Función para descargar una imagen
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http
    
    const file = fs.createWriteStream(filepath)
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      } else {
        reject(new Error(`Error descargando imagen: ${response.statusCode}`))
      }
    }).on('error', (err) => {
      reject(err)
    })
  })
}

// Función para crear una imagen SVG de fallback
function createFallbackSVG(title, width = 400, height = 300, bgColor = '#f3f4f6', textColor = '#374151') {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
      ${title}
    </text>
    <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
      Imagen no disponible
    </text>
  </svg>`
}

async function downloadRealProductImages() {
  try {
    console.log('🖼️ Descargando imágenes reales de productos...')

    for (const [productCode, productData] of Object.entries(productImages)) {
      console.log(`\n📦 Procesando: ${productData.name}`)
      
      const productDir = path.join('public', 'uploads', 'products', productCode)
      
      // Crear directorio si no existe
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true })
      }

      for (const image of productData.images) {
        const imagePath = path.join(productDir, image.filename)
        
        try {
          console.log(`  📥 Descargando: ${image.filename}`)
          await downloadImage(image.url, imagePath)
          console.log(`  ✅ ${image.filename} descargada exitosamente`)
        } catch (error) {
          console.log(`  ⚠️ Error descargando ${image.filename}: ${error.message}`)
          console.log(`  🔄 Creando imagen de fallback...`)
          
          // Crear imagen SVG de fallback
          const fallbackSVG = createFallbackSVG(image.title)
          fs.writeFileSync(imagePath, fallbackSVG)
          console.log(`  ✅ Imagen de fallback creada: ${image.filename}`)
        }
      }
    }

    console.log('\n🎉 Descarga de imágenes completada!')
    console.log('📁 Ubicación: public/uploads/products/')
    console.log('🖼️ Imágenes reales descargadas de internet')

  } catch (error) {
    console.error('❌ Error descargando imágenes:', error)
  }
}

downloadRealProductImages()
