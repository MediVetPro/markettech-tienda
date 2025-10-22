# 🚀 Guía de Deploy - MarketTech

## Configuración Vercel + Neon (PostgreSQL Gratuito)

### 1. Configurar Neon (PostgreSQL Gratuito)

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea una nueva base de datos:
   - Nombre: `markettech-prod`
   - Región: `AWS South America East 1 (São Paulo)` (optimizado para Brasil)
3. Obtén la connection string desde "Dashboard" → "Connection Details"

### 2. Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno (ver sección Variables de Entorno)

### 3. Migrar datos localmente

```bash
# 1. Configurar variables de entorno locales
cp .env.example .env.local
# Edita .env.local con tus credenciales

# 2. Generar cliente Prisma para MySQL
npx prisma generate

# 3. Ejecutar migración de base de datos
npx prisma db push

# 4. Migrar datos de SQLite a PostgreSQL
npm run migrate:postgres

# 5. Verificar migración
npm run db:studio
```

### 4. Deploy en Vercel

```bash
# 1. Hacer commit de todos los cambios
git add .
git commit -m "feat: configure for Vercel + PlanetScale deployment"
git push origin main

# 2. El deploy se ejecutará automáticamente en Vercel
```

### 5. Variables de Entorno en Vercel

Configura estas variables en el dashboard de Vercel:

```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=tu-jwt-secret-super-seguro
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_PUBLIC_KEY=tu-public-key
STRIPE_SECRET_KEY=sk_live_tu-stripe-secret
STRIPE_PUBLIC_KEY=pk_live_tu-stripe-public
PAYPAL_CLIENT_ID=tu-paypal-client-id
PAYPAL_CLIENT_SECRET=tu-paypal-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
VAPID_PUBLIC_KEY=tu-vapid-public-key
VAPID_PRIVATE_KEY=tu-vapid-private-key
VAPID_EMAIL=tu-email@example.com
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-nextauth-secret
```

### 6. Verificar Deploy

1. Ve a tu dashboard de Vercel
2. Verifica que el build sea exitoso
3. Prueba tu aplicación en la URL generada
4. Verifica que la base de datos esté funcionando

### 7. Configurar Dominio Personalizado (Opcional)

1. En Vercel, ve a "Settings" → "Domains"
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

## 🎉 ¡Listo!

Tu tienda MarketTech estará funcionando en:
- **Vercel**: Hosting gratuito con CDN global
- **Neon**: Base de datos PostgreSQL gratuita (3GB)
- **Deploy automático**: Cada push a main actualiza la app

## 📊 Monitoreo

- **Vercel Analytics**: Métricas de performance
- **Neon Dashboard**: Monitoreo de base de datos
- **Logs**: Disponibles en Vercel Dashboard

## 🔧 Mantenimiento

- **Backups**: Automáticos en Neon
- **Updates**: Deploy automático desde GitHub
- **Escalado**: Automático según tráfico
