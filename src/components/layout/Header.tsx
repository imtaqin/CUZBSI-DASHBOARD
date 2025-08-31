'use client'

import { useAuth } from '@/context/AuthContext'
import { useRealTimeLogs } from '@/hooks/useRealTimeLogs'
import { 
  BellIcon,
  WifiIcon,
  SignalSlashIcon 
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const { user } = useAuth()
  const { isConnected, logs } = useRealTimeLogs()
  
  // Count recent unread logs (last 10 minutes)
  const recentLogs = logs.filter(log => {
    const logTime = new Date(log.timestamp).getTime()
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000)
    return logTime > tenMinutesAgo
  })

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 lg:pl-12">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-6 sm:leading-7 text-white truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-400 truncate">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Real-time connection status */}
          <div className="hidden md:flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center text-green-600">
                <WifiIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="ml-1 text-xs lg:text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <SignalSlashIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="ml-1 text-xs lg:text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>

          {/* Connection status indicator for mobile */}
          <div className="md:hidden">
            {isConnected ? (
              <WifiIcon className="h-5 w-5 text-green-600" />
            ) : (
              <SignalSlashIcon className="h-5 w-5 text-red-600" />
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
              <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              {recentLogs.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs"
                >
                  {recentLogs.length > 9 ? '9+' : recentLogs.length}
                </Badge>
              )}
            </button>
          </div>

          {/* User info */}
          <div className="hidden sm:flex sm:items-center sm:space-x-2 lg:space-x-3">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400">
                {user?.Roles?.map(role => role.name).join(', ')}
              </p>
            </div>
            <div className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs sm:text-sm font-medium text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}