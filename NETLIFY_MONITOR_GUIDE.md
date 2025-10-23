# 🚀 Monitor de Netlify - Guía de Uso

Este sistema te permite monitorear automáticamente el estado de tus builds en Netlify y detectar errores en tiempo real.

## 📋 Scripts Disponibles

### 1. **Configuración Inicial**
```bash
npm run netlify:setup
```
- Te guía paso a paso para configurar el monitor
- Obtiene tu token de acceso de Netlify
- Selecciona tu sitio automáticamente
- Genera archivo de configuración

### 2. **Verificación Rápida**
```bash
npm run netlify:status
```
- Verifica el estado del último build
- Analiza errores si el build falló
- Proporciona sugerencias de corrección

### 3. **Monitoreo Continuo**
```bash
npm run monitor
```
- Monitorea builds en tiempo real
- Detecta nuevos deploys automáticamente
- Analiza logs y sugiere correcciones

### 4. **Análisis de Código**
```bash
npm run analyze
```
- Analiza el código localmente antes del build
- Detecta problemas potenciales
- Se ejecuta automáticamente antes de cada build

## 🔧 Configuración Manual

Si prefieres configurar manualmente:

### 1. Obtener Token de Acceso
1. Ve a [https://app.netlify.com/user/applications](https://app.netlify.com/user/applications)
2. Crea un nuevo "Personal Access Token"
3. Copia el token generado

### 2. Configurar Variables de Entorno
```bash
export NETLIFY_ACCESS_TOKEN="tu_token_aqui"
export NETLIFY_SITE_ID="tu_site_id"  # Opcional, por defecto usa 'smartesh'
```

### 3. Obtener Site ID (Opcional)
Si no conoces tu Site ID:
1. Ve a tu sitio en Netlify
2. En la URL verás: `https://app.netlify.com/sites/TU_SITE_ID/`
3. Copia el `TU_SITE_ID`

## 🚀 Uso Rápido

### Primera vez:
```bash
# 1. Configurar el monitor
npm run netlify:setup

# 2. Cargar configuración
source .env.netlify

# 3. Verificar estado
npm run netlify:status
```

### Monitoreo continuo:
```bash
# Cargar configuración
source .env.netlify

# Iniciar monitoreo
npm run monitor
```

## 📊 Funcionalidades del Monitor

### ✅ **Detección Automática**
- Nuevos deploys
- Cambios de estado
- Errores de build
- Warnings

### 🔍 **Análisis de Errores**
- Errores de TypeScript
- Problemas de build
- Referencias a modelos eliminados
- Conflictos de merge

### 💡 **Sugerencias Inteligentes**
- Correcciones específicas para cada error
- Patrones de errores comunes
- Soluciones automáticas

### 📈 **Estadísticas**
- Tiempo de build
- Estado del deploy
- Historial de errores
- Métricas de rendimiento

## 🛠️ Solución de Problemas

### Error: "NETLIFY_ACCESS_TOKEN no configurado"
```bash
# Configurar token
export NETLIFY_ACCESS_TOKEN="tu_token"

# O usar el setup automático
npm run netlify:setup
```

### Error: "No se encontraron sitios"
- Verifica que tu token tenga permisos de lectura
- Asegúrate de que el token no haya expirado

### Error: "No se pudo obtener deploys"
- Verifica que el Site ID sea correcto
- Asegúrate de que el sitio tenga al menos un deploy

## 📝 Ejemplos de Uso

### Verificar estado actual:
```bash
npm run netlify:status
```

### Monitorear durante desarrollo:
```bash
# Terminal 1: Desarrollo
npm run dev

# Terminal 2: Monitor
npm run monitor
```

### Análisis antes de commit:
```bash
npm run analyze
```

## 🔄 Flujo de Trabajo Recomendado

1. **Antes de hacer push:**
   ```bash
   npm run analyze
   ```

2. **Después de hacer push:**
   ```bash
   npm run netlify:status
   ```

3. **Durante desarrollo activo:**
   ```bash
   npm run monitor
   ```

## 📞 Soporte

Si encuentras problemas:
1. Verifica que el token sea válido
2. Asegúrate de que el Site ID sea correcto
3. Revisa los logs del monitor
4. Usa `npm run netlify:setup` para reconfigurar

---

**¡El monitor está listo para usar! 🎉**
