const fs = require('fs')
const path = require('path')

async function createPlaceholderImages() {
  console.log('🖼️ Creando imágenes placeholder...')
  
  try {
    // Crear directorio base
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log('📁 Directorio de uploads creado')
    }
    
    // Crear directorios de productos
    for (let i = 1; i <= 20; i++) {
      const productDir = path.join(uploadsDir, `product_${i}`)
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true })
        console.log(`📁 Directorio product_${i} creado`)
      }
    }
    
    // Crear archivo placeholder.jpg en la raíz de public
    const placeholderPath = path.join(process.cwd(), 'public', 'placeholder.jpg')
    if (!fs.existsSync(placeholderPath)) {
      // Crear un archivo de imagen placeholder simple
      const placeholderContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
      fs.writeFileSync(placeholderPath, placeholderContent)
      console.log('🖼️ Imagen placeholder.jpg creada')
    }
    
    // Crear imágenes placeholder para cada producto
    const products = [
      { id: 1, name: 'iPhone 15 Pro Max', images: ['iphone15_frontal.jpg', 'iphone15_trasera.jpg'] },
      { id: 2, name: 'MacBook Pro 16', images: ['macbook_pro_16.jpg'] },
      { id: 3, name: 'Samsung Galaxy S24 Ultra', images: ['galaxy_s24_ultra.jpg'] },
      { id: 4, name: 'iPad Pro 12.9', images: ['ipad_pro_12_9.jpg'] },
      { id: 5, name: 'AirPods Pro 2', images: ['airpods_pro_2.jpg'] },
      { id: 6, name: 'Sony WH-1000XM5', images: ['sony_wh1000xm5.jpg'] },
      { id: 7, name: 'Dell XPS 13 Plus', images: ['dell_xps_13_plus.jpg'] },
      { id: 8, name: 'Samsung Galaxy Tab S9 Ultra', images: ['galaxy_tab_s9_ultra.jpg'] },
      { id: 9, name: 'Apple Watch Series 9', images: ['apple_watch_series_9.jpg'] },
      { id: 10, name: 'MacBook Air M2', images: ['macbook_air_m2.jpg'] },
      { id: 11, name: 'PlayStation 5 Digital', images: ['ps5_digital.jpg'] },
      { id: 12, name: 'Nintendo Switch OLED', images: ['nintendo_switch_oled.jpg'] },
      { id: 13, name: 'Samsung Galaxy Buds2 Pro', images: ['galaxy_buds2_pro.jpg'] },
      { id: 14, name: 'iPad Air 5', images: ['ipad_air_5.jpg'] },
      { id: 15, name: 'Microsoft Surface Laptop 5', images: ['surface_laptop_5.jpg'] },
      { id: 16, name: 'Google Pixel 8 Pro', images: ['pixel_8_pro.jpg'] },
      { id: 17, name: 'Sony WF-1000XM4', images: ['sony_wf1000xm4.jpg'] },
      { id: 18, name: 'iPad mini 6', images: ['ipad_mini_6.jpg'] },
      { id: 19, name: 'Samsung Galaxy Z Fold5', images: ['galaxy_z_fold5.jpg'] },
      { id: 20, name: 'MacBook Pro 14 M3', images: ['macbook_pro_14_m3.jpg'] }
    ]
    
    for (const product of products) {
      const productDir = path.join(uploadsDir, `product_${product.id}`)
      
      for (const imageName of product.images) {
        const imagePath = path.join(productDir, imageName)
        
        if (!fs.existsSync(imagePath)) {
          // Crear un archivo de imagen placeholder simple
          const placeholderContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
          fs.writeFileSync(imagePath, placeholderContent)
          console.log(`🖼️ Imagen ${imageName} creada para ${product.name}`)
        }
      }
    }
    
    console.log('\n🎉 ¡Imágenes placeholder creadas exitosamente!')
    console.log('📁 Estructura creada:')
    console.log('  public/uploads/products/')
    console.log('    product_1/')
    console.log('    product_2/')
    console.log('    ...')
    console.log('    product_20/')
    
  } catch (error) {
    console.error('❌ Error creando imágenes placeholder:', error)
  }
}

// Ejecutar
createPlaceholderImages()
