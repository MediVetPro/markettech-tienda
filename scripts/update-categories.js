const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateProductCategories() {
  try {
    console.log('🔄 Actualizando categorías de productos...')

    // Obtener todos los productos
    const products = await prisma.product.findMany()
    console.log(`📦 Encontrados ${products.length} productos`)

    // Categorías de ejemplo basadas en el título del producto
    const categoryMappings = {
      'iphone': 'smartphones',
      'samsung': 'smartphones',
      'xiaomi': 'smartphones',
      'motorola': 'smartphones',
      'smartphone': 'smartphones',
      'celular': 'smartphones',
      'telefone': 'smartphones',
      'macbook': 'laptops',
      'laptop': 'laptops',
      'notebook': 'laptops',
      'dell': 'laptops',
      'hp': 'laptops',
      'lenovo': 'laptops',
      'asus': 'laptops',
      'acer': 'laptops',
      'fone': 'audio',
      'headphone': 'audio',
      'headset': 'audio',
      'airpods': 'audio',
      'som': 'audio',
      'caixa': 'audio',
      'speaker': 'audio',
      'camera': 'cameras',
      'canon': 'cameras',
      'nikon': 'cameras',
      'sony': 'cameras',
      'fotografia': 'cameras',
      'gaming': 'gaming',
      'playstation': 'gaming',
      'xbox': 'gaming',
      'nintendo': 'gaming',
      'controle': 'gaming',
      'joystick': 'gaming',
      'watch': 'wearables',
      'relogio': 'wearables',
      'smartwatch': 'wearables',
      'fitness': 'wearables',
      'band': 'wearables'
    }

    let updatedCount = 0

    for (const product of products) {
      const title = product.title.toLowerCase()
      let categories = []

      // Buscar coincidencias en el título
      for (const [keyword, category] of Object.entries(categoryMappings)) {
        if (title.includes(keyword)) {
          if (!categories.includes(category)) {
            categories.push(category)
          }
        }
      }

      // Si no se encontraron categorías, asignar una por defecto
      if (categories.length === 0) {
        categories = ['smartphones'] // Categoría por defecto
      }

      // Actualizar el producto con las categorías
      await prisma.product.update({
        where: { id: product.id },
        data: {
          categories: categories.join(',')
        }
      })

      console.log(`✅ ${product.title} -> ${categories.join(', ')}`)
      updatedCount++
    }

    console.log(`\n🎉 Actualización completada! ${updatedCount} productos actualizados`)

  } catch (error) {
    console.error('❌ Error actualizando categorías:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductCategories()
