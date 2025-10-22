import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { generateSalesReport } from '@/lib/reports'

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
    const groupBy = searchParams.get('groupBy') as 'day' | 'week' | 'month' || 'day'

    if (!startDate || !endDate) {
      throw CommonErrors.INVALID_INPUT('startDate y endDate', 'startDate y endDate son requeridos')
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw CommonErrors.INVALID_INPUT('fechas', 'Fechas inválidas')
    }

    if (start > end) {
      throw CommonErrors.INVALID_INPUT('fechas', 'startDate debe ser anterior a endDate')
    }

    const report = await generateSalesReport(start, end, groupBy)

    return NextResponse.json({ report }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
