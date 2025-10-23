import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyJWT(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' }, { status: 403 })
    }

    console.log('🧹 Iniciando limpeza parcial da base de dados...')

    // Obter todas as imagens antes de deletar
    let productImages: any[] = []
    let imagePaths: string[] = []
    
    try {
      productImages = await prisma.productImage.findMany()
      imagePaths = productImages.map(img => img.path)
      console.log(`📸 Encontradas ${imagePaths.length} imagens para deletar`)
    } catch (error) {
      console.warn('⚠️ Erro ao obter imagens de produtos:', error)
      // Continuar sem deletar imagens se houver erro
    }

    // Usar transação para garantir consistência
    try {
      await prisma.$transaction(async (tx) => {
        console.log('🔄 Iniciando transação de limpeza...')
        
        // PRIMEIRO: Deletar dados de pedidos (que referenciam produtos)
        console.log('🗑️ Deletando payouts de vendedores...')
        await tx.sellerPayout.deleteMany()
        
        console.log('🗑️ Deletando pagamentos PIX...')
        await tx.pixPayment.deleteMany()
        
        console.log('🗑️ Deletando pagamentos...')
        await tx.payment.deleteMany()
        
        console.log('🗑️ Deletando itens de pedidos...')
        await tx.orderItem.deleteMany()
        
        console.log('🗑️ Deletando pedidos...')
        await tx.order.deleteMany()

        // SEGUNDO: Deletar dados relacionados aos produtos (em ordem de dependência)
        console.log('🗑️ Deletando ratings de produtos...')
        await tx.productRating.deleteMany()
        
        console.log('🗑️ Deletando votos de reviews...')
        await tx.reviewVote.deleteMany()
        
        console.log('🗑️ Deletando reviews...')
        await tx.review.deleteMany()
        
        console.log('🗑️ Deletando itens de wishlist...')
        await tx.wishlistItem.deleteMany()
        
        console.log('🗑️ Deletando comparações salvas...')
        await tx.savedComparison.deleteMany()
        
        console.log('🗑️ Deletando usos de cupons...')
        await tx.couponUsage.deleteMany()
        
        console.log('🗑️ Deletando cupons...')
        await tx.coupon.deleteMany()
        
        console.log('🗑️ Deletando itens do carrinho...')
        await tx.cartItem.deleteMany()
        
        console.log('🗑️ Deletando carrinhos de usuários...')
        await tx.userCart.deleteMany()
        
        console.log('🗑️ Deletando alertas de inventário...')
        await tx.inventoryAlert.deleteMany()
        
        console.log('🗑️ Deletando movimientos de inventário...')
        await tx.inventoryMovement.deleteMany()
        
        console.log('🗑️ Deletando inventário...')
        await tx.inventory.deleteMany()
        
        console.log('🗑️ Deletando imagens de produtos...')
        await tx.productImage.deleteMany()
        
        console.log('🗑️ Deletando produtos...')
        await tx.product.deleteMany()

        // Deletar dados de comunicação
        
        console.log('🗑️ Deletando mensagens...')
        await tx.message.deleteMany()
        
        console.log('🗑️ Deletando notificações...')
        await tx.notification.deleteMany()
        
        console.log('🗑️ Deletando logs de notificações...')
        await tx.notificationLog.deleteMany()
        
        console.log('🗑️ Deletando preferencias de notificações...')
        await tx.notificationPreference.deleteMany()
        
        console.log('🗑️ Deletando subscrições push...')
        await tx.pushSubscription.deleteMany()

        // Deletar dados de analytics
        console.log('🗑️ Deletando eventos de usuários...')
        await tx.userEvent.deleteMany()
        
        console.log('🗑️ Deletando sessões de usuários...')
        await tx.userSession.deleteMany()
        
        console.log('🗑️ Deletando métricas de analytics...')
        await tx.analyticsMetric.deleteMany()

        // Deletar dados de pagamento (mantener perfiles globales)
        console.log('🗑️ Deletando métodos de pagamento...')
        await tx.paymentMethod.deleteMany()
        
        console.log('🗑️ Deletando métodos de pagamento globales...')
        await tx.globalPaymentMethod.deleteMany()
        
        // NO eliminar GlobalPaymentProfile - mantener configuraciones de pago
        // await tx.globalPaymentProfile.deleteMany()

        // NO eliminar configuraciones de comisión - mantener configuraciones del sistema
        // await tx.commissionSettings.deleteMany()

        
        console.log('✅ Transação de limpeza concluída com sucesso!')
      })
    } catch (error) {
      console.error('❌ Erro na transação de limpeza:', error)
      throw error
    }

    // Deletar arquivos de imagem do sistema de arquivos
    if (imagePaths.length > 0) {
      console.log(`🗑️ Deletando ${imagePaths.length} arquivos de imagem...`)
      for (const imagePath of imagePaths) {
        try {
          const fullPath = join(process.cwd(), 'public', imagePath)
          await unlink(fullPath)
          console.log(`🗑️ Imagem deletada: ${imagePath}`)
        } catch (error) {
          console.warn(`⚠️ Não foi possível deletar imagem ${imagePath}:`, error)
        }
      }
    } else {
      console.log('📸 Nenhuma imagem encontrada para deletar')
    }

    console.log('✅ Limpeza parcial concluída com sucesso!')

    return NextResponse.json({
      success: true,
      message: 'Limpeza parcial realizada com sucesso. Todos os dados foram removidos exceto usuários.'
    })

  } catch (error) {
    console.error('❌ Erro na limpeza parcial:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor durante a limpeza' },
      { status: 500 }
    )
  }
}
