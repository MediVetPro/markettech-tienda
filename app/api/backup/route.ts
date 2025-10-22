import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { createFullBackup, createIncrementalBackup, listBackups, deleteBackup } from '@/lib/backup'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      throw CommonErrors.UNAUTHORIZED()
    }

    const auth = verifyAuth(token)
    if (!auth.user || auth.user.role !== 'ADMIN') {
      throw CommonErrors.FORBIDDEN()
    }

    const backups = await listBackups()

    return NextResponse.json({ backups }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      throw CommonErrors.UNAUTHORIZED()
    }

    const auth = verifyAuth(token)
    if (!auth.user || auth.user.role !== 'ADMIN') {
      throw CommonErrors.FORBIDDEN()
    }

    const { type } = await req.json()

    let backup
    if (type === 'incremental') {
      // Para incremental, usar la fecha del último backup
      const lastBackup = new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
      backup = await createIncrementalBackup(lastBackup)
    } else {
      backup = await createFullBackup()
    }

    return NextResponse.json({ backup }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      throw CommonErrors.UNAUTHORIZED()
    }

    const auth = verifyAuth(token)
    if (!auth.user || auth.user.role !== 'ADMIN') {
      throw CommonErrors.FORBIDDEN()
    }

    const { searchParams } = new URL(req.url)
    const backupId = searchParams.get('id')

    if (!backupId) {
      throw CommonErrors.INVALID_INPUT('backupId', 'ID del backup requerido')
    }

    await deleteBackup(backupId)

    return NextResponse.json({ message: 'Backup eliminado exitosamente' }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
