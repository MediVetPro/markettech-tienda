# 🌱 Scripts de Seeding - Smartesh

Este directorio contiene scripts para poblar la base de datos con datos de prueba realistas.

## 📋 Scripts Disponibles

### 🚀 Seeding Completo
```bash
npm run seed:all
```
**Descripción:** Script completo que crea usuarios, configuración del sitio y 20 productos reales con stock aleatorio.

**Incluye:**
- 👥 3 usuarios (1 admin, 2 clientes)
- ⚙️ Configuración del sitio
- 📱 20 productos reales con stock aleatorio
- 🗑️ Limpia datos existentes antes de crear nuevos

### 📱 Solo Productos Reales
```bash
npm run seed:real-products
```
**Descripción:** Crea solo 20 productos reales con stock aleatorio.

### 👥 Solo Usuarios
```bash
npm run seed:users
```
**Descripción:** Crea usuarios de prueba.

### ⚙️ Solo Configuración
```bash
npm run seed:config
```
**Descripción:** Crea la configuración del sitio.

## 🛠️ Configuración de la Base de Datos

### 1. Regenerar el esquema
```bash
npm run db:generate
```

### 2. Aplicar cambios a la base de datos
```bash
npm run db:push
```

### 3. Ejecutar seeding completo
```bash
npm run seed:all
```

## 📊 Productos Incluidos

El script `seed:all` incluye 20 productos reales de tecnología:

### 🍎 Apple
- iPhone 15 Pro Max 256GB
- MacBook Air M2 13"
- iPad Pro 11" M2
- AirPods Pro 2da Gen
- Apple Watch Series 9
- MacBook Pro 14" M3 Pro
- iPad Air 5ta Gen
- iPad mini 6ta Gen
- Mac Studio M2 Max
- MacBook Pro 16" M3 Max

### 📱 Samsung
- Galaxy S24 Ultra 256GB
- Galaxy Tab S9 128GB
- Galaxy Watch 6 Classic

### 💻 Laptops
- Dell XPS 13 Plus
- Dell XPS 15 9520
- Microsoft Surface Laptop 5

### 🎧 Auriculares
- Sony WH-1000XM5
- Bose QuietComfort 45
- Sony WF-1000XM4

## 🎯 Características del Stock

- **Stock aleatorio:** Cada producto tiene entre 1-20 unidades
- **Productos premium:** Stock más bajo (1-5 unidades)
- **Productos populares:** Stock más alto (1-20 unidades)
- **Variedad realista:** Diferentes cantidades según el tipo de producto

## 🔐 Usuarios de Prueba

### 👨‍💼 Administrador
- **Email:** admin@markettech.com
- **Contraseña:** password123
- **Rol:** ADMIN

### 👤 Clientes
- **Email:** joao@email.com
- **Contraseña:** password123
- **Rol:** CLIENT

- **Email:** maria@email.com
- **Contraseña:** password123
- **Rol:** CLIENT

## 🚨 Importante

- ⚠️ **Los scripts limpian datos existentes** antes de crear nuevos
- 🔄 **Ejecuta `npm run db:generate`** después de cambios en el esquema
- 💾 **Haz backup** de datos importantes antes de ejecutar
- 🧪 **Solo para desarrollo** - No usar en producción

## 🐛 Solución de Problemas

### Error: "Cannot find module '@prisma/client'"
```bash
npm install
npm run db:generate
```

### Error: "Database connection failed"
```bash
npm run db:push
```

### Error: "bcrypt not found"
```bash
npm install bcryptjs
```

## 📈 Próximos Pasos

1. **Ejecutar seeding completo:**
   ```bash
   npm run seed:all
   ```

2. **Verificar en el panel de admin:**
   - Ir a `/admin/products`
   - Verificar que aparecen 20 productos
   - Comprobar que tienen stock aleatorio

3. **Probar funcionalidad:**
   - Agregar productos al carrito
   - Verificar validación de stock
   - Probar el flujo de compra completo

¡Listo para probar con datos reales! 🎉
