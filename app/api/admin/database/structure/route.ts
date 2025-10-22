import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyJWT(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' }, { status: 403 })
    }

    console.log('🔍 Obtendo estrutura da base de dados...')

    // Obter informações das tabelas
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name as name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    ` as Array<{ name: string; column_count: number }>

    // Obter contagem de registros para cada tabela
    const tableStats = await Promise.all(
      tables.map(async (table) => {
        try {
          const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table.name}"`) as Array<{ count: bigint }>
          return {
            name: table.name,
            rows: Number(count[0]?.count || 0),
            columns: table.column_count
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao contar registros da tabela ${table.name}:`, error)
          return {
            name: table.name,
            rows: 0,
            columns: table.column_count
          }
        }
      })
    )

    // Obter informações das colunas para cada tabela
    const tablesWithColumns = await Promise.all(
      tableStats.map(async (table) => {
        try {
          const columns = await prisma.$queryRaw`
            SELECT 
              column_name as name,
              data_type as type,
              is_nullable as nullable,
              column_default as default_value
            FROM information_schema.columns 
            WHERE table_name = ${table.name}
            ORDER BY ordinal_position
          ` as Array<{
            name: string
            type: string
            nullable: string
            default_value: string | null
          }>

          return {
            ...table,
            columns: columns.map(col => ({
              name: col.name,
              type: col.type,
              nullable: col.nullable === 'YES',
              default: col.default_value
            }))
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao obter colunas da tabela ${table.name}:`, error)
          return {
            ...table,
            columns: []
          }
        }
      })
    )

    // Obter informações de relacionamentos
    const relationships = await prisma.$queryRaw`
      SELECT 
        tc.table_name as source_table,
        kcu.column_name as source_column,
        ccu.table_name as target_table,
        ccu.column_name as target_column,
        tc.constraint_name as constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    ` as Array<{
      source_table: string
      source_column: string
      target_table: string
      target_column: string
      constraint_name: string
    }>

    // Obter índices
    const indexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    ` as Array<{
      schemaname: string
      tablename: string
      indexname: string
      indexdef: string
    }>

    console.log('✅ Estrutura da base de dados obtida com sucesso!')

    return NextResponse.json({
      tables: tablesWithColumns,
      relationships,
      indexes,
      summary: {
        totalTables: tablesWithColumns.length,
        totalRelationships: relationships.length,
        totalIndexes: indexes.length
      }
    })

  } catch (error) {
    console.error('❌ Erro ao obter estrutura da base de dados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
