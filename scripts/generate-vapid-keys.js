const webpush = require('web-push')

console.log('🔑 Generando claves VAPID para notificaciones push...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ Claves VAPID generadas exitosamente!\n')
console.log('📋 Agrega estas claves a tu archivo .env.local:\n')
console.log('VAPID_SUBJECT="mailto:admin@markettech.com"')
console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
console.log('\n🔒 Mantén la clave privada segura y no la compartas!')
console.log('📱 La clave pública se usará en el frontend para suscribirse a notificaciones.')
