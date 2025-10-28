'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Button, Input, LoadingPage } from '@/components/ui'
import { apiService } from '@/services/api'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface WhatsAppLog {
  id: number
  transactionId?: number
  phoneNumber: string
  message: string
  status: 'pending' | 'sent' | 'failed'
  response?: Record<string, any>
  errorMessage?: string
  sentAt?: string
  metadata?: {
    flag?: string
    type?: string
    amount?: number | string
    senderName?: string
    templateUsed?: string
  }
  createdAt: string
  updatedAt: string
  Transaction?: {
    id: number
    FTNumber: string
    Amount: number
    description?: string
  }
}

interface WhatsAppStats {
  period: string
  statistics: {
    total: number
    sent: number
    failed: number
    pending: number
    successRate: string
  }
}

export default function WhatsAppLogsPage() {
  const [logs, setLogs] = useState<WhatsAppLog[]>([])
  const [stats, setStats] = useState<WhatsAppStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'sent' | 'failed'>('all')
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [total, setTotal] = useState(0)
  const [retryingId, setRetryingId] = useState<number | null>(null)

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [page, selectedStatus, selectedPeriod, searchQuery])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getWhatsAppLogs({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        phoneNumber: searchQuery || undefined,
        period: selectedPeriod,
        limit,
        offset: (page - 1) * limit
      })

      if (response.success && response.data) {
        setLogs(response.data.logs || [])
        setTotal(response.data.total || 0)
      } else {
        setError(response.message || 'Failed to fetch logs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiService.getWhatsAppStats({ period: selectedPeriod })
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleRetry = async (id: number) => {
    try {
      setRetryingId(id)
      const response = await apiService.retryWhatsAppMessage(id)
      if (response.success) {
        setSuccess('Message retry queued successfully')
        fetchLogs()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry message')
    } finally {
      setRetryingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Sent</span>
          </div>
        )
      case 'failed':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700">
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Failed</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-700">
            <ClockIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Pending</span>
          </div>
        )
      default:
        return null
    }
  }

  const pages = Math.ceil(total / limit)

  if (isLoading && logs.length === 0) {
    return (
      <AdminLayout title="WhatsApp Logs" description="Monitor WhatsApp message delivery">
        <LoadingPage text="Loading WhatsApp logs..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="WhatsApp Logs" description="Monitor WhatsApp message delivery">
      <div className="space-y-2 sm:space-y-3 lg:space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">WhatsApp Logs</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Monitor WhatsApp message delivery and status</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 lg:gap-3">
            <div className="bg-white rounded border border-slate-200 p-2 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase truncate">Total</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mt-0.5">{stats.statistics.total}</p>
            </div>

            <div className="bg-white rounded border border-slate-200 p-2 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase truncate">Sent</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-green-600 mt-0.5">{stats.statistics.sent}</p>
            </div>

            <div className="bg-white rounded border border-slate-200 p-2 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase truncate">Failed</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-red-600 mt-0.5">{stats.statistics.failed}</p>
            </div>

            <div className="bg-white rounded border border-slate-200 p-2 shadow-sm sm:col-span-1">
              <p className="text-xs font-medium text-slate-500 uppercase truncate">Pending</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-yellow-600 mt-0.5">{stats.statistics.pending}</p>
            </div>

            <div className="bg-white rounded border border-slate-200 p-2 shadow-sm sm:col-span-1">
              <p className="text-xs font-medium text-slate-500 uppercase truncate">Rate</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-blue-600 mt-0.5">{stats.statistics.successRate}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg">
            <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg">
            <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded border border-slate-200 p-2 sm:p-2.5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-7 pr-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as any)
                  setPage(1)
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Period Filter */}
            <div>
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value)
                  setPage(1)
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">24h</option>
                <option value="7d">7d</option>
                <option value="30d">30d</option>
                <option value="90d">90d</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table/Cards */}
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs sm:text-sm text-slate-600">No WhatsApp logs found</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-2.5 py-2 font-semibold text-slate-900">Phone</th>
                      <th className="text-left px-2.5 py-2 font-semibold text-slate-900">Message</th>
                      <th className="text-left px-2.5 py-2 font-semibold text-slate-900">Status</th>
                      <th className="text-left px-2.5 py-2 font-semibold text-slate-900">Amount</th>
                      <th className="text-left px-2.5 py-2 font-semibold text-slate-900">Date</th>
                      <th className="text-center px-2.5 py-2 font-semibold text-slate-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const amount = log.metadata?.amount || log.Transaction?.Amount
                      return (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-2.5 py-1.5 font-mono text-slate-900 whitespace-nowrap">{log.phoneNumber}</td>
                          <td className="px-2.5 py-1.5 text-slate-700 line-clamp-1 max-w-xs">{log.message}</td>
                          <td className="px-2.5 py-1.5">{getStatusBadge(log.status)}</td>
                          <td className="px-2.5 py-1.5 text-slate-900 whitespace-nowrap">
                            {amount ? `Rp ${Number(amount).toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="px-2.5 py-1.5 text-slate-600 whitespace-nowrap text-xs">
                            {new Date(log.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-2.5 py-1.5 text-center">
                            {log.status === 'failed' && (
                              <button
                                onClick={() => handleRetry(log.id)}
                                disabled={retryingId === log.id}
                                className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 whitespace-nowrap"
                              >
                                {retryingId === log.id ? '...' : 'Retry'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-slate-100">
                {logs.map((log) => {
                  const amount = log.metadata?.amount || log.Transaction?.Amount
                  return (
                    <div key={log.id} className="p-2.5 space-y-1.5">
                      {/* Row 1: Phone & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono font-semibold text-slate-900 truncate">{log.phoneNumber}</p>
                        </div>
                        <div className="flex-shrink-0">{getStatusBadge(log.status)}</div>
                      </div>

                      {/* Row 2: Message */}
                      <div className="bg-slate-50 rounded p-1.5 border border-slate-100">
                        <p className="text-xs text-slate-700 break-words whitespace-pre-wrap max-h-16 overflow-hidden line-clamp-2">{log.message}</p>
                      </div>

                      {/* Row 3: Amount & Date */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">
                          {amount ? `Rp ${Number(amount).toLocaleString('id-ID')}` : '-'}
                        </span>
                        <span className="text-slate-500">{new Date(log.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>

                      {/* Row 4: Metadata & Action */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1 flex-wrap">
                          {log.metadata?.flag && (
                            <span className="inline-block text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              {log.metadata.flag}
                            </span>
                          )}
                          {log.metadata?.senderName && (
                            <span className="inline-block text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded truncate max-w-xs">
                              {log.metadata.senderName}
                            </span>
                          )}
                        </div>
                        {log.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(log.id)}
                            disabled={retryingId === log.id}
                            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                          >
                            {retryingId === log.id ? '...' : 'Retry'}
                          </button>
                        )}
                      </div>

                      {/* Error Message if exists */}
                      {log.errorMessage && (
                        <div className="bg-red-50 border border-red-100 rounded p-1.5 text-xs text-red-700 break-words">
                          Error: {log.errorMessage}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-2 py-2 text-xs">
            <p className="text-slate-600">
              {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)} / {total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="flex items-center px-1.5 font-medium text-slate-700">
                {page}/{pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="p-1 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
