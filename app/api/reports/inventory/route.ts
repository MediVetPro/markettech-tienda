import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { handleError, CommonErrors } from '@/lib/errorHandler'
import { generateInventoryReport } from '@/lib/reports'

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

    const report = await generateInventoryReport()

    return NextResponse.json({ report }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
