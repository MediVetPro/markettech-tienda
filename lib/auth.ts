import jwt from 'jsonwebtoken'

export interface UserToken {
  userId: string
  email: string
  role: string
  name: string
}

export interface AuthResult {
  user: UserToken | null
  error: string | null
}

// Verificar token JWT
export function verifyToken(token: string): AuthResult {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return {
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      },
      error: null
    }
  } catch (error) {
    return {
      user: null,
      error: 'Token inválido'
    }
  }
}

// Verificar si el usuario es administrador (acceso completo)
export function isAdmin(user: UserToken | null): boolean {
  return user?.role === 'ADMIN'
}

// Verificar si el usuario es administrador de ventas
export function isAdminVendas(user: UserToken | null): boolean {
  return user?.role === 'ADMIN_VENDAS'
}

// Verificar si el usuario es administrador (ADMIN o ADMIN_VENDAS)
export function isAnyAdmin(user: UserToken | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'ADMIN_VENDAS'
}

// Verificar si el usuario puede gestionar productos
export function canManageProducts(user: UserToken | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'ADMIN_VENDAS'
}

// Verificar si el usuario puede gestionar usuarios
export function canManageUsers(user: UserToken | null): boolean {
  return user?.role === 'ADMIN'
}

// Verificar si el usuario puede gestionar configuración del sitio
export function canManageSiteSettings(user: UserToken | null): boolean {
  return user?.role === 'ADMIN'
}

// Verificar si el usuario puede ver todos los pedidos
export function canViewAllOrders(user: UserToken | null): boolean {
  return user?.role === 'ADMIN'
}

// Verificar si el usuario puede ver productos de otros administradores
export function canViewAllProducts(user: UserToken | null): boolean {
  return user?.role === 'ADMIN'
}

// Verificar si el usuario puede gestionar productos de otros administradores
export function canManageAllProducts(user: UserToken | null): boolean {
  return user?.role === 'ADMIN'
}

// Verificar si el usuario puede gestionar perfiles de pago
export function canManagePaymentProfiles(user: UserToken | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'ADMIN_VENDAS'
}

// Middleware para verificar permisos en API routes
export function requireAuth(handler: (req: any, user: UserToken) => Promise<any>) {
  return async (req: any) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token requerido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { user, error } = verifyToken(token)
    
    if (!user || error) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return handler(req, user)
  }
}

// Middleware para verificar rol específico
export function requireRole(allowedRoles: string[]) {
  return function(handler: (req: any, user: UserToken) => Promise<any>) {
    return async (req: any) => {
      const token = req.headers.get('authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return new Response(JSON.stringify({ error: 'Token requerido' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const { user, error } = verifyToken(token)
      
      if (!user || error) {
        return new Response(JSON.stringify({ error: 'Token inválido' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (!allowedRoles.includes(user.role)) {
        return new Response(JSON.stringify({ error: 'Permisos insuficientes' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return handler(req, user)
    }
  }
}

// Función para verificar autenticación (alias de verifyToken para compatibilidad)
export function verifyAuth(token: string): AuthResult {
  return verifyToken(token)
}