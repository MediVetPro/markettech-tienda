import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/')
    const fullPath = join(process.cwd(), 'public', imagePath)
    
    console.log('🖼️ [IMAGE] Solicitando imagen:', fullPath)
    
    if (!existsSync(fullPath)) {
      console.log('❌ [IMAGE] Imagen no encontrada:', fullPath)
      return new NextResponse('Image not found', { status: 404 })
    }
    
    const fileBuffer = await readFile(fullPath)
    const contentType = getContentType(fullPath)
    
    console.log('✅ [IMAGE] Imagen servida:', fullPath)
    
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('❌ [IMAGE] Error sirviendo imagen:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}
