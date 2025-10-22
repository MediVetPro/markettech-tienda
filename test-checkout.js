// Script para probar el checkout con los mismos datos que el frontend
const fetch = require('node-fetch');

async function testCheckout() {
  try {
    console.log('🧪 Probando checkout con datos del frontend...');
    
    // Datos exactos que se envían desde el frontend
    const orderData = {
      customerInfo: {
        name: "Cliente Comprador Rapido",
        email: "cliente@gmail.com",
        phone: "(41) 997043445",
        address: "Carme, 65, casa",
        city: "Curitiba",
        state: "Paraná",
        zipCode: "80010-000"
      },
      items: [
        {
          id: "cmgwthcgw000214fj312hji05",
          quantity: 2,
          price: 7500
        }
      ],
      paymentMethod: "pix",
      commissionRate: 0.05
    };

    console.log('📤 Datos a enviar:', JSON.stringify(orderData, null, 2));

    const response = await fetch('http://localhost:3000/api/orders/commission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    console.log('📥 Status de respuesta:', response.status);
    console.log('📥 Headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.text();
    console.log('📥 Respuesta completa:', result);

    if (response.ok) {
      console.log('✅ ¡Checkout exitoso!');
    } else {
      console.log('❌ Error en el checkout');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testCheckout();
