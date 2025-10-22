// Script para simular exactamente lo que hace el frontend
async function testFrontendRequest() {
  console.log('🔍 Simulando petición del frontend...\n');
  
  // Simular la lógica del frontend
  const searchTerm = '';
  const filterCondition = 'all';
  const filterCategory = 'all';
  
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (filterCondition !== 'all') params.append('condition', filterCondition);
  if (filterCategory !== 'all') params.append('category', filterCategory);
  // Aumentar el límite para mostrar más productos
  params.append('limit', '50');
  
  const url = params.toString() ? `http://localhost:3000/api/products?${params.toString()}` : 'http://localhost:3000/api/products';
  
  console.log('📡 URL que enviaría el frontend:', url);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\n📊 Resultados:');
    console.log(`   Productos devueltos: ${data.products?.length || 0}`);
    console.log(`   Total disponible: ${data.pagination?.total || 0}`);
    console.log(`   Límite aplicado: ${data.pagination?.limit || 0}`);
    console.log(`   Páginas: ${data.pagination?.pages || 0}`);
    
    if (data.products?.length === data.pagination?.total) {
      console.log('\n✅ ¡Perfecto! El frontend ahora debería mostrar todos los productos.');
    } else {
      console.log('\n❌ Aún hay un problema con la paginación.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendRequest();
