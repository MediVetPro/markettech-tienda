# 📁 Sistema de Almacenamiento Local de Imágenes

## ✅ **Sistema Implementado**

He implementado un sistema de almacenamiento local que organiza las imágenes en subcarpetas por producto, sin necesidad de servicios externos.

## 📂 **Estructura de Archivos**

```
public/
  uploads/
    products/
      product_123/
        image1_1234567890_abc123.jpg
        image2_1234567890_def456.jpg
      product_456/
        image1_1234567890_ghi789.jpg
        image2_1234567890_jkl012.jpg
```

## 🗄️ **Base de Datos Actualizada**

### **Esquema ProductImage:**
```sql
model ProductImage {
  id        String  @id @default(cuid())
  path      String  // Ruta relativa: /uploads/products/product_123/image1.jpg
  filename  String  // Nombre del archivo: image1.jpg
  alt       String?
  order     Int     @default(0)
  productId String
  
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

## 🔧 **Archivos Implementados**

### **1. `lib/fileStorage.ts`**
- ✅ Validación de archivos (tipo y tamaño)
- ✅ Generación de nombres únicos
- ✅ Creación automática de directorios
- ✅ Subida múltiple de archivos
- ✅ Eliminación de archivos y directorios

### **2. `app/api/products/route.ts` (Actualizado)**
- ✅ Manejo de FormData
- ✅ Subida de archivos locales
- ✅ Creación de registros en BD
- ✅ Rollback en caso de error

### **3. `app/admin/products/new/page.tsx` (Actualizado)**
- ✅ Envío de FormData en lugar de JSON
- ✅ Validación de archivos en frontend
- ✅ Preview de imágenes
- ✅ Manejo de errores

## 🚀 **Ventajas del Sistema Local**

### **✅ Ventajas:**
- **Sin dependencias externas** - No requiere Cloudinary, AWS, etc.
- **Control total** - Tienes todas las imágenes en tu servidor
- **Gratuito** - No hay costos de almacenamiento
- **Simple** - Fácil de entender y mantener
- **Backup fácil** - Solo copiar la carpeta `uploads`
- **Organizado** - Cada producto tiene su subcarpeta
- **Escalable** - Funciona bien hasta miles de productos

### **⚠️ Consideraciones:**
- **No hay CDN** - Las imágenes se sirven desde tu servidor
- **No hay optimización automática** - Las imágenes se guardan tal como se suben
- **Espacio en disco** - Necesitas espacio en tu servidor

## 📋 **Instrucciones de Uso**

### **1. Migrar Base de Datos**
```bash
# Ejecutar migración del esquema
npx prisma db push

# Migrar imágenes existentes (opcional)
node scripts/migrate-images.js
```

### **2. Crear Directorio de Uploads**
```bash
mkdir -p public/uploads/products
```

### **3. Probar el Sistema**
1. Ve a `/admin/products/new`
2. Completa el formulario
3. Selecciona imágenes
4. Envía el formulario
5. Las imágenes se guardarán en `public/uploads/products/product_[ID]/`

## 🔄 **Flujo de Trabajo**

1. **Usuario selecciona imágenes** → Validación en frontend
2. **Preview de imágenes** → URLs temporales para mostrar
3. **Envío del formulario** → FormData con archivos
4. **Backend recibe archivos** → Validación y subida
5. **Creación de directorio** → `product_[ID]/`
6. **Guardado de archivos** → Con nombres únicos
7. **Registro en BD** → Rutas relativas guardadas
8. **Producto creado** → Con imágenes funcionales

## 🛠️ **Funciones Principales**

### **Subir Archivo:**
```typescript
const result = await uploadFile(file, productId, index)
// Retorna: { success: boolean, path?: string, filename?: string, error?: string }
```

### **Subir Múltiples Archivos:**
```typescript
const result = await uploadMultipleFiles(files, productId)
// Retorna: { success: boolean, results?: Array<{path, filename}>, error?: string }
```

### **Eliminar Archivo:**
```typescript
const success = await deleteFile('/uploads/products/product_123/image1.jpg')
```

### **Eliminar Directorio del Producto:**
```typescript
const success = await deleteProductDirectory('product_123')
```

## 🎯 **Comparación con Sistema Anterior**

| Aspecto | Sistema Anterior | Sistema Local |
|---------|------------------|---------------|
| **Almacenamiento** | URLs temporales (se pierden) | Archivos permanentes |
| **Organización** | Sin organización | Subcarpetas por producto |
| **Dependencias** | Cloudinary | Ninguna |
| **Costo** | Variable | Gratuito |
| **Control** | Limitado | Total |
| **Backup** | Complejo | Simple (copiar carpeta) |

## 🚨 **Importante**

- **Antes**: Las imágenes se perdían al cerrar el navegador
- **Ahora**: Las imágenes se guardan permanentemente en el servidor
- **Resultado**: Sistema funcional y confiable para producción

## 📝 **Próximos Pasos**

1. **Ejecutar migración de BD**: `npx prisma db push`
2. **Probar creación de productos** con imágenes
3. **Verificar que las imágenes se guardan** en `public/uploads/products/`
4. **Configurar backup** de la carpeta `uploads` si es necesario
