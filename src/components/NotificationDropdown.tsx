'use client'

import { useEffect, useRef, useState } from 'react'
import { useNotifications, type Notification } from '@/hooks/useNotifications'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, dismissNotification, clearAll, markAllAsRead, isLoading, error } = useNotifications()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const getNotificationBgClass = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-slate-50 border-l-4 border-green-500'
      case 'error':
        return 'bg-slate-50 border-l-4 border-red-500'
      case 'transaction':
        return 'bg-slate-50 border-l-4 border-slate-400'
      case 'sync':
        return 'bg-slate-50 border-l-4 border-slate-400'
      default:
        return 'bg-slate-50 border-l-4 border-slate-300'
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '⚠️'
      case 'transaction':
        return '💳'
      case 'sync':
        return '🔄'
      default:
        return '📢'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 z-50 mt-2 w-96 origin-top-right rounded-lg bg-white shadow-lg border border-slate-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  setIsMarkingAllRead(true)
                  await markAllAsRead()
                  setIsMarkingAllRead(false)
                }}
                disabled={isMarkingAllRead}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 disabled:text-slate-400 transition-colors"
                title="Mark all as read"
              >
                {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
              </button>
            )}
            <button
              onClick={clearAll}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-5 w-5 border-2 border-slate-400 border-t-slate-900 rounded-full" />
          </div>
        ) : error && notifications.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-slate-600">No notifications yet</p>
            <p className="text-xs text-slate-500 mt-1">You'll see transaction alerts and sync updates here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-slate-100 transition-colors group ${getNotificationBgClass(notification.type)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-lg mt-0.5 flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatTime(notification.timestamp)}</p>
                      {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="mt-2 text-xs space-y-0.5 text-slate-700">
                          {notification.data.amount && (
                            <p>
                              <span className="font-medium">Amount:</span> {notification.data.amount}
                            </p>
                          )}
                          {notification.data.flag && (
                            <p>
                              <span className="font-medium">Flag:</span> {notification.data.flag}
                            </p>
                          )}
                          {notification.data.senderName && (
                            <p>
                              <span className="font-medium">From:</span> {notification.data.senderName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (notification.id) dismissNotification(notification.id)
                    }}
                    className="p-1 hover:bg-slate-300 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Dismiss"
                  >
                    <XMarkIcon className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-2">
          <a
            href="/admin/activity-logs"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            View all activity →
          </a>
        </div>
      )}
    </div>
  )
}
