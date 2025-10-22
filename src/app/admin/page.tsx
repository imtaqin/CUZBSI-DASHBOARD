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
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
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

  const { stats, flagStats, accounts, recentTransactions, chartData } = data

  return (
    <AdminLayout
      title="Dashboard"
      description="Overview of your transaction management system"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <BuildingLibraryIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Total Akun
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">{stats.totalAccounts}</p>
                <p className="text-xs text-emerald-600 mt-0.5 font-medium">{stats.activeAccounts} aktif</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Transaksi
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">{stats.totalTransactions.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-0.5 font-medium">{stats.todayTransactions} hari ini</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Total Saldo
                </p>
                <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1 truncate">{formatCurrency(stats.totalBalance)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FlagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Ditandai
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">{stats.flaggedTransactions}</p>
                <p className="text-xs text-purple-600 mt-0.5 font-medium">
                  {stats.newFlags || 0} baru
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Flag Statistics */}
        {flagStats && flagStats.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                Statistik Penanda
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Ringkasan transaksi berdasarkan penanda</p>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-slate-100">
              {flagStats.map((flagStat) => (
                <div key={flagStat.flagId} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{flagStat.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{flagStat.name}</div>
                        <div className="text-xs text-slate-500">{flagStat.flagId}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Jumlah Transaksi</div>
                      <div className="text-lg font-bold text-slate-900">{flagStat.count}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Total Nilai</div>
                      <div className="text-lg font-bold text-emerald-600">{formatCurrency(flagStat.totalAmount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Grid View */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {flagStats.map((flagStat) => (
                <div key={flagStat.flagId} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${flagStat.color}20` }}
                    >
                      {flagStat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{flagStat.name}</h4>
                      <p className="text-xs text-slate-500">{flagStat.flagId}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Transaksi</div>
                      <div className="text-xl font-bold text-slate-900">{flagStat.count}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Total</div>
                      <div className="text-sm font-bold text-emerald-600">{formatCurrency(flagStat.totalAmount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Status Cards */}
        {accounts && accounts.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                Status Akun
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Informasi akun bank yang terhubung</p>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-slate-100">
              {accounts.map((account) => (
                <div key={account.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 mb-1">{account.accountNumber}</div>
                      <div className="text-xs text-slate-500">{account.Bank.name}</div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      account.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {account.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Saldo:</span>
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {formatCurrency(parseFloat(account.lastBalance))}
                      </span>
                    </div>

                    {account.ScrapingOption && (
                      <>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-xs text-slate-500">Auto-Sync:</span>
                          <span className={`text-xs font-medium ${
                            account.ScrapingOption.isActive ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            {account.ScrapingOption.cronExpression}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Status:</span>
                          <div className="flex items-center gap-1">
                            {account.ScrapingOption.lastStatus === 'success' ? (
                              <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                            ) : account.ScrapingOption.lastStatus === 'error' ? (
                              <XCircleIcon className="h-3.5 w-3.5 text-red-600" />
                            ) : (
                              <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            <span className={`text-xs font-medium ${
                              account.ScrapingOption.lastStatus === 'success' ? 'text-emerald-600' :
                              account.ScrapingOption.lastStatus === 'error' ? 'text-red-600' :
                              'text-slate-600'
                            }`}>
                              {account.ScrapingOption.lastStatus || 'Pending'}
                            </span>
                          </div>
                        </div>

                        {account.ScrapingOption.errorMessage && (
                          <div className="bg-amber-50 border border-amber-100 rounded p-2 text-xs text-amber-700">
                            {account.ScrapingOption.errorMessage}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Grid View */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <div key={account.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BuildingLibraryIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{account.accountNumber}</h4>
                        <p className="text-xs text-slate-500">{account.Bank.name}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      account.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {account.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Saldo</span>
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {formatCurrency(parseFloat(account.lastBalance))}
                      </span>
                    </div>

                    {account.ScrapingOption && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Auto-Sync</span>
                          <span className={`text-xs font-medium ${
                            account.ScrapingOption.isActive ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            {account.ScrapingOption.cronExpression}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Status</span>
                          <div className="flex items-center gap-1">
                            {account.ScrapingOption.lastStatus === 'success' ? (
                              <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                            ) : account.ScrapingOption.lastStatus === 'error' ? (
                              <XCircleIcon className="h-3.5 w-3.5 text-red-600" />
                            ) : (
                              <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            <span className={`text-xs font-medium ${
                              account.ScrapingOption.lastStatus === 'success' ? 'text-emerald-600' :
                              account.ScrapingOption.lastStatus === 'error' ? 'text-red-600' :
                              'text-slate-600'
                            }`}>
                              {account.ScrapingOption.lastStatus || 'Pending'}
                            </span>
                          </div>
                        </div>

                        {account.ScrapingOption.errorMessage && (
                          <div className="bg-amber-50 border border-amber-100 rounded p-2 text-xs text-amber-700 mt-2">
                            {account.ScrapingOption.errorMessage}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              Transaksi Terbaru
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Aktivitas transaksi terkini</p>
          </div>

          {!recentTransactions || recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BanknotesIcon className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No recent transactions found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-slate-100">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900 mb-1 line-clamp-2">
                          {transaction.description}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{new Date(transaction.tanggal).toLocaleDateString('id-ID')}</span>
                          <span>•</span>
                          <span>{new Date(transaction.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ml-2 ${
                        transaction.type === 'Kredit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <CreditCardIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700">{transaction.Account?.accountNumber || 'N/A'}</span>
                      </div>

                      {transaction.flag && (
                        <div className="flex items-center gap-2 text-xs">
                          <FlagIcon className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                          <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                            {transaction.flag}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                      <div className={`font-mono text-base font-semibold ${
                        transaction.type === 'Kredit' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'Debit' ? '-' : '+'}{formatCurrency(transaction.Amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="table-compact min-w-full">
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
                    {recentTransactions.map((transaction) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}