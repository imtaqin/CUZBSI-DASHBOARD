'use client'

import { useState, useEffect, useRef } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { useRealTimeLogs } from '@/hooks/useRealTimeLogs'
import { formatRelativeTime } from '@/lib/utils'
import { apiService } from '@/services/api'
import {
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ArrowDownIcon,
  WifiIcon,
  SignalSlashIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function RealTimeLogsPage() {
  const { 
    logs, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect, 
    clearLogs 
  } = useRealTimeLogs()
  
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [accounts, setAccounts] = useState<any[]>([])
  
  const logsEndRef = useRef<HTMLDivElement>(null)
  const logsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (isAutoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isAutoScroll])

  const fetchAccounts = async () => {
    try {
      const response = await apiService.getAccounts()
      if (response.success) {
        setAccounts(response.data.accounts)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    }
  }

  const handleSyncAccount = async (accountId: number) => {
    try {
      await apiService.syncAccount(accountId)
    } catch (error) {
      console.error('Failed to start sync:', error)
    }
  }

  const handleSyncAll = async () => {
    try {
      await apiService.syncAllAccounts()
    } catch (error) {
      console.error('Failed to start batch sync:', error)
    }
  }

  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 10
      setIsAutoScroll(isScrolledToBottom)
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return log.type === filter
  })

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
      case 'progress':
        return <ChartBarIcon className="h-4 w-4 text-blue-500" />
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getLogBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'success'
      case 'error': return 'destructive'
      case 'warning': return 'warning'
      case 'progress': return 'info'
      default: return 'secondary'
    }
  }

  return (
    <AdminLayout
      title="Real-time Logs"
      description="Monitor BSI sync operations and system events in real-time"
    >
      <div className="space-y-6">
        {/* Connection Status & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {isConnected ? (
                  <WifiIcon className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <SignalSlashIcon className="h-5 w-5 text-red-600 mr-2" />
                )}
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge 
                    variant={isConnected ? 'success' : 'destructive'}
                    className="mb-2"
                  >
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {isConnected 
                      ? 'Receiving real-time updates' 
                      : isConnecting 
                        ? 'Connecting...' 
                        : 'Not connected to sync server'
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  {isConnected ? (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={disconnect}
                    >
                      <PauseIcon className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={connect}
                      loading={isConnecting}
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RocketLaunchIcon className="h-5 w-5 text-blue-600 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={handleSyncAll}
                  disabled={!isConnected}
                >
                  Sync All Accounts
                </Button>
                <div className="text-xs text-gray-500">
                  {accounts.length} accounts available
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
                  <div className="text-gray-500">Total Logs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {logs.filter(l => l.type === 'error').length}
                  </div>
                  <div className="text-gray-500">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sync Logs</CardTitle>
              <div className="flex items-center space-x-2">
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="all">All Logs</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="progress">Progress</option>
                </select>

                {/* Auto-scroll toggle */}
                <Button
                  variant={isAutoScroll ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsAutoScroll(!isAutoScroll)}
                >
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  Auto-scroll
                </Button>

                {/* Clear logs */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearLogs}
                  disabled={logs.length === 0}
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div 
              ref={logsContainerRef}
              onScroll={handleScroll}
              className="h-96 overflow-y-auto bg-gray-900 text-gray-100 font-mono text-sm"
            >
              <div className="p-4 space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    {filter === 'all' ? 'No logs yet' : `No ${filter} logs`}
                    <div className="text-xs mt-1">
                      {!isConnected && 'Connect to start receiving logs'}
                    </div>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start space-x-3 p-2 rounded hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getLogIcon(log.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={getLogBadgeVariant(log.type)}
                              className="text-xs"
                            >
                              {log.type.toUpperCase()}
                            </Badge>
                            {log.syncId && (
                              <span className="text-xs text-gray-400">
                                {log.syncId}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(log.timestamp)}
                          </span>
                        </div>
                        
                        <div className="mt-1 text-gray-100">
                          {log.message}
                        </div>
                        
                        {log.progress && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{log.progress.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${log.progress.percentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {log.progress.current} / {log.progress.total} completed
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Quick Actions */}
        {accounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Account Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts.slice(0, 6).map((account) => (
                  <Button
                    key={account.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncAccount(account.id)}
                    disabled={!isConnected}
                    className="justify-start"
                  >
                    <RocketLaunchIcon className="h-4 w-4 mr-2" />
                    {account.accountNumber} ({account.Bank.code})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}