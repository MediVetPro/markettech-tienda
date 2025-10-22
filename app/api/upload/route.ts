import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { validateFile } from '@/lib/fileStorage'
import { rateLimit, rateLimitConfigs } from '@/lib/rateLimit'
import { createSecureResponse } from '@/lib/securityHeaders'
import { handleError, CommonErrors, withErrorHandling } from '@/lib/errorHandler'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 [UPLOAD] Iniciando upload de arquivo...')
    
    // Aplicar rate limiting para uploads
    const rateLimiter = rateLimit(rateLimitConfigs.upload)
    const rateLimitResult = rateLimiter(request)
    
    if (!rateLimitResult.allowed) {
      const response = createSecureResponse(
        { 
          error: rateLimitResult.error,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        429,
        'api'
      )
      
      // Añadir headers de rate limiting
      response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString())
      response.headers.set('X-RateLimit-Limit', rateLimitConfigs.upload.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
      
      return response
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    console.log('📤 [UPLOAD] Dados recebidos:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      folder
    })

    if (!file) {
      console.error('❌ [UPLOAD] Nenhum arquivo fornecido')
      const error = CommonErrors.INVALID_INPUT('file', 'Nenhum arquivo fornecido')
      return handleError(error)
    }

    // Validar archivo
    console.log('🔍 [UPLOAD] Validando arquivo...')
    const validation = await validateFile(file)
    if (!validation.valid) {
      console.error('❌ [UPLOAD] Validação falhou:', validation.error)
      const error = CommonErrors.INVALID_FILE_TYPE(['image/jpeg', 'image/png', 'image/webp'])
      error.message = validation.error || 'Archivo inválido'
      return handleError(error)
    }
    console.log('✅ [UPLOAD] Validação passou - Tipo MIME:', validation.mimeType)

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    console.log('📁 [UPLOAD] Criando diretório:', uploadDir)
    await mkdir(uploadDir, { recursive: true })
    console.log('✅ [UPLOAD] Diretório criado')

    // Generar nombre único
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = path.extname(file.name)
    const filename = `${timestamp}_${randomString}${fileExtension}`
    
    console.log('📝 [UPLOAD] Nome do arquivo gerado:', filename)
    
    // Convertir File a Buffer
    console.log('🔄 [UPLOAD] Convertendo arquivo para buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('✅ [UPLOAD] Buffer criado, tamanho:', buffer.length, 'bytes')

    // Escribir archivo
    const filePath = path.join(uploadDir, filename)
    console.log('💾 [UPLOAD] Escrevendo arquivo:', filePath)
    await writeFile(filePath, buffer)
    console.log('✅ [UPLOAD] Arquivo escrito com sucesso')

    // Retornar URL relativa
    const relativePath = `/uploads/${folder}/${filename}`
    console.log('🎉 [UPLOAD] Upload concluído:', relativePath)
    
    return createSecureResponse({ 
      success: true, 
      url: relativePath,
      filename: filename 
    }, 200, 'api')

  } catch (error) {
    console.error('❌ [UPLOAD] Erro no upload:', error)
    return handleError(error)
  }
}
