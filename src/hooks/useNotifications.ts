'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'
import { socketService } from '@/services/socket'
import { useAuth } from '@/context/AuthContext'

export interface ActivityLog {
  id: number
  userId: number
  accountId: number
  action: string
  description: string
  metadata?: Record<string, any>
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed' | 'pending'
  createdAt: string
  updatedAt: string
  Account?: {
    id: number
    accountNumber: string
    accountType: string
  }
}

export interface ActivityStats {
  period: string
  totalCount: number
  statsByAction: Record<string, number>
  statsByStatus: Record<string, number>
}

export interface Notification {
  id?: string
  type: 'transaction' | 'sync' | 'error' | 'success'
  message: string
  timestamp: string
  read?: boolean
  data?: Record<string, any>
  apiId?: number // ID from the API for read status updates
  isRead?: boolean
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  activityLogs: ActivityLog[]
  activityStats: ActivityStats | null
  isLoading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAsUnread: (id: string) => Promise<void>
  markAllAsRead: (accountId?: number) => Promise<void>
  dismissNotification: (id: string) => void
  fetchActivityLogs: (params?: { page?: number; limit?: number; accountId?: number; status?: string }) => Promise<void>
  fetchActivityStats: (period?: string, accountId?: number) => Promise<void>
  clearAll: () => void
}

export function useNotifications(): UseNotificationsReturn {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readNotificationIds, setReadNotificationIds] = useState<Set<number>>(new Set())
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load read notification IDs from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const stored = localStorage.getItem(`notifications_read_${user.id}`)
      if (stored) {
        try {
          setReadNotificationIds(new Set(JSON.parse(stored)))
        } catch (e) {
          console.error('Failed to parse stored read notifications:', e)
        }
      }
    }
  }, [user?.id])

  // Fetch activity logs
  const fetchActivityLogs = useCallback(
    async (params?: { page?: number; limit?: number; accountId?: number; status?: string }) => {
      if (!isAuthenticated) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.getActivityLogs({
          page: params?.page || 1,
          limit: params?.limit || 20,
          accountId: params?.accountId,
          status: params?.status,
        })

        if (response.success && response.data) {
          setActivityLogs(response.data.logs)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity logs'
        setError(errorMessage)
        console.error('Error fetching activity logs:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated]
  )

  // Fetch activity stats
  const fetchActivityStats = useCallback(
    async (period?: string, accountId?: number) => {
      if (!isAuthenticated) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.getActivityStats({
          period: period || '7d',
          accountId,
        })

        if (response.success && response.data) {
          setActivityStats(response.data.data)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity stats'
        setError(errorMessage)
        console.error('Error fetching activity stats:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated]
  )

  // Convert activity logs to notifications
  useEffect(() => {
    if (activityLogs.length > 0) {
      const newNotifications = activityLogs.map((log) => {
        let type: Notification['type'] = 'sync'

        // Determine notification type based on action
        if (log.action.includes('TRANSACTION_RECEIVED')) {
          type = 'transaction'
        } else if (log.action.includes('NOTIFICATION_SENT') || log.action.includes('AUTO_FLAGGED')) {
          type = 'success'
        } else if (log.action.includes('ERROR') || log.action.includes('FAILED')) {
          type = 'error'
        }

        // Check if this notification ID has been marked as read
        const isRead = readNotificationIds.has(log.id)

        const notification: Notification = {
          id: `activity-${log.id}`,
          apiId: log.id, // Store API ID for read status updates
          type,
          message: log.description,
          timestamp: log.createdAt,
          read: isRead,
          isRead: isRead,
          data: log.metadata,
        }

        return notification
      })

      // Only update if we have new notifications
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id))
        const newNotifs = newNotifications.filter(n => !existingIds.has(n.id))
        return [...newNotifs, ...prev].slice(0, 50)
      })
    }
  }, [activityLogs, readNotificationIds])

  // Handle real-time notifications from socket
  useEffect(() => {
    if (!isAuthenticated) return

    // Listen for sync progress
    const handleSyncProgress = (data: any) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        type: 'sync',
        message: data.message || 'Sync in progress...',
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        data,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    }

    // Listen for sync completed
    const handleSyncCompleted = (data: any) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        type: 'success',
        message: data.message || 'Sync completed successfully',
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        data,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))

      // Refresh activity logs when sync is complete
      fetchActivityLogs({ limit: 10 })
      fetchActivityStats()
    }

    // Listen for errors
    const handleSyncError = (data: any) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        type: 'error',
        message: data.message || 'An error occurred during sync',
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        data,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    }

    // Try to connect to socket if not already connected
    if (socketService.isConnected()) {
      socketService.on('sync_progress', handleSyncProgress)
      socketService.on('sync_completed', handleSyncCompleted)
      socketService.on('sync_error', handleSyncError)
      socketService.on('batch_sync_progress', handleSyncProgress)
      socketService.on('batch_sync_completed', handleSyncCompleted)
    }

    // Fetch initial activity logs
    fetchActivityLogs({ limit: 10 })
    fetchActivityStats()

    return () => {
      // Clean up event listeners
      if (socketService.isConnected()) {
        socketService.off('sync_progress', handleSyncProgress)
        socketService.off('sync_completed', handleSyncCompleted)
        socketService.off('sync_error', handleSyncError)
        socketService.off('batch_sync_progress', handleSyncProgress)
        socketService.off('batch_sync_completed', handleSyncCompleted)
      }
    }
  }, [isAuthenticated, fetchActivityLogs, fetchActivityStats])

  const markAsRead = useCallback(
    async (id: string) => {
      const notification = notifications.find(n => n.id === id)
      if (!notification || !notification.apiId) return

      try {
        await apiService.markNotificationAsRead(notification.apiId)

        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read: true, isRead: true } : notif
          )
        )

        // Save to localStorage
        setReadNotificationIds(prev => {
          const updated = new Set(prev)
          updated.add(notification.apiId!)
          if (typeof window !== 'undefined' && user?.id) {
            localStorage.setItem(`notifications_read_${user.id}`, JSON.stringify([...updated]))
          }
          return updated
        })
      } catch (err) {
        console.error('Error marking notification as read:', err)
      }
    },
    [notifications, user?.id]
  )

  const markAsUnread = useCallback(
    async (id: string) => {
      const notification = notifications.find(n => n.id === id)
      if (!notification || !notification.apiId) return

      try {
        await apiService.markNotificationAsUnread(notification.apiId)

        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read: false, isRead: false } : notif
          )
        )

        // Remove from localStorage
        setReadNotificationIds(prev => {
          const updated = new Set(prev)
          updated.delete(notification.apiId!)
          if (typeof window !== 'undefined' && user?.id) {
            localStorage.setItem(`notifications_read_${user.id}`, JSON.stringify([...updated]))
          }
          return updated
        })
      } catch (err) {
        console.error('Error marking notification as unread:', err)
      }
    },
    [notifications, user?.id]
  )

  const markAllAsRead = useCallback(
    async (accountId?: number) => {
      try {
        await apiService.markAllNotificationsAsRead(accountId)

        // Update local state
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true, isRead: true }))
        )

        // Save all notification IDs to localStorage
        setReadNotificationIds(prev => {
          const updated = new Set(prev)
          notifications.forEach(notif => {
            if (notif.apiId) {
              updated.add(notif.apiId)
            }
          })
          if (typeof window !== 'undefined' && user?.id) {
            localStorage.setItem(`notifications_read_${user.id}`, JSON.stringify([...updated]))
          }
          return updated
        })
      } catch (err) {
        console.error('Error marking all notifications as read:', err)
      }
    },
    [notifications, user?.id]
  )

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    activityLogs,
    activityStats,
    isLoading,
    error,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    dismissNotification,
    fetchActivityLogs,
    fetchActivityStats,
    clearAll,
  }
}
