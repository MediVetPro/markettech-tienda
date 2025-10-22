const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addComputerPartsProducts() {
  try {
    console.log('🖥️ Agregando productos de piezas de computadoras...')

    const computerPartsProducts = [
      // Placas Madre
      {
        title: 'ASUS ROG Strix B550-F Gaming',
        description: 'Placa madre AMD AM4 con soporte para procesadores Ryzen, PCIe 4.0, WiFi 6 y RGB.',
        price: 189.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Socket AM4, Chipset B550, 4 slots DDR4, PCIe 4.0, WiFi 6, RGB',
        categories: 'motherboards',
        stock: 15,
        status: 'ACTIVE'
      },
      {
        title: 'MSI MAG B550 Tomahawk',
        description: 'Placa madre gaming con excelente refrigeración y conectividad avanzada.',
        price: 149.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: 'Socket AM4, Chipset B550, 4 slots DDR4, PCIe 4.0, USB-C',
        categories: 'motherboards',
        stock: 12,
        status: 'ACTIVE'
      },

      // Monitores
      {
        title: 'Samsung Odyssey G7 27" 1440p',
        description: 'Monitor gaming curvo 27" con 240Hz, QHD y tecnología QLED.',
        price: 399.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: '27", 2560x1440, 240Hz, 1ms, QLED, Curvo 1000R',
        categories: 'monitors',
        stock: 8,
        status: 'ACTIVE'
      },
      {
        title: 'LG UltraGear 24" 1080p',
        description: 'Monitor gaming 24" con 144Hz y tecnología IPS para colores precisos.',
        price: 199.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: '24", 1920x1080, 144Hz, 1ms, IPS, FreeSync',
        categories: 'monitors',
        stock: 20,
        status: 'ACTIVE'
      },

      // Almacenamiento
      {
        title: 'Samsung 980 PRO 1TB NVMe',
        description: 'SSD NVMe PCIe 4.0 de alta velocidad para gaming y trabajo profesional.',
        price: 129.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: '1TB, PCIe 4.0, 7000MB/s lectura, 5000MB/s escritura',
        categories: 'storage',
        stock: 25,
        status: 'ACTIVE'
      },
      {
        title: 'WD Blue SN570 500GB NVMe',
        description: 'SSD NVMe PCIe 3.0 con excelente relación calidad-precio.',
        price: 49.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: '500GB, PCIe 3.0, 3500MB/s lectura, 3000MB/s escritura',
        categories: 'storage',
        stock: 30,
        status: 'ACTIVE'
      },

      // Tarjetas Gráficas
      {
        title: 'NVIDIA GeForce RTX 4070',
        description: 'Tarjeta gráfica gaming de alta gama con ray tracing y DLSS 3.',
        price: 599.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: '12GB GDDR6X, 192-bit, Ray Tracing, DLSS 3, PCIe 4.0',
        categories: 'graphics',
        stock: 5,
        status: 'ACTIVE'
      },
      {
        title: 'AMD Radeon RX 6700 XT',
        description: 'Tarjeta gráfica AMD con 12GB GDDR6 para gaming en 1440p.',
        price: 399.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: '12GB GDDR6, 192-bit, RDNA 2, PCIe 4.0',
        categories: 'graphics',
        stock: 8,
        status: 'ACTIVE'
      },

      // Procesadores
      {
        title: 'AMD Ryzen 7 7700X',
        description: 'Procesador AMD de 8 núcleos y 16 hilos con arquitectura Zen 4.',
        price: 329.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: '8 núcleos, 16 hilos, 4.5GHz base, 5.4GHz boost, Socket AM5',
        categories: 'processors',
        stock: 15,
        status: 'ACTIVE'
      },
      {
        title: 'Intel Core i5-13400F',
        description: 'Procesador Intel de 10 núcleos con excelente rendimiento gaming.',
        price: 199.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: '10 núcleos, 16 hilos, 2.5GHz base, 4.6GHz boost, Socket LGA1700',
        categories: 'processors',
        stock: 18,
        status: 'ACTIVE'
      },

      // Memoria RAM
      {
        title: 'Corsair Vengeance LPX 32GB DDR4',
        description: 'Kit de memoria DDR4 de 32GB (2x16GB) con latencia baja.',
        price: 89.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: '32GB (2x16GB), DDR4-3200, CL16, 1.35V',
        categories: 'memory',
        stock: 22,
        status: 'ACTIVE'
      },
      {
        title: 'G.Skill Trident Z RGB 16GB DDR4',
        description: 'Kit de memoria DDR4 gaming con iluminación RGB.',
        price: 69.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: '16GB (2x8GB), DDR4-3600, CL18, RGB',
        categories: 'memory',
        stock: 25,
        status: 'ACTIVE'
      },

      // Fuentes de Poder
      {
        title: 'Corsair RM850x 850W 80+ Gold',
        description: 'Fuente de poder modular 850W con certificación 80+ Gold.',
        price: 129.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: '850W, 80+ Gold, Modular, 140mm fan, 10 años garantía',
        categories: 'powerSupplies',
        stock: 12,
        status: 'ACTIVE'
      },
      {
        title: 'EVGA SuperNOVA 650W 80+ Gold',
        description: 'Fuente de poder 650W con excelente eficiencia y estabilidad.',
        price: 89.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: '650W, 80+ Gold, Semi-modular, 120mm fan',
        categories: 'powerSupplies',
        stock: 15,
        status: 'ACTIVE'
      },

      // Refrigeración
      {
        title: 'Noctua NH-D15 Chromax Black',
        description: 'Cooler de CPU de alto rendimiento con doble ventilador.',
        price: 99.99,
        condition: 'NEW',
        aestheticCondition: 10,
        specifications: 'Doble ventilador 140mm, 6 heatpipes, Compatible AM4/AM5/LGA1700',
        categories: 'cooling',
        stock: 10,
        status: 'ACTIVE'
      },
      {
        title: 'Corsair H100i RGB Elite',
        description: 'AIO líquido 240mm con iluminación RGB y software iCUE.',
        price: 149.99,
        condition: 'NEW',
        aestheticCondition: 9,
        specifications: '240mm, RGB, Bomba de alta velocidad, Ventiladores ML120',
        categories: 'cooling',
        stock: 8,
        status: 'ACTIVE'
      }
    ]

    let addedCount = 0

    for (const product of computerPartsProducts) {
      try {
        const createdProduct = await prisma.product.create({
          data: product
        })
        console.log(`✅ Producto creado: ${createdProduct.title}`)
        addedCount++
      } catch (error) {
        console.error(`❌ Error creando producto ${product.title}:`, error.message)
      }
    }

    console.log(`🎉 Se agregaron ${addedCount} productos de piezas de computadoras`)
    console.log('📊 Categorías agregadas:')
    console.log('  - Placas Madre (motherboards)')
    console.log('  - Monitores (monitors)')
    console.log('  - Almacenamiento (storage)')
    console.log('  - Tarjetas Gráficas (graphics)')
    console.log('  - Procesadores (processors)')
    console.log('  - Memoria RAM (memory)')
    console.log('  - Fuentes de Poder (powerSupplies)')
    console.log('  - Refrigeración (cooling)')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addComputerPartsProducts()
