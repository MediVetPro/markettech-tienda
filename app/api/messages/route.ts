import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

// GET - Obtener mensajes del usuario
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const userId = payload.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Solo administradores pueden ver mensajes
    if (user.role !== 'ADMIN' && user.role !== 'ADMIN_VENDAS') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem ver mensagens.' }, { status: 403 })
    }

    // Los administradores ven todos los mensajes
    const whereClause = {}

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        recipient: {
          select: { id: true, name: true, email: true }
        },
        replies: {
          include: {
            sender: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Enviar mensaje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, content, type = 'CONTACT', recipientId, senderName, senderEmail, senderPhone } = body

    if (!subject || !content) {
      return NextResponse.json({ error: 'Assunto e conteúdo são obrigatórios' }, { status: 400 })
    }

    // Verificar si es un mensaje de contacto (sin usuario autenticado)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let senderId = null
    let sender = null
    let isRegisteredUser = false

    if (token) {
      try {
        const payload = verifyJWT(token)
        if (payload) {
          senderId = payload.userId
          sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { name: true, email: true, phone: true }
          })
          isRegisteredUser = true
          console.log('📧 [API] Usuario autenticado enviando mensaje:', sender?.email)
        }
      } catch (tokenError) {
        console.error('Error al verificar token:', tokenError)
      }
    } else {
      // Usuario no autenticado - verificar si el email o teléfono existe en la base de datos
      if (senderEmail || senderPhone) {
        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                ...(senderEmail ? [{ email: senderEmail }] : []),
                ...(senderPhone ? [{ phone: senderPhone }] : [])
              ]
            },
            select: { id: true, name: true, email: true, phone: true }
          })
          
          if (existingUser) {
            isRegisteredUser = true
            sender = existingUser
            console.log('📧 [API] Usuario no autenticado pero registrado:', existingUser.email)
          } else {
            console.log('📧 [API] Usuario no registrado enviando mensaje')
          }
        } catch (dbError) {
          console.error('Error al verificar usuario existente:', dbError)
        }
      }
    }

    // Crear el mensaje
    const message = await prisma.message.create({
      data: {
        subject,
        content,
        type,
        senderId,
        recipientId: recipientId || null,
        senderName: senderName || sender?.name || null,
        senderEmail: senderEmail || sender?.email || null,
        senderPhone: senderPhone || sender?.phone || null
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        recipient: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Si es un mensaje de contacto o consulta de producto, notificar a los administradores
    if (type === 'CONTACT' || type === 'PRODUCT_INQUIRY') {
      try {
        const admins = await prisma.user.findMany({
          where: { 
            OR: [
              { role: 'ADMIN' },
              { role: 'ADMIN_VENDAS' }
            ]
          },
          select: { id: true }
        })

        // Solo crear notificaciones si hay administradores
        if (admins.length > 0) {
          const userStatus = isRegisteredUser ? 'Usuário Registrado' : 'Usuário Não Registrado'
          const notifications = admins.map(admin => ({
            type: 'MESSAGE_RECEIVED',
            title: type === 'PRODUCT_INQUIRY' ? 'Nova Consulta de Produto' : 'Nova Mensagem de Contato',
            message: `Nova mensagem de ${message.senderName || 'Usuário anônimo'} (${userStatus}): ${subject}`,
            userId: admin.id,
            messageId: message.id,
            data: JSON.stringify({
              messageId: message.id,
              senderName: message.senderName,
              senderEmail: message.senderEmail,
              subject: message.subject,
              isRegisteredUser
            })
          }))

          await prisma.notification.createMany({
            data: notifications
          })
        }
      } catch (notificationError) {
        console.error('Erro ao criar notificações:', notificationError)
        // No fallar el envío del mensaje si hay error en las notificaciones
      }
    }

    return NextResponse.json({ 
      message: 'Mensagem enviada com sucesso!',
      data: message 
    })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
