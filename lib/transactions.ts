import { PrismaClient, Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { AppError, ErrorType, CommonErrors } from './errorHandler'

// Tipo para operaciones de transacción
export type TransactionOperation<T = any> = (tx: Prisma.TransactionClient) => Promise<T>

// Interfaz para configuración de transacción
export interface TransactionConfig {
  timeout?: number // Timeout en milisegundos
  isolationLevel?: Prisma.TransactionIsolationLevel
  maxWait?: number // Tiempo máximo de espera
}

// Configuración por defecto
const DEFAULT_CONFIG: Required<TransactionConfig> = {
  timeout: 10000, // 10 segundos
  isolationLevel: 'Serializable',
  maxWait: 5000 // 5 segundos
}

// Función principal para ejecutar transacciones
export async function executeTransaction<T>(
  operation: TransactionOperation<T>,
  config: TransactionConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  try {
    console.log('🔄 [TRANSACTION] Iniciando transacción...')
    
    const result = await prisma.$transaction(
      operation,
      {
        timeout: finalConfig.timeout,
        isolationLevel: finalConfig.isolationLevel,
        maxWait: finalConfig.maxWait
      }
    )
    
    console.log('✅ [TRANSACTION] Transacción completada exitosamente')
    return result
    
  } catch (error) {
    console.error('❌ [TRANSACTION] Error en transacción:', error)
    
    // Si es un error de Prisma, crear AppError específico
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw CommonErrors.DATABASE_QUERY_ERROR(error.message)
    }
    
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      throw CommonErrors.DATABASE_CONNECTION_ERROR()
    }
    
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      throw CommonErrors.DATABASE_CONNECTION_ERROR()
    }
    
    // Si es un AppError, re-lanzarlo
    if (error instanceof AppError) {
      throw error
    }
    
    // Error genérico
    throw CommonErrors.INTERNAL_SERVER_ERROR(error)
  }
}

// Transacciones específicas para operaciones comunes

// Crear producto con imágenes
export async function createProductWithImages(
  productData: Prisma.ProductCreateInput,
  images: Array<{ path: string; filename: string; alt?: string; order: number }>
): Promise<{ product: any; images: any[] }> {
  return executeTransaction(async (tx) => {
    console.log('🔄 [TRANSACTION] Creando producto con imágenes...')
    console.log('📊 [TRANSACTION] Datos del producto:', {
      title: productData.title?.substring(0, 50) + '...',
      manufacturer: productData.manufacturer || 'NULL',
      model: productData.model || 'NULL',
      manufacturerCode: productData.manufacturerCode
    })
    
    // Crear producto
    const product = await tx.product.create({
      data: productData
    })
    
    console.log('✅ [TRANSACTION] Producto creado:', product.id)
    console.log('🔍 [TRANSACTION] Verificando campos guardados:', {
      manufacturer: product.manufacturer || 'NULL',
      model: product.model || 'NULL',
      manufacturerCode: product.manufacturerCode
    })
    
    // Crear imágenes
    console.log('🖼️ [TRANSACTION] Creando imágenes en base de datos:', images.length)
    const productImages = await Promise.all(
      images.map((imageData, index) => {
        console.log(`📸 [TRANSACTION] Creando imagen ${index + 1}:`, {
          path: imageData.path,
          filename: imageData.filename,
          order: imageData.order || index
        })
        return tx.productImage.create({
          data: {
            ...imageData,
            productId: product.id,
            order: imageData.order || index
          }
        })
      })
    )
    
    console.log('✅ [TRANSACTION] Imágenes creadas en BD:', productImages.length)
    
    return { product, images: productImages }
  })
}

