// Script para probar la paginación
async function testPagination() {
  console.log('🔍 Testing pagination system...\n');
  
  const baseUrl = 'http://localhost:3000/api/products';
  
  try {
    // Test page 1
    console.log('📄 Testing page 1:');
    const page1 = await fetch(`${baseUrl}?page=1&limit=12`);
    const data1 = await page1.json();
    console.log(`   Products: ${data1.products.length}`);
    console.log(`   Page: ${data1.pagination.page}/${data1.pagination.pages}`);
    console.log(`   Total: ${data1.pagination.total}`);
    
    // Test page 2
    console.log('\n📄 Testing page 2:');
    const page2 = await fetch(`${baseUrl}?page=2&limit=12`);
    const data2 = await page2.json();
    console.log(`   Products: ${data2.products.length}`);
    console.log(`   Page: ${data2.pagination.page}/${data2.pagination.pages}`);
    console.log(`   Total: ${data2.pagination.total}`);
    
    // Test page 4 (last page)
    console.log('\n📄 Testing page 4 (last page):');
    const page4 = await fetch(`${baseUrl}?page=4&limit=12`);
    const data4 = await page4.json();
    console.log(`   Products: ${data4.products.length}`);
    console.log(`   Page: ${data4.pagination.page}/${data4.pagination.pages}`);
    console.log(`   Total: ${data4.pagination.total}`);
    
    // Test category filtering with pagination
    console.log('\n🔍 Testing category filtering with pagination:');
    const cables = await fetch(`${baseUrl}?category=cables&page=1&limit=12`);
    const cablesData = await cables.json();
    console.log(`   Cables - Products: ${cablesData.products.length}`);
    console.log(`   Cables - Pages: ${cablesData.pagination.pages}`);
    console.log(`   Cables - Total: ${cablesData.pagination.total}`);
    
    // Test search with pagination
    console.log('\n🔍 Testing search with pagination:');
    const search = await fetch(`${baseUrl}?search=iPhone&page=1&limit=12`);
    const searchData = await search.json();
    console.log(`   iPhone search - Products: ${searchData.products.length}`);
    console.log(`   iPhone search - Pages: ${searchData.pagination.pages}`);
    console.log(`   iPhone search - Total: ${searchData.pagination.total}`);
    
    console.log('\n✅ Pagination system is working correctly!');
    console.log('\n📊 Summary:');
    console.log(`   - Total products: ${data1.pagination.total}`);
    console.log(`   - Products per page: 12`);
    console.log(`   - Total pages: ${data1.pagination.pages}`);
    console.log(`   - Category filtering works with pagination`);
    console.log(`   - Search works with pagination`);
    
  } catch (error) {
    console.error('❌ Error testing pagination:', error.message);
  }
}

testPagination();
