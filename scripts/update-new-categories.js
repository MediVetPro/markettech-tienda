const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateProductCategoriesWithNew() {
  try {
    console.log('🔄 Actualizando categorías de productos con las nuevas categorías...')

    // Obtener todos los productos
    const products = await prisma.product.findMany()
    console.log(`📦 Encontrados ${products.length} productos`)

    // Categorías de ejemplo basadas en el título del producto
    const categoryMappings = {
      // Categorías existentes
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
      'band': 'wearables',
      
      // Nuevas categorías
      'carregador': 'chargers',
      'carregadores': 'chargers',
      'bateria': 'chargers',
      'powerbank': 'chargers',
      'power bank': 'chargers',
      'cabo': 'cables',
      'cabos': 'cables',
      'cable': 'cables',
      'usb': 'cables',
      'hdmi': 'cables',
      'lightning': 'cables',
      'micro usb': 'cables',
      'type c': 'cables',
      'gadget': 'gadgets',
      'gadgets': 'gadgets',
      'acessorio': 'gadgets',
      'acessorios': 'gadgets',
      'suporte': 'gadgets',
      'suportes': 'gadgets',
      'stand': 'gadgets',
      'dock': 'gadgets',
      'hub': 'gadgets',
      'adaptador': 'gadgets',
      'adaptadores': 'gadgets',
      
      // Categorías de mochilas e bolsos
      'mochila': 'backpacks',
      'mochilas': 'backpacks',
      'bolso': 'backpacks',
      'bolsos': 'backpacks',
      'estuche': 'backpacks',
      'estuches': 'backpacks',
      'case': 'backpacks',
      'maleta': 'backpacks',
      'maletas': 'backpacks',
      'bag': 'backpacks',
      'saco': 'backpacks',
      'sacola': 'backpacks',
      'backpack': 'backpacks',
      'pasta': 'backpacks',
      'pastas': 'backpacks',
      
      // Categorías de drones
      'drone': 'drones',
      'drones': 'drones',
      'quadcopter': 'drones',
      'quadricoptero': 'drones',
      'aeronave': 'drones',
      'voo': 'drones',
      'flying': 'drones',
      'aereo': 'drones',
      
      // Categorías de defensa personal
      'defesa': 'defense',
      'defense': 'defense',
      'seguranca': 'defense',
      'segurança': 'defense',
      'protecao': 'defense',
      'proteção': 'defense',
      'spray': 'defense',
      'pepper': 'defense',
      'pimenta': 'defense',
      'alarme': 'defense',
      'alarmes': 'defense',
      'sirene': 'defense',
      'sirenes': 'defense',
      'whistle': 'defense',
      'apito': 'defense',
      'apitos': 'defense',
      'lanterna': 'defense',
      'lanternas': 'defense',
      'flashlight': 'defense',
      'taser': 'defense',
      'stun': 'defense',
      'choque': 'defense',
      'pessoal': 'defense',
      'pessoais': 'defense',
      
      // Categorías de ferramentas
      'ferramenta': 'tools',
      'ferramentas': 'tools',
      'tool': 'tools',
      'tools': 'tools',
      'chave': 'tools',
      'chaves': 'tools',
      'screwdriver': 'tools',
      'chave de fenda': 'tools',
      'chave philips': 'tools',
      'philips': 'tools',
      'phillips': 'tools',
      'alicate': 'tools',
      'alicates': 'tools',
      'pliers': 'tools',
      'martelo': 'tools',
      'martelos': 'tools',
      'hammer': 'tools',
      'furadeira': 'tools',
      'furadeiras': 'tools',
      'drill': 'tools',
      'parafuso': 'tools',
      'parafusos': 'tools',
      'screw': 'tools',
      'porca': 'tools',
      'porcas': 'tools',
      'nut': 'tools',
      'arruela': 'tools',
      'arruelas': 'tools',
      'washer': 'tools',
      'multimetro': 'tools',
      'multímetro': 'tools',
      'multimeter': 'tools',
      'teste': 'tools',
      'tester': 'tools',
      'solda': 'tools',
      'soldagem': 'tools',
      'soldering': 'tools',
      'estacao': 'tools',
      'estação': 'tools',
      'station': 'tools',
      'desoldagem': 'tools',
      'desoldar': 'tools',
      'desoldering': 'tools',
      'pasta': 'tools',
      'flux': 'tools',
      'fluxo': 'tools',
      'cabo': 'tools',
      'wire': 'tools',
      'fio': 'tools',
      'fios': 'tools',
      'conector': 'tools',
      'conectores': 'tools',
      'connector': 'tools',
      'pinça': 'tools',
      'pinças': 'tools',
      'tweezers': 'tools',
      'cortador': 'tools',
      'cortadores': 'tools',
      'cutter': 'tools',
      'corte': 'tools',
      'cutting': 'tools',
      'reparo': 'tools',
      'reparos': 'tools',
      'repair': 'tools',
      'manutencao': 'tools',
      'manutenção': 'tools',
      'maintenance': 'tools',
      'eletronica': 'tools',
      'eletrônica': 'tools',
      'electronics': 'tools',
      'circuito': 'tools',
      'circuitos': 'tools',
      'circuit': 'tools',
      'pcb': 'tools',
      'placa': 'tools',
      'placas': 'tools',
      'board': 'tools',
      'componente': 'tools',
      'componentes': 'tools',
      'component': 'tools',
      'resistor': 'tools',
      'resistor': 'tools',
      'capacitor': 'tools',
      'capacitor': 'tools',
      'diodo': 'tools',
      'diodos': 'tools',
      'diode': 'tools',
      'transistor': 'tools',
      'transistores': 'tools',
      'ic': 'tools',
      'chip': 'tools',
      'chips': 'tools',
      'led': 'tools',
      'leds': 'tools',
      'switch': 'tools',
      'botao': 'tools',
      'botões': 'tools',
      'button': 'tools',
      'potenciometro': 'tools',
      'potenciômetro': 'tools',
      'potentiometer': 'tools',
      'sensor': 'tools',
      'sensores': 'tools',
      'relay': 'tools',
      'rele': 'tools',
      'relés': 'tools',
      'fuse': 'tools',
      'fusivel': 'tools',
      'fusível': 'tools',
      'fusíveis': 'tools'
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
        categories = ['gadgets'] // Categoría por defecto más amplia
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
    console.log('\n📋 Categorías disponibles:')
    console.log('   • smartphones - Smartphones e celulares')
    console.log('   • laptops - Laptops e notebooks')
    console.log('   • audio - Fones, caixas de som, etc.')
    console.log('   • cameras - Câmeras e equipamentos fotográficos')
    console.log('   • gaming - Consoles, controles, jogos')
    console.log('   • wearables - Smartwatches, pulseiras, etc.')
    console.log('   • chargers - Carregadores, powerbanks, baterias')
    console.log('   • cables - Cabos USB, HDMI, Lightning, etc.')
    console.log('   • gadgets - Acessórios, suportes, adaptadores, etc.')
    console.log('   • backpacks - Mochilas, bolsos, estuches, cases')
    console.log('   • drones - Drones, quadcopters, aeronaves')
    console.log('   • defense - Defesa pessoal, segurança, proteção')
    console.log('   • tools - Ferramentas, reparo, eletrônica, componentes')

  } catch (error) {
    console.error('❌ Error actualizando categorías:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductCategoriesWithNew()
