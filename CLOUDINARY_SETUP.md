# Configuración de Cloudinary para Subida de Imágenes

## ¿Por qué Cloudinary?

En Netlify y otros servicios de hosting, no puedes escribir archivos en el sistema de archivos del servidor. Por eso necesitamos usar un servicio de almacenamiento en la nube como Cloudinary.

## Configuración

### 1. Crear cuenta en Cloudinary

1. Ve a [https://cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita
3. En el dashboard, encontrarás tus credenciales:
   - Cloud Name
   - API Key
   - API Secret

### 2. Configurar variables de entorno

#### Para desarrollo local:
Crea un archivo `.env.local` con:
```env
CLOUDINARY_CLOUD_NAME='tu-cloud-name'
CLOUDINARY_API_KEY='tu-api-key'
CLOUDINARY_API_SECRET='tu-api-secret'
```

#### Para Netlify:
1. Ve a tu proyecto en Netlify
2. Ve a Site settings > Environment variables
3. Agrega las siguientes variables:
   - `CLOUDINARY_CLOUD_NAME`: tu cloud name
   - `CLOUDINARY_API_KEY`: tu API key
   - `CLOUDINARY_API_SECRET`: tu API secret

### 3. Características de Cloudinary

- ✅ **Gratuito**: 25GB de almacenamiento y 25GB de ancho de banda
- ✅ **Optimización automática**: Comprime y optimiza las imágenes
- ✅ **Transformaciones**: Redimensiona automáticamente
- ✅ **CDN global**: Entrega rápida de imágenes
- ✅ **Formatos modernos**: Convierte a WebP/AVIF automáticamente

### 4. Estructura de carpetas

Las imágenes se organizarán así:
```
products/
├── producto-1-imagen-1.jpg
├── producto-1-imagen-2.jpg
├── producto-2-imagen-1.jpg
└── ...
```

### 5. URLs de ejemplo

Las imágenes se servirán desde URLs como:
```
https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/products/imagen.jpg
```

## Ventajas sobre el sistema de archivos local

1. **Escalabilidad**: No hay límites de espacio en el servidor
2. **Rendimiento**: CDN global para entrega rápida
3. **Optimización**: Compresión y formatos modernos automáticos
4. **Compatibilidad**: Funciona en cualquier hosting (Netlify, Vercel, etc.)
5. **Backup**: Las imágenes están seguras en la nube

## Migración

Si ya tienes imágenes en el sistema local, puedes:
1. Subirlas manualmente a Cloudinary
2. Actualizar las URLs en la base de datos
3. O crear un script de migración automática
