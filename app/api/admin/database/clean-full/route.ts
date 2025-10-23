import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { readdir } from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyJWT(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' }, { status: 403 })
    }

    console.log('🚨 Iniciando limpeza COMPLETA da base de dados...')

    // Obter ID do usuário atual para preservar
    const currentUserId = decoded.userId

    // Obter todas as imagens antes de deletar
    const productImages = await prisma.productImage.findMany()
    const imagePaths = productImages.map(img => img.path)

    // Usar transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Deletar TODOS os dados, exceto o usuário admin atual
      
      // Primeiro, deletar dados relacionados aos usuários (exceto o admin atual)
      await tx.productRating.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.reviewVote.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.review.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.wishlistItem.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.savedComparison.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.couponUsage.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.cartItem.deleteMany({
        where: {
          userCart: {
            userId: {
              not: currentUserId
            }
          }
        }
      })
      await tx.userCart.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.paymentMethod.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.payment.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.userEvent.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.userSession.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.pushSubscription.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.notificationPreference.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.notification.deleteMany({
        where: {
          userId: {
            not: currentUserId
          }
        }
      })
      await tx.message.deleteMany({
        where: {
          OR: [
            { senderId: { not: currentUserId } },
            { recipientId: { not: currentUserId } }
          ]
        }
      })

      // Deletar TODOS os produtos e dados relacionados
      await tx.productRating.deleteMany()
      await tx.reviewVote.deleteMany()
      await tx.review.deleteMany()
      await tx.wishlistItem.deleteMany()
      await tx.savedComparison.deleteMany()
      await tx.couponUsage.deleteMany()
      await tx.coupon.deleteMany()
      await tx.cartItem.deleteMany()
      await tx.userCart.deleteMany()
      await tx.inventoryAlert.deleteMany()
      await tx.inventoryMovement.deleteMany()
      await tx.inventory.deleteMany()
      await tx.productImage.deleteMany()
      await tx.product.deleteMany()

      // Deletar TODOS os pedidos
      await tx.sellerPayout.deleteMany()
      await tx.pixPayment.deleteMany()
      await tx.payment.deleteMany()
      await tx.orderItem.deleteMany()
      await tx.order.deleteMany()

      // Deletar dados de comunicação
      await tx.message.deleteMany()
      await tx.notification.deleteMany()
      await tx.notificationLog.deleteMany()
      await tx.notificationPreference.deleteMany()
      await tx.pushSubscription.deleteMany()

      // Deletar dados de analytics
      await tx.userEvent.deleteMany()
      await tx.userSession.deleteMany()
      await tx.analyticsMetric.deleteMany()

      // Deletar dados de pagamento
      await tx.paymentMethod.deleteMany()
      await tx.globalPaymentMethod.deleteMany()
      await tx.globalPaymentProfile.deleteMany()

      // Deletar dados de comissão
      await tx.commissionSettings.deleteMany()


      // Deletar TODOS os usuários exceto o admin atual
      await tx.user.deleteMany({
        where: {
          id: {
            not: currentUserId
          }
        }
      })
    })

    // Deletar arquivos de imagem do sistema de arquivos
    for (const imagePath of imagePaths) {
      try {
        const fullPath = join(process.cwd(), 'public', imagePath)
        await unlink(fullPath)
        console.log(`🗑️ Imagem deletada: ${imagePath}`)
      } catch (error) {
        console.warn(`⚠️ Não foi possível deletar imagem ${imagePath}:`, error)
      }
    }

    // Limpar diretório de uploads
    try {
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      const files = await readdir(uploadsDir, { recursive: true })
      
      for (const file of files) {
        if (typeof file === 'string') {
          const filePath = join(uploadsDir, file)
          try {
            await unlink(filePath)
            console.log(`🗑️ Arquivo deletado: ${file}`)
          } catch (error) {
            console.warn(`⚠️ Não foi possível deletar arquivo ${file}:`, error)
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao limpar diretório de uploads:', error)
    }

    console.log('✅ Limpeza completa concluída com sucesso!')

    return NextResponse.json({
      success: true,
      message: 'Limpeza completa realizada com sucesso. Apenas a conta do administrador atual foi preservada.'
    })

  } catch (error) {
    console.error('❌ Erro na limpeza completa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor durante a limpeza' },
      { status: 500 }
    )
  }
}
