'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { LoadingPage } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { apiService } from '@/services/api'
import type { DashboardData } from '@/types'
import {
  BuildingLibraryIcon,
  CreditCardIcon,
  FlagIcon,
  BanknotesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await apiService.getDashboard()

      if (response.success) {
        setData(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard" description="Overview of your BSI transaction system">
        <LoadingPage text="Loading dashboard..." />
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard" description="Overview of your BSI transaction system">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) return null

  const { stats, chartData, recentTransactions } = data

  return (
    <AdminLayout
      title="Dashboard"
      description="Overview of your transaction management system"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Total Accounts
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalAccounts}</p>
                <p className="text-xs text-emerald-600 mt-0.5 font-medium">{stats.activeAccounts} active</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CreditCardIcon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalTransactions.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-0.5 font-medium">{stats.todayTransactions} today</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <BanknotesIcon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Total Balance
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalBalance)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FlagIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Flagged
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.flaggedTransactions}</p>
                <p className="text-xs text-purple-600 mt-0.5 font-medium">
                  {stats.newFlags || 0} new
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Transactions
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">Latest transaction activity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table-compact">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Account</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {!recentTransactions || recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No recent transactions found
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">
                            {new Date(transaction.tanggal).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-500">
                            {transaction.Account?.accountNumber || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="text-sm text-slate-700">
                        {transaction.Account?.accountNumber || 'N/A'}
                      </td>
                      <td>
                        <div className="max-w-xs truncate text-sm text-slate-700" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          transaction.type === 'Kredit'
                            ? 'badge-success'
                            : 'badge-danger'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`font-semibold text-sm ${
                        transaction.type === 'Kredit' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.Amount)}
                      </td>
                      <td>
                        {transaction.flag ? (
                          <span className="badge badge-primary">
                            {transaction.flag}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
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