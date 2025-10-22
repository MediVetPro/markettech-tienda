# 🚀 Guía de Despliegue en Producción

## ✅ **Compatibilidad con URLs Dinámicas**

El sistema ha sido actualizado para funcionar correctamente en cualquier entorno (desarrollo, staging, producción) sin necesidad de modificar código.

### 🔧 **Cambios Realizados**

#### **1. Navegación Corregida**
- ✅ **Reemplazado `window.location.href`** por `router.push()` en todos los archivos
- ✅ **Rutas relativas** en lugar de URLs absolutas
- ✅ **Navegación consistente** entre desarrollo y producción

#### **2. URLs Dinámicas**
- ✅ **Utilidades de URL** creadas en `/lib/urls.ts`
- ✅ **Detección automática** del entorno (cliente/servidor)
- ✅ **Variables de entorno** para configuración

#### **3. Archivos Corregidos**
- ✅ `app/admin/page.tsx` - Navegación de admin
- ✅ `app/admin/products/page.tsx` - Gestión de productos
- ✅ `app/admin/products/new/page.tsx` - Creación de productos
- ✅ `app/admin/accounting/page.tsx` - Panel de contabilidad
- ✅ `app/api/social/route.ts` - Enlaces de compartir
- ✅ `app/api/social/publish/route.ts` - Publicación social

---

## 🌐 **Configuración para Producción**

### **Variables de Entorno Requeridas**

```bash
# URL Base de la Aplicación
NEXT_PUBLIC_BASE_URL="https://tu-dominio.com"

# Base de Datos (PostgreSQL recomendado para producción)
DATABASE_URL="postgresql://usuario:password@host:puerto/database"

# Configuración JWT
JWT_SECRET="secreto-super-seguro-para-produccion"

# NextAuth
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="secreto-nextauth-para-produccion"
```

### **Configuración de Dominios**

El archivo `next.config.js` ya está configurado para:
- ✅ **Imágenes remotas** permitidas
- ✅ **Dominios dinámicos** soportados
- ✅ **WebSocket HMR** para desarrollo

---

## 🚀 **Pasos para Despliegue**

### **1. Preparar el Proyecto**

```bash
# Instalar dependencias
npm install

# Construir para producción
npm run build

# Verificar que no hay errores
npm run lint
```

### **2. Configurar Variables de Entorno**

```bash
# En tu plataforma de despliegue (Vercel, Netlify, etc.)
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
DATABASE_URL=postgresql://...
JWT_SECRET=tu-secreto-super-seguro
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=tu-secreto-nextauth
```

### **3. Desplegar**

```bash
# Para Vercel
vercel --prod

# Para Netlify
netlify deploy --prod

# Para servidor propio
npm start
```

---

## 🔍 **Verificación Post-Despliegue**

### **1. URLs que Deben Funcionar**
- ✅ `https://tu-dominio.com/` - Página principal
- ✅ `https://tu-dominio.com/products` - Catálogo de productos
- ✅ `https://tu-dominio.com/admin` - Panel de administración
- ✅ `https://tu-dominio.com/admin/mercado-pago` - Configuración MercadoPago
- ✅ `https://tu-dominio.com/checkout` - Proceso de compra

### **2. Navegación que Debe Funcionar**
- ✅ **Botones de navegación** en el admin
- ✅ **Enlaces de productos** a detalles
- ✅ **Redirecciones** después de login/logout
- ✅ **Navegación entre páginas** del admin

### **3. Funcionalidades Críticas**
- ✅ **Autenticación** y autorización
- ✅ **Gestión de productos** (crear, editar, eliminar)
- ✅ **Proceso de compra** completo
- ✅ **Configuración de pagos** PIX/MercadoPago

---

## 🛠️ **Solución de Problemas**

### **Problema: Navegación no funciona**
**Solución**: Verificar que todas las rutas usen `router.push()` en lugar de `window.location.href`

### **Problema: URLs incorrectas en producción**
**Solución**: Configurar `NEXT_PUBLIC_BASE_URL` correctamente

### **Problema: Imágenes no se cargan**
**Solución**: Verificar configuración de `next.config.js` y permisos de archivos

### **Problema: Autenticación falla**
**Solución**: Verificar `JWT_SECRET` y `NEXTAUTH_SECRET` en producción

---

## 📋 **Checklist de Despliegue**

- [ ] Variables de entorno configuradas
- [ ] Base de datos configurada y migrada
- [ ] Dominio configurado correctamente
- [ ] SSL/HTTPS habilitado
- [ ] Imágenes y archivos estáticos funcionando
- [ ] Autenticación funcionando
- [ ] Panel de administración accesible
- [ ] Proceso de compra funcionando
- [ ] Configuración de pagos funcionando

---

## 🎯 **Resultado Final**

✅ **El sistema funcionará correctamente en cualquier URL de producción**
✅ **Todas las navegaciones serán dinámicas y compatibles**
✅ **No se requieren cambios de código para diferentes entornos**
✅ **URLs se generan automáticamente según el dominio**

**¡Tu tienda está lista para producción! 🚀**
