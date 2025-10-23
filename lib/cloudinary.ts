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
    console.error('❌ [CLOUDINARY] Error subiendo archivo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string = 'products'
): Promise<{ success: boolean; results?: Array<{ url: string; public_id: string }>; error?: string }> {
  try {
    console.log(`☁️ [CLOUDINARY] Subiendo ${files.length} archivos a la carpeta: ${folder}`)
    
    const results = []
    
    for (let i = 0; i < files.length; i++) {
      console.log(`☁️ [CLOUDINARY] Procesando archivo ${i + 1}/${files.length}: ${files[i].name}`)
      
      const result = await uploadToCloudinary(files[i], folder)
      
      if (!result.success) {
        console.error(`❌ [CLOUDINARY] Error en archivo ${i + 1}:`, result.error)
        return {
          success: false,
          error: result.error
        }
      }
      
      results.push({
        url: result.url!,
        public_id: result.public_id!
      })
      
      console.log(`✅ [CLOUDINARY] Archivo ${i + 1} subido exitosamente`)
    }
    
    console.log(`🎉 [CLOUDINARY] Todos los archivos subidos exitosamente: ${results.length}`)
    return {
      success: true,
      results
    }
  } catch (error) {
    console.error('❌ [CLOUDINARY] Error subiendo múltiples archivos:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
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
