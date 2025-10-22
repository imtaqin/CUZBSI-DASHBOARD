'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Button, LoadingPage } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { apiService } from '@/services/api'
import { 
  BanknotesIcon, 
  ArrowPathIcon, 
  FlagIcon,
  BuildingLibraryIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

interface BsiTransaction {
  id: number
  tanggal: string
  description: string
  Amount: string
  type: 'Kredit' | 'Debit'
  Balance: string
  flag?: string
}

interface BsiDashboard {
  totalAccounts: number
  activeAccounts: number
  totalTransactions: number
  todayTransactions: number
  flaggedTransactions: number
  totalBalance: number
  recentTransactions: BsiTransaction[]
}

export default function BsiDashboardPage() {
  const [dashboardData, setDashboardData] = useState<BsiDashboard | null>(null)
  const [transactions, setTransactions] = useState<BsiTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    fetchTransactions()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getBsiDashboard()
      if (response.success) {
        setDashboardData(response.data.dashboard)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch BSI dashboard data')
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await apiService.getBsiTransactions({ limit: 10 })
      if (response.success) {
        setTransactions(response.data.transactions)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch BSI transactions')
    }
  }

  const handleSyncAll = async () => {
    try {
      setIsSyncing(true)
      await apiService.syncAllBsiAccounts()
      // Refresh data after sync
      setTimeout(() => {
        fetchDashboardData()
        fetchTransactions()
        setIsSyncing(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync accounts')
      setIsSyncing(false)
    }
  }

  const handleFlagTransaction = async (transactionId: number) => {
    const flagId = prompt('Enter flag ID:')
    if (flagId) {
      try {
        await apiService.flagBsiTransaction(transactionId, {
          flagId: parseInt(flagId),
          notes: 'Flagged from BSI dashboard'
        })
        fetchTransactions()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to flag transaction')
      }
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="BSI Dashboard" description="BSI transaction management dashboard">
        <LoadingPage text="Loading BSI dashboard..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="BSI Dashboard" description="BSI transaction management dashboard">
      <div className="space-y-4">
        {/* Compact Header with Inline Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BuildingLibraryIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">BSI Dashboard</h2>
                <p className="text-xs text-slate-500">Transaction management</p>
              </div>
            </div>
            <Button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="btn-primary h-9 text-sm"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync All'}
            </Button>
          </div>

          {/* Inline Stats */}
          {dashboardData && (
            <div className="grid grid-cols-4 gap-4 pt-3 border-t border-slate-100">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Accounts</div>
                <div className="text-lg font-semibold text-slate-900">{dashboardData.totalAccounts}</div>
                <div className="text-xs text-emerald-600">{dashboardData.activeAccounts} active</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Transactions</div>
                <div className="text-lg font-semibold text-slate-900">{dashboardData.totalTransactions.toLocaleString()}</div>
                <div className="text-xs text-blue-600">{dashboardData.todayTransactions} today</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Total Balance</div>
                <div className="text-lg font-semibold text-emerald-600">{formatCurrency(dashboardData.totalBalance)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Flagged</div>
                <div className="text-lg font-semibold text-purple-600">{dashboardData.flaggedTransactions}</div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Compact Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Flag</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {!transactions || transactions?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      No BSI transactions found
                    </td>
                  </tr>
                ) : (
                  transactions?.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-xs text-slate-900">
                        {new Date(transaction.tanggal).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-700">
                        <div className="max-w-xs truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          transaction.type === 'Kredit'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`px-4 py-2 text-sm font-medium ${
                        transaction.type === 'Kredit' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.Amount)}
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-700">
                        {formatCurrency(transaction.Balance)}
                      </td>
                      <td className="px-4 py-2">
                        {transaction.flag ? (
                          <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            {transaction.flag}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleFlagTransaction(transaction.id)}
                          className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                        >
                          <FlagIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}