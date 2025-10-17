import { Mail, Phone, MessageCircle, MapPin, Clock } from 'lucide-react'

export function ContactInfo() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Necesitas Ayuda?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos por cualquier medio que prefieras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Email */}
          <div className="bg-primary-50 rounded-xl p-6 text-center hover:bg-primary-100 transition-colors">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 mb-4">Respuesta en 24h</p>
            <a 
              href="mailto:info@markettech.com" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              info@markettech.com
            </a>
          </div>

          {/* Teléfono */}
          <div className="bg-green-50 rounded-xl p-6 text-center hover:bg-green-100 transition-colors">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Teléfono</h3>
            <p className="text-gray-600 mb-4">Lun-Vie 9:00-18:00</p>
            <a 
              href="tel:+15551234567" 
              className="text-green-600 hover:text-green-700 font-medium"
            >
              +1 (555) 123-4567
            </a>
          </div>

          {/* WhatsApp */}
          <div className="bg-green-50 rounded-xl p-6 text-center hover:bg-green-100 transition-colors">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-gray-600 mb-4">Respuesta inmediata</p>
            <a 
              href="https://wa.me/15551234567" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Chatear Ahora
            </a>
          </div>

          {/* Ubicación */}
          <div className="bg-purple-50 rounded-xl p-6 text-center hover:bg-purple-100 transition-colors">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
            <p className="text-gray-600 mb-4">Visítanos</p>
            <span className="text-purple-600 font-medium">
              Ciudad, País
            </span>
          </div>
        </div>

        {/* Horarios */}
        <div className="mt-12 bg-gray-50 rounded-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Clock className="w-6 h-6 text-primary-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Horarios de Atención</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Lunes - Viernes</h4>
              <p className="text-gray-600">9:00 AM - 6:00 PM</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sábados</h4>
              <p className="text-gray-600">10:00 AM - 4:00 PM</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Domingos</h4>
              <p className="text-gray-600">Cerrado</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
