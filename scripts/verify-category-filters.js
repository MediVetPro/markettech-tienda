const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Categorías que deberían tener productos
const expectedCategories = [
  'smartphones',
  'laptops', 
  'audio',
  'cameras',
  'gaming',
  'wearables',
  'chargers',
  'cables',
  'gadgets'
];

async function testCategoryFilters() {
  try {
    console.log('🔍 Testing category filters...\n');
    
    let allTestsPassed = true;
    
    for (const category of expectedCategories) {
      try {
        const response = await fetch(`http://localhost:3000/api/products?category=${category}`);
        const data = await response.json();
        const count = data.pagination?.total || 0;
        
        if (count > 0) {
          console.log(`✅ ${category}: ${count} products`);
        } else {
          console.log(`❌ ${category}: 0 products (expected > 0)`);
          allTestsPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${category}: Error - ${error.message}`);
        allTestsPassed = false;
      }
    }
    
    // Test "all" category
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();
      const totalCount = data.pagination?.total || 0;
      
      console.log(`\n📊 Total products (all categories): ${totalCount}`);
      
      if (totalCount >= 20) {
        console.log('✅ Total products count looks good');
      } else {
        console.log('❌ Total products count seems low');
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ Error testing total products: ${error.message}`);
      allTestsPassed = false;
    }
    
    // Get all unique categories from database
    const products = await prisma.product.findMany({
      select: { categories: true }
    });
    
    const allCategories = products.flatMap(p => p.categories.split(','));
    const uniqueCategories = [...new Set(allCategories)].sort();
    
    console.log('\n🏷️ All categories in database:');
    uniqueCategories.forEach(cat => console.log(`   - ${cat}`));
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   Unique categories: ${uniqueCategories.length}`);
    console.log(`   All filters working: ${allTestsPassed ? '✅ Yes' : '❌ No'}`);
    
    if (allTestsPassed) {
      console.log('\n🎉 All category filters are working correctly!');
    } else {
      console.log('\n⚠️ Some category filters need attention.');
    }
    
  } catch (error) {
    console.error('❌ Error testing category filters:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategoryFilters();
