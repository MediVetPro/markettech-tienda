import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    // En un entorno de producción, esto debería hacer fetch a la API
    // Por ahora, usamos valores por defecto
    const siteTitle = 'Smartesh - Loja de Tecnologia'
    const siteDescription = 'Sua loja de tecnologia de confiança com os melhores produtos'
    
    return {
      title: siteTitle,
      description: siteDescription,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Smartesh - Loja de Tecnologia',
      description: 'Sua loja de tecnologia de confiança com os melhores produtos',
    }
  }
}
