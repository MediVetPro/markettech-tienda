import { Hero } from '@/components/Hero'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { Categories } from '@/components/Categories'
import { ContactInfo } from '@/components/ContactInfo'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <ContactInfo />
    </div>
  )
}
