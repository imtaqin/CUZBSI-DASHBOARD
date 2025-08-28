'use client'

import { io, Socket } from 'socket.io-client'
import type {
  SyncEvent,
  SyncStartedEvent,
  SyncProgressEvent,
  SyncCompletedEvent,
  SyncErrorEvent
} from '@/types'

export interface SocketEventHandlers {
  onConnect?: () => void
  onDisconnect?: () => void
  onSyncStarted?: (data: SyncStartedEvent) => void
  onSyncProgress?: (data: SyncProgressEvent) => void
  onSyncCompleted?: (data: SyncCompletedEvent) => void
  onSyncError?: (data: SyncErrorEvent) => void
  onBatchSyncStarted?: (data: SyncStartedEvent) => void
  onBatchSyncProgress?: (data: SyncProgressEvent) => void
  onBatchSyncCompleted?: (data: SyncCompletedEvent) => void
}

type EventHandler = (data: any) => void

interface SocketEvents {
  [event: string]: EventHandler[]
}

class SocketService {
  private socket: Socket | null = null
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5543'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private handlers: SocketEventHandlers = {}
  private events: SocketEvents = {}
  private connected = false
  private simulatedEvents: any = null

  connect(token?: string): Promise<Socket> | void {
    // For demo purposes, simulate connection without real Socket.IO
    if (!token) {
      this.connected = true
      console.log('🔌 Connected to Socket.IO (simulated)')
      return
    }
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket)
        return
      }

      this.socket = io(this.baseURL, {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      })

      this.socket.on('connect', () => {
        console.log('🔌 Connected to Socket.IO:', this.socket?.id)
        this.reconnectAttempts = 0
        this.handlers.onConnect?.()
        resolve(this.socket!)
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        this.reconnectAttempts++
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to Socket.IO server after multiple attempts'))
        }
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        this.handlers.onDisconnect?.()
      })

      // Sync events - bridge to our event system
      this.socket.on('sync_started', (data: SyncStartedEvent) => {
        console.log(`🚀 Sync Started: ${data.message}`)
        this.handlers.onSyncStarted?.(data)
        this.emit('sync_started', data) // Bridge to our event system
      })

      this.socket.on('sync_progress', (data: SyncProgressEvent) => {
        console.log(`⏳ ${data.message}`)
        this.handlers.onSyncProgress?.(data)
        this.emit('sync_progress', data) // Bridge to our event system
      })

      this.socket.on('sync_completed', (data: SyncCompletedEvent) => {
        console.log(`✅ Completed: ${data.message}`)
        this.handlers.onSyncCompleted?.(data)
        this.emit('sync_completed', data) // Bridge to our event system
      })

      this.socket.on('sync_error', (data: SyncErrorEvent) => {
        console.log(`❌ Error: ${data.message}`)
        this.handlers.onSyncError?.(data)
        this.emit('sync_error', data) // Bridge to our event system
      })

      // Batch sync events - bridge to our event system
      this.socket.on('batch_sync_started', (data: SyncStartedEvent) => {
        console.log(`🎯 Batch Started: ${data.message}`)
        this.handlers.onBatchSyncStarted?.(data)
        this.emit('batch_sync_started', data) // Bridge to our event system
      })

      this.socket.on('batch_sync_progress', (data: SyncProgressEvent) => {
        if (data.progress) {
          console.log(`📊 Progress (${data.progress.percentage}%): ${data.message}`)
        } else {
          console.log(`⏳ ${data.message}`)
        }
        this.handlers.onBatchSyncProgress?.(data)
        this.emit('batch_sync_progress', data) // Bridge to our event system
      })

      this.socket.on('batch_sync_completed', (data: SyncCompletedEvent) => {
        console.log(`🎉 Batch Completed: ${data.message}`)
        this.handlers.onBatchSyncCompleted?.(data)
        this.emit('batch_sync_completed', data) // Bridge to our event system
      })

      // Screenshot preview events
      this.socket.on('automation_preview', (data: any) => {
        console.log(`📸 Screenshot: ${data.message}`)
        this.emit('automation_preview', data)
      })

      this.socket.on('automation_preview_stopped', (data: any) => {
        console.log(`📸 Preview Stopped: ${data.message}`)
        this.emit('automation_preview_stopped', data)
      })

      // Batch sync error
      this.socket.on('batch_sync_error', (data: any) => {
        console.log(`❌ Batch Error: ${data.message}`)
        this.emit('batch_sync_error', data)
      })
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('Socket disconnected manually')
    }
  }

  isConnected(): boolean {
    return this.connected || this.socket?.connected ?? false
  }

  // Simple event system for our notification component
  on(event: string, handler: EventHandler) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  off(event: string, handler: EventHandler) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(h => h !== handler)
    }
  }

  emit(event: string, data: any) {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(data))
    }
  }

  setEventHandlers(handlers: SocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers }
  }

  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_room', room)
    }
  }

  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', room)
    }
  }

  // Get current socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket
  }

  // Simulate sync events for testing
  simulateSync(syncType: 'single' | 'all', accountName?: string) {
    if (!this.isConnected()) return

    // Clear any existing simulation
    if (this.simulatedEvents) {
      clearTimeout(this.simulatedEvents)
    }

    const totalAccounts = syncType === 'all' ? 3 : 1
    let currentAccount = 0
    let totalTransactions = 0

    // Start sync
    setTimeout(() => {
      this.emit('sync:started', { totalAccounts })
    }, 100)

    // Progress updates
    const progressSteps = [
      { progress: 10, message: 'Connecting to BSI servers...', delay: 500 },
      { progress: 25, message: 'Authenticating credentials...', delay: 800 },
      { progress: 40, message: 'Fetching account information...', delay: 1200 },
      { progress: 60, message: 'Downloading transaction data...', delay: 1800 },
      { progress: 75, message: 'Processing transactions...', delay: 2300 },
      { progress: 90, message: 'Validating data integrity...', delay: 2800 },
      { progress: 100, message: 'Sync completed successfully!', delay: 3200 }
    ]

    progressSteps.forEach(step => {
      setTimeout(() => {
        const newTransactions = Math.floor(Math.random() * 5) + 1
        totalTransactions += newTransactions

        if (step.progress === 100) {
          currentAccount = totalAccounts
        } else if (step.progress > 60) {
          currentAccount = Math.min(totalAccounts, Math.floor((step.progress - 40) / 20) + 1)
        }

        this.emit('sync:progress', {
          progress: step.progress,
          message: step.message,
          account: accountName || `Account ${currentAccount + 1}`,
          completedAccounts: currentAccount,
          newTransactions: totalTransactions
        })

        // Add some log entries
        if (step.progress === 25) {
          this.emit('sync:log', {
            level: 'info',
            message: `Successfully authenticated with BSI`,
            account: accountName || `Account ${currentAccount + 1}`
          })
        }
        
        if (step.progress === 75) {
          this.emit('sync:log', {
            level: 'success',
            message: `Found ${newTransactions} new transactions`,
            account: accountName || `Account ${currentAccount + 1}`
          })
        }

        if (step.progress === 90) {
          this.emit('sync:log', {
            level: 'warning',
            message: `Duplicate transaction detected and skipped`,
            account: accountName || `Account ${currentAccount + 1}`
          })
        }

        if (step.progress === 100) {
          this.emit('sync:completed', {
            completedAccounts: totalAccounts,
            newTransactions: totalTransactions
          })
        }
      }, step.delay)
    })

    // Simulate some random log entries during sync
    const logMessages = [
      { level: 'info', message: 'Parsing transaction CSV data...', delay: 1000 },
      { level: 'info', message: 'Checking for existing transactions...', delay: 1500 },
      { level: 'success', message: 'Transaction data validated successfully', delay: 2000 },
      { level: 'info', message: 'Updating account balance...', delay: 2500 }
    ]

    logMessages.forEach(log => {
      setTimeout(() => {
        this.emit('sync:log', {
          level: log.level,
          message: log.message,
          account: accountName || `Account 1`
        })
      }, log.delay)
    })
  }
}

// Create singleton instance
export const socketService = new SocketService()

// Hook for React components
export function useSocket() {
  return socketService
}

export default socketService