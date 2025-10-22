import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { prisma } from './prisma'
import { handleError, CommonErrors } from './errorHandler'

const execAsync = promisify(exec)

export interface BackupInfo {
  id: string
  filename: string
  size: number
  createdAt: Date
  type: 'FULL' | 'INCREMENTAL'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  error?: string
}

export interface RestoreInfo {
  id: string
  backupId: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  startedAt: Date
  completedAt?: Date
  error?: string
}

// Directorio de backups
const BACKUP_DIR = path.join(process.cwd(), 'backups')
const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db')

/**
 * Crea un backup completo de la base de datos
 */
export async function createFullBackup(): Promise<BackupInfo> {
  try {
    console.log('💾 [BACKUP] Creando backup completo...')

    // Crear directorio de backups si no existe
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-full-${timestamp}.db`
    const filepath = path.join(BACKUP_DIR, filename)

    // Crear backup usando sqlite3
    await execAsync(`sqlite3 "${DB_PATH}" ".backup '${filepath}'"`)

    // Verificar que el archivo se creó correctamente
    if (!fs.existsSync(filepath)) {
      throw new Error('El archivo de backup no se creó correctamente')
    }

    const stats = fs.statSync(filepath)
    const backupInfo: BackupInfo = {
      id: `backup-${Date.now()}`,
      filename,
      size: stats.size,
      createdAt: new Date(),
      type: 'FULL',
      status: 'COMPLETED'
    }

    // Guardar información del backup en la base de datos
    await prisma.siteConfig.upsert({
      where: { key: `backup_${backupInfo.id}` },
      update: { value: JSON.stringify(backupInfo) },
      create: { key: `backup_${backupInfo.id}`, value: JSON.stringify(backupInfo) }
    })

    console.log(`✅ Backup completo creado: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
    return backupInfo

  } catch (error: any) {
    console.error('❌ Error creando backup completo:', error)
    throw CommonErrors.INTERNAL_SERVER_ERROR('Error creating full backup.')
  }
}

/**
 * Crea un backup incremental (solo datos modificados)
 */
export async function createIncrementalBackup(lastBackupDate: Date): Promise<BackupInfo> {
  try {
    console.log('💾 [BACKUP] Creando backup incremental...')

    // Crear directorio de backups si no existe
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-incremental-${timestamp}.db`
    const filepath = path.join(BACKUP_DIR, filename)

    // Para un backup incremental, exportamos solo los datos modificados
    // En SQLite, esto es más complejo, así que hacemos un backup completo por ahora
    // En producción, se implementaría una lógica más sofisticada
    await execAsync(`sqlite3 "${DB_PATH}" ".backup '${filepath}'"`)

    if (!fs.existsSync(filepath)) {
      throw new Error('El archivo de backup incremental no se creó correctamente')
    }

    const stats = fs.statSync(filepath)
    const backupInfo: BackupInfo = {
      id: `backup-inc-${Date.now()}`,
      filename,
      size: stats.size,
      createdAt: new Date(),
      type: 'INCREMENTAL',
      status: 'COMPLETED'
    }

    // Guardar información del backup
    await prisma.siteConfig.upsert({
      where: { key: `backup_${backupInfo.id}` },
      update: { value: JSON.stringify(backupInfo) },
      create: { key: `backup_${backupInfo.id}`, value: JSON.stringify(backupInfo) }
    })

    console.log(`✅ Backup incremental creado: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
    return backupInfo

  } catch (error: any) {
    console.error('❌ Error creando backup incremental:', error)
    throw CommonErrors.INTERNAL_SERVER_ERROR('Error creating incremental backup.')
  }
}

/**
 * Restaura la base de datos desde un backup
 */
export async function restoreFromBackup(backupId: string): Promise<RestoreInfo> {
  try {
    console.log(`🔄 [RESTORE] Restaurando desde backup ${backupId}...`)

    // Obtener información del backup
    const backupConfig = await prisma.siteConfig.findUnique({
      where: { key: `backup_${backupId}` }
    })

    if (!backupConfig) {
      throw new Error('Backup no encontrado')
    }

    const backupInfo: BackupInfo = JSON.parse(backupConfig.value)
    const backupPath = path.join(BACKUP_DIR, backupInfo.filename)

    if (!fs.existsSync(backupPath)) {
      throw new Error('Archivo de backup no encontrado')
    }

    const restoreInfo: RestoreInfo = {
      id: `restore-${Date.now()}`,
      backupId,
      status: 'PENDING',
      startedAt: new Date()
    }

    // Crear backup de la base de datos actual antes de restaurar
    const currentBackupPath = path.join(BACKUP_DIR, `pre-restore-${Date.now()}.db`)
    await execAsync(`sqlite3 "${DB_PATH}" ".backup '${currentBackupPath}'"`)

    // Restaurar desde el backup
    await execAsync(`sqlite3 "${backupPath}" ".backup '${DB_PATH}'"`)

    restoreInfo.status = 'COMPLETED'
    restoreInfo.completedAt = new Date()

    // Guardar información de la restauración
    await prisma.siteConfig.upsert({
      where: { key: `restore_${restoreInfo.id}` },
      update: { value: JSON.stringify(restoreInfo) },
      create: { key: `restore_${restoreInfo.id}`, value: JSON.stringify(restoreInfo) }
    })

    console.log(`✅ Base de datos restaurada desde ${backupInfo.filename}`)
    return restoreInfo

  } catch (error: any) {
    console.error('❌ Error restaurando backup:', error)
    throw CommonErrors.INTERNAL_SERVER_ERROR('Error restoring from backup.')
  }
}

/**
 * Lista todos los backups disponibles
 */
export async function listBackups(): Promise<BackupInfo[]> {
  try {
    console.log('📋 [BACKUP] Listando backups disponibles...')

    const backupConfigs = await prisma.siteConfig.findMany({
      where: {
        key: {
          startsWith: 'backup_'
        }
      }
    })

    const backups: BackupInfo[] = backupConfigs
      .map(config => {
        try {
          return JSON.parse(config.value) as BackupInfo
        } catch {
          return null
        }
      })
      .filter((backup): backup is BackupInfo => backup !== null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return backups

  } catch (error: any) {
    throw CommonErrors.DB_OPERATION_FAILED('Error listing backups.')
  }
}

/**
 * Elimina un backup
 */
export async function deleteBackup(backupId: string): Promise<void> {
  try {
    console.log(`🗑️ [BACKUP] Eliminando backup ${backupId}...`)

    // Obtener información del backup
    const backupConfig = await prisma.siteConfig.findUnique({
      where: { key: `backup_${backupId}` }
    })

    if (!backupConfig) {
      throw new Error('Backup no encontrado')
    }

    const backupInfo: BackupInfo = JSON.parse(backupConfig.value)
    const backupPath = path.join(BACKUP_DIR, backupInfo.filename)

    // Eliminar archivo físico
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath)
    }

    // Eliminar registro de la base de datos
    await prisma.siteConfig.delete({
      where: { key: `backup_${backupId}` }
    })

    console.log(`✅ Backup ${backupId} eliminado`)

  } catch (error: any) {
    throw CommonErrors.INTERNAL_SERVER_ERROR('Error deleting backup.')
  }
}

/**
 * Programa backups automáticos
 */
export async function scheduleAutomaticBackups(): Promise<void> {
  try {
    console.log('⏰ [BACKUP] Programando backups automáticos...')

    // Crear backup diario a las 2:00 AM
    const dailyBackup = {
      id: 'daily-backup',
      schedule: '0 2 * * *', // Cron: 2:00 AM todos los días
      type: 'FULL',
      enabled: true
    }

    await prisma.siteConfig.upsert({
      where: { key: 'backup_schedule_daily' },
      update: { value: JSON.stringify(dailyBackup) },
      create: { key: 'backup_schedule_daily', value: JSON.stringify(dailyBackup) }
    })

    // Crear backup semanal los domingos a las 3:00 AM
    const weeklyBackup = {
      id: 'weekly-backup',
      schedule: '0 3 * * 0', // Cron: 3:00 AM los domingos
      type: 'FULL',
      enabled: true
    }

    await prisma.siteConfig.upsert({
      where: { key: 'backup_schedule_weekly' },
      update: { value: JSON.stringify(weeklyBackup) },
      create: { key: 'backup_schedule_weekly', value: JSON.stringify(weeklyBackup) }
    })

    console.log('✅ Backups automáticos programados')

  } catch (error: any) {
    throw CommonErrors.INTERNAL_SERVER_ERROR('Error scheduling automatic backups.')
  }
}
