'use client'


interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  multiple?: boolean
}

export function CategorySelector({ value, onChange, multiple = false }: CategorySelectorProps) {
  const predefinedCategories = [
    { key: 'smartphones', label: 'Smartphones' },
    { key: 'laptops', label: 'Laptops' },
    { key: 'audio', label: 'Áudio' },
    { key: 'cameras', label: 'Câmeras' },
    { key: 'gaming', label: 'Gaming' },
    { key: 'wearables', label: 'Wearables' },
    { key: 'chargers', label: 'Carregadores' },
    { key: 'cables', label: 'Cabos' },
    { key: 'gadgets', label: 'Gadgets' },
    { key: 'motherboards', label: 'Placas Mãe' },
    { key: 'monitors', label: 'Monitores' },
    { key: 'storage', label: 'Armazenamento' },
    { key: 'graphics', label: 'Placas de Vídeo' },
    { key: 'processors', label: 'Processadores' },
    { key: 'memory', label: 'Memória RAM' },
    { key: 'powerSupplies', label: 'Fontes de Alimentação' },
    { key: 'cooling', label: 'Refrigeração' },
    { key: 'drones', label: 'Drones' },
    { key: 'backpacks', label: 'Mochilas e Bolsos' },
    { key: 'defense', label: 'Defesa Pessoal' },
    { key: 'tools', label: 'Ferramentas' },
    { key: 'health', label: 'Saúde' },
    { key: 'sports', label: 'Esporte' },
    { key: 'portable_batteries', label: 'Baterias Portáteis' },
    { key: 'retro', label: 'Retro' },
    { key: 'stands', label: 'Suportes' },
    { key: 'usb_hubs', label: 'HUB USB' },
    { key: 'peripherals', label: 'Periféricos' },
    { key: 'lighting', label: 'Iluminação' },
    { key: 'adapters', label: 'Adaptadores' },
    { key: 'robotics', label: 'Robótica' },
    { key: 'iot', label: 'IoT' },
    { key: 'vr_ar', label: 'VR/AR' },
    { key: 'smart_home', label: 'Casa Inteligente' },
    { key: 'automotive', label: 'Automotivo' },
    { key: 'security', label: 'Segurança' },
    { key: 'networking', label: 'Rede' },
    { key: 'desktop', label: 'PC de Escritório' }
  ]

  const handleCategoryChange = (categoryKey: string) => {
    if (multiple) {
      const currentCategories = value ? value.split(',').filter(c => c.trim()) : []
      const isSelected = currentCategories.includes(categoryKey)
      
      let newCategories: string[]
      if (isSelected) {
        newCategories = currentCategories.filter(c => c !== categoryKey)
      } else {
        newCategories = [...currentCategories, categoryKey]
      }
      
      onChange(newCategories.join(','))
    } else {
      onChange(categoryKey)
    }
  }

  const isSelected = (categoryKey: string) => {
    if (multiple) {
      const currentCategories = value ? value.split(',').filter(c => c.trim()) : []
      return currentCategories.includes(categoryKey)
    }
    return value === categoryKey
  }

  if (multiple) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500 mb-2">
          Selecione uma ou mais categorias para o produto
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {predefinedCategories.map((category) => (
            <label
              key={category.key}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected(category.key)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected(category.key)}
                onChange={() => handleCategoryChange(category.key)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className={`w-4 h-4 border-2 rounded mr-3 ${
                  isSelected(category.key)
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {isSelected(category.key) && (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">{category.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-2">
        Selecione uma categoria para o produto
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {predefinedCategories.map((category) => (
          <label
            key={category.key}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              isSelected(category.key)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="category"
              value={category.key}
              checked={isSelected(category.key)}
              onChange={() => handleCategoryChange(category.key)}
              className="sr-only"
            />
            <div className="flex items-center">
              <div className={`w-4 h-4 border-2 rounded-full mr-3 ${
                isSelected(category.key)
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
              }`}>
                {isSelected(category.key) && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">{category.label}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
