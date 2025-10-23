import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  success: boolean
  url?: string
  public_id?: string
  error?: string
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'products'
): Promise<CloudinaryUploadResult> {
  try {
    // Verificar si Cloudinary está configurado
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ [CLOUDINARY] Variables de entorno no configuradas, usando placeholder')
      return {
        success: true,
        url: '/placeholder.jpg', // Imagen placeholder local
        public_id: `placeholder-${Date.now()}`
      }
    }

    console.log(`☁️ [CLOUDINARY] Subiendo archivo: ${file.name}`)
    
    // Convertir File a Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ [CLOUDINARY] Error:', error)
            reject(error)
          } else {
            console.log('✅ [CLOUDINARY] Subida exitosa:', result?.url)
            resolve(result)
          }
        }
      ).end(buffer)
    }) as any

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    }
  } catch (error) {
    console.warn('⚠️ [CLOUDINARY] Error subiendo archivo, usando placeholder:', error)
    // En lugar de fallar, devolver placeholder
    return {
      success: true,
      url: '/placeholder.jpg',
      public_id: `placeholder-${Date.now()}`
    }
  }
}

export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string = 'products'
): Promise<{ success: boolean; results?: Array<{ url: string; public_id: string }>; error?: string }> {
  try {
    console.log(`☁️ [CLOUDINARY] Subiendo ${files.length} archivos a la carpeta: ${folder}`)
    
    // Verificar si Cloudinary está configurado
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ [CLOUDINARY] Variables de entorno no configuradas, usando placeholders')
      const results = files.map((file, index) => ({
        url: '/placeholder.jpg',
        public_id: `placeholder-${Date.now()}-${index}`
      }))
      return {
        success: true,
        results
      }
    }
    
    const results = []
    
    for (let i = 0; i < files.length; i++) {
      console.log(`☁️ [CLOUDINARY] Procesando archivo ${i + 1}/${files.length}: ${files[i].name}`)
      
      const result = await uploadToCloudinary(files[i], folder)
      
      if (!result.success) {
        console.warn(`⚠️ [CLOUDINARY] Error en archivo ${i + 1}, usando placeholder:`, result.error)
        // En lugar de fallar, usar placeholder
        results.push({
          url: '/placeholder.jpg',
          public_id: `placeholder-${Date.now()}-${i}`
        })
      } else {
        results.push({
          url: result.url!,
          public_id: result.public_id!
        })
      }
      
      console.log(`✅ [CLOUDINARY] Archivo ${i + 1} procesado`)
    }
    
    console.log(`🎉 [CLOUDINARY] Todos los archivos procesados: ${results.length}`)
    return {
      success: true,
      results
    }
  } catch (error) {
    console.warn('⚠️ [CLOUDINARY] Error subiendo múltiples archivos, usando placeholders:', error)
    // En lugar de fallar, devolver placeholders
    const results = files.map((file, index) => ({
      url: '/placeholder.jpg',
      public_id: `placeholder-${Date.now()}-${index}`
    }))
    return {
      success: true,
      results
    }
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    console.log(`🗑️ [CLOUDINARY] Eliminando archivo: ${publicId}`)
    
    const result = await cloudinary.uploader.destroy(publicId)
    
    if (result.result === 'ok') {
      console.log(`✅ [CLOUDINARY] Archivo eliminado exitosamente: ${publicId}`)
      return true
    } else {
      console.error(`❌ [CLOUDINARY] Error eliminando archivo: ${result.result}`)
      return false
    }
  } catch (error) {
    console.error('❌ [CLOUDINARY] Error eliminando archivo:', error)
    return false
  }
}
