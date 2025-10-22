const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updatePaulProfile() {
  try {
    console.log('🔧 Actualizando perfil de Paul con datos reales...')

    // Buscar el usuario Paul
    const paul = await prisma.user.findFirst({
      where: { email: 'paul790905@gmail.com' }
    })

    if (!paul) {
      console.log('❌ No se encontró el usuario Paul')
      return
    }

    console.log(`\n👤 Usuario encontrado: ${paul.name}`)
    console.log(`   ID: ${paul.id}`)
    console.log(`   Email: ${paul.email}`)

    // Actualizar con datos reales
    const updatedPaul = await prisma.user.update({
      where: { id: paul.id },
      data: {
        name: 'Paul Romero Garcia',
        email: 'paul790905@gmail.com',
        phone: '41997050868',
        cpf: '034.996.506-49',
        address: 'Rua Janusz Korczak 81',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '81170-754',
        country: 'Brasil'
      }
    })

    console.log('\n✅ Perfil actualizado exitosamente:')
    console.log(`   Nombre: ${updatedPaul.name}`)
    console.log(`   Email: ${updatedPaul.email}`)
    console.log(`   Teléfono: ${updatedPaul.phone}`)
    console.log(`   CPF: ${updatedPaul.cpf}`)
    console.log(`   Dirección: ${updatedPaul.address}`)
    console.log(`   Ciudad: ${updatedPaul.city}`)
    console.log(`   Estado: ${updatedPaul.state}`)
    console.log(`   CEP: ${updatedPaul.zipCode}`)
    console.log(`   País: ${updatedPaul.country}`)

    // Verificar productos asociados
    const products = await prisma.product.findMany({
      where: { userId: paul.id },
      include: { images: true }
    })

    console.log(`\n📦 Productos asociados: ${products.length}`)
    products.forEach(product => {
      console.log(`   - ${product.title} (${product.images.length} imágenes)`)
    })

  } catch (error) {
    console.error('❌ Error actualizando perfil:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePaulProfile()
