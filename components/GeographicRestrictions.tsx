'use client'

import { useState, useEffect } from 'react'
import { MapPin, Save, AlertCircle, Search } from 'lucide-react'
import { GeographicRestrictions } from '@/lib/brazilianStates'
interface GeographicRestrictionsProps {
  onSave: (restrictions: GeographicRestrictions) => Promise<void>
  initialRestrictions?: GeographicRestrictions
}

export default function GeographicRestrictionsComponent({ 
  onSave, 
  initialRestrictions 
}: GeographicRestrictionsProps) {
    const [restrictions, setRestrictions] = useState<GeographicRestrictions>({
    enabled: false,
    type: 'none',
    allowedStates: [],
    allowedCities: []
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [citySearch, setCitySearch] = useState('')

  // Actualizar restricciones cuando cambien las props
  useEffect(() => {
    if (initialRestrictions) {
      setRestrictions(initialRestrictions)
    }
  }, [initialRestrictions])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      await onSave(restrictions)
    } catch (error) {
      setError('Erro ao salvar restrições geográficas')
      console.error('Error saving restrictions:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateRestrictions = (updates: Partial<GeographicRestrictions>) => {
    setRestrictions(prev => ({ ...prev, ...updates }))
  }

  const toggleState = (stateCode: string) => {
    const newStates = restrictions.allowedStates.includes(stateCode)
      ? restrictions.allowedStates.filter(s => s !== stateCode)
      : [...restrictions.allowedStates, stateCode]
    
    updateRestrictions({ allowedStates: newStates })
  }

  const updateCities = (citiesText: string) => {
    const cities = citiesText.split('\n').map(city => city.trim()).filter(Boolean)
    updateRestrictions({ allowedCities: cities })
  }

  // Lista completa de ciudades brasileñas (sin duplicados)
  const allCities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília',
    'Fortaleza', 'Manaus', 'Curitiba', 'Recife', 'Goiânia',
    'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís',
    'Maceió', 'Duque de Caxias', 'Natal', 'Teresina', 'Campo Grande',
    'Nova Iguaçu', 'São Bernardo do Campo', 'João Pessoa', 'Santo André',
    'Osasco', 'Jaboatão dos Guararapes', 'São José dos Campos', 'Ribeirão Preto',
    'Uberlândia', 'Sorocaba', 'Contagem', 'Aracaju', 'Feira de Santana',
    'Cuiabá', 'Joinville', 'Aparecida de Goiânia', 'Londrina', 'Ananindeua',
    'Niterói', 'Porto Velho', 'Serra', 'Caxias do Sul', 'Campos dos Goytacazes',
    'Macapá', 'Vila Velha', 'Florianópolis', 'Mauá', 'São João de Meriti',
    'Mogi das Cruzes', 'Diadema', 'Jundiaí', 'Carapicuíba', 'Piracicaba',
    'Belford Roxo', 'Itaquaquecetuba', 'São Vicente', 'Franca', 'Ribeirão das Neves',
    'Uberaba', 'Governador Valadares', 'Taubaté', 'Petrolina', 'Paulista',
    'Limeira', 'Cabo Frio', 'Camaçari', 'Suzano', 'Mossoró',
    'Várzea Grande', 'Petrópolis', 'Caruaru', 'Volta Redonda', 'Novo Hamburgo',
    'Caucaia', 'Magé', 'Itabuna', 'Colombo', 'Americana',
    'Marília', 'Taboão da Serra', 'Sumaré', 'Juiz de Fora', 'Santa Maria',
    'Embu das Artes', 'São Caetano do Sul', 'Cariacica', 'Blumenau',
    'Cascavel', 'Guarujá', 'Cotia', 'São José de Ribamar', 'Viamão',
    'Foz do Iguaçu', 'Vitória', 'Pindamonhangaba', 'Caraguatatuba', 'Itu',
    'Lauro de Freitas', 'Ferraz de Vasconcelos', 'Barueri', 'Francisco Morato', 'Araçatuba',
    'Guaratinguetá', 'Praia Grande', 'São José do Rio Preto', 'Jacareí',
    'Ribeirão Pires'
  ]

  // Filtrar ciudades según la búsqueda
  const filteredCities = allCities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-4">
        <MapPin className="w-5 h-5 text-primary-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Restrições Geográficas</h2>
      </div>
      
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <p className="text-yellow-800 text-sm">
                <strong>Nota:</strong> As restrições geográficas limitam onde os produtos podem ser vendidos
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="geographic_restrictions_enabled"
              checked={restrictions.enabled}
              onChange={(e) => updateRestrictions({ enabled: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="geographic_restrictions_enabled" className="ml-2 block text-sm text-gray-900">
              Habilitar restrições geográficas
            </label>
          </div>

          {restrictions.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de restrição
                </label>
                <select
                  value={restrictions.type}
                  onChange={(e) => updateRestrictions({ 
                    type: e.target.value as 'state' | 'city' | 'none',
                    allowedStates: [],
                    allowedCities: []
                  })}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="none">Sem restrições</option>
                  <option value="state">Restringir por estado</option>
                  <option value="city">Restringir por cidade</option>
                </select>
              </div>

              {restrictions.type === 'state' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Estados permitidos (selecciona uno o más)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allStateCodes = [
                            'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE',
                            'PA', 'MA', 'ES', 'PB', 'AM', 'RN', 'AL', 'MT', 'MS', 'RO',
                            'AC', 'AP', 'RR', 'TO', 'PI', 'SE', 'DF'
                          ]
                          updateRestrictions({ allowedStates: allStateCodes })
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Seleccionar todos
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRestrictions({ allowedStates: [] })}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {[
                      { code: 'SP', name: 'São Paulo' },
                      { code: 'RJ', name: 'Rio de Janeiro' },
                      { code: 'MG', name: 'Minas Gerais' },
                      { code: 'RS', name: 'Rio Grande do Sul' },
                      { code: 'PR', name: 'Paraná' },
                      { code: 'SC', name: 'Santa Catarina' },
                      { code: 'BA', name: 'Bahia' },
                      { code: 'GO', name: 'Goiás' },
                      { code: 'PE', name: 'Pernambuco' },
                      { code: 'CE', name: 'Ceará' },
                      { code: 'PA', name: 'Pará' },
                      { code: 'MA', name: 'Maranhão' },
                      { code: 'ES', name: 'Espírito Santo' },
                      { code: 'PB', name: 'Paraíba' },
                      { code: 'AM', name: 'Amazonas' },
                      { code: 'RN', name: 'Rio Grande do Norte' },
                      { code: 'AL', name: 'Alagoas' },
                      { code: 'MT', name: 'Mato Grosso' },
                      { code: 'MS', name: 'Mato Grosso do Sul' },
                      { code: 'RO', name: 'Rondônia' },
                      { code: 'AC', name: 'Acre' },
                      { code: 'AP', name: 'Amapá' },
                      { code: 'RR', name: 'Roraima' },
                      { code: 'TO', name: 'Tocantins' },
                      { code: 'PI', name: 'Piauí' },
                      { code: 'SE', name: 'Sergipe' },
                      { code: 'DF', name: 'Distrito Federal' }
                    ].map((state) => (
                      <label key={state.code} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={restrictions.allowedStates.includes(state.code)}
                          onChange={() => toggleState(state.code)}
                          className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                        />
                        {state.name}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {restrictions.allowedStates.length} estado(s) seleccionado(s)
                  </p>
                </div>
              )}

              {restrictions.type === 'city' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidades permitidas
                  </label>
                  
                  {/* Campo de búsqueda */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar ciudad..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredCities.map((city) => (
                        <label key={city} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={restrictions.allowedCities.includes(city)}
                            onChange={() => {
                              const newCities = restrictions.allowedCities.includes(city)
                                ? restrictions.allowedCities.filter(c => c !== city)
                                : [...restrictions.allowedCities, city]
                              updateRestrictions({ allowedCities: newCities })
                            }}
                            className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                          />
                          {city}
                        </label>
                      ))}
                    </div>
                    {filteredCities.length === 0 && citySearch && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No se encontraron ciudades que coincidan con "{citySearch}"
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {restrictions.allowedCities.length} ciudad(es) seleccionada(s)
                    </p>
                    {restrictions.allowedCities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => updateRestrictions({ allowedCities: [] })}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Limpar seleção
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Restrições'}
          </button>
        </div>
      </div>
    </div>
  )
}
