const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 20 productos adicionales con imágenes reales
const additionalProducts = [
  {
    title: "iPhone 13 Pro 128GB",
    description: "Smartphone premium con cámara de 12MP, chip A15 Bionic y pantalla Super Retina XDR de 6.1 pulgadas.",
    price: 899.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "A15 Bionic, Pantalla 6.1\" Super Retina XDR, 128GB, Cámara 12MP, 5G, iOS 15",
    categories: "smartphones,apple,premium",
    stock: 6,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop"
  },
  {
    title: "Samsung Galaxy S22 Ultra 256GB",
    description: "Smartphone Android con cámara de 108MP, procesador Snapdragon 8 Gen 1 y pantalla Dynamic AMOLED 2X de 6.8 pulgadas.",
    price: 1199.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Snapdragon 8 Gen 1, Pantalla 6.8\" Dynamic AMOLED 2X, 256GB, Cámara 108MP, 5G, Android 12",
    categories: "smartphones,samsung,premium",
    stock: 4,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop"
  },
  {
    title: "MacBook Air M1 13 pulgadas",
    description: "Laptop ultraportátil con chip M1, pantalla Retina de 13.3 pulgadas y hasta 18 horas de batería.",
    price: 999.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "Chip M1, Pantalla 13.3\" Retina, 256GB SSD, 8GB RAM, Hasta 18h batería, macOS Monterey",
    categories: "laptops,apple,ultraportatil",
    stock: 8,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop"
  },
  {
    title: "Dell XPS 13 9310",
    description: "Laptop ultraportátil con procesador Intel i7, pantalla InfinityEdge de 13.4 pulgadas y diseño premium.",
    price: 1299.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Intel i7, Pantalla 13.4\" InfinityEdge, 512GB SSD, 16GB RAM, Windows 11, Diseño premium",
    categories: "laptops,dell,ultraportatil",
    stock: 5,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop"
  },
  {
    title: "Sony WH-1000XM3",
    description: "Auriculares over-ear con cancelación de ruido líder, sonido de alta fidelidad y hasta 30 horas de batería.",
    price: 299.99,
    condition: "USED",
    aestheticCondition: 8,
    specifications: "Cancelación de ruido líder, Sonido alta fidelidad, 30h batería, Carga rápida, Bluetooth 5.0",
    categories: "audio,sony,over-ear",
    stock: 12,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop"
  },
  {
    title: "Bose QuietComfort 35 II",
    description: "Auriculares over-ear con cancelación de ruido líder, sonido equilibrado y hasta 20 horas de batería.",
    price: 279.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "Cancelación de ruido, Sonido equilibrado, 20h batería, Carga rápida, Bluetooth",
    categories: "audio,bose,over-ear",
    stock: 15,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop"
  },
  {
    title: "Canon EOS R",
    description: "Cámara mirrorless full frame con sensor de 30.3MP, grabación 4K y autofoco avanzado.",
    price: 1799.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "30.3MP Full Frame, 4K video, Autofoco avanzado, 8 FPS, WiFi, Bluetooth, Pantalla táctil",
    categories: "cameras,canon,profesional",
    stock: 3,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"
  },
  {
    title: "Sony A7 III",
    description: "Cámara mirrorless full frame con sensor de 24.2MP, grabación 4K y autofoco avanzado.",
    price: 1999.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "24.2MP Full Frame, 4K video, Autofoco avanzado, 10 FPS, WiFi, Bluetooth, Pantalla táctil",
    categories: "cameras,sony,profesional",
    stock: 2,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"
  },
  {
    title: "Xbox Series S",
    description: "Consola de videojuegos de nueva generación con 4K upscaling, ray tracing y SSD ultra rápido.",
    price: 299.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "AMD Zen 2, 4K upscaling, Ray tracing, SSD ultra rápido, Compatible con Xbox One, Dolby Vision",
    categories: "gaming,xbox,consola",
    stock: 7,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop"
  },
  {
    title: "Nintendo Switch Lite",
    description: "Consola portátil dedicada para gaming. Más ligera y compacta que la Switch original.",
    price: 199.99,
    condition: "USED",
    aestheticCondition: 8,
    specifications: "Modo portátil, Joy-Con integrados, 32GB, WiFi, Bluetooth, Pantalla 5.5\"",
    categories: "gaming,nintendo,portatil",
    stock: 10,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop"
  },
  {
    title: "Apple Watch Series 7 GPS 45mm",
    description: "Reloj inteligente con chip S7, pantalla Always-On Retina, seguimiento de salud y resistencia al agua.",
    price: 399.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "Chip S7, Pantalla Always-On Retina, GPS, Seguimiento salud, Resistente al agua, watchOS 8",
    categories: "wearables,apple,smartwatch",
    stock: 8,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop"
  },
  {
    title: "Samsung Galaxy Watch 4 Classic",
    description: "Reloj inteligente Android con GPS, seguimiento de salud avanzado y batería de larga duración.",
    price: 349.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "GPS, Seguimiento salud avanzado, Batería larga duración, Resistente al agua, Android compatible",
    categories: "wearables,samsung,smartwatch",
    stock: 6,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop"
  },
  {
    title: "Cargador USB-C 30W",
    description: "Cargador rápido USB-C de 30W. Compacto y eficiente para smartphones y tablets.",
    price: 29.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "30W USB-C, Carga rápida, Compacto, Compatible universal, Diseño moderno",
    categories: "chargers,usb-c,accesorios",
    stock: 30,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop"
  },
  {
    title: "Cable USB-A a Micro USB 2m",
    description: "Cable USB-A a Micro USB de alta calidad para dispositivos Android. Carga rápida y transferencia de datos.",
    price: 12.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "USB-A a Micro USB, 2 metros, Carga rápida, Transferencia datos, Compatible Android",
    categories: "cables,android,micro-usb",
    stock: 40,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
  },
  {
    title: "Hub USB-C 6 en 1",
    description: "Hub USB-C con 6 puertos: HDMI, USB-A, USB-C, SD, microSD y Ethernet. Perfecto para laptops.",
    price: 59.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "6 puertos, HDMI 4K, USB 3.0, SD/microSD, Ethernet, Carga 60W, Compatible universal",
    categories: "gadgets,accesorios,usb-c",
    stock: 20,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop"
  },
  {
    title: "iPad 10.2 pulgadas 64GB",
    description: "Tablet con chip A13 Bionic, pantalla Retina de 10.2 pulgadas y compatibilidad con Apple Pencil.",
    price: 329.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "Chip A13 Bionic, Pantalla 10.2\" Retina, 64GB, Apple Pencil compatible, iPadOS 15",
    categories: "tablets,apple,profesional",
    stock: 12,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop"
  },
  {
    title: "Samsung Galaxy Tab A8 64GB",
    description: "Tablet Android con pantalla de 10.5 pulgadas, procesador octa-core y batería de larga duración.",
    price: 249.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Procesador octa-core, Pantalla 10.5\", 64GB, Android 11, Batería larga duración",
    categories: "tablets,samsung,profesional",
    stock: 15,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop"
  },
  {
    title: "AirPods 3ra Generación",
    description: "Auriculares inalámbricos con chip H1, sonido espacial y hasta 6 horas de batería.",
    price: 179.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Chip H1, Sonido espacial, 6h batería, Estuche de carga, Bluetooth, Compatible iPhone",
    categories: "audio,apple,inalambrico",
    stock: 25,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop"
  },
  {
    title: "Sony WF-1000XM3",
    description: "Auriculares inalámbricos con cancelación de ruido líder, sonido de alta fidelidad y hasta 6 horas de batería.",
    price: 199.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "Cancelación de ruido líder, Sonido alta fidelidad, 6h batería, Estuche de carga, Bluetooth",
    categories: "audio,sony,inalambrico",
    stock: 18,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop"
  },
  {
    title: "Cargador Inalámbrico MagSafe 15W",
    description: "Cargador inalámbrico MagSafe para iPhone con imanes de alineación automática y carga rápida.",
    price: 39.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "MagSafe, 15W, Imanes alineación, Carga rápida, Compatible iPhone, Diseño elegante",
    categories: "chargers,apple,magsafe",
    stock: 22,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop"
  },
  {
    title: "Cable HDMI 2.0 5m",
    description: "Cable HDMI 2.0 de alta velocidad para 4K 60Hz y HDR. Perfecto para home theater y gaming.",
    price: 24.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "HDMI 2.0, 4K 60Hz, HDR, 5 metros, Alta velocidad, Gaming compatible",
    categories: "cables,hdmi,gaming",
    stock: 35,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
  }
];

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error(`❌ Error downloading image ${filename}:`, error.message);
    return null;
  }
}

async function createProductWithImage(productData) {
  try {
    console.log(`📱 Creating product: ${productData.title}`);
    
    // Download image
    const imageBuffer = await downloadImage(productData.imageUrl, 'product.jpg');
    if (!imageBuffer) {
      console.log(`⚠️ Skipping ${productData.title} - could not download image`);
      return null;
    }
    
    // Create product directory
    const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', productId);
    fs.mkdirSync(productDir, { recursive: true });
    
    // Save image
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}.jpg`;
    const imagePath = path.join(productDir, filename);
    fs.writeFileSync(imagePath, imageBuffer);
    
    // Create product in database
    const product = await prisma.product.create({
      data: {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        condition: productData.condition,
        aestheticCondition: productData.aestheticCondition,
        specifications: productData.specifications,
        categories: productData.categories,
        stock: productData.stock,
        status: productData.status,
        images: {
          create: [{
            path: `/uploads/products/${productId}/${filename}`,
            filename: filename,
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
    console.log('🚀 Adding 20 more products with real images...');
    
    let successCount = 0;
    for (const productData of additionalProducts) {
      const product = await createProductWithImage(productData);
      if (product) successCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Successfully created ${successCount} products with real images`);
    
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
