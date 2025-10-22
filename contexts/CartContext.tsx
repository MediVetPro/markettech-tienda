'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { useAuth } from './AuthContext'

interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
  condition: string
  aestheticCondition: number
}

interface CartContextType {
  items: CartItem[]
  cartItems: CartItem[] // Alias para compatibilidad
  totalItems: number
  totalPrice: number
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  
  // Ref para rastrear el usuario actual y evitar cargas duplicadas
  const currentUserIdRef = useRef<string | null>(null)
  const isLoadingRef = useRef(false)

  // Función para cargar el carrito desde la BD
  const loadCartFromDB = async (userId: string) => {
    if (isLoadingRef.current) {
      console.log('🔄 [CART] Ya se está cargando el carrito, ignorando...')
      return
    }

    isLoadingRef.current = true
    setIsLoading(true)
    
    try {
      console.log('🔄 [CART] Cargando carrito para usuario:', userId)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token || token.trim() === '') {
        console.warn('⚠️ [CART] No hay token JWT válido')
        setItems([])
        return
      }

      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [CART] Carrito cargado:', data.items?.length || 0, 'items')
        
        // Solo actualizar si el usuario no ha cambiado
        if (currentUserIdRef.current === userId) {
          setItems(data.items || [])
        } else {
          console.log('⚠️ [CART] Usuario cambió durante la carga, ignorando datos')
        }
      } else {
        console.warn('⚠️ [CART] Error cargando carrito:', response.status)
        setItems([])
      }
    } catch (error) {
      console.warn('⚠️ [CART] Error cargando carrito:', error)
      setItems([])
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }

  // Función para guardar el carrito en la BD
  const saveCartToDB = async (userId: string, cartItems: CartItem[]) => {
    if (isLoadingRef.current) {
      console.log('💾 [CART] Ya se está cargando, ignorando guardado...')
      return
    }

    try {
      console.log('💾 [CART] Guardando carrito para usuario:', userId)
      
      const token = localStorage.getItem('smartesh_token')
      if (!token || token.trim() === '') {
        console.warn('⚠️ [CART] No hay token JWT válido')
        return
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: cartItems })
      })

      if (response.ok) {
        console.log('✅ [CART] Carrito guardado exitosamente')
      } else {
        console.warn('⚠️ [CART] Error guardando carrito:', response.status)
      }
    } catch (error) {
      console.warn('⚠️ [CART] Error guardando carrito:', error)
    }
  }

  // Efecto principal: manejar cambios de usuario
  useEffect(() => {
    const handleUserChange = async () => {
      console.log('🔄 [CART] Cambio de usuario detectado')
      console.log('🔄 [CART] Usuario anterior:', currentUserIdRef.current)
      console.log('🔄 [CART] Usuario actual:', user?.id || 'No user')
      console.log('🔄 [CART] isAuthenticated:', isAuthenticated)

      // Limpiar carrito inmediatamente
      setItems([])
      setIsLoading(false)
      isLoadingRef.current = false

      if (isAuthenticated && user) {
        // Usuario autenticado: cargar su carrito
        currentUserIdRef.current = user.id
        await loadCartFromDB(user.id)
      } else {
        // Usuario no autenticado: cargar desde localStorage temporal
        currentUserIdRef.current = null
        console.log('🔄 [CART] Usuario no autenticado, cargando desde localStorage...')
        
        const tempCart = localStorage.getItem('smartesh_cart_temp')
        if (tempCart) {
          try {
            const cartItems = JSON.parse(tempCart)
            setItems(cartItems)
            console.log('✅ [CART] Carrito temporal cargado:', cartItems.length, 'items')
          } catch (error) {
            console.error('❌ [CART] Error parsing temp cart:', error)
            localStorage.removeItem('smartesh_cart_temp')
            setItems([])
          }
        } else {
          setItems([])
        }
      }
    }

    handleUserChange()
  }, [user?.id, isAuthenticated])

  // Efecto para guardar el carrito cuando cambia
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return
    }

    // Guardar en BD si está autenticado
    if (items.length > 0) {
      saveCartToDB(user.id, items)
    } else if (items.length === 0 && currentUserIdRef.current === user.id) {
      // Si el carrito está vacío, también guardar para limpiar la BD
      saveCartToDB(user.id, [])
    }
  }, [items, isAuthenticated, user, isLoading])

  const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    console.log('➕ [CART] Agregando producto:', product.title)
    
    const newItems = items.find(item => item.id === product.id)
      ? items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [...items, { ...product, quantity }]
    
    setItems(newItems)
    console.log('✅ [CART] Producto agregado')
  }

  const removeFromCart = (productId: string) => {
    console.log('➖ [CART] Removiendo producto:', productId)
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    console.log('🔄 [CART] Actualizando cantidad:', productId, '->', quantity)
    const newItems = items.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    )
    
    setItems(newItems)
  }

  const clearCart = async () => {
    console.log('🧹 [CART] Limpiando carrito')
    setItems([])
    
    if (isAuthenticated && user) {
      try {
        const token = localStorage.getItem('smartesh_token')
        if (token) {
          await fetch('/api/cart', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          console.log('✅ [CART] Carrito limpiado en BD')
        }
      } catch (error) {
        console.warn('⚠️ [CART] Error limpiando carrito:', error)
      }
    } else {
      localStorage.removeItem('smartesh_cart_temp')
      console.log('✅ [CART] Carrito temporal limpiado')
    }
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.id === productId)
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0)

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const value: CartContextType = {
    items,
    cartItems: items, // Alias para compatibilidad
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getTotalPrice: getTotalPrice
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}