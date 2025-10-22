# 🌱 Scripts de Seed - 20 Productos Reales

## 📋 **Productos Incluidos**

He creado 20 productos reales de tecnología con todos los elementos necesarios:

### **📱 Smartphones (6 productos):**
1. **iPhone 15 Pro Max 256GB** - $1,299.99
2. **Samsung Galaxy S24 Ultra 512GB** - $1,199.99
3. **Google Pixel 8 Pro 256GB** - $999.99
4. **Samsung Galaxy Z Fold5 512GB** - $1,799.99
5. **iPhone 15 Pro Max 256GB** (variante)
6. **Samsung Galaxy S24 Ultra 512GB** (variante)

### **💻 Laptops (5 productos):**
7. **MacBook Pro 16" M3 Max 1TB** - $3,499.99
8. **Dell XPS 13 Plus 512GB** - $1,299.99
9. **MacBook Air M2 13" 256GB** - $1,199.99
10. **Microsoft Surface Laptop 5 13.5"** - $1,299.99
11. **MacBook Pro 14" M3 512GB** - $1,999.99

### **📱 Tablets (4 productos):**
12. **iPad Pro 12.9" M2 256GB** - $1,099.99
13. **Samsung Galaxy Tab S9 Ultra 14.6"** - $899.99
14. **iPad Air 5ta Generación 256GB** - $599.99
15. **iPad mini 6ta Generación 256GB** - $649.99

### **🎧 Audio (3 productos):**
16. **AirPods Pro 2da Generación** - $249.99
17. **Sony WH-1000XM5 Auriculares** - $399.99
18. **Samsung Galaxy Buds2 Pro** - $229.99
19. **Sony WF-1000XM4 Auriculares** - $279.99

### **🎮 Gaming (2 productos):**
20. **Sony PlayStation 5 Digital** - $399.99
21. **Nintendo Switch OLED 64GB** - $349.99

### **⌚ Smartwatch (1 producto):**
22. **Apple Watch Series 9 GPS 45mm** - $429.99

## 🚀 **Cómo Ejecutar el Seed**

### **Opción 1: Script Simple (Recomendado)**
```bash
node scripts/seed-products-simple.js
```

### **Opción 2: Script Completo**
```bash
node scripts/seed-real-products-20.js
```

## 📊 **Características de los Productos**

### **✅ Elementos Incluidos:**
- **Título** - Nombre del producto
- **Descripción** - Descripción detallada
- **Precio** - Precio en USD
- **Condición** - NEW/USED
- **Condición Estética** - 1-10
- **Especificaciones** - Características técnicas
- **Categorías** - Tags separados por comas
- **Stock** - Cantidad disponible
- **Estado** - ACTIVE/INACTIVE
- **Imágenes** - Rutas de imágenes organizadas

### **📁 Estructura de Imágenes:**
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

## 🎯 **Categorías Incluidas**

- **smartphones** - Teléfonos inteligentes
- **laptops** - Laptops y notebooks
- **tablets** - Tablets y iPads
- **audio** - Auriculares y audio
- **gaming** - Consolas y gaming
- **smartwatch** - Relojes inteligentes
- **apple** - Productos de Apple
- **samsung** - Productos de Samsung
- **sony** - Productos de Sony
- **premium** - Productos premium
- **profesional** - Productos profesionales

## 🔧 **Scripts Disponibles**

1. **`seed-products-simple.js`** - Script simple que solo crea los productos
2. **`seed-real-products-20.js`** - Script completo que crea directorios e imágenes

## 📝 **Notas Importantes**

- Los scripts **limpiarán** los productos existentes antes de crear los nuevos
- Las imágenes se organizan en subcarpetas por producto
- Cada producto tiene entre 1-3 imágenes
- Los precios están en USD
- El stock varía entre 2-20 unidades

## 🎉 **Resultado Final**

Después de ejecutar el script tendrás:
- ✅ **20 productos reales** en la base de datos
- ✅ **Estructura de imágenes** organizada
- ✅ **Categorías** para filtrado
- ✅ **Stock** y precios realistas
- ✅ **Sistema listo** para usar

¡Ejecuta el script y tendrás una tienda completa con productos reales!
