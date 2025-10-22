import { NextResponse } from 'next/server'
import { createSecureResponse } from './securityHeaders'

// Tipos de errores
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL = 'INTERNAL'
}

// Interfaz para errores estructurados
export interface AppError {
  type: ErrorType
  message: string
  details?: any
  code?: string
  statusCode: number
  timestamp: string
  requestId?: string
}

// Clase de error personalizada
export class AppError extends Error {
  public type: ErrorType
  public details?: any
  public code?: string
  public statusCode: number
  public timestamp: string
  public requestId?: string

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number = 500,
    details?: any,
    code?: string,
    requestId?: string
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.code = code
    this.timestamp = new Date().toISOString()
    this.requestId = requestId
  }
}

// Función para crear errores específicos
export function createError(
  type: ErrorType,
  message: string,
  statusCode: number = 500,
  details?: any,
  code?: string,
  requestId?: string
): AppError {
  return new AppError(type, message, statusCode, details, code, requestId)
}

// Errores predefinidos comunes
export const CommonErrors = {
  // Validación
  INVALID_INPUT: (field: string, details?: any) => 
    createError(ErrorType.VALIDATION, `Datos de entrada inválidos: ${field}`, 400, details, 'INVALID_INPUT'),
  
  MISSING_REQUIRED_FIELD: (field: string) => 
    createError(ErrorType.VALIDATION, `Campo requerido faltante: ${field}`, 400, { field }, 'MISSING_REQUIRED_FIELD'),
  
  INVALID_FILE_TYPE: (expectedTypes: string[]) => 
    createError(ErrorType.FILE_UPLOAD, `Tipo de archivo no permitido. Tipos permitidos: ${expectedTypes.join(', ')}`, 400, { expectedTypes }, 'INVALID_FILE_TYPE'),
  
  FILE_TOO_LARGE: (maxSize: string) => 
    createError(ErrorType.FILE_UPLOAD, `Archivo demasiado grande. Tamaño máximo: ${maxSize}`, 413, { maxSize }, 'FILE_TOO_LARGE'),
  
  // Autenticación
  INVALID_CREDENTIALS: () => 
    createError(ErrorType.AUTHENTICATION, 'Credenciales inválidas', 401, null, 'INVALID_CREDENTIALS'),
  
  TOKEN_EXPIRED: () => 
    createError(ErrorType.AUTHENTICATION, 'Token expirado', 401, null, 'TOKEN_EXPIRED'),
  
  TOKEN_INVALID: () => 
    createError(ErrorType.AUTHENTICATION, 'Token inválido', 401, null, 'TOKEN_INVALID'),
  
  UNAUTHORIZED: () => 
    createError(ErrorType.AUTHENTICATION, 'No autorizado', 401, null, 'UNAUTHORIZED'),
  
  // Autorización
  INSUFFICIENT_PERMISSIONS: (requiredRole?: string) => 
    createError(ErrorType.AUTHORIZATION, 'Permisos insuficientes', 403, { requiredRole }, 'INSUFFICIENT_PERMISSIONS'),
  
  FORBIDDEN: () => 
    createError(ErrorType.AUTHORIZATION, 'Acceso prohibido', 403, null, 'FORBIDDEN'),
  
  // No encontrado
  USER_NOT_FOUND: (userId?: string) => 
    createError(ErrorType.NOT_FOUND, 'Usuario no encontrado', 404, { userId }, 'USER_NOT_FOUND'),
  
  PRODUCT_NOT_FOUND: (productId?: string) => 
    createError(ErrorType.NOT_FOUND, 'Producto no encontrado', 404, { productId }, 'PRODUCT_NOT_FOUND'),
  
  ORDER_NOT_FOUND: (orderId?: string) => 
    createError(ErrorType.NOT_FOUND, 'Pedido no encontrado', 404, { orderId }, 'ORDER_NOT_FOUND'),
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: (retryAfter?: number) => 
    createError(ErrorType.RATE_LIMIT, 'Demasiadas solicitudes', 429, { retryAfter }, 'RATE_LIMIT_EXCEEDED'),
  
  // Base de datos
  DATABASE_CONNECTION_ERROR: () => 
    createError(ErrorType.DATABASE, 'Error de conexión a la base de datos', 500, null, 'DATABASE_CONNECTION_ERROR'),
  
  DATABASE_QUERY_ERROR: (query?: string) => 
    createError(ErrorType.DATABASE, 'Error en consulta de base de datos', 500, { query }, 'DATABASE_QUERY_ERROR'),
  
  DB_OPERATION_FAILED: (details?: any) => 
    createError(ErrorType.DATABASE, 'Error en operación de base de datos', 500, details, 'DB_OPERATION_FAILED'),
  
  // Interno
  INTERNAL_SERVER_ERROR: (details?: any) => 
    createError(ErrorType.INTERNAL, 'Error interno del servidor', 500, details, 'INTERNAL_SERVER_ERROR')
}

// Función para manejar errores y crear respuestas
export function handleError(error: any, requestId?: string): NextResponse {
  console.error('🚨 [ERROR] Error capturado:', {
    error: error.message,
    type: error.type || 'UNKNOWN',
    stack: error.stack,
    requestId,
    timestamp: new Date().toISOString()
  })

  // Si es un AppError, usar sus propiedades
  if (error instanceof AppError) {
    const response = createSecureResponse({
      error: error.message,
      type: error.type,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
      requestId: error.requestId || requestId
    }, error.statusCode, 'api')

    return response
  }

  // Si es un error de Prisma
  if (error.code && error.code.startsWith('P')) {
    console.error('🚨 [ERROR] Error de Prisma:', error)
    
    const response = createSecureResponse({
      error: 'Error de base de datos',
      type: ErrorType.DATABASE,
      code: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString(),
      requestId
    }, 500, 'api')

    return response
  }

  // Error genérico
  const response = createSecureResponse({
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
    type: ErrorType.INTERNAL,
    code: 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    requestId
  }, 500, 'api')

  return response
}

// Función para logging de errores
export function logError(error: AppError, context?: any) {
  const logData = {
    timestamp: error.timestamp,
    type: error.type,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    details: error.details,
    requestId: error.requestId,
    context
  }

  // En producción, aquí podrías enviar a un servicio de logging como Sentry
  if (process.env.NODE_ENV === 'production') {
    console.error('🚨 [PRODUCTION ERROR]', logData)
    // TODO: Integrar con servicio de logging externo
  } else {
    console.error('🚨 [DEVELOPMENT ERROR]', logData)
  }
}

// Función para validar y sanitizar errores antes de enviar al cliente
export function sanitizeErrorForClient(error: AppError): Partial<AppError> {
  const sanitized: Partial<AppError> = {
    type: error.type,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    timestamp: error.timestamp
  }

  // Solo incluir detalles en desarrollo
  if (process.env.NODE_ENV === 'development' && error.details) {
    sanitized.details = error.details
  }

  return sanitized
}

// Función helper para manejar errores en try-catch
export function withErrorHandling<T>(
  handler: () => Promise<T>,
  requestId?: string
): Promise<T | NextResponse> {
  return handler().catch((error) => {
    return handleError(error, requestId)
  })
}
