import { Users, Award, Shield, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sobre <span className="text-primary-600">MarketTech</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tu tienda de tecnología de confianza, donde la calidad y el servicio al cliente 
            son nuestra prioridad.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Misión</h2>
              <p className="text-lg text-gray-600 mb-6">
                En MarketTech, nos dedicamos a ofrecer la mejor tecnología con garantía, 
                precios competitivos y un servicio excepcional. Creemos que todos merecen 
                acceso a productos tecnológicos de calidad.
              </p>
              <p className="text-lg text-gray-600">
                Nuestro compromiso es brindarte una experiencia de compra única, con 
                productos cuidadosamente seleccionados y un equipo de expertos dispuesto 
                a ayudarte en cada paso.
              </p>
            </div>
            <div className="bg-primary-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">+1000</h3>
                  <p className="text-gray-600 text-sm">Clientes Satisfechos</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">5+</h3>
                  <p className="text-gray-600 text-sm">Años de Experiencia</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">100%</h3>
                  <p className="text-gray-600 text-sm">Garantía</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">24/7</h3>
                  <p className="text-gray-600 text-sm">Soporte</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Valores</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Los principios que guían cada decisión que tomamos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Calidad Garantizada</h3>
              <p className="text-gray-600">
                Todos nuestros productos pasan por un riguroso proceso de verificación 
                para asegurar que cumplan con los más altos estándares de calidad.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Servicio al Cliente</h3>
              <p className="text-gray-600">
                Nuestro equipo está disponible para ayudarte en cada paso del proceso, 
                desde la selección hasta el soporte post-venta.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Precios Justos</h3>
              <p className="text-gray-600">
                Ofrecemos precios competitivos sin comprometer la calidad, 
                asegurando que obtengas el mejor valor por tu inversión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Expertos en tecnología apasionados por brindarte la mejor experiencia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">María González</h3>
              <p className="text-primary-600 mb-2">CEO & Fundadora</p>
              <p className="text-gray-600">
                Más de 10 años de experiencia en tecnología y retail
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Carlos Rodríguez</h3>
              <p className="text-primary-600 mb-2">Director Técnico</p>
              <p className="text-gray-600">
                Especialista en productos Apple y dispositivos móviles
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ana Martínez</h3>
              <p className="text-primary-600 mb-2">Gerente de Ventas</p>
              <p className="text-gray-600">
                Experta en atención al cliente y soluciones tecnológicas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para encontrar tu próxima tecnología?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Explora nuestra selección de productos y descubre por qué somos la tienda 
            de tecnología de confianza.
          </p>
          <a
            href="/products"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Ver Productos
          </a>
        </div>
      </section>
    </div>
  )
}
