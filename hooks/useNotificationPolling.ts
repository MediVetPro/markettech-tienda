'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: string
  read: boolean
  createdAt: string
  order?: {
    id: string
    status: string
    total: number
    customerName: string
    items?: any[]
  }
}

interface UseNotificationPollingReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export function useNotificationPolling(intervalMs: number = 60000): UseNotificationPollingReturn {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id || isPollingRef.current) {
      return
    }

    isPollingRef.current = true
    console.log('🔔 [POLLING] Loading notifications for user:', user.id)
    
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) {
        console.log('🔔 [POLLING] No token found, skipping notification load')
        return
      }

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔔 [POLLING] Notifications loaded:', data.notifications?.length || 0, 'unread:', data.unreadCount || 0)
        
        setNotifications(prev => {
          // Solo actualizar si hay cambios
          const newNotifications = data.notifications || []
          const hasChanges = JSON.stringify(prev) !== JSON.stringify(newNotifications)
          
          if (hasChanges) {
            console.log('🔔 [POLLING] Notifications updated')
            return newNotifications
          }
          
          return prev
        })
        
        setUnreadCount(data.unreadCount || 0)
      } else {
        console.error('🔔 [POLLING] Failed to load notifications:', response.status)
      }
    } catch (error) {
      console.error('🔔 [POLLING] Error loading notifications:', error)
    } finally {
      isPollingRef.current = false
    }
  }, [isAuthenticated, user?.id])

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true)
    await loadNotifications()
    setIsLoading(false)
  }, [loadNotifications])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) return

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
          return updated
        })
        
        setUnreadCount(prev => Math.max(0, prev - 1))
        console.log('🔔 [POLLING] Notification marked as read:', notificationId)
      }
    } catch (error) {
      console.error('🔔 [POLLING] Error marking notification as read:', error)
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) return

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => {
          const notification = prev.find(n => n.id === notificationId)
          const updated = prev.filter(n => n.id !== notificationId)
          
          // Decrementar contador si la notificación no estaba leída
          if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
          
          return updated
        })
        console.log('🔔 [POLLING] Notification deleted:', notificationId)
      }
    } catch (error) {
      console.error('🔔 [POLLING] Error deleting notification:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('smartesh_token')
      if (!token) return

      console.log('🔔 [POLLING] Marking all notifications as read...')
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('🔔 [POLLING] Mark all read result:', result)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
        console.log('🔔 [POLLING] All notifications marked as read')
      } else {
        const errorData = await response.json()
        console.error('🔔 [POLLING] Error response:', errorData)
      }
    } catch (error) {
      console.error('🔔 [POLLING] Error marking all notifications as read:', error)
    }
  }, [])

  // Iniciar polling cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('🔔 [POLLING] Starting notification polling every', intervalMs, 'ms')
      
      // Cargar notificaciones inmediatamente
      loadNotifications()
      
      // Configurar polling
      intervalRef.current = setInterval(() => {
        console.log('🔔 [POLLING] Polling notifications...')
        loadNotifications()
      }, intervalMs)
    } else {
      console.log('🔔 [POLLING] User not authenticated, stopping polling')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        console.log('🔔 [POLLING] Cleaning up notification polling')
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAuthenticated, user?.id, intervalMs, loadNotifications])

  // Limpiar cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead
  }
}
