# 🏦 Configuración de Mercado Pago para PIX Real

## 📋 **Pasos para Configurar PIX Real**

### 1. **Registro en Mercado Pago**
1. Ve a [https://developers.mercadopago.com/](https://developers.mercadopago.com/)
2. Haz clic en **"Crear cuenta"** o **"Registrarse"**
3. Completa el formulario con tus datos
4. Verifica tu email

### 2. **Crear una Aplicación**
1. Una vez logueado, ve a **"Tus integraciones"**
2. Haz clic en **"Crear tu primera aplicación"**
3. Completa los datos:
   - **Nombre**: "MarketTech PIX"
   - **Descripción**: "Sistema de pagos PIX para tienda online"
   - **Categoría**: "E-commerce"
   - **Plataforma**: "Web"

### 3. **Obtener las Credenciales**
Después de crear la aplicación, obtendrás:
- **Access Token** (Token de acceso)
- **Public Key** (Clave pública)

### 4. **Configurar Variables de Entorno**

Agrega estas líneas a tu archivo `.env.local`:

```bash
# Mercado Pago Configuration
# Obtén estas credenciales en: https://developers.mercadopago.com/
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_AQUI
MERCADOPAGO_PUBLIC_KEY=TU_PUBLIC_KEY_AQUI
```

### 5. **Credenciales de Prueba (Desarrollo)**

Para desarrollo, puedes usar las credenciales de prueba:

```bash
# Credenciales de prueba (reemplaza con las tuyas)
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-abcdef-1234567890abcdef-1234567890
MERCADOPAGO_PUBLIC_KEY=TEST-12345678-1234-1234-1234-123456789012
```

### 6. **Credenciales de Producción**

Para producción, usa las credenciales reales:

```bash
# Credenciales de producción
MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890-abcdef-1234567890abcdef-1234567890
MERCADOPAGO_PUBLIC_KEY=APP_USR-12345678-1234-1234-1234-123456789012
```

## 🔧 **Configuración del Sistema**

### 1. **Verificar Configuración Actual**
El sistema ya está configurado para usar Mercado Pago. Solo necesitas:

1. **Agregar las credenciales** al archivo `.env.local`
2. **Reiniciar el servidor** para que tome las nuevas variables
3. **Probar el pago** con las credenciales de prueba

### 2. **Flujo de Pago PIX**

1. **Cliente selecciona PIX** como método de pago
2. **Sistema crea pago** con Mercado Pago
3. **Mercado Pago genera QR Code** PIX
4. **Cliente escanea QR** y paga
5. **Sistema verifica pago** automáticamente
6. **Pedido se marca como pagado**

## 🧪 **Pruebas**

### 1. **Modo Prueba**
- Usa las credenciales de prueba
- Los pagos no son reales
- Perfecto para desarrollo

### 2. **Modo Producción**
- Usa las credenciales reales
- Los pagos son reales
- Solo para producción

## 📱 **Tipos de PIX Soportados**

- **PIX Copia y Cola**: Texto para copiar
- **PIX QR Code**: Código QR para escanear
- **PIX Manual**: Clave PIX para transferencia

## 🔒 **Seguridad**

- Las credenciales están en variables de entorno
- No se exponen en el código
- Mercado Pago maneja la seguridad de pagos

## 📞 **Soporte**

- **Documentación**: [https://developers.mercadopago.com/](https://developers.mercadopago.com/)
- **Soporte**: [https://www.mercadopago.com.br/developers/support](https://www.mercadopago.com.br/developers/support)
- **Comunidad**: [https://github.com/mercadopago](https://github.com/mercadopago)

## 🚀 **Próximos Pasos**

1. **Registrarse** en Mercado Pago
2. **Crear aplicación** y obtener credenciales
3. **Agregar credenciales** al `.env.local`
4. **Reiniciar servidor**
5. **Probar pagos** PIX reales

¡Listo! Con estas credenciales podrás procesar pagos PIX reales. 🎉