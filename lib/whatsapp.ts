import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js'
import { prisma } from './prisma'
import QRCode from 'qrcode'

export interface WhatsAppMessage {
  phoneNumber: string
  content: string
  type?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO'
  mediaUrl?: string
  metadata?: any
}

export interface WhatsAppSession {
  phoneNumber: string
  userId?: string
  metadata?: any
}

class WhatsAppService {
  private client: Client | null = null
  private isReady = false
  private isConnecting = false

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    if (this.client) return

    console.log('📱 [WHATSAPP] Inicializando cliente de WhatsApp...')

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'markettech-whatsapp'
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    if (!this.client) return

    this.client.on('qr', async (qr) => {
      console.log('📱 [WHATSAPP] Código QR generado. Escanea con WhatsApp:')
      try {
        const qrString = await QRCode.toString(qr, { type: 'terminal', small: true })
        console.log(qrString)
      } catch (error) {
        console.log('QR Code:', qr)
      }
    })

    this.client.on('ready', async () => {
      console.log('✅ [WHATSAPP] Cliente de WhatsApp listo!')
      this.isReady = true
      this.isConnecting = false
      
      // Obtener información del cliente
      const info = this.client?.info
      if (info) {
        console.log(`📱 [WHATSAPP] Conectado como: ${info.pushname} (${info.wid.user})`)
      }
    })

    this.client.on('authenticated', () => {
      console.log('🔐 [WHATSAPP] Autenticación exitosa')
    })

    this.client.on('auth_failure', (msg) => {
      console.error('❌ [WHATSAPP] Error de autenticación:', msg)
      this.isReady = false
      this.isConnecting = false
    })

    this.client.on('disconnected', (reason) => {
      console.log('📱 [WHATSAPP] Desconectado:', reason)
      this.isReady = false
      this.isConnecting = false
    })

    this.client.on('message', async (message) => {
      await this.handleIncomingMessage(message)
    })

    this.client.on('message_ack', async (message, ack) => {
      await this.updateMessageStatus(message.id._serialized, ack.toString())
    })
  }

  async connect() {
    if (this.isReady || this.isConnecting) {
      return { success: true, message: 'Ya conectado o conectando' }
    }

    try {
      this.isConnecting = true
      console.log('📱 [WHATSAPP] Conectando...')
      
      await this.client?.initialize()
      
      return { success: true, message: 'Conectando...' }
    } catch (error) {
      console.error('❌ [WHATSAPP] Error conectando:', error)
      this.isConnecting = false
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  async disconnect() {
    if (!this.client) return { success: true }

    try {
      await this.client.destroy()
      this.isReady = false
      this.isConnecting = false
      console.log('📱 [WHATSAPP] Desconectado')
      return { success: true }
    } catch (error) {
      console.error('❌ [WHATSAPP] Error desconectando:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  async sendMessage(messageData: WhatsAppMessage) {
    if (!this.client || !this.isReady) {
      return { 
        success: false, 
        error: 'Cliente de WhatsApp no está listo' 
      }
    }

    try {
      console.log('📱 [WHATSAPP] Enviando mensaje a:', messageData.phoneNumber)

      const chatId = `${messageData.phoneNumber}@c.us`
      let message

      if (messageData.type === 'IMAGE' && messageData.mediaUrl) {
        const media = await MessageMedia.fromUrl(messageData.mediaUrl)
        message = await this.client.sendMessage(chatId, media, { caption: messageData.content })
      } else if (messageData.type === 'DOCUMENT' && messageData.mediaUrl) {
        const media = await MessageMedia.fromUrl(messageData.mediaUrl)
        message = await this.client.sendMessage(chatId, media)
      } else {
        message = await this.client.sendMessage(chatId, messageData.content)
      }

      // Guardar mensaje en la base de datos
      const savedMessage = await prisma.whatsAppMessage.create({
        data: {
          phoneNumber: messageData.phoneNumber,
          messageId: message.id._serialized,
          type: messageData.type || 'TEXT',
          content: messageData.content,
          direction: 'OUTBOUND',
          status: 'SENT',
          metadata: messageData.metadata ? JSON.stringify(messageData.metadata) : null
        }
      })

      console.log(`✅ [WHATSAPP] Mensaje enviado: ${message.id._serialized}`)

      return {
        success: true,
        messageId: message.id._serialized,
        savedMessage
      }

    } catch (error) {
      console.error('❌ [WHATSAPP] Error enviando mensaje:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  async sendBulkMessage(phoneNumbers: string[], content: string, type: string = 'TEXT') {
    const results = []
    
    for (const phoneNumber of phoneNumbers) {
      const result = await this.sendMessage({
        phoneNumber,
        content,
        type: type as any
      })
      results.push({ phoneNumber, ...result })
      
      // Pequeña pausa entre mensajes para evitar spam
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return results
  }

  async getChatHistory(phoneNumber: string, limit: number = 50) {
    try {
      const messages = await prisma.whatsAppMessage.findMany({
        where: { phoneNumber },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return {
        success: true,
        messages: messages.reverse()
      }
    } catch (error) {
      console.error('❌ [WHATSAPP] Error obteniendo historial:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  async getActiveSessions() {
    try {
      const sessions = await prisma.whatsAppSession.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { lastSeen: 'desc' }
      })

      return {
        success: true,
        sessions
      }
    } catch (error) {
      console.error('❌ [WHATSAPP] Error obteniendo sesiones:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  async createSession(sessionData: WhatsAppSession) {
    try {
      console.log('📱 [WHATSAPP] Creando sesión para:', sessionData.phoneNumber)

      const session = await prisma.whatsAppSession.upsert({
        where: { phoneNumber: sessionData.phoneNumber },
        update: {
          isActive: true,
          lastSeen: new Date(),
          metadata: sessionData.metadata ? JSON.stringify(sessionData.metadata) : null
        },
        create: {
          phoneNumber: sessionData.phoneNumber,
          userId: sessionData.userId,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metadata: sessionData.metadata ? JSON.stringify(sessionData.metadata) : null
        }
      })

      console.log(`✅ [WHATSAPP] Sesión creada: ${session.id}`)

      return {
        success: true,
        session
      }
    } catch (error) {
      console.error('❌ [WHATSAPP] Error creando sesión:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  private async handleIncomingMessage(message: any) {
    try {
      const phoneNumber = message.from.replace('@c.us', '')
      const content = message.body || ''
      const messageType = message.type || 'TEXT'

      console.log('📱 [WHATSAPP] Mensaje recibido de:', phoneNumber)

      // Guardar mensaje en la base de datos
      const savedMessage = await prisma.whatsAppMessage.create({
        data: {
          phoneNumber,
          messageId: message.id._serialized,
          type: messageType,
          content,
          direction: 'INBOUND',
          status: 'DELIVERED',
          metadata: JSON.stringify({
            from: message.from,
            to: message.to,
            timestamp: message.timestamp,
            hasMedia: message.hasMedia
          })
        }
      })

      // Actualizar sesión
      await this.createSession({
        phoneNumber,
        metadata: {
          lastMessage: content,
          lastMessageType: messageType
        }
      })

      // Procesar comando si es un mensaje de texto
      if (messageType === 'TEXT' && content.startsWith('/')) {
        await this.processCommand(phoneNumber, content, savedMessage)
      }

      console.log(`✅ [WHATSAPP] Mensaje guardado: ${savedMessage.id}`)

    } catch (error) {
      console.error('❌ [WHATSAPP] Error procesando mensaje:', error)
    }
  }

  private async processCommand(phoneNumber: string, content: string, message: any) {
    const command = content.split(' ')[0].toLowerCase()
    const args = content.split(' ').slice(1)

    console.log('📱 [WHATSAPP] Procesando comando:', command)

    switch (command) {
      case '/help':
        await this.sendMessage({
          phoneNumber,
          content: `🤖 *Comandos disponibles:*
/help - Mostrar esta ayuda
/catalog - Ver catálogo de productos
/order <producto> - Hacer un pedido
/status <pedido> - Consultar estado de pedido
/contact - Información de contacto`
        })
        break

      case '/catalog':
        await this.sendProductCatalog(phoneNumber)
        break

      case '/order':
        await this.handleOrderCommand(phoneNumber, args)
        break

      case '/status':
        await this.handleStatusCommand(phoneNumber, args)
        break

      case '/contact':
        await this.sendContactInfo(phoneNumber)
        break

      default:
        await this.sendMessage({
          phoneNumber,
          content: '❌ Comando no reconocido. Usa /help para ver los comandos disponibles.'
        })
    }
  }

  private async sendProductCatalog(phoneNumber: string) {
    try {
      const products = await prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: {
          images: {
            select: { path: true, alt: true },
            take: 1
          },
          inventory: {
            select: { available: true }
          }
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      })

      let catalogMessage = '🛍️ *Catálogo de Productos:*\n\n'

      products.forEach((product, index) => {
        const stock = product.inventory[0]?.available || 0
        catalogMessage += `${index + 1}. *${product.title}*\n`
        catalogMessage += `💰 Precio: $${product.price}\n`
        catalogMessage += `📦 Stock: ${stock > 0 ? stock : 'Agotado'}\n`
        catalogMessage += `📝 ${product.description.substring(0, 100)}...\n\n`
      })

      catalogMessage += '💬 Para hacer un pedido, usa: /order <número del producto>'

      await this.sendMessage({
        phoneNumber,
        content: catalogMessage
      })

    } catch (error) {
      console.error('❌ [WHATSAPP] Error enviando catálogo:', error)
      await this.sendMessage({
        phoneNumber,
        content: '❌ Error obteniendo el catálogo. Intenta más tarde.'
      })
    }
  }

  private async handleOrderCommand(phoneNumber: string, args: string[]) {
    if (args.length === 0) {
      await this.sendMessage({
        phoneNumber,
        content: '❌ Por favor especifica el número del producto. Ejemplo: /order 1'
      })
      return
    }

    const productNumber = parseInt(args[0])
    if (isNaN(productNumber)) {
      await this.sendMessage({
        phoneNumber,
        content: '❌ Número de producto inválido. Usa /catalog para ver los productos disponibles.'
      })
      return
    }

    // Aquí implementarías la lógica de pedido
    await this.sendMessage({
      phoneNumber,
      content: `🛒 Pedido para producto #${productNumber} recibido. Te contactaremos pronto para confirmar los detalles.`
    })
  }

  private async handleStatusCommand(phoneNumber: string, args: string[]) {
    if (args.length === 0) {
      await this.sendMessage({
        phoneNumber,
        content: '❌ Por favor especifica el ID del pedido. Ejemplo: /status ORD-123'
      })
      return
    }

    const orderId = args[0]
    
    try {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          customerEmail: phoneNumber // Asumiendo que el teléfono es el email
        },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true
        }
      })

      if (!order) {
        await this.sendMessage({
          phoneNumber,
          content: '❌ Pedido no encontrado. Verifica el ID del pedido.'
        })
        return
      }

      const statusEmoji = {
        'PENDING': '⏳',
        'CONFIRMED': '✅',
        'COMPLETED': '🎉',
        'CANCELLED': '❌'
      }

      await this.sendMessage({
        phoneNumber,
        content: `📋 *Estado del Pedido ${order.id}:*\n\n` +
                `Estado: ${statusEmoji[order.status as keyof typeof statusEmoji]} ${order.status}\n` +
                `Total: $${order.total}\n` +
                `Fecha: ${order.createdAt.toLocaleDateString()}`
      })

    } catch (error) {
      console.error('❌ [WHATSAPP] Error consultando estado:', error)
      await this.sendMessage({
        phoneNumber,
        content: '❌ Error consultando el estado del pedido. Intenta más tarde.'
      })
    }
  }

  private async sendContactInfo(phoneNumber: string) {
    await this.sendMessage({
      phoneNumber,
      content: `📞 *Información de Contacto:*\n\n` +
              `🏢 MarketTech\n` +
              `📧 Email: info@markettech.com\n` +
              `🌐 Web: https://markettech.com\n` +
              `⏰ Horario: Lunes a Viernes 9:00 - 18:00\n\n` +
              `💬 También puedes usar nuestros comandos:\n` +
              `/help - Ver todos los comandos\n` +
              `/catalog - Ver productos\n` +
              `/order - Hacer pedido`
    })
  }

  private async updateMessageStatus(messageId: string, status: string) {
    try {
      await prisma.whatsAppMessage.updateMany({
        where: { messageId },
        data: { status: status.toUpperCase() }
      })
    } catch (error) {
      console.error('❌ [WHATSAPP] Error actualizando estado:', error)
    }
  }

  getStatus() {
    return {
      isReady: this.isReady,
      isConnecting: this.isConnecting,
      client: this.client ? 'initialized' : 'not_initialized'
    }
  }
}

// Instancia singleton
export const whatsappService = new WhatsAppService()
