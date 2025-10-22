'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'ADMIN_VENDAS' | 'CLIENT'
  
  // Información personal adicional
  cpf?: string
  birthDate?: string
  gender?: string
  
  // Dirección
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  
  // Preferencias
  newsletter?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isAdminVendas: boolean
  isAnyAdmin: boolean
  canManageProducts: boolean
  canManageUsers: boolean
  canManageSiteSettings: boolean
  canViewAllOrders: boolean
  canManagePaymentProfiles: boolean
  canViewAllProducts: boolean
  canManageAllProducts: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    newsletter?: boolean;
  }) => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
  logout: () => void
  loading: boolean
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Evitar reinicializaciones innecesarias
    if (isInitialized) {
      return
    }
    
    // Verificar que localStorage esté disponible
    if (typeof window === 'undefined') {
      console.log('🔄 [AUTH] localStorage no disponible (SSR)')
      setLoading(false)
      setIsInitialized(true)
      return
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [AUTH] Inicializando contexto de autenticación...')
    }
    
    // Función para inicializar autenticación
    const initializeAuth = () => {
      try {
        // Verificar si hay usuario guardado en localStorage
        const savedUser = localStorage.getItem('smartesh_user')
        const savedToken = localStorage.getItem('smartesh_token')
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [AUTH] Verificando usuario guardado:', savedUser ? 'Sí' : 'No')
          console.log('🔄 [AUTH] Verificando token guardado:', savedToken ? 'Sí' : 'No')
        }
        
        if (savedUser && savedToken) {
          try {
            const parsedUser = JSON.parse(savedUser)
            if (process.env.NODE_ENV === 'development') {
              console.log('🔄 [AUTH] Usuario parseado correctamente:', parsedUser.name)
            }
            
            // Verificar que el token sea válido usando una verificación simple
            if (savedToken && savedToken.length > 10) {
              // Verificar que el token tenga el formato JWT básico (3 partes separadas por puntos)
              const tokenParts = savedToken.split('.')
              if (tokenParts.length === 3) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ [AUTH] Token válido, estableciendo usuario')
                }
                setUser(parsedUser)
              } else {
                throw new Error('Token format invalid')
              }
            } else {
              throw new Error('Token empty or too short')
            }
          } catch (tokenError) {
            console.error('❌ [AUTH] Token inválido o expirado:', tokenError.message)
            if (process.env.NODE_ENV === 'development') {
              console.log('🧹 [AUTH] Limpiando datos de autenticación...')
            }
            localStorage.removeItem('smartesh_user')
            localStorage.removeItem('smartesh_token')
            localStorage.removeItem('smartesh_cart_temp')
            setUser(null)
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('ℹ️ [AUTH] No hay usuario o token guardado')
          }
          setUser(null)
        }
      } catch (error) {
        console.error('❌ [AUTH] Error parsing saved user:', error)
        if (process.env.NODE_ENV === 'development') {
          console.log('🧹 [AUTH] Limpiando localStorage corrupto...')
        }
        localStorage.removeItem('smartesh_user')
        localStorage.removeItem('smartesh_token')
        localStorage.removeItem('smartesh_cart_temp')
        setUser(null)
      } finally {
        // Siempre establecer loading como false después de verificar
        setLoading(false)
        setIsInitialized(true)
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [AUTH] Contexto inicializado')
        }
      }
    }
    
    // Ejecutar inicialización
    initializeAuth()
  }, [isInitialized])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Usar autenticación real con la API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        const token = data.token
        
        // Validar que los datos son válidos antes de guardar
        if (userData && token) {
          console.log('✅ [AUTH] Datos de login válidos, estableciendo usuario')
          setUser(userData)
          
          // Verificar que localStorage esté disponible antes de guardar
          if (typeof window !== 'undefined') {
            localStorage.setItem('smartesh_user', JSON.stringify(userData))
            localStorage.setItem('smartesh_token', token)
            console.log('✅ [AUTH] Login exitoso con token JWT guardado')
          } else {
            console.log('⚠️ [AUTH] localStorage no disponible, datos no guardados')
          }
          
          return true
        } else {
          console.error('❌ [AUTH] Datos de login inválidos')
          console.error('   - userData:', !!userData)
          console.error('   - token:', !!token)
          return false
        }
      } else {
        console.error('❌ [AUTH] Error del servidor:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('❌ [AUTH] Detalles del error:', errorData)
        return false
      }
    } catch (error) {
      console.error('❌ [AUTH] Error during login:', error)
      if (error instanceof Error) {
        console.error('❌ [AUTH] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      return false
    }
  }

  const register = async (userData: { 
    name: string; 
    email: string; 
    password: string; 
    phone?: string;
    cpf?: string;
    birthDate?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    newsletter?: boolean;
  }): Promise<boolean> => {
    try {
      // Usar registro real con la API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 [AUTH] Datos de respuesta del registro:', data)
        const newUser = data.user
        const token = data.token
        
        // Validar que los datos son válidos antes de guardar
        if (newUser && token) {
          setUser(newUser)
          localStorage.setItem('smartesh_user', JSON.stringify(newUser))
          localStorage.setItem('smartesh_token', token)
          console.log('✅ [AUTH] Registro exitoso con token JWT')
          
          // Forzar actualización del contexto
          setRefreshTrigger(prev => prev + 1)
          
          return true
        } else {
          console.error('❌ [AUTH] Datos de registro inválidos:', { newUser, token })
          return false
        }
      } else {
        const errorData = await response.json()
        console.error('❌ [AUTH] Error del servidor:', response.status, response.statusText)
        console.error('❌ [AUTH] Detalles del error:', errorData)
        alert(`Error al registrar: ${errorData.error}`)
        return false
      }
    } catch (error) {
      console.error('Error during registration:', error)
      alert('Error al conectar con el servidor')
      return false
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      console.log('🔄 [AUTH] Actualizando usuario en contexto:', {
        name: updatedUser.name,
        city: updatedUser.city,
        state: updatedUser.state,
        address: updatedUser.address
      })
      setUser(updatedUser)
      localStorage.setItem('smartesh_user', JSON.stringify(updatedUser))
    }
  }

  const logout = () => {
    console.log('🚪 [AUTH] Cerrando sesión...')
    setUser(null)
    
    // Verificar que localStorage esté disponible antes de limpiar
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smartesh_user')
      localStorage.removeItem('smartesh_token')
      localStorage.removeItem('smartesh_cart_temp')
      console.log('✅ [AUTH] Datos de sesión eliminados')
    } else {
      console.log('⚠️ [AUTH] localStorage no disponible')
    }

    // NO limpiar carritos del localStorage
    // El carrito se mantiene en la base de datos y se restaura al volver a hacer login
    console.log('🛒 Usuario desautenticado, carrito mantenido en BD')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isAdminVendas: user?.role === 'ADMIN_VENDAS',
    isAnyAdmin: user?.role === 'ADMIN' || user?.role === 'ADMIN_VENDAS',
    canManageProducts: user?.role === 'ADMIN' || user?.role === 'ADMIN_VENDAS',
    canManageUsers: user?.role === 'ADMIN',
    canManageSiteSettings: user?.role === 'ADMIN',
    canViewAllOrders: user?.role === 'ADMIN' || user?.role === 'ADMIN_VENDAS',
    canManagePaymentProfiles: user?.role === 'ADMIN' || user?.role === 'ADMIN_VENDAS',
    canViewAllProducts: user?.role === 'ADMIN',
    canManageAllProducts: user?.role === 'ADMIN',
    login,
    register,
    updateUser,
    logout,
    loading,
    isInitialized
  }

  // Debug: Log del estado del contexto (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [AUTH] Context state:', {
      user: user?.name || 'No user',
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      isAdminVendas: user?.role === 'ADMIN_VENDAS',
      canViewAllOrders: user?.role === 'ADMIN' || user?.role === 'ADMIN_VENDAS',
      canManageProducts: user?.role === 'ADMIN' || user?.role === 'ADMIN_VENDAS'
    })
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
