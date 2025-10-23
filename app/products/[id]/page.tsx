import dynamic from 'next/dynamic'

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

// Componente dinámico que se carga solo en el cliente
const ProductDetailClient = dynamic(() => import('./ProductDetailClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando produto...</p>
      </div>
    </div>
  )
})

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return <ProductDetailClient productId={params.id} />
}
