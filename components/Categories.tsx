'use client'

import Link from 'next/link'
import { Smartphone, Laptop, Headphones, Camera, Gamepad2, Watch } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function Categories() {
  const { t } = useLanguage()

  const categories = [
    {
      name: t.categories.smartphones,
      icon: Smartphone,
      href: '/products/static?category=smartphones',
      color: 'bg-blue-500'
    },
    {
      name: t.categories.laptops,
      icon: Laptop,
      href: '/products/static?category=laptops',
      color: 'bg-green-500'
    },
    {
      name: t.categories.audio,
      icon: Headphones,
      href: '/products/static?category=audio',
      color: 'bg-purple-500'
    },
    {
      name: t.categories.cameras,
      icon: Camera,
      href: '/products/static?category=cameras',
      color: 'bg-red-500'
    },
    {
      name: t.categories.gaming,
      icon: Gamepad2,
      href: '/products/static?category=gaming',
      color: 'bg-orange-500'
    },
    {
      name: t.categories.wearables,
      icon: Watch,
      href: '/products/static?category=wearables',
      color: 'bg-pink-500'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.categories.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.categories.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors"
            >
              <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
