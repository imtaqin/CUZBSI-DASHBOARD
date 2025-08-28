'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { socketService } from '@/services/socket'
import { useAuth } from '@/context/AuthContext'
import type {
  SyncStartedEvent,
  SyncProgressEvent,
  SyncCompletedEvent,
  SyncErrorEvent
} from '@/types'

export interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning' | 'progress'
  syncId?: string
  progress?: {
    current: number
    total: number
    percentage: number
  }
  data?: unknown
}

export function useRealTimeLogs() {
  const { accessToken } = useAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const logIdCounter = useRef(0)

  const addLog = useCallback((log: Omit<LogEntry, 'id'>) => {
    const newLog: LogEntry = {
      ...log,
      id: `log_${++logIdCounter.current}_${Date.now()}`,
    }
    
    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newLog]
      // Keep only last 1000 logs to prevent memory issues
      return updatedLogs.slice(-1000)
    })
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
    logIdCounter.current = 0
  }, [])

  const connect = useCallback(async () => {
    if (!accessToken || isConnected || isConnecting) return

    try {
      setIsConnecting(true)
      
      await socketService.connect(accessToken)
      
      // Set up event handlers
      socketService.setEventHandlers({
        onConnect: () => {
          setIsConnected(true)
          setIsConnecting(false)
          addLog({
            timestamp: new Date().toISOString(),
            message: 'Connected to real-time sync server',
            type: 'success'
          })
        },
        
        onDisconnect: () => {
          setIsConnected(false)
          addLog({
            timestamp: new Date().toISOString(),
            message: 'Disconnected from sync server',
            type: 'warning'
          })
        },
        
        onSyncStarted: (data: SyncStartedEvent) => {
          addLog({
            timestamp: data.timestamp,
            message: data.message,
            type: 'info',
            syncId: data.syncId,
            data: data
          })
        },
        
        onSyncProgress: (data: SyncProgressEvent) => {
          addLog({
            timestamp: data.timestamp,
            message: data.message,
            type: 'progress',
            syncId: data.syncId,
            progress: data.progress,
            data: data
          })
        },
        
        onSyncCompleted: (data: SyncCompletedEvent) => {
          addLog({
            timestamp: data.timestamp,
            message: data.message,
            type: data.success ? 'success' : 'warning',
            syncId: data.syncId,
            data: data
          })
        },
        
        onSyncError: (data: SyncErrorEvent) => {
          addLog({
            timestamp: data.timestamp,
            message: data.message,
            type: 'error',
            syncId: data.syncId,
            data: data
          })
        },
        
        onBatchSyncStarted: (data: SyncStartedEvent) => {
          addLog({
            timestamp: data.timestamp,
            message: data.message,
            type: 'info',
            syncId: data.syncId,
            data: data
          })
        },
        
        onBatchSyncProgress: (data: SyncProgressEvent) => {
          addLog({
            timestamp: data.timestamp,
            message: data.message,
            type: 'progress',
            syncId: data.syncId,
            progress: data.progress,
            data: data
          })
        },
        
        onBatchSyncCompleted: (data: SyncCompletedEvent) => {
          addLog({
            timestamp: data.timestamp,
            message: data.message,
            type: 'success',
            syncId: data.syncId,
            data: data
          })
        }
      })
      
    } catch (error) {
      setIsConnecting(false)
      addLog({
        timestamp: new Date().toISOString(),
        message: `Failed to connect to sync server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      })
    }
  }, [accessToken, isConnected, isConnecting, addLog])

  const disconnect = useCallback(() => {
    socketService.disconnect()
    setIsConnected(false)
    setIsConnecting(false)
    addLog({
      timestamp: new Date().toISOString(),
      message: 'Manually disconnected from sync server',
      type: 'info'
    })
  }, [addLog])

  // Auto-connect when access token is available
  useEffect(() => {
    if (accessToken && !isConnected && !isConnecting) {
      connect()
    }
  }, [accessToken, isConnected, isConnecting, connect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect()
    }
  }, [])

  return {
    logs,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    clearLogs,
    addLog
  }
}