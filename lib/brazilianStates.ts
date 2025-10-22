// Datos de estados y ciudades de Brasil
export interface State {
  code: string
  name: string
  cities: string[]
}

export const brazilianStates: State[] = [
  {
    code: 'AC',
    name: 'Acre',
    cities: [
      'Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó',
      'Brasiléia', 'Senador Guiomard', 'Plácido de Castro', 'Xapuri', 'Mâncio Lima'
    ]
  },
  {
    code: 'AL',
    name: 'Alagoas',
    cities: [
      'Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares',
      'São Miguel dos Campos', 'Penedo', 'Coruripe', 'Delmiro Gouveia', 'Santana do Ipanema'
    ]
  },
  {
    code: 'AP',
    name: 'Amapá',
    cities: [
      'Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Porto Grande',
      'Mazagão', 'Vitória do Jari', 'Pedra Branca do Amapari', 'Tartarugalzinho', 'Calçoene'
    ]
  },
  {
    code: 'AM',
    name: 'Amazonas',
    cities: [
      'Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari',
      'Tefé', 'Tabatinga', 'Maués', 'São Gabriel da Cachoeira', 'Humaitá'
    ]
  },
  {
    code: 'BA',
    name: 'Bahia',
    cities: [
      'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna',
      'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas',
      'Barreiras', 'Alagoinhas', 'Porto Seguro', 'Simões Filho', 'Paulo Afonso'
    ]
  },
  {
    code: 'CE',
    name: 'Ceará',
    cities: [
      'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral',
      'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá',
      'Pacatuba', 'Cascavel', 'Aracati', 'Crateús', 'Icó'
    ]
  },
  {
    code: 'DF',
    name: 'Distrito Federal',
    cities: [
      'Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Planaltina',
      'Sobradinho', 'Gama', 'Santa Maria', 'São Sebastião', 'Paranoá'
    ]
  },
  {
    code: 'ES',
    name: 'Espírito Santo',
    cities: [
      'Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Cachoeiro de Itapemirim',
      'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz'
    ]
  },
  {
    code: 'GO',
    name: 'Goiás',
    cities: [
      'Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia',
      'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama'
    ]
  },
  {
    code: 'MA',
    name: 'Maranhão',
    cities: [
      'São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias',
      'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas'
    ]
  },
  {
    code: 'MT',
    name: 'Mato Grosso',
    cities: [
      'Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra',
      'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Barra do Garças', 'Primavera do Leste'
    ]
  },
  {
    code: 'MS',
    name: 'Mato Grosso do Sul',
    cities: [
      'Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã',
      'Naviraí', 'Nova Andradina', 'Aquidauana', 'Paranaíba', 'Maracaju'
    ]
  },
  {
    code: 'MG',
    name: 'Minas Gerais',
    cities: [
      'Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim',
      'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga',
      'Sete Lagoas', 'Divinópolis', 'Santa Luzia', 'Ibirité', 'Poços de Caldas'
    ]
  },
  {
    code: 'PA',
    name: 'Pará',
    cities: [
      'Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas',
      'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba', 'Bragança'
    ]
  },
  {
    code: 'PB',
    name: 'Paraíba',
    cities: [
      'João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux',
      'Sousa', 'Cajazeiras', 'Guarabira', 'Mamanguape', 'Cabedelo'
    ]
  },
  {
    code: 'PR',
    name: 'Paraná',
    cities: [
      'Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel',
      'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'
    ]
  },
  {
    code: 'PE',
    name: 'Pernambuco',
    cities: [
      'Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina',
      'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'
    ]
  },
  {
    code: 'PI',
    name: 'Piauí',
    cities: [
      'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano',
      'Campo Maior', 'Barras', 'União', 'Altos', 'Pedro II'
    ]
  },
  {
    code: 'RJ',
    name: 'Rio de Janeiro',
    cities: [
      'Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói',
      'Belford Roxo', 'São João de Meriti', 'Campos dos Goytacazes', 'Petrópolis', 'Volta Redonda'
    ]
  },
  {
    code: 'RN',
    name: 'Rio Grande do Norte',
    cities: [
      'Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba',
      'Ceará-Mirim', 'Caicó', 'Açu', 'Currais Novos', 'Nova Cruz'
    ]
  },
  {
    code: 'RS',
    name: 'Rio Grande do Sul',
    cities: [
      'Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria',
      'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande'
    ]
  },
  {
    code: 'RO',
    name: 'Rondônia',
    cities: [
      'Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal',
      'Rolim de Moura', 'Guajará-Mirim', 'Jaru', 'Ouro Preto do Oeste', 'Buritis'
    ]
  },
  {
    code: 'RR',
    name: 'Roraima',
    cities: [
      'Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí',
      'Bonfim', 'Cantá', 'Normandia', 'Pacaraima', 'Iracema'
    ]
  },
  {
    code: 'SC',
    name: 'Santa Catarina',
    cities: [
      'Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma',
      'Chapecó', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça'
    ]
  },
  {
    code: 'SP',
    name: 'São Paulo',
    cities: [
      'São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André',
      'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'São José dos Campos',
      'Mogi das Cruzes', 'Diadema', 'Jundiaí', 'Carapicuíba', 'Piracicaba'
    ]
  },
  {
    code: 'SE',
    name: 'Sergipe',
    cities: [
      'Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão',
      'Estância', 'Propriá', 'Simão Dias', 'Tobias Barreto', 'Poço Redondo'
    ]
  },
  {
    code: 'TO',
    name: 'Tocantins',
    cities: [
      'Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins',
      'Colinas do Tocantins', 'Guaraí', 'Formoso do Araguaia', 'Dianópolis', 'Miracema do Tocantins'
    ]
  }
]

// Función para obtener estados permitidos según restricciones
export function getAllowedStates(restrictions: GeographicRestrictions): State[] {
  if (!restrictions.enabled) {
    return brazilianStates
  }

  if (restrictions.type === 'state' && restrictions.allowedStates.length > 0) {
    return brazilianStates.filter(state => 
      restrictions.allowedStates.includes(state.code)
    )
  }

  if (restrictions.type === 'city' && restrictions.allowedCities.length > 0) {
    // Si hay restricción por ciudad, solo mostrar estados que contengan esas ciudades
    const allowedStates = brazilianStates.filter(state => 
      restrictions.allowedCities.some(city => state.cities.includes(city))
    )
    return allowedStates
  }

  return brazilianStates
}

// Función para obtener ciudades permitidas según restricciones
export function getAllowedCities(stateCode: string, restrictions: GeographicRestrictions): string[] {
  const state = brazilianStates.find(s => s.code === stateCode)
  if (!state) return []

  if (!restrictions.enabled) {
    return state.cities
  }

  if (restrictions.type === 'city' && restrictions.allowedCities.length > 0) {
    return state.cities.filter(city => 
      restrictions.allowedCities.includes(city)
    )
  }

  return state.cities
}

// Tipos para las restricciones geográficas
export interface GeographicRestrictions {
  enabled: boolean
  type: 'state' | 'city' | 'none'
  allowedStates: string[] // Códigos de estados permitidos
  allowedCities: string[] // Nombres de ciudades permitidas
}

// Función para validar si una ubicación está permitida
export function isLocationAllowed(
  state: string, 
  city: string, 
  restrictions: GeographicRestrictions
): boolean {
  if (!restrictions.enabled) {
    return true
  }

  if (restrictions.type === 'state') {
    return restrictions.allowedStates.includes(state)
  }

  if (restrictions.type === 'city') {
    return restrictions.allowedCities.includes(city)
  }

  return true
}
