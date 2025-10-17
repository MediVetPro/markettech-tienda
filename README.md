# MarketTech - Tienda de Tecnología

Una tienda de tecnología moderna y funcional construida con Next.js, TypeScript y Tailwind CSS.

## 🚀 Características

### Para Administradores
- ✅ Panel de administración completo
- ✅ Gestión de productos con múltiples fotos (hasta 5)
- ✅ Campos completos: título, descripción, precio, condición, especificaciones
- ✅ Estado del producto (nuevo/usado) y condición estética (1-10)
- ✅ Sistema de autenticación para administradores

### Para Clientes
- ✅ Catálogo de productos con filtros y búsqueda
- ✅ Páginas de detalles de productos
- ✅ Sistema de carrito de compras
- ✅ Registro y login de usuarios
- ✅ Botones de contacto (email, teléfono, WhatsApp)
- ✅ Diseño responsive para móviles y desktop

### Diseño y UX
- ✅ Diseño moderno y elegante
- ✅ Completamente responsive
- ✅ Navegación intuitiva
- ✅ Componentes reutilizables
- ✅ Animaciones suaves

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Prisma con SQLite
- **Autenticación**: JWT
- **Iconos**: Lucide React
- **Deployment**: GitHub Pages / Vercel

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd MarketTech
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Configurar la base de datos**
```bash
npx prisma generate
npx prisma db push
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 🗄️ Estructura de la Base de Datos

### Usuarios
- Información personal (nombre, email, teléfono)
- Roles (ADMIN, CLIENT)
- Autenticación segura

### Productos
- Información básica (título, descripción, precio)
- Condición (nuevo/usado) y condición estética (1-10)
- Especificaciones técnicas
- Múltiples imágenes (hasta 5)
- Estado del producto

### Pedidos
- Sistema de carrito y pedidos
- Seguimiento de estado
- Información del cliente

## 🎨 Páginas Incluidas

### Públicas
- **Inicio** (`/`) - Hero, categorías, productos destacados
- **Productos** (`/products`) - Catálogo con filtros
- **Detalle Producto** (`/products/[id]`) - Información completa
- **Nosotros** (`/about`) - Información de la empresa
- **Contacto** (`/contact`) - Formulario y información de contacto
- **Login** (`/login`) - Inicio de sesión
- **Registro** (`/register`) - Crear cuenta

### Administración
- **Panel Admin** (`/admin`) - Dashboard principal
- **Nuevo Producto** (`/admin/products/new`) - Formulario de creación
- **Gestión de Pedidos** (`/admin/orders`) - Ver pedidos
- **Gestión de Usuarios** (`/admin/users`) - Administrar usuarios

### Cliente
- **Carrito** (`/cart`) - Gestión de compras

## 🚀 Deployment

### GitHub Pages
```bash
npm run build
# Los archivos se generan en la carpeta 'dist'
```

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

## 📱 Responsive Design

- **Mobile First**: Optimizado para dispositivos móviles
- **Tablet**: Adaptación para tablets
- **Desktop**: Experiencia completa en escritorio
- **Navegación**: Menú hamburguesa en móviles

## 🔧 Funcionalidades Técnicas

### Autenticación
- JWT tokens seguros
- Hash de contraseñas con bcrypt
- Roles de usuario (admin/cliente)

### Gestión de Imágenes
- Subida múltiple de imágenes
- Preview en tiempo real
- Validación de tipos y tamaños

### Base de Datos
- Esquema completo con Prisma
- Relaciones entre entidades
- Migraciones automáticas

## 📞 Contacto y Soporte

- **Email**: info@markettech.com
- **Teléfono**: +1 (555) 123-4567
- **WhatsApp**: +1 (555) 123-4567

## 🎯 Próximas Mejoras

- [ ] Sistema de pagos integrado
- [ ] Notificaciones por email
- [ ] Sistema de reseñas
- [ ] Wishlist de productos
- [ ] Chat en tiempo real
- [ ] API REST completa
- [ ] Dashboard de analytics

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**MarketTech** - Tu tienda de tecnología de confianza 🚀
