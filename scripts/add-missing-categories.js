const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Productos con categorías que faltan
const missingCategoryProducts = [
  {
    title: "Cable USB-C a USB-C 2m",
    description: "Cable USB-C de alta calidad para carga rápida y transferencia de datos. Compatible con smartphones, tablets y laptops.",
    price: 19.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "USB-C a USB-C, 2 metros, Carga rápida, Transferencia datos, Compatible universal",
    categories: "cables,accesorios,usb-c",
    stock: 50,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
  },
  {
    title: "Cargador Inalámbrico Qi 15W",
    description: "Cargador inalámbrico de alta velocidad con tecnología Qi. Compatible con iPhone, Samsung y otros dispositivos.",
    price: 39.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "15W Qi, Carga inalámbrica, LED indicador, Compatible universal, Diseño compacto",
    categories: "chargers,inalambrico,accesorios",
    stock: 30,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop"
  },
  {
    title: "Cable Lightning a USB-A 1.5m",
    description: "Cable Lightning original para dispositivos Apple. Carga rápida y transferencia de datos confiable.",
    price: 24.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Lightning a USB-A, 1.5 metros, Carga rápida, Transferencia datos, Compatible iPhone iPad",
    categories: "cables,apple,lightning",
    stock: 40,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
  },
  {
    title: "Cámara Canon EOS R6 Mark II",
    description: "Cámara mirrorless profesional con sensor full frame de 24.2MP, grabación 4K y estabilización de imagen.",
    price: 2499.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "24.2MP Full Frame, 4K video, Estabilización, 40 FPS, WiFi, Bluetooth, Pantalla táctil",
    categories: "cameras,canon,profesional",
    stock: 5,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"
  },
  {
    title: "Adaptador USB-C Hub 7 en 1",
    description: "Hub USB-C con 7 puertos: HDMI, USB-A, USB-C, SD, microSD, Ethernet y carga. Perfecto para laptops.",
    price: 79.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "7 puertos, HDMI 4K, USB 3.0, SD/microSD, Ethernet, Carga 100W, Compatible universal",
    categories: "gadgets,accesorios,usb-c",
    stock: 25,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop"
  },
  {
    title: "Cable HDMI 2.1 3m",
    description: "Cable HDMI 2.1 de alta velocidad para 4K 120Hz, 8K y eARC. Perfecto para gaming y home theater.",
    price: 29.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "HDMI 2.1, 4K 120Hz, 8K, eARC, 3 metros, Alta velocidad, Gaming compatible",
    categories: "cables,hdmi,gaming",
    stock: 35,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
  },
  {
    title: "Cargador Portátil 20000mAh",
    description: "Power bank de alta capacidad con carga rápida USB-C y wireless. Perfecto para viajes y uso diario.",
    price: 59.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "20000mAh, Carga rápida, USB-C, Wireless, LED display, Múltiples puertos",
    categories: "chargers,portatil,accesorios",
    stock: 20,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop"
  },
  {
    title: "Cámara Sony A7 IV",
    description: "Cámara mirrorless full frame con sensor de 33MP, grabación 4K y autofoco avanzado. Ideal para profesionales.",
    price: 2499.99,
    condition: "USED",
    aestheticCondition: 9,
    specifications: "33MP Full Frame, 4K video, Autofoco avanzado, 10 FPS, WiFi, Bluetooth, Pantalla táctil",
    categories: "cameras,sony,profesional",
    stock: 3,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop"
  },
  {
    title: "Gadget Smart Ring",
    description: "Anillo inteligente con seguimiento de salud, notificaciones y control de dispositivos. Diseño elegante y discreto.",
    price: 199.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Seguimiento salud, Notificaciones, Control dispositivos, Batería 7 días, Resistente al agua",
    categories: "gadgets,wearables,smart",
    stock: 15,
    status: "ACTIVE",
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop"
  },
  {
    title: "Cable Ethernet Cat8 5m",
    description: "Cable Ethernet de alta velocidad Cat8 para conexiones de red ultra rápidas. Perfecto para gaming y oficina.",
    price: 34.99,
    condition: "NEW",
    aestheticCondition: 10,
    specifications: "Cat8, 5 metros, 40Gbps, Blindado, Gaming compatible, Oficina profesional",
    categories: "cables,red,profesional",
    stock: 30,
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
      return;
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
    console.log('🚀 Adding products with missing categories...');
    
    let successCount = 0;
    for (const productData of missingCategoryProducts) {
      const product = await createProductWithImage(productData);
      if (product) successCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Successfully created ${successCount} products with missing categories`);
    
    // Verify categories
    const products = await prisma.product.findMany({
      select: { title: true, categories: true }
    });
    
    const allCategories = products.flatMap(p => p.categories.split(','));
    const uniqueCategories = [...new Set(allCategories)];
    
    console.log('\n🏷️ All categories now available:');
    uniqueCategories.sort().forEach(cat => console.log(`   - ${cat}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
