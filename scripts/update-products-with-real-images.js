const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateProductsWithRealImages() {
  console.log('🖼️ Actualizando productos con imágenes reales...')
  
  try {
    // Limpiar imágenes existentes
    await prisma.productImage.deleteMany({})
    console.log('🧹 Imágenes existentes eliminadas')
    
    const products = [
      {
        title: 'iPhone 15 Pro Max 256GB Titanio Natural',
        images: [
          { path: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop', filename: 'iphone15_frontal.jpg', alt: 'iPhone 15 Pro Max frontal' },
          { path: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop', filename: 'iphone15_trasera.jpg', alt: 'iPhone 15 Pro Max trasera' }
        ]
      },
      {
        title: 'MacBook Pro 16" M3 Max 1TB',
        images: [
          { path: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop', filename: 'macbook_pro_16.jpg', alt: 'MacBook Pro 16 pulgadas' }
        ]
      },
      {
        title: 'Samsung Galaxy S24 Ultra 512GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop', filename: 'galaxy_s24_ultra.jpg', alt: 'Samsung Galaxy S24 Ultra' }
        ]
      },
      {
        title: 'iPad Pro 12.9" M2 256GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop', filename: 'ipad_pro_12_9.jpg', alt: 'iPad Pro 12.9 pulgadas' }
        ]
      },
      {
        title: 'AirPods Pro 2da Generación',
        images: [
          { path: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop', filename: 'airpods_pro_2.jpg', alt: 'AirPods Pro 2da generación' }
        ]
      },
      {
        title: 'Sony WH-1000XM5 Auriculares',
        images: [
          { path: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop', filename: 'sony_wh1000xm5.jpg', alt: 'Sony WH-1000XM5' }
        ]
      },
      {
        title: 'Dell XPS 13 Plus 512GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', filename: 'dell_xps_13_plus.jpg', alt: 'Dell XPS 13 Plus' }
        ]
      },
      {
        title: 'Samsung Galaxy Tab S9 Ultra 14.6"',
        images: [
          { path: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop', filename: 'galaxy_tab_s9_ultra.jpg', alt: 'Samsung Galaxy Tab S9 Ultra' }
        ]
      },
      {
        title: 'Apple Watch Series 9 GPS 45mm',
        images: [
          { path: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop', filename: 'apple_watch_series_9.jpg', alt: 'Apple Watch Series 9' }
        ]
      },
      {
        title: 'MacBook Air M2 13" 256GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', filename: 'macbook_air_m2.jpg', alt: 'MacBook Air M2' }
        ]
      },
      {
        title: 'Sony PlayStation 5 Digital',
        images: [
          { path: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop', filename: 'ps5_digital.jpg', alt: 'PlayStation 5 Digital' }
        ]
      },
      {
        title: 'Nintendo Switch OLED 64GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop', filename: 'nintendo_switch_oled.jpg', alt: 'Nintendo Switch OLED' }
        ]
      },
      {
        title: 'Samsung Galaxy Buds2 Pro',
        images: [
          { path: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop', filename: 'galaxy_buds2_pro.jpg', alt: 'Samsung Galaxy Buds2 Pro' }
        ]
      },
      {
        title: 'iPad Air 5ta Generación 256GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop', filename: 'ipad_air_5.jpg', alt: 'iPad Air 5ta generación' }
        ]
      },
      {
        title: 'Microsoft Surface Laptop 5 13.5"',
        images: [
          { path: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', filename: 'surface_laptop_5.jpg', alt: 'Microsoft Surface Laptop 5' }
        ]
      },
      {
        title: 'Google Pixel 8 Pro 256GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop', filename: 'pixel_8_pro.jpg', alt: 'Google Pixel 8 Pro' }
        ]
      },
      {
        title: 'Sony WF-1000XM4 Auriculares',
        images: [
          { path: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop', filename: 'sony_wf1000xm4.jpg', alt: 'Sony WF-1000XM4' }
        ]
      },
      {
        title: 'iPad mini 6ta Generación 256GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop', filename: 'ipad_mini_6.jpg', alt: 'iPad mini 6ta generación' }
        ]
      },
      {
        title: 'Samsung Galaxy Z Fold5 512GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop', filename: 'galaxy_z_fold5.jpg', alt: 'Samsung Galaxy Z Fold5' }
        ]
      },
      {
        title: 'MacBook Pro 14" M3 512GB',
        images: [
          { path: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', filename: 'macbook_pro_14_m3.jpg', alt: 'MacBook Pro 14" M3' }
        ]
      }
    ]
    
    console.log(`📦 Actualizando ${products.length} productos...`)
    
    // Obtener productos existentes
    const existingProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    for (let i = 0; i < existingProducts.length && i < products.length; i++) {
      const product = existingProducts[i]
      const productData = products[i]
      
      // Crear imágenes para el producto
      await prisma.productImage.createMany({
        data: productData.images.map((img, index) => ({
          path: img.path,
          filename: img.filename,
          alt: img.alt,
          order: index,
          productId: product.id
        }))
      })
      
      console.log(`✅ Producto ${i + 1}/${products.length} actualizado: ${product.title}`)
    }
    
    console.log('\n🎉 ¡Productos actualizados con imágenes reales!')
    console.log('📊 Resumen:')
    console.log(`- Productos actualizados: ${Math.min(existingProducts.length, products.length)}`)
    console.log('- Imágenes: URLs de Unsplash')
    console.log('- Formato: 800x600 optimizado')
    
  } catch (error) {
    console.error('❌ Error actualizando productos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
updateProductsWithRealImages()
