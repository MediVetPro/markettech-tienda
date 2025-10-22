# 🔍 Sistema de Logging Detallado para Diagnóstico

## 🎯 **Objetivo**

Habilitar logs detallados en todo el sistema para diagnosticar errores al guardar anuncios con imágenes.

## 📊 **Logs Implementados**

### **1. Frontend (app/admin/products/new/page.tsx)**
- ✅ **Inicio de envío** - `🚀 [FRONTEND] Iniciando envío de formulario...`
- ✅ **Datos del formulario** - Muestra todos los campos
- ✅ **Archivos de imagen** - Detalles de cada imagen
- ✅ **Envío a API** - Confirmación de envío
- ✅ **Respuesta del servidor** - Status y detalles
- ✅ **Errores** - Stack trace completo

### **2. API Backend (app/api/products/route.ts)**
- ✅ **Inicio de proceso** - `🚀 [API] Iniciando creación de producto...`
- ✅ **FormData** - Confirmación de recepción
- ✅ **Datos extraídos** - Resumen de campos
- ✅ **Imágenes encontradas** - Cantidad y detalles
- ✅ **Creación de producto** - ID generado
- ✅ **Subida de imágenes** - Proceso detallado
- ✅ **Base de datos** - Registros creados
- ✅ **Errores** - Detalles completos

### **3. File Storage (lib/fileStorage.ts)**
- ✅ **Subida de archivos** - `📁 [FILE] Iniciando subida...`
- ✅ **Validación** - Tipo y tamaño
- ✅ **Directorio** - Creación y verificación
- ✅ **Conversión** - File a Buffer
- ✅ **Escritura** - Almacenamiento en disco
- ✅ **Múltiples archivos** - Proceso por archivo
- ✅ **Errores** - Stack trace detallado

## 🚀 **Cómo Usar**

### **1. Ejecutar el Servidor con Logs**
```bash
npm run dev
```

### **2. Abrir DevTools del Navegador**
- **F12** o **Ctrl+Shift+I**
- Ir a la pestaña **Console**
- Mantener abierto durante la prueba

### **3. Probar Creación de Producto**
1. Ir a `/admin/products/new`
2. Llenar el formulario
3. Subir imágenes
4. Hacer clic en "Crear Producto"
5. **Observar logs en consola**

### **4. Verificar Logs del Servidor**
```bash
# En la terminal donde corre npm run dev
# Los logs aparecerán automáticamente
```

## 📋 **Qué Buscar en los Logs**

### **✅ Flujo Exitoso:**
```
🚀 [FRONTEND] Iniciando envío de formulario...
📝 [FRONTEND] Creando FormData...
📊 [FRONTEND] Datos del formulario: {...}
🖼️ [FRONTEND] Archivos de imagen: 2
📁 [FRONTEND] Agregando imagen 0: {...}
📁 [FRONTEND] Agregando imagen 1: {...}
📤 [FRONTEND] Enviando formulario a /api/products...
📡 [FRONTEND] Respuesta recibida: {status: 201, ok: true}
✅ [FRONTEND] Producto creado exitosamente, redirigiendo...
```

### **❌ Errores Comunes:**

#### **Error de Validación:**
```
❌ [FILE] Validación fallida: Tipo de archivo no permitido
```

#### **Error de Permisos:**
```
❌ [FILE] Error subiendo archivo: EACCES: permission denied
```

#### **Error de Base de Datos:**
```
❌ [API] Error creando producto: Prisma error
```

#### **Error de Red:**
```
❌ [FRONTEND] Error del servidor: {error: "Failed to create product"}
```

## 🔧 **Diagnóstico por Errores**

### **1. Error de Permisos**
```bash
# Verificar permisos del directorio
ls -la public/uploads/
chmod 755 public/uploads/
chmod 755 public/uploads/products/
```

### **2. Error de Validación**
- **Tipo de archivo:** Solo JPG, PNG, WEBP
- **Tamaño:** Máximo 5MB
- **Cantidad:** Máximo 5 imágenes

### **3. Error de Base de Datos**
- **Prisma:** Verificar conexión
- **Schema:** Verificar campos requeridos
- **Relaciones:** Verificar foreign keys

### **4. Error de Red**
- **CORS:** Verificar configuración
- **Timeout:** Verificar tamaño de archivos
- **Headers:** Verificar Content-Type

## 📊 **Scripts de Prueba**

### **1. Probar Estructura de Directorios**
```bash
node scripts/test-image-upload.js
```

### **2. Probar Descarga de Imágenes**
```bash
node scripts/download-product-images.js
```

### **3. Verificar Base de Datos**
```bash
npx prisma studio
```

## 🎯 **Pasos de Diagnóstico**

### **1. Verificar Logs del Frontend**
- Abrir DevTools → Console
- Crear producto con imágenes
- Buscar errores `❌ [FRONTEND]`

### **2. Verificar Logs del Backend**
- Terminal donde corre `npm run dev`
- Buscar errores `❌ [API]` o `❌ [FILE]`

### **3. Verificar Estructura de Archivos**
```bash
ls -la public/uploads/products/
```

### **4. Verificar Base de Datos**
```bash
npx prisma studio
# Buscar productos recién creados
```

## 💡 **Tips de Debugging**

### **✅ Logs Limpios:**
- Usar prefijos `[FRONTEND]`, `[API]`, `[FILE]`
- Incluir emojis para fácil identificación
- Mostrar datos relevantes sin saturar

### **✅ Información Útil:**
- Tamaño de archivos
- Tipos de archivo
- IDs de productos
- Rutas de archivos
- Stack traces completos

### **✅ Errores Comunes:**
- **Permisos:** `EACCES: permission denied`
- **Validación:** `Tipo de archivo no permitido`
- **Red:** `Failed to fetch`
- **Base de datos:** `Prisma error`

¡Con este sistema de logging detallado podrás identificar exactamente dónde está fallando el proceso de subida de imágenes! 🔍
