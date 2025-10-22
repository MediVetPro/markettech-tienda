import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

// GET - Obtener mensaje específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const messageId = params.id

    const message = await prisma.message.findUnique({
      where: { id: messageId },
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
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
    }

    // Verificar permisos - solo administradores
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Solo administradores pueden acceder a mensajes
    if (user.role !== 'ADMIN' && user.role !== 'ADMIN_VENDAS') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar mensagens.' }, { status: 403 })
    }

    // Marcar como leído si el usuario actual es el destinatario
    if (message.recipientId === userId && message.status === 'UNREAD') {
      await prisma.message.update({
        where: { id: messageId },
        data: { status: 'READ' }
      })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Erro ao buscar mensagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Responder mensaje
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const messageId = params.id
    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: 'Conteúdo da resposta é obrigatório' }, { status: 400 })
    }

    // Verificar que el mensaje original existe
    const originalMessage = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!originalMessage) {
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
    }

    // Verificar permisos (solo admins pueden responder)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, name: true, email: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_VENDAS')) {
      return NextResponse.json({ error: 'Apenas administradores podem responder mensagens' }, { status: 403 })
    }

    // Crear la respuesta
    const reply = await prisma.message.create({
      data: {
        subject: `Re: ${originalMessage.subject}`,
        content,
        type: 'REPLY',
        senderId: userId,
        recipientId: originalMessage.senderId,
        replyId: messageId
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

    // Marcar el mensaje original como respondido
    await prisma.message.update({
      where: { id: messageId },
      data: { status: 'REPLIED' }
    })

    // Crear notificación para el remitente original si tiene cuenta registrada
    if (originalMessage.senderId) {
      await prisma.notification.create({
        data: {
          type: 'MESSAGE_REPLY',
          title: 'Resposta Recebida',
          message: `Você recebeu uma resposta para sua mensagem: ${originalMessage.subject}`,
          userId: originalMessage.senderId,
          messageId: reply.id,
          data: JSON.stringify({
            messageId: reply.id,
            originalMessageId: messageId,
            subject: originalMessage.subject
          })
        }
      })
    }
    // Nota: Los contactos anónimos no reciben notificaciones, solo los usuarios registrados

    return NextResponse.json({ 
      message: 'Resposta enviada com sucesso!',
      data: reply 
    })
  } catch (error) {
    console.error('Erro ao responder mensagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar mensaje
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const messageId = params.id

    // Verificar que el mensaje existe
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 })
    }

    // Verificar permisos - solo administradores pueden eliminar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_VENDAS')) {
      return NextResponse.json({ error: 'Apenas administradores podem eliminar mensagens' }, { status: 403 })
    }

    // Eliminar el mensaje (esto también eliminará las notificaciones relacionadas por CASCADE)
    await prisma.message.delete({
      where: { id: messageId }
    })

    return NextResponse.json({ 
      message: 'Mensagem eliminada com sucesso!' 
    })
  } catch (error) {
    console.error('Erro ao eliminar mensagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
