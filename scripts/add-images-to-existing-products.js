const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Productos que necesitan imágenes reales
const productsNeedingImages = [
  {
    title: "Cargador USB-C 65W GaN",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop"
  },
  {
    title: "Cargador Inalámbrico MagSafe 15W",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop"
  },
  {
    title: "Cargador Múltiple 4 Puertos 100W",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop"
  },
  {
    title: "Cargador USB-C 30W",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop"
  },
  {
    title: "Cargador Inalámbrico MagSafe 15W",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop"
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

async function addImageToProduct(productTitle, imageUrl) {
  try {
    console.log(`📱 Adding image to product: ${productTitle}`);
    
    // Find product by title
    const product = await prisma.product.findFirst({
      where: { title: productTitle },
      include: { images: true }
    });
    
    if (!product) {
      console.log(`❌ Product not found: ${productTitle}`);
      return null;
    }
    
    // Check if product already has images
    if (product.images && product.images.length > 0) {
      console.log(`⚠️ Product ${productTitle} already has images, skipping`);
      return null;
    }
    
    // Download image
    const imageBuffer = await downloadImage(imageUrl, 'product.jpg');
    if (!imageBuffer) {
      console.log(`⚠️ Could not download image for ${productTitle}`);
      return null;
    }
    
    // Create product directory
    const productDir = path.join(process.cwd(), 'public', 'uploads', 'products', product.id);
    fs.mkdirSync(productDir, { recursive: true });
    
    // Save image
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}.jpg`;
    const imagePath = path.join(productDir, filename);
    fs.writeFileSync(imagePath, imageBuffer);
    
    // Create image record in database
    const imageRecord = await prisma.productImage.create({
      data: {
        path: `/uploads/products/${product.id}/${filename}`,
        filename: filename,
        alt: product.title,
        order: 0,
        productId: product.id
      }
    });
    
    console.log(`✅ Image added to product: ${product.title} (Image ID: ${imageRecord.id})`);
    return imageRecord;
    
  } catch (error) {
    console.error(`❌ Error adding image to product ${productTitle}:`, error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('🚀 Adding real images to existing products...');
    
    // First, let's check which products don't have images
    const productsWithoutImages = await prisma.product.findMany({
      where: {
        images: {
          none: {}
        }
      },
      select: { id: true, title: true }
    });
    
    console.log(`📊 Products without images: ${productsWithoutImages.length}`);
    productsWithoutImages.forEach(p => console.log(`   - ${p.title}`));
    
    let successCount = 0;
    for (const productData of productsWithoutImages) {
      // Use a generic image URL for products that need images
      const imageUrl = "https://images.unsplash.com/photo-1609091839311-d5365bcc0b0a?w=800&h=600&fit=crop";
      
      const result = await addImageToProduct(productData.title, imageUrl);
      if (result) successCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Successfully added images to ${successCount} products`);
    
    // Verify final count
    const totalProducts = await prisma.product.count();
    const productsWithImages = await prisma.product.count({
      where: {
        images: {
          some: {}
        }
      }
    });
    
    console.log(`📊 Final statistics:`);
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Products with images: ${productsWithImages}`);
    console.log(`   Products without images: ${totalProducts - productsWithImages}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
