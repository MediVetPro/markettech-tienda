import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileTypeFromBuffer } from 'file-type'

// Configuración
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// Configuración de compresión
const MAX_WIDTH = 1000 // Máximo 1000px de ancho
const MAX_HEIGHT = 1000 // Máximo 1000px de alto
const MAX_FILE_SIZE_COMPRESSED = 100 * 1024 // 100KB máximo después de compresión
const COMPRESSION_QUALITY = 85 // Calidad de compresión (0-100)

// Configuración de validación avanzada
const MIN_IMAGE_DIMENSIONS = { width: 50, height: 50 } // Dimensiones mínimas
const MAX_IMAGE_DIMENSIONS = { width: 4000, height: 4000 } // Dimensiones máximas
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs', '.jar', '.php', '.asp', '.aspx']

// Patrones de archivos sospechosos
const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /vbscript:/i,
  /onload=/i,
  /onerror=/i,
  /onclick=/i,
  /eval\(/i,
  /document\./i,
  /window\./i
]

// Función para generar nombre único de archivo
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = path.extname(originalName)
  const nameWithoutExt = path.basename(originalName, extension)
  return `${nameWithoutExt}_${timestamp}_${random}${extension}`
}

// Función para crear directorio del producto
async function createProductDirectory(productId: string): Promise<string> {
  const productDir = path.join(UPLOAD_DIR, `product_${productId}`)
  
  if (!existsSync(productDir)) {
    await mkdir(productDir, { recursive: true })
  }
  
  return productDir
}

// Función para validar extensión de archivo
function validateFileExtension(filename: string): { valid: boolean; error?: string } {
  const extension = path.extname(filename).toLowerCase()
  
  // Verificar extensiones peligrosas
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Tipo de archivo peligroso no permitido.'
    }
  }
  
  // Verificar extensiones permitidas
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Extensión de archivo no permitida. Solo JPG, PNG y WEBP.'
    }
  }
  
  return { valid: true }
}

