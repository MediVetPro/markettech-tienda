'use client'

import Link from 'next/link'
import { Smartphone, Laptop, Headphones, Camera, Gamepad2, Watch, Battery, Cable, Zap, Cpu, Monitor, HardDrive, CpuIcon, MemoryStick, Power, Fan, Plane, Bot, Wifi, Eye, Home, Car, Shield, Router, Backpack, ShieldCheck, Wrench, Heart, Dumbbell, BatteryIcon, Clock, TabletSmartphone, Usb, Mouse, Lightbulb, Plug } from 'lucide-react'

export function Categories() {
  const categories = [
    {
      name: 'Smartphones',
      icon: Smartphone,
      href: '/products?category=smartphones',
      color: 'bg-blue-500'
    },
    {
      name: 'Laptops',
      icon: Laptop,
      href: '/products?category=laptops',
      color: 'bg-green-500'
    },
    {
      name: 'Áudio',
      icon: Headphones,
      href: '/products?category=audio',
      color: 'bg-purple-500'
    },
    {
      name: 'Câmeras',
      icon: Camera,
      href: '/products?category=cameras',
      color: 'bg-red-500'
    },
    {
      name: 'Gaming',
      icon: Gamepad2,
      href: '/products?category=gaming',
      color: 'bg-orange-500'
    },
    {
      name: 'Wearables',
      icon: Watch,
      href: '/products?category=wearables',
      color: 'bg-pink-500'
    },
    {
      name: 'Carregadores',
      icon: Battery,
      href: '/products?category=chargers',
      color: 'bg-yellow-500'
    },
    {
      name: 'Cabos',
      icon: Cable,
      href: '/products?category=cables',
      color: 'bg-gray-500'
    },
    {
      name: 'Gadgets',
      icon: Zap,
      href: '/products?category=gadgets',
      color: 'bg-indigo-500'
    },
    {
      name: 'Placas Mãe',
      icon: Cpu,
      href: '/products?category=motherboards',
      color: 'bg-teal-500'
    },
    {
      name: 'Monitores',
      icon: Monitor,
      href: '/products?category=monitors',
      color: 'bg-cyan-500'
    },
    {
      name: 'Armazenamento',
      icon: HardDrive,
      href: '/products?category=storage',
      color: 'bg-emerald-500'
    },
    {
      name: 'Placas de Vídeo',
      icon: CpuIcon,
      href: '/products?category=graphics',
      color: 'bg-violet-500'
    },
    {
      name: 'Processadores',
      icon: Cpu,
      href: '/products?category=processors',
      color: 'bg-amber-500'
    },
    {
      name: 'Memória RAM',
      icon: MemoryStick,
      href: '/products?category=memory',
      color: 'bg-rose-500'
    },
    {
      name: 'Fontes de Alimentação',
      icon: Power,
      href: '/products?category=powerSupplies',
      color: 'bg-slate-500'
    },
    {
      name: 'Refrigeração',
      icon: Fan,
      href: '/products?category=cooling',
      color: 'bg-sky-500'
    },
    {
      name: 'Drones',
      icon: Plane,
      href: '/products?category=drones',
      color: 'bg-emerald-600'
    },
    {
      name: 'Mochilas e Bolsos',
      icon: Backpack,
      href: '/products?category=backpacks',
      color: 'bg-amber-600'
    },
    {
      name: 'Defesa Pessoal',
      icon: ShieldCheck,
      href: '/products?category=defense',
      color: 'bg-red-700'
    },
    {
      name: 'Ferramentas',
      icon: Wrench,
      href: '/products?category=tools',
      color: 'bg-slate-700'
    },
    {
      name: 'Saúde',
      icon: Heart,
      href: '/products?category=health',
      color: 'bg-pink-600'
    },
    {
      name: 'Esporte',
      icon: Dumbbell,
      href: '/products?category=sports',
      color: 'bg-green-600'
    },
    {
      name: 'Baterias Portáteis',
      icon: BatteryIcon,
      href: '/products?category=portable_batteries',
      color: 'bg-yellow-600'
    },
    {
      name: 'Retro',
      icon: Clock,
      href: '/products?category=retro',
      color: 'bg-amber-800'
    },
    {
      name: 'Suportes',
      icon: TabletSmartphone,
      href: '/products?category=stands',
      color: 'bg-blue-700'
    },
    {
      name: 'HUB USB',
      icon: Usb,
      href: '/products?category=usb_hubs',
      color: 'bg-indigo-700'
    },
    {
      name: 'Periféricos',
      icon: Mouse,
      href: '/products?category=peripherals',
      color: 'bg-purple-700'
    },
    {
      name: 'Iluminação',
      icon: Lightbulb,
      href: '/products?category=lighting',
      color: 'bg-yellow-500'
    },
    {
      name: 'Adaptadores',
      icon: Plug,
      href: '/products?category=adapters',
      color: 'bg-orange-700'
    },
    {
      name: 'Robótica',
      icon: Bot,
      href: '/products?category=robotics',
      color: 'bg-purple-600'
    },
    {
      name: 'IoT',
      icon: Wifi,
      href: '/products?category=iot',
      color: 'bg-cyan-600'
    },
    {
      name: 'VR/AR',
      icon: Eye,
      href: '/products?category=vr_ar',
      color: 'bg-violet-600'
    },
    {
      name: 'Casa Inteligente',
      icon: Home,
      href: '/products?category=smart_home',
      color: 'bg-orange-600'
    },
    {
      name: 'Automotivo',
      icon: Car,
      href: '/products?category=automotive',
      color: 'bg-red-600'
    },
    {
      name: 'Segurança',
      icon: Shield,
      href: '/products?category=security',
      color: 'bg-gray-600'
    },
    {
      name: 'Rede',
      icon: Router,
      href: '/products?category=networking',
      color: 'bg-blue-600'
    },
    {
      name: 'PC de Escritório',
      icon: Monitor,
      href: '/products?category=desktop',
      color: 'bg-indigo-600'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Categorias de Produtos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore nossas categorias e encontre exatamente o que você precisa
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
