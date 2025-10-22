import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { restoreFromBackup } from '@/lib/backup'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      throw CommonErrors.UNAUTHORIZED
    }
    
    const auth = verifyToken(token)
    if (!auth.user || auth.user.role !== 'ADMIN') {
      throw CommonErrors.FORBIDDEN
    }

    const { backupId } = await req.json()

    if (!backupId) {
      throw CommonErrors.INVALID_INPUT('backupId', 'ID del backup requerido')
    }

    const restoreInfo = await restoreFromBackup(backupId)

    return NextResponse.json({ restoreInfo }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