// Función para validar contenido del archivo
async function validateFileContent(buffer: Buffer): Promise<{ valid: boolean; error?: string; mimeType?: string }> {
  try {
    // Detectar tipo MIME real del archivo
    const fileType = await fileTypeFromBuffer(buffer)
    
    if (!fileType) {
      return {
        valid: false,
        error: 'No se pudo determinar el tipo de archivo.'
      }
    }
    
    // Verificar que el tipo MIME detectado esté permitido
    if (!ALLOWED_TYPES.includes(fileType.mime)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido: ${fileType.mime}. Solo se permiten imágenes JPG, PNG y WEBP.`
      }
    }
    
    // Verificar que sea realmente una imagen válida
    try {
      const metadata = await sharp(buffer).metadata()
      
      if (!metadata.width || !metadata.height) {
        return {
          valid: false,
          error: 'El archivo no es una imagen válida.'
        }
      }
      
      // Validar dimensiones
      if (metadata.width < MIN_IMAGE_DIMENSIONS.width || metadata.height < MIN_IMAGE_DIMENSIONS.height) {
        return {
          valid: false,
          error: `La imagen es demasiado pequeña. Mínimo ${MIN_IMAGE_DIMENSIONS.width}x${MIN_IMAGE_DIMENSIONS.height}px.`
        }
      }
      
      if (metadata.width > MAX_IMAGE_DIMENSIONS.width || metadata.height > MAX_IMAGE_DIMENSIONS.height) {
        return {
          valid: false,
          error: `La imagen es demasiado grande. Máximo ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height}px.`
        }
      }
      
      return {
        valid: true,
        mimeType: fileType.mime
      }
      
    } catch (sharpError) {
      return {
        valid: false,
        error: 'El archivo no es una imagen válida o está corrupto.'
      }
    }
    
  } catch (error) {
    return {
      valid: false,
      error: 'Error al validar el contenido del archivo.'
    }
  }
}

// Función para detectar contenido sospechoso
function detectSuspiciousContent(buffer: Buffer): { suspicious: boolean; reason?: string } {
  const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024)) // Solo primeros 1KB
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      return {
        suspicious: true,
        reason: 'Contenido sospechoso detectado en el archivo.'
      }
    }
  }
  
  return { suspicious: false }
}

// Función mejorada para validar archivo
export async function validateFile(file: File): Promise<{ valid: boolean; error?: string; mimeType?: string }> {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Máximo 5MB.'
    }
  }
  
  if (file.size === 0) {
    return {
      valid: false,
      error: 'El archivo está vacío.'
    }
  }
  
  // Validar extensión
  const extensionValidation = validateFileExtension(file.name)
  if (!extensionValidation.valid) {
    return extensionValidation
  }
  
  // Convertir a buffer para validación de contenido
  const buffer = Buffer.from(await file.arrayBuffer())
  
  // Detectar contenido sospechoso
  const suspiciousCheck = detectSuspiciousContent(buffer)
  if (suspiciousCheck.suspicious) {
    return {
      valid: false,
      error: suspiciousCheck.reason
    }
  }
  
  // Validar contenido real del archivo
  const contentValidation = await validateFileContent(buffer)
  return contentValidation
}

// Función para comprimir imagen
async function compressImage(buffer: Buffer): Promise<Buffer> {
  console.log(`🗜️ [COMPRESS] Iniciando compresión de imagen...`)
  console.log(`🗜️ [COMPRESS] Tamaño original: ${buffer.length} bytes`)
  
  try {
    let sharpInstance = sharp(buffer)
    
    // Obtener metadatos de la imagen
    const metadata = await sharpInstance.metadata()
    console.log(`🗜️ [COMPRESS] Dimensiones originales: ${metadata.width}x${metadata.height}`)
    
    // Redimensionar si es necesario
    if (metadata.width && metadata.height) {
      if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        console.log(`🗜️ [COMPRESS] Redimensionando imagen...`)
        sharpInstance = sharpInstance.resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
      }
    }
    
    // Aplicar compresión
    let compressedBuffer = await sharpInstance
      .jpeg({ 
        quality: COMPRESSION_QUALITY,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer()
    
    console.log(`🗜️ [COMPRESS] Tamaño después de compresión inicial: ${compressedBuffer.length} bytes`)
    
    // Si aún es muy grande, reducir calidad progresivamente
    let quality = COMPRESSION_QUALITY
    while (compressedBuffer.length > MAX_FILE_SIZE_COMPRESSED && quality > 20) {
      quality -= 10
      console.log(`🗜️ [COMPRESS] Reduciendo calidad a ${quality}%...`)
      
      compressedBuffer = await sharp(buffer)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: quality,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer()
      
      console.log(`🗜️ [COMPRESS] Tamaño con calidad ${quality}%: ${compressedBuffer.length} bytes`)
    }
    
    console.log(`✅ [COMPRESS] Compresión completada: ${buffer.length} → ${compressedBuffer.length} bytes`)
    console.log(`✅ [COMPRESS] Reducción: ${Math.round((1 - compressedBuffer.length / buffer.length) * 100)}%`)
    
    return compressedBuffer
    
  } catch (error) {
    console.error(`❌ [COMPRESS] Error comprimiendo imagen:`, error)
    // Si falla la compresión, devolver el buffer original
    return buffer
  }
}

// Función para subir archivo
export async function uploadFile(
  file: File, 
  productId: string, 
  index: number
): Promise<{ success: boolean; path?: string; filename?: string; error?: string }> {
  console.log(`📁 [FILE] Iniciando subida de archivo ${index + 1}...`)
  console.log(`📁 [FILE] Archivo:`, {
    name: file.name,
    size: file.size,
    type: file.type,
    productId
  })
  
  try {
    // Validar archivo
    console.log(`🔍 [FILE] Validando archivo ${file.name}...`)
    const validation = await validateFile(file)
    if (!validation.valid) {
      console.error(`❌ [FILE] Validación fallida:`, validation.error)
      return { success: false, error: validation.error }
    }
    console.log(`✅ [FILE] Validación exitosa - Tipo MIME: ${validation.mimeType}`)
    
    // Crear directorio del producto
    console.log(`📁 [FILE] Creando directorio para producto ${productId}...`)
    const productDir = await createProductDirectory(productId)
    console.log(`✅ [FILE] Directorio creado:`, productDir)
    
    // Generar nombre único
    const filename = generateUniqueFilename(file.name)
    const filePath = path.join(productDir, filename)
    console.log(`📝 [FILE] Nombre de archivo generado:`, filename)
    console.log(`📝 [FILE] Ruta completa:`, filePath)
    
    // Convertir File a Buffer
    console.log(`🔄 [FILE] Convirtiendo archivo a buffer...`)
    const bytes = await file.arrayBuffer()
    const originalBuffer = Buffer.from(bytes)
    console.log(`✅ [FILE] Buffer creado, tamaño:`, originalBuffer.length, 'bytes')
    
    // Comprimir imagen
    console.log(`🗜️ [FILE] Comprimiendo imagen...`)
    const compressedBuffer = await compressImage(originalBuffer)
    console.log(`✅ [FILE] Imagen comprimida: ${originalBuffer.length} → ${compressedBuffer.length} bytes`)
    
    // Escribir archivo comprimido
    console.log(`💾 [FILE] Escribiendo archivo comprimido al disco...`)
    await writeFile(filePath, compressedBuffer)
    console.log(`✅ [FILE] Archivo comprimido escrito exitosamente`)
    
    // Retornar ruta relativa
    const relativePath = `/uploads/products/product_${productId}/${filename}`
    const apiPath = `/api/images/products/product_${productId}/${filename}`
    console.log(`✅ [FILE] Subida exitosa:`, relativePath)
    console.log(`✅ [FILE] API path:`, apiPath)
    
    return {
      success: true,
      path: relativePath,
      filename: filename
    }
    
  } catch (error) {
    console.error(`❌ [FILE] Error subiendo archivo ${file.name}:`, error)
    if (error instanceof Error) {
      console.error(`❌ [FILE] Stack trace:`, error.stack)
    }
    return {
      success: false,
      error: `Error al subir el archivo: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Función para subir múltiples archivos
export async function uploadMultipleFiles(
  files: File[],
  productId: string
): Promise<{ success: boolean; results?: Array<{ path: string; filename: string }>; error?: string }> {
  console.log(`📤 [MULTI] Iniciando subida de ${files.length} archivos para producto ${productId}`)
  
  try {
    const results = []
    
    for (let i = 0; i < files.length; i++) {
      console.log(`📤 [MULTI] Procesando archivo ${i + 1}/${files.length}...`)
      const result = await uploadFile(files[i], productId, i)
      
      if (!result.success) {
        console.error(`❌ [MULTI] Error en archivo ${i + 1}:`, result.error)
        return {
          success: false,
          error: result.error
        }
      }
      
      console.log(`✅ [MULTI] Archivo ${i + 1} subido exitosamente`)
      results.push({
        path: result.path!,
        filename: result.filename!
      })
    }
    
    console.log(`🎉 [MULTI] Todos los archivos subidos exitosamente:`, results.length)
    return {
      success: true,
      results
    }
    
  } catch (error) {
    console.error('❌ [MULTI] Error subiendo múltiples archivos:', error)
    if (error instanceof Error) {
      console.error('❌ [MULTI] Stack trace:', error.stack)
    }
    return {
      success: false,
      error: `Error al subir los archivos: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Función para eliminar archivo
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath)
    await unlink(fullPath)
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

// Función para eliminar directorio del producto
export async function deleteProductDirectory(productId: string): Promise<boolean> {
  try {
    const productDir = path.join(UPLOAD_DIR, `product_${productId}`)
    if (existsSync(productDir)) {
      const { rm } = await import('fs/promises')
      await rm(productDir, { recursive: true, force: true })
    }
    return true
  } catch (error) {
    console.error('Error deleting product directory:', error)
    return false
  }
}
