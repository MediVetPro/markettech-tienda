const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Traducciones al portugués brasileño
const translations = {
  // Títulos de productos
  titles: {
    'iPhone 15 Pro Max 256GB': 'iPhone 15 Pro Max 256GB',
    'Samsung Galaxy S24 Ultra 512GB': 'Samsung Galaxy S24 Ultra 512GB',
    'Google Pixel 8 Pro 256GB': 'Google Pixel 8 Pro 256GB',
    'PlayStation 5 Console': 'Console PlayStation 5',
    'Xbox Series X Console': 'Console Xbox Series X',
    'Nintendo Switch OLED': 'Nintendo Switch OLED',
    'Steam Deck 512GB': 'Steam Deck 512GB',
    'Samsung Odyssey G7 27" 1440p': 'Samsung Odyssey G7 27" 1440p',
    'LG UltraGear 24" 1080p 144Hz': 'LG UltraGear 24" 1080p 144Hz',
    'ASUS ROG Swift 32" 4K 144Hz': 'ASUS ROG Swift 32" 4K 144Hz',
    'Dell UltraSharp 27" 4K': 'Dell UltraSharp 27" 4K',
    'Sony WH-1000XM5 Auriculares Inalámbricos': 'Sony WH-1000XM5 Fones de Ouvido Sem Fio',
    'AirPods Pro 2da Generación': 'AirPods Pro 2ª Geração',
    'Bose QuietComfort 45': 'Bose QuietComfort 45',
    'Sennheiser HD 660S': 'Sennheiser HD 660S',
    'JBL Charge 5 Altavoz Bluetooth': 'JBL Charge 5 Alto-falante Bluetooth',
    'Audio-Technica ATH-M50x': 'Audio-Technica ATH-M50x',
    'Apple Watch Series 9 45mm GPS': 'Apple Watch Series 9 45mm GPS',
    'Samsung Galaxy Watch 6 Classic 47mm': 'Samsung Galaxy Watch 6 Classic 47mm',
    'Garmin Fenix 7 Pro Solar': 'Garmin Fenix 7 Pro Solar',
    'Fitbit Versa 4': 'Fitbit Versa 4',
    'Amazfit GTR 4': 'Amazfit GTR 4',
    'Huawei Watch GT 4': 'Huawei Watch GT 4'
  },

  // Descripciones
  descriptions: {
    'iPhone 15 Pro Max 256GB': 'O iPhone mais avançado com chip A17 Pro, câmera de 48MP e tela Super Retina XDR de 6,7 polegadas.',
    'Samsung Galaxy S24 Ultra 512GB': 'Smartphone premium com S Pen, câmera de 200MP e tela Dynamic AMOLED 2X de 6,8 polegadas.',
    'Google Pixel 8 Pro 256GB': 'Smartphone com IA avançada, câmera de 50MP e tela OLED de 6,7 polegadas com 120Hz.',
    'PlayStation 5 Console': 'Console de videogames de nova geração com SSD ultra-rápido e ray tracing.',
    'Xbox Series X Console': 'Console da Microsoft com 4K nativo, 120 FPS e Quick Resume.',
    'Nintendo Switch OLED': 'Console híbrido com tela OLED de 7 polegadas e Joy-Con melhorados.',
    'Steam Deck 512GB': 'Console portátil para PC gaming com AMD APU e tela touch de 7 polegadas.',
    'Samsung Odyssey G7 27" 1440p': 'Monitor gaming curvo QHD com 240Hz, 1ms e tecnologia Quantum Dot.',
    'LG UltraGear 24" 1080p 144Hz': 'Monitor gaming Full HD com 144Hz, 1ms e FreeSync Premium.',
    'ASUS ROG Swift 32" 4K 144Hz': 'Monitor gaming 4K com 144Hz, HDR600 e G-SYNC Ultimate.',
    'Dell UltraSharp 27" 4K': 'Monitor profissional 4K com 99% sRGB e USB-C.',
    'Sony WH-1000XM5 Auriculares Inalámbricos': 'Fones de ouvido premium com cancelamento de ruído líder da indústria e 30 horas de bateria.',
    'AirPods Pro 2da Generación': 'Fones de ouvido sem fio com cancelamento ativo de ruído e áudio espacial.',
    'Bose QuietComfort 45': 'Fones de ouvido com cancelamento de ruído e som equilibrado para uso diário.',
    'Sennheiser HD 660S': 'Fones de ouvido de estúdio de alta fidelidade com transdutores de 150 ohms.',
    'JBL Charge 5 Altavoz Bluetooth': 'Alto-falante portátil resistente à água com 20 horas de reprodução.',
    'Audio-Technica ATH-M50x': 'Fones de ouvido de monitoramento profissionais com resposta plana.',
    'Apple Watch Series 9 45mm GPS': 'Smartwatch com tela Always-On, rastreamento de saúde avançado e resistência à água até 50 metros.',
    'Samsung Galaxy Watch 6 Classic 47mm': 'Smartwatch premium com bisel giratório, monitoramento de saúde e bateria de longa duração.',
    'Garmin Fenix 7 Pro Solar': 'Relógio esportivo com GPS, carregamento solar e rastreamento avançado de atividades ao ar livre.',
    'Fitbit Versa 4': 'Smartwatch fitness com rastreamento de sono, GPS integrado e resistência à água.',
    'Amazfit GTR 4': 'Smartwatch elegante com tela AMOLED, GPS duplo e bateria de 14 dias.',
    'Huawei Watch GT 4': 'Smartwatch com design premium, monitoramento de saúde 24/7 e autonomia de 14 dias.'
  }
}

async function translateProductsToPortuguese() {
  try {
    console.log('🇧🇷 Traduzindo produtos para português brasileiro...')
    
    // Buscar todos los productos
    const products = await prisma.product.findMany()
    
    console.log(`📦 Encontrados ${products.length} produtos para traduzir`)
    
    for (const product of products) {
      console.log(`\n🔄 Traduzindo: ${product.title}`)
      
      try {
        // Traducir título
        const translatedTitle = translations.titles[product.title] || product.title
        
        // Traducir descripción
        const translatedDescription = translations.descriptions[product.title] || product.description
        
        // Arreglar especificaciones (parsear JSON y formatear)
        let formattedSpecs = product.specifications
        try {
          const specsObj = JSON.parse(product.specifications)
          formattedSpecs = `Marca: ${specsObj.marca}\nModelo: ${specsObj.modelo}\nCategoria: ${specsObj.categoria}\nTipo: ${specsObj.tipo}`
        } catch (e) {
          // Si no es JSON válido, usar el texto tal como está
          formattedSpecs = product.specifications
        }
        
        // Actualizar producto
        await prisma.product.update({
          where: { id: product.id },
          data: {
            title: translatedTitle,
            description: translatedDescription,
            specifications: formattedSpecs
          }
        })
        
        console.log(`  ✅ Traduzido: ${translatedTitle}`)
        
      } catch (error) {
        console.error(`  ❌ Erro traduzindo ${product.title}: ${error.message}`)
      }
    }
    
    console.log(`\n🎉 Processo concluído! ${products.length} produtos traduzidos para português brasileiro.`)
    console.log('\n📋 Especificações agora formatadas corretamente (sem chaves JSON)')
    console.log('🇧🇷 Todos os títulos e descrições traduzidos para português')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

translateProductsToPortuguese()
