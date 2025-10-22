const { PrismaClient } = require('@prisma/client')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function downloadImage(url, filePath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    })
    
    const writer = fs.createWriteStream(filePath)
    response.data.pipe(writer)
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  } catch (error) {
    console.error(`Error descargando imagen: ${error.message}`)
    throw error
  }
}

async function createProductsWithRealImages() {
  try {
    console.log('🚀 Creando productos con imágenes reales...')

    // Buscar usuarios
    const paul = await prisma.user.findFirst({
      where: { email: 'paul790905@gmail.com' }
    })
    
    const maria = await prisma.user.findFirst({
      where: { email: 'maria.silva@techstore.com' }
    })

    if (!paul || !maria) {
      console.error('❌ No se encontraron los usuarios')
      return
    }

    console.log(`👤 Paul: ${paul.name} (${paul.email})`)
    console.log(`👤 Maria: ${maria.name} (${maria.email})`)

    // Productos para Paul
    const paulProducts = [
      {
        title: 'iPhone 15 Pro Max 256GB',
        description: 'El iPhone más avanzado con cámara de 48MP, chip A17 Pro y pantalla Super Retina XDR de 6.7 pulgadas.',
        supplierPrice: 800.00,
        marginPercentage: 50.0,
        previousPrice: 1299.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 6.7", Procesador: A17 Pro, Cámara: 48MP, Almacenamiento: 256GB',
        categories: 'smartphones',
        stock: 25,
        status: 'ACTIVE',
        productCode: 'IPH15PM-256',
        manufacturerCode: 'APPLE-IPHONE-15-PRO-MAX-256',
        publishedBy: paul.name,
        publishedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'MacBook Pro M3 14"',
        description: 'MacBook Pro con chip M3, pantalla Liquid Retina XDR de 14.2 pulgadas y hasta 22 horas de batería.',
        supplierPrice: 1200.00,
        marginPercentage: 45.0,
        previousPrice: null,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 14.2", Procesador: M3, RAM: 8GB, Almacenamiento: 512GB SSD',
        categories: 'laptops',
        stock: 15,
        status: 'ACTIVE',
        productCode: 'MBP-M3-14',
        manufacturerCode: 'APPLE-MACBOOK-PRO-M3-14',
        publishedBy: paul.name,
        publishedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone premium con cámara de 200MP, S Pen incluido y pantalla Dynamic AMOLED 2X.',
        supplierPrice: 700.00,
        marginPercentage: 60.0,
        previousPrice: 1199.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 6.8", Procesador: Snapdragon 8 Gen 3, Cámara: 200MP, S Pen',
        categories: 'smartphones',
        stock: 30,
        status: 'ACTIVE',
        productCode: 'SGS24U-256',
        manufacturerCode: 'SAMSUNG-GALAXY-S24-ULTRA',
        publishedBy: paul.name,
        publishedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'
        ]
      }
    ]

    // Productos para Maria
    const mariaProducts = [
      {
        title: 'iPad Air 5ta Gen',
        description: 'iPad Air con chip M1, pantalla Liquid Retina de 10.9 pulgadas y compatibilidad con Apple Pencil.',
        supplierPrice: 400.00,
        marginPercentage: 55.0,
        previousPrice: null,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 10.9", Procesador: M1, Almacenamiento: 64GB, Apple Pencil compatible',
        categories: 'tablets',
        stock: 20,
        status: 'ACTIVE',
        productCode: 'IPA-AIR-5',
        manufacturerCode: 'APPLE-IPAD-AIR-5TH-GEN',
        publishedBy: maria.name,
        publishedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'Sony WH-1000XM5',
        description: 'Auriculares inalámbricos con cancelación de ruido líder en la industria y hasta 30 horas de batería.',
        supplierPrice: 150.00,
        marginPercentage: 80.0,
        previousPrice: 399.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Cancelación de ruido, 30h batería, Bluetooth 5.2, Hi-Res Audio',
        categories: 'audio',
        stock: 40,
        status: 'ACTIVE',
        productCode: 'SONY-WH1000XM5',
        manufacturerCode: 'SONY-WH-1000XM5',
        publishedBy: maria.name,
        publishedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'Nintendo Switch OLED',
        description: 'Consola híbrida con pantalla OLED de 7 pulgadas, perfecta para jugar en casa y en movimiento.',
        supplierPrice: 200.00,
        marginPercentage: 75.0,
        previousPrice: null,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Pantalla: 7" OLED, Procesador: NVIDIA Tegra, Almacenamiento: 64GB',
        categories: 'gaming',
        stock: 35,
        status: 'ACTIVE',
        productCode: 'NSW-OLED',
        manufacturerCode: 'NINTENDO-SWITCH-OLED',
        publishedBy: maria.name,
        publishedAt: new Date(),
        imageUrls: [
          'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop'
        ]
      }
    ]

    // Crear productos para Paul
    console.log('\n📱 Creando productos para Paul...')
    for (const productData of paulProducts) {
      const finalPrice = productData.supplierPrice * (1 + productData.marginPercentage / 100)
      
      const product = await prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          price: finalPrice,
          supplierPrice: productData.supplierPrice,
          marginPercentage: productData.marginPercentage,
          previousPrice: productData.previousPrice,
          condition: productData.condition,
          aestheticCondition: productData.aestheticCondition,
          specifications: productData.specifications,
          categories: productData.categories,
          stock: productData.stock,
          status: productData.status,
          productCode: productData.productCode,
          manufacturerCode: productData.manufacturerCode,
          publishedBy: productData.publishedBy,
          publishedAt: productData.publishedAt,
          userId: paul.id
        }
      })

      console.log(`✅ Producto creado: ${product.title}`)
      
      // Crear directorio para el producto
      const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', product.id)
      fs.mkdirSync(productDir, { recursive: true })

      // Descargar y guardar imágenes
      for (let i = 0; i < productData.imageUrls.length; i++) {
        const imageUrl = productData.imageUrls[i]
        const timestamp = Date.now()
        const filename = `image_${i + 1}_${timestamp}.jpg`
        const filePath = path.join(productDir, filename)
        
        try {
          await downloadImage(imageUrl, filePath)
          
          // Crear registro en la base de datos
          await prisma.productImage.create({
            data: {
              path: `/uploads/products/${product.id}/${filename}`,
              filename: filename,
              alt: product.title,
              order: i,
              productId: product.id
            }
          })
          
          console.log(`  📸 Imagen ${i + 1} descargada: ${filename}`)
        } catch (error) {
          console.error(`  ❌ Error descargando imagen ${i + 1}:`, error.message)
        }
      }
    }

    // Crear productos para Maria
    console.log('\n📱 Creando productos para Maria...')
    for (const productData of mariaProducts) {
      const finalPrice = productData.supplierPrice * (1 + productData.marginPercentage / 100)
      
      const product = await prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          price: finalPrice,
          supplierPrice: productData.supplierPrice,
          marginPercentage: productData.marginPercentage,
          previousPrice: productData.previousPrice,
          condition: productData.condition,
          aestheticCondition: productData.aestheticCondition,
          specifications: productData.specifications,
          categories: productData.categories,
          stock: productData.stock,
          status: productData.status,
          productCode: productData.productCode,
          manufacturerCode: productData.manufacturerCode,
          publishedBy: productData.publishedBy,
          publishedAt: productData.publishedAt,
          userId: maria.id
        }
      })

      console.log(`✅ Producto creado: ${product.title}`)
      
      // Crear directorio para el producto
      const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', product.id)
      fs.mkdirSync(productDir, { recursive: true })

      // Descargar y guardar imágenes
      for (let i = 0; i < productData.imageUrls.length; i++) {
        const imageUrl = productData.imageUrls[i]
        const timestamp = Date.now()
        const filename = `image_${i + 1}_${timestamp}.jpg`
        const filePath = path.join(productDir, filename)
        
        try {
          await downloadImage(imageUrl, filePath)
          
          // Crear registro en la base de datos
          await prisma.productImage.create({
            data: {
              path: `/uploads/products/${product.id}/${filename}`,
              filename: filename,
              alt: product.title,
              order: i,
              productId: product.id
            }
          })
          
          console.log(`  📸 Imagen ${i + 1} descargada: ${filename}`)
        } catch (error) {
          console.error(`  ❌ Error descargando imagen ${i + 1}:`, error.message)
        }
      }
    }

    console.log('\n🎉 Productos creados exitosamente con imágenes reales!')
    
  } catch (error) {
    console.error('❌ Error creando productos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createProductsWithRealImages()
