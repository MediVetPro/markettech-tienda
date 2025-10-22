const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Productos adicionales para probar la paginación
const additionalProducts = [
  {
    title: "iPhone 14 Pro 128GB",
    description: "Smartphone premium con cámara de 48MP, chip A16 Bionic y pantalla Super Retina XDR de 6.1 pulgadas.",
    price: 999.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "A16 Bionic, Pantalla 6.1\" Super Retina XDR, 128GB, Cámara 48MP, 5G, iOS 16",
    categories: "smartphones,apple,premium",
    stock: 8,
    status: "ACTIVE"
  },
  {
    title: "Samsung Galaxy S23 256GB",
    description: "Smartphone Android con cámara de 50MP, procesador Snapdragon 8 Gen 2 y pantalla Dynamic AMOLED 2X.",
    price: 799.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Snapdragon 8 Gen 2, Pantalla 6.1\" Dynamic AMOLED 2X, 256GB, Cámara 50MP, 5G, Android 13",
    categories: "smartphones,samsung,premium",
    stock: 12,
    status: "ACTIVE"
  },
  {
    title: "MacBook Pro M3 Pro 14 pulgadas",
    description: "Laptop profesional con chip M3 Pro, pantalla Liquid Retina XDR de 14.2 pulgadas y hasta 18 horas de batería.",
    price: 1999.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "M3 Pro, Pantalla 14.2\" Liquid Retina XDR, 512GB SSD, 18GB RAM, Hasta 18h batería, macOS Sonoma",
    categories: "laptops,apple,profesional",
    stock: 6,
    status: "ACTIVE"
  },
  {
    title: "Dell XPS 13 Plus 9320",
    description: "Laptop ultraportátil con procesador Intel i7, pantalla InfinityEdge de 13.4 pulgadas y diseño premium.",
    price: 1299.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Intel i7, Pantalla 13.4\" InfinityEdge, 512GB SSD, 16GB RAM, Windows 11, Diseño premium",
    categories: "laptops,dell,ultraportatil",
    stock: 10,
    status: "ACTIVE"
  },
  {
    title: "Sony WH-1000XM4",
    description: "Auriculares over-ear con cancelación de ruido líder, sonido de alta fidelidad y hasta 30 horas de batería.",
    price: 349.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "Cancelación de ruido líder, Sonido alta fidelidad, 30h batería, Carga rápida, Bluetooth 5.0",
    categories: "audio,sony,over-ear",
    stock: 15,
    status: "ACTIVE"
  },
  {
    title: "Bose QuietComfort Earbuds II",
    description: "Auriculares inalámbricos con cancelación de ruido personalizada y sonido de alta calidad.",
    price: 279.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Cancelación de ruido personalizada, Sonido alta calidad, 6h batería, Estuche de carga, Bluetooth",
    categories: "audio,bose,inalambrico",
    stock: 20,
    status: "ACTIVE"
  },
  {
    title: "Nikon Z6 II",
    description: "Cámara mirrorless full frame con sensor de 24.5MP, grabación 4K y autofoco avanzado.",
    price: 1999.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "24.5MP Full Frame, 4K video, Autofoco avanzado, 14 FPS, WiFi, Bluetooth, Pantalla táctil",
    categories: "cameras,nikon,profesional",
    stock: 4,
    status: "ACTIVE"
  },
  {
    title: "Canon EOS R5",
    description: "Cámara mirrorless profesional con sensor de 45MP, grabación 8K y estabilización de imagen.",
    price: 3899.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "45MP Full Frame, 8K video, Estabilización, 20 FPS, WiFi, Bluetooth, Pantalla táctil",
    categories: "cameras,canon,profesional",
    stock: 2,
    status: "ACTIVE"
  },
  {
    title: "PlayStation 5",
    description: "Consola de videojuegos de nueva generación con 4K nativo, ray tracing y SSD ultra rápido.",
    price: 499.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "AMD Zen 2, 4K nativo, Ray tracing, SSD ultra rápido, Compatible con PS4, Dolby Vision",
    categories: "gaming,playstation,consola",
    stock: 5,
    status: "ACTIVE"
  },
  {
    title: "Nintendo Switch",
    description: "Consola híbrida que funciona como consola de casa y portátil. Incluye Joy-Con y dock.",
    price: 299.99,
    condition: "USED",
    aestheticCondition: 8,
    specifications: "Modo híbrido, Joy-Con incluidos, Dock, 32GB, WiFi, Bluetooth, Compatible con TV",
    categories: "gaming,nintendo,portatil",
    stock: 8,
    status: "ACTIVE"
  },
  {
    title: "Apple Watch Series 8 GPS 45mm",
    description: "Reloj inteligente con chip S8, pantalla Always-On Retina, seguimiento de salud y resistencia al agua.",
    price: 399.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip S8, Pantalla Always-On Retina, GPS, Seguimiento salud, Resistente al agua, watchOS 9",
    categories: "wearables,apple,smartwatch",
    stock: 12,
    status: "ACTIVE"
  },
  {
    title: "Samsung Galaxy Watch 5 Pro",
    description: "Reloj inteligente Android con GPS, seguimiento de salud avanzado y batería de larga duración.",
    price: 449.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "GPS, Seguimiento salud avanzado, Batería larga duración, Resistente al agua, Android compatible",
    categories: "wearables,samsung,smartwatch",
    stock: 9,
    status: "ACTIVE"
  },
  {
    title: "Cargador USB-C 100W GaN",
    description: "Cargador ultra rápido USB-C de 100W con tecnología GaN. Compacto y eficiente para laptops y dispositivos.",
    price: 79.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "100W USB-C, GaN, Carga ultra rápida, Compacto, Compatible universal, Múltiples puertos",
    categories: "chargers,usb-c,accesorios",
    stock: 25,
    status: "ACTIVE"
  },
  {
    title: "Cable USB-C a Lightning 2m",
    description: "Cable USB-C a Lightning de alta calidad para dispositivos Apple. Carga rápida y transferencia de datos.",
    price: 29.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "USB-C a Lightning, 2 metros, Carga rápida, Transferencia datos, Compatible iPhone iPad",
    categories: "cables,apple,lightning",
    stock: 35,
    status: "ACTIVE"
  },
  {
    title: "Hub USB-C 10 en 1",
    description: "Hub USB-C con 10 puertos: HDMI 4K, USB-A, USB-C, SD, microSD, Ethernet, VGA, Audio y carga.",
    price: 99.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "10 puertos, HDMI 4K, USB 3.0, SD/microSD, Ethernet, VGA, Audio, Carga 100W",
    categories: "gadgets,accesorios,usb-c",
    stock: 18,
    status: "ACTIVE"
  }
];

async function createProduct(productData) {
  try {
    console.log(`📱 Creating product: ${productData.title}`);
    
    const product = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: [{
            path: '/placeholder.jpg',
            filename: 'placeholder.jpg',
            alt: productData.title,
            order: 0
          }]
        }
      }
    });
    
    console.log(`✅ Product created: ${product.title} (ID: ${product.id})`);
    return product;
    
  } catch (error) {
    console.error(`❌ Error creating product ${productData.title}:`, error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('🚀 Adding more products for pagination testing...');
    
    let successCount = 0;
    for (const productData of additionalProducts) {
      const product = await createProduct(productData);
      if (product) successCount++;
    }
    
    console.log(`\n✅ Successfully created ${successCount} additional products`);
    
    // Verify total products
    const totalProducts = await prisma.product.count();
    console.log(`📊 Total products in database: ${totalProducts}`);
    
    // Calculate pages with limit 12
    const pages = Math.ceil(totalProducts / 12);
    console.log(`📄 With 12 products per page: ${pages} pages`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
