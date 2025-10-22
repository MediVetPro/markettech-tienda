import { ProductDetailClient } from '@/components/ProductDetailClient'

// Função para gerar parâmetros estáticos
export async function generateStaticParams() {
  // Retornar IDs de produtos estáticos para o build
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' }
  ]
}

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return <ProductDetailClient productId={params.id} />
}
