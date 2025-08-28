'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui'
import { socketService } from '@/services/socket'
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  RocketLaunchIcon,
  ClockIcon,
  BanknotesIcon,
  CameraIcon
} from '@heroicons/react/24/outline'

interface SyncLog {
  id: string
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  account?: string
  progress?: number
}

interface SyncNotificationProps {
  isOpen: boolean
  onClose: () => void
  syncType: 'single' | 'all'
  accountName?: string
}

export function SyncNotification({ isOpen, onClose, syncType, accountName }: SyncNotificationProps) {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [isActive, setIsActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStatus, setCurrentStatus] = useState<'starting' | 'syncing' | 'completed' | 'error'>('starting')
  const [stats, setStats] = useState({
    totalAccounts: 0,
    completedAccounts: 0,
    newTransactions: 0,
    errors: 0
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewEnabled, setPreviewEnabled] = useState(false)
  const [screenshotCount, setScreenshotCount] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setLogs([])
      setProgress(0)
      setIsActive(true)
      setCurrentStatus('starting')
      setStats({ totalAccounts: 0, completedAccounts: 0, newTransactions: 0, errors: 0 })
      setPreviewImage(null)
      setPreviewEnabled(true)
      setScreenshotCount(0)
      
      // Connect to Socket.IO for real-time logs with auth token
      const token = localStorage.getItem('token') || ''
      try {
        socketService.connect(token)
      } catch (error) {
        console.log('Failed to connect to Socket.IO, falling back to simulation')
        socketService.connect() // fallback to simulation mode
      }
      
      // Listen for sync events (using the actual backend event names)
      socketService.on('sync_started', handleSyncStarted)
      socketService.on('sync_progress', handleSyncProgress)  
      socketService.on('sync_completed', handleSyncCompleted)
      socketService.on('sync_error', handleSyncError)
      socketService.on('batch_sync_started', handleSyncStarted)
      socketService.on('batch_sync_progress', handleSyncProgress)
      socketService.on('batch_sync_completed', handleSyncCompleted)
      socketService.on('batch_sync_error', handleSyncError)
      
      // Preview events
      socketService.on('automation_preview', handleAutomationPreview)
      socketService.on('automation_preview_stopped', handlePreviewStopped)
      
      // Initial log
      addLog('info', `Starting ${syncType === 'all' ? 'bulk sync for all accounts' : `sync for ${accountName}`}...`)
    }

    return () => {
      if (socketService.isConnected()) {
        socketService.off('sync_started', handleSyncStarted)
        socketService.off('sync_progress', handleSyncProgress)
        socketService.off('sync_log', handleSyncLog)
        socketService.off('sync_completed', handleSyncCompleted)
        socketService.off('sync_error', handleSyncError)
        socketService.off('batch_sync_started', handleSyncStarted)
        socketService.off('batch_sync_progress', handleSyncProgress)
        socketService.off('batch_sync_completed', handleSyncCompleted)
        socketService.off('automation_preview', handleAutomationPreview)
        socketService.off('automation_preview_stopped', handlePreviewStopped)
      }
    }
  }, [isOpen, syncType, accountName])

  const addLog = (level: SyncLog['level'], message: string, account?: string, progress?: number) => {
    const newLog: SyncLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure unique ID
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      account,
      progress
    }
    
    // Prevent duplicate messages
    setLogs(prev => {
      const isDuplicate = prev.some(log => 
        log.message === message && 
        log.account === account && 
        Date.now() - parseInt(log.id.split('-')[0]) < 1000 // Within 1 second
      )
      
      if (isDuplicate) {
        return prev
      }
      
      return [newLog, ...prev].slice(0, 50) // Keep last 50 logs
    })
  }

  const handleSyncStarted = (data: any) => {
    setCurrentStatus('syncing')
    setStats(prev => ({ ...prev, totalAccounts: data.totalAccounts || data.total || 1 }))
    addLog('info', data.message || `Sync started for ${data.totalAccounts || data.total || 1} account(s)`)
  }

  const handleSyncProgress = (data: any) => {
    console.log('Sync progress received:', data)
    
    // Always add the message to logs
    if (data.message) {
      let level: SyncLog['level'] = 'info'
      if (data.message.includes('✅') || data.message.includes('completed') || data.message.includes('success')) {
        level = 'success'
      } else if (data.message.includes('⚠️') || data.message.includes('warning') || data.message.includes('not found')) {
        level = 'warning'
      } else if (data.message.includes('❌') || data.message.includes('error') || data.message.includes('failed')) {
        level = 'error'
      }
      
      addLog(level, data.message, data.account || data.accountName || 'System')
    }
    
    // Handle different progress formats
    let progressValue = 0
    if (data.progress) {
      if (typeof data.progress === 'object' && data.progress.percentage) {
        progressValue = data.progress.percentage
      } else if (typeof data.progress === 'number') {
        progressValue = data.progress
      }
    }
    
    setProgress(progressValue)
    setStats(prev => ({
      ...prev,
      completedAccounts: data.completedAccounts || data.completed || prev.completedAccounts,
      newTransactions: data.newTransactions || data.transactions || prev.newTransactions
    }))
  }

  const handleSyncLog = (data: any) => {
    // All progress messages are essentially logs
    const level = data.level || (data.message?.includes('Error') || data.message?.includes('Failed') ? 'error' : 'info')
    addLog(level, data.message, data.account || data.accountName)
    
    if (level === 'error') {
      setStats(prev => ({ ...prev, errors: prev.errors + 1 }))
    }
  }

  const handleSyncCompleted = (data: any) => {
    setCurrentStatus('completed')
    setIsActive(false)
    setProgress(100)
    const newTransactions = data.newTransactions || data.transactions || 0
    setStats(prev => ({
      ...prev,
      completedAccounts: data.completedAccounts || data.completed || prev.totalAccounts,
      newTransactions: newTransactions
    }))
    
    addLog('success', data.message || `Sync completed successfully! Found ${newTransactions} new transactions`)
  }

  const handleSyncError = (data: any) => {
    setCurrentStatus('error')
    setIsActive(false)
    addLog('error', data.message || 'Sync failed with unknown error')
    setStats(prev => ({ ...prev, errors: prev.errors + 1 }))
  }

  const handleAutomationPreview = (data: any) => {
    console.log('Automation preview data:', data)
    if (data.image) {
      // Remove data:image/png;base64, prefix if present
      const imageData = data.image.replace('data:image/png;base64,', '')
      setPreviewImage(imageData)
      setPreviewEnabled(true)
      setScreenshotCount(prev => prev + 1)
      
      // Add log entry for first screenshot
     
    }
  }

  const handlePreviewStopped = (data: any) => {
    setPreviewEnabled(false)
    addLog('info', data.message || `📸 Screenshot preview stopped - captured ${screenshotCount} screenshots`)
  }

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'starting':
      case 'syncing':
        return <RocketLaunchIcon className="h-6 w-6 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />
    }
  }

  const getLogIcon = (level: SyncLog['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XMarkIcon className="h-4 w-4 text-red-500" />
      default:
        return <InformationCircleIcon className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'completed':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'syncing':
        return 'text-blue-400'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={currentStatus === 'syncing' ? () => {} : onClose} // Prevent closing during sync
      title="Sync Progress"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Status */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {getStatusIcon()}
              <div className="ml-3">
                <h3 className={`text-lg font-medium ${getStatusColor()}`}>
                  {currentStatus === 'starting' && 'Starting Sync...'}
                  {currentStatus === 'syncing' && 'Syncing in Progress...'}
                  {currentStatus === 'completed' && 'Sync Completed Successfully'}
                  {currentStatus === 'error' && 'Sync Failed'}
                </h3>
                <p className="text-sm text-slate-400">
                  {syncType === 'all' ? 'All Accounts' : accountName}
                </p>
              </div>
            </div>
            
            {currentStatus !== 'syncing' && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isActive && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.completedAccounts}</div>
              <div className="text-xs text-slate-400">Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.newTransactions}</div>
              <div className="text-xs text-slate-400">New Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.errors}</div>
              <div className="text-xs text-slate-400">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{logs.length}</div>
              <div className="text-xs text-slate-400">Log Entries</div>
            </div>
          
          </div>
        </div>

        {/* Real-time Screenshot Preview */}
        {(previewEnabled || previewImage) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-300 flex items-center">
                <CameraIcon className="h-4 w-4 mr-2 text-green-400" />
                Live Automation Preview
              </h4>
              <div className="flex items-center text-xs text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live • {screenshotCount} captures
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
              <div className="relative min-h-48 flex items-center justify-center">
                {previewImage ? (
                  <img
                    src={`data:image/png;base64,${previewImage}`}
                    alt="Real-time automation preview"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Waiting for screenshots...</p>
                    <p className="text-xs">Preview will appear when automation starts</p>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  📸 {previewImage ? 'Live Preview' : 'Waiting...'}
                </div>
                {!isActive && previewImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-600">
                      <span className="text-sm text-slate-300">Preview Stopped</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-800 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Capturing every 0.5 seconds</span>
                  <span>Total: {screenshotCount} screenshots</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Logs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-300">Real-time Logs</h4>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="bg-slate-900 rounded-lg border border-slate-700 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <ClockIcon className="h-8 w-8 mx-auto mb-2" />
                <p>Waiting for sync logs...</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-3 py-2 px-3 rounded hover:bg-slate-800 transition-colors"
                  >
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white">{log.message}</p>
                        <span className="text-xs text-slate-500">{log.timestamp}</span>
                      </div>
                      {log.account && (
                        <p className="text-xs text-slate-400 mt-1">Account: {log.account}</p>
                      )}
                      {log.progress !== undefined && (
                        <div className="mt-2">
                          <div className="w-full bg-slate-700 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all"
                              style={{ width: `${log.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-600">
          {currentStatus === 'syncing' ? (
            <div className="flex items-center text-sm text-slate-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Sync in progress... Please wait
            </div>
          ) : (
            <>
              <button
                onClick={() => setLogs([])}
                className="px-4 py-2 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
              >
                Clear Logs
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {currentStatus === 'completed' ? 'Done' : 'Close'}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}