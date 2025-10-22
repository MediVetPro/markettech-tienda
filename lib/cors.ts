import { NextResponse } from 'next/server'

// Headers de CORS para permitir acceso desde el frontend
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Función helper para manejar preflight requests
export function handleCorsOptions() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

// Función helper para agregar headers de CORS a las respuestas
export function withCors(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
