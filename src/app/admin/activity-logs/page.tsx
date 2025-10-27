'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { useNotifications } from '@/hooks/useNotifications'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

type ActionType = 'TRANSACTION_RECEIVED' | 'NOTIFICATION_SENT' | 'TRANSACTION_AUTO_FLAGGED' | 'NOTIFICATION_ERROR' | 'all'
type StatusType = 'success' | 'failed' | 'pending' | 'all'

export default function ActivityLogsPage() {
  const { activityLogs, activityStats, fetchActivityLogs, isLoading } = useNotifications()
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState<ActionType>('all')
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('all')

  // Fetch logs on mount and when filters change
  useEffect(() => {
    fetchActivityLogs({
      page,
      limit,
      action: selectedAction !== 'all' ? selectedAction : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    })
  }, [page, limit, selectedAction, selectedStatus, fetchActivityLogs])

  const getActionIcon = (action: string) => {
    const iconProps = 'h-5 w-5'

    if (action.includes('TRANSACTION_RECEIVED')) {
      return <CreditCardIcon className={`${iconProps} text-blue-600`} />
    } else if (action.includes('NOTIFICATION_SENT')) {
      return <CheckCircleIcon className={`${iconProps} text-green-600`} />
    } else if (action.includes('AUTO_FLAGGED')) {
      return <ArrowPathIcon className={`${iconProps} text-purple-600`} />
    } else if (action.includes('ERROR') || action.includes('FAILED')) {
      return <ExclamationTriangleIcon className={`${iconProps} text-red-600`} />
    }

    return <CheckCircleIcon className={`${iconProps} text-slate-600`} />
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const filteredLogs = activityLogs.filter((log) =>
    log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout title="Activity Logs">
      <div className="space-y-6">
        {/* Stats Cards */}
        {activityStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Activities</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{activityStats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Read</p>
                  <p className="text-2xl font-semibold text-green-600 mt-1">{activityStats.read}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Unread</p>
                  <p className="text-2xl font-semibold text-red-600 mt-1">{activityStats.unread}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Read Rate</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{activityStats.readPercentage}%</p>
                </div>
                <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <ArrowPathIcon className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FunnelIcon className="h-4 w-4 inline mr-1" />
                  Action Type
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value as ActionType)
                    setPage(1)
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Actions</option>
                  <option value="TRANSACTION_RECEIVED">Transaction Received</option>
                  <option value="NOTIFICATION_SENT">Notification Sent</option>
                  <option value="TRANSACTION_AUTO_FLAGGED">Auto Flagged</option>
                  <option value="NOTIFICATION_ERROR">Error</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as StatusType)
                    setPage(1)
                  }}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {isLoading && activityLogs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-slate-400 border-t-slate-900 rounded-full" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No activity logs found</p>
                <p className="text-sm text-slate-500">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Action</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Account</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="text-xs font-medium text-slate-700">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900 line-clamp-2">{log.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {log.Account?.accountNumber}
                          {log.Account && (
                            <p className="text-xs text-slate-500">{log.Account.accountType}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(log.status)}`}
                        >
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {new Date(log.createdAt).toLocaleDateString()}
                          <p className="text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, activityLogs.length)} of {activityLogs.length} activities
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={filteredLogs.length < limit}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
