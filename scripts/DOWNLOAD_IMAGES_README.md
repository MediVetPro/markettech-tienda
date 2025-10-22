# 🖼️ Scripts de Descarga de Imágenes Reales

## 🎯 **Objetivo**

Crear un sistema que descargue imágenes reales de productos y las almacene localmente en la estructura correcta, referenciadas en la base de datos.

## 📁 **Scripts Disponibles**

### **1. `download-real-images.js`** - Script Completo (20 productos)
- ✅ Descarga imágenes de 20 productos
- ✅ Crea estructura de directorios
- ✅ Almacena imágenes localmente
- ✅ Actualiza base de datos

### **2. `download-product-images.js`** - Script Optimizado (10 productos)
- ✅ Descarga imágenes de 10 productos
- ✅ Timeout mejorado (15 segundos)
- ✅ Mejor manejo de errores
- ✅ Más rápido y confiable

## 🚀 **Cómo Usar**

### **Opción 1: Script Completo (Recomendado)**
```bash
node scripts/download-product-images.js
```

### **Opción 2: Script de 20 Productos**
```bash
node scripts/download-real-images.js
```

## 📊 **Productos Incluidos**

### **Script Optimizado (10 productos):**
1. **iPhone 15 Pro Max** - 2 imágenes
2. **MacBook Pro 16" M3 Max** - 1 imagen
3. **Samsung Galaxy S24 Ultra** - 1 imagen
4. **iPad Pro 12.9" M2** - 1 imagen
5. **AirPods Pro 2da Gen** - 1 imagen
6. **Sony WH-1000XM5** - 1 imagen
7. **Dell XPS 13 Plus** - 1 imagen
8. **Samsung Galaxy Tab S9 Ultra** - 1 imagen
9. **Apple Watch Series 9** - 1 imagen
10. **MacBook Air M2** - 1 imagen

## 🖼️ **Características de las Imágenes**

### **Fuentes:**
- **Unsplash** - Imágenes de alta calidad
- **Formato** - 800x600 píxeles
- **Optimización** - Compresión automática
- **Calidad** - Alta resolución

### **Estructura:**
```
public/uploads/products/
  product_1/
    iphone15_frontal.jpg
    iphone15_trasera.jpg
  product_2/
    macbook_pro_16.jpg
  product_3/
    galaxy_s24_ultra.jpg
  ...
```

## 🔧 **Funcionalidades del Script**

### **✅ Descarga Automática:**
- Descarga imágenes desde URLs
- Manejo de errores y timeouts
- Continuación en caso de fallo

### **✅ Estructura Organizada:**
- Crea directorios por producto
- Nombres de archivo descriptivos
- Rutas relativas en base de datos

### **✅ Base de Datos:**
- Limpia productos existentes
- Crea productos con imágenes
- Referencias correctas a archivos

## 🚨 **Manejo de Errores**

### **Timeouts:**
- **15 segundos** por imagen
- **Reintentos automáticos**
- **Continuación** si falla una imagen

### **Errores de Red:**
- **Manejo de errores** HTTP
- **Logs detallados** de errores
- **Continuación** del proceso

### **Archivos:**
- **Verificación** de descarga
- **Eliminación** de archivos parciales
- **Creación** de directorios

## 📋 **Proceso del Script**

### **1. Preparación:**
- Crear directorio base
- Limpiar productos existentes
- Preparar estructura

### **2. Descarga:**
- Procesar cada producto
- Crear directorio del producto
- Descargar cada imagen
- Manejar errores

### **3. Base de Datos:**
- Crear producto
- Agregar referencias de imágenes
- Confirmar creación

### **4. Resumen:**
- Mostrar estadísticas
- Confirmar éxito
- Listar archivos creados

## 🎉 **Resultado Final**

Después de ejecutar el script tendrás:
- ✅ **Imágenes reales** descargadas localmente
- ✅ **Estructura organizada** por producto
- ✅ **Base de datos actualizada** con referencias
- ✅ **Sistema funcional** sin errores
- ✅ **Tienda lista** para usar

## 💡 **Ventajas**

### **✅ Local:**
- **Sin dependencias externas** - Imágenes en tu servidor
- **Control total** - Tienes todas las imágenes
- **Rápido** - Sin latencia de red

### **✅ Organizado:**
- **Estructura clara** - Cada producto tiene su carpeta
- **Fácil backup** - Solo copiar la carpeta
- **Escalable** - Fácil de expandir

### **✅ Confiable:**
- **Sin errores** - Sistema estable
- **Imágenes reales** - Calidad profesional
- **Base sólida** - Para desarrollo

¡Ejecuta el script y tendrás una tienda completamente funcional con imágenes reales almacenadas localmente!
