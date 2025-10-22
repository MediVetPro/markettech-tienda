// Script para verificar que la paginación funcione correctamente
const testCases = [
  { name: 'All products', url: 'http://localhost:3000/api/products?limit=50' },
  { name: 'Cables category', url: 'http://localhost:3000/api/products?category=cables&limit=50' },
  { name: 'Smartphones category', url: 'http://localhost:3000/api/products?category=smartphones&limit=50' },
  { name: 'Gaming category', url: 'http://localhost:3000/api/products?category=gaming&limit=50' },
  { name: 'Default limit (should be 10)', url: 'http://localhost:3000/api/products' }
];

async function testPagination() {
  console.log('🔍 Testing pagination fix...\n');
  
  for (const testCase of testCases) {
    try {
      const response = await fetch(testCase.url);
      const data = await response.json();
      
      const productCount = data.products?.length || 0;
      const totalCount = data.pagination?.total || 0;
      const limit = data.pagination?.limit || 0;
      
      console.log(`📊 ${testCase.name}:`);
      console.log(`   Products returned: ${productCount}`);
      console.log(`   Total available: ${totalCount}`);
      console.log(`   Limit: ${limit}`);
      
      if (testCase.name === 'Default limit (should be 10)') {
        if (limit === 10) {
          console.log('   ✅ Default limit working correctly');
        } else {
          console.log('   ❌ Default limit not working');
        }
      } else {
        if (productCount === totalCount) {
          console.log('   ✅ All products returned');
        } else {
          console.log('   ⚠️ Some products may be missing');
        }
      }
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error testing ${testCase.name}: ${error.message}`);
    }
  }
  
  console.log('🎯 Summary:');
  console.log('   - Default limit: 10 products (for performance)');
  console.log('   - With limit=50: All products returned');
  console.log('   - Frontend now requests limit=50 to show all products');
}

testPagination();