// Crear orden con items y actualizar stock
export async function createOrderWithItems(
  orderData: Prisma.OrderCreateInput,
  items: Array<{
    productId: string
    quantity: number
    price: number
    sellerId?: string
    sellerName?: string
    sellerCommission?: number
  }>
): Promise<{ order: any; orderItems: any[] }> {
  return executeTransaction(async (tx) => {
    console.log('🔄 [TRANSACTION] Creando orden con items...')
    
    // Verificar stock de todos los productos y obtener información de vendedores
    const productInfo = []
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      })
      
      if (!product) {
        throw CommonErrors.PRODUCT_NOT_FOUND(item.productId)
      }
      
      if (product.stock < item.quantity) {
        throw new AppError(
          ErrorType.VALIDATION,
          `Stock insuficiente para "${product.title}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
          400,
          { productId: item.productId, available: product.stock, requested: item.quantity }
        )
      }
      
      productInfo.push({
        product,
        item
      })
    }
    
    // Crear orden
    const order = await tx.order.create({
      data: orderData
    })
    
    console.log('✅ [TRANSACTION] Orden creada:', order.id)
    
    // Crear items de orden y actualizar stock
    const orderItems = await Promise.all(
      productInfo.map(async ({ product, item }) => {
        // Crear item de orden con información del vendedor
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            sellerId: product.user?.id || null,
            sellerName: product.user?.name || 'Vendedor no disponible',
            sellerCommission: item.sellerCommission
          }
        })
        
        // Actualizar stock del producto
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
        
        return orderItem
      })
    )
    
    console.log('✅ [TRANSACTION] Items de orden creados y stock actualizado')
    
    return { order, orderItems }
  })
}

// Actualizar carrito de usuario
export async function updateUserCart(
  userId: string,
  items: Array<{
    productId: string
    quantity: number
  }>
): Promise<{ cart: any; cartItems: any[] }> {
  return executeTransaction(async (tx) => {
    console.log('🔄 [TRANSACTION] Actualizando carrito de usuario...')
    
    // Buscar o crear carrito
    let cart = await tx.userCart.findUnique({
      where: { userId },
      include: { items: true }
    })
    
    if (!cart) {
      cart = await tx.userCart.create({
        data: { userId },
        include: { items: true }
      })
    }
    
    // Eliminar items existentes
    await tx.cartItem.deleteMany({
      where: { userCartId: cart.id }
    })
    
    // Crear nuevos items
    const cartItems = await Promise.all(
      items.map(item =>
        tx.cartItem.create({
          data: {
            userCartId: cart.id,
            productId: item.productId,
            quantity: item.quantity
          }
        })
      )
    )
    
    console.log('✅ [TRANSACTION] Carrito actualizado:', cartItems.length, 'items')
    
    return { cart, cartItems }
  })
}

// Eliminar producto y limpiar datos relacionados
export async function deleteProductCompletely(productId: string): Promise<void> {
  return executeTransaction(async (tx) => {
    console.log('🔄 [TRANSACTION] Eliminando producto completamente...')
    
    // Verificar que el producto existe
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true }
    })
    
    if (!product) {
      throw CommonErrors.PRODUCT_NOT_FOUND(productId)
    }
    
    // Eliminar en orden específico para evitar conflictos de foreign key
    // 1. Eliminar items de carrito
    await tx.cartItem.deleteMany({
      where: { productId }
    })
    
    // 2. Eliminar valoraciones
    await tx.productRating.deleteMany({
      where: { productId }
    })
    
    // 3. Eliminar items de orden (solo si no hay órdenes completadas)
    const orderItems = await tx.orderItem.findMany({
      where: { productId },
      include: { order: true }
    })
    
    const completedOrderItems = orderItems.filter(item => 
      ['CONFIRMED', 'COMPLETED'].includes(item.order.status)
    )
    
    if (completedOrderItems.length > 0) {
      throw new AppError(
        ErrorType.VALIDATION,
        'No se puede eliminar el producto porque tiene órdenes completadas',
        400,
        { productId, completedOrders: completedOrderItems.length }
      )
    }
    
    // Eliminar items de órdenes pendientes
    await tx.orderItem.deleteMany({
      where: { productId }
    })
    
    // 4. Eliminar imágenes
    await tx.productImage.deleteMany({
      where: { productId }
    })
    
    // 5. Eliminar producto
    await tx.product.delete({
      where: { id: productId }
    })
    
    console.log('✅ [TRANSACTION] Producto eliminado completamente:', product.title)
  })
}

// Crear usuario con carrito inicial
export async function createUserWithCart(
  userData: Prisma.UserCreateInput
): Promise<{ user: any; cart: any }> {
  return executeTransaction(async (tx) => {
    console.log('🔄 [TRANSACTION] Creando usuario con carrito...')
    
    // Crear usuario
    const user = await tx.user.create({
      data: userData
    })
    
    console.log('✅ [TRANSACTION] Usuario creado:', user.id)
    
    // Crear carrito vacío
    const cart = await tx.userCart.create({
      data: { userId: user.id }
    })
    
    console.log('✅ [TRANSACTION] Carrito creado:', cart.id)
    
    return { user, cart }
  })
}

// Actualizar perfil de pago global y desactivar otros
export async function updateGlobalPaymentProfile(
  profileData: Prisma.GlobalPaymentProfileCreateInput,
  paymentMethods: Array<Prisma.GlobalPaymentMethodCreateInput>
): Promise<{ profile: any; methods: any[] }> {
  return executeTransaction(async (tx) => {
    console.log('🔄 [TRANSACTION] Actualizando perfil de pago global...')
    
    // Desactivar perfiles existentes
    await tx.globalPaymentProfile.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })
    
    // Crear nuevo perfil
    const profile = await tx.globalPaymentProfile.create({
      data: profileData
    })
    
    console.log('✅ [TRANSACTION] Perfil de pago creado:', profile.id)
    
    // Crear métodos de pago
    const methods = await Promise.all(
      paymentMethods.map(methodData => {
        const { globalPaymentProfile, ...methodDataWithoutProfile } = methodData
        return tx.globalPaymentMethod.create({
          data: {
            ...methodDataWithoutProfile,
            globalPaymentProfileId: profile.id
          }
        })
      })
    )
    
    console.log('✅ [TRANSACTION] Métodos de pago creados:', methods.length)
    
    return { profile, methods }
  })
}

// Función helper para retry de transacciones
export async function executeTransactionWithRetry<T>(
  operation: TransactionOperation<T>,
  config: TransactionConfig = {},
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [TRANSACTION] Intento ${attempt}/${maxRetries}`)
      return await executeTransaction(operation, config)
    } catch (error) {
      lastError = error as Error
      console.warn(`⚠️ [TRANSACTION] Intento ${attempt} falló:`, error)
      
      if (attempt < maxRetries) {
        // Esperar antes del siguiente intento (backoff exponencial)
        const delay = Math.pow(2, attempt) * 1000
        console.log(`⏳ [TRANSACTION] Esperando ${delay}ms antes del siguiente intento...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Transacción falló después de todos los intentos')
}
