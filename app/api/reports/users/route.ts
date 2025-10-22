import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { generateUserReport } from '@/lib/reports'

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

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let start: Date | undefined
    let end: Date | undefined

    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw CommonErrors.INVALID_INPUT('fechas', 'Fechas inválidas')
      }

      if (start > end) {
        throw CommonErrors.INVALID_INPUT('fechas', 'startDate debe ser anterior a endDate')
      }
    }

    const report = await generateUserReport(start, end)

    return NextResponse.json({ report }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
