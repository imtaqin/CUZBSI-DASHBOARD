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
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })

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

  // Prepare chart data
  const transactionChartData = chartData?.transactionDates?.map((date, index) => ({
    date,
    transactions: chartData.transactionCounts?.[index] || 0,
  })) || []

  const balanceChartData = chartData?.balanceLabels?.map((label, index) => ({
    account: label,
    balance: chartData.balanceData?.[index] || 0,
  })) || []

  return (
    <AdminLayout
      title="Dashboard"
      description="Overview of your transaction management system"
    >
      <div className="space-y-4">
        {/* Key Metrics - Compact Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Accounts */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">Total Akun</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalAccounts}</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">{stats.activeAccounts} aktif</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BuildingLibraryIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">Transaksi</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalTransactions}</p>
                <p className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
                  <ArrowUpRightIcon className="h-3 w-3" /> {stats.todayTransactions} hari ini
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCardIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Balance */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">Total Saldo</p>
                <p className="text-lg font-bold text-slate-900 mt-1 truncate">{formatCurrency(stats.totalBalance)}</p>
                <p className="text-xs text-slate-500 mt-1">Rp IDR</p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BanknotesIcon className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Flagged Transactions */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">Ditandai</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.flaggedTransactions}</p>
                <p className="text-xs text-purple-600 mt-1 font-medium">{stats.newFlags || 0} baru</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FlagIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Transaction Chart */}
          {transactionChartData.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Transaksi Mingguan</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={transactionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar dataKey="transactions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Balance Chart */}
          {balanceChartData.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Saldo Rekening</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={balanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="account" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Bar dataKey="balance" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Flag Statistics - Compact */}
        {flagStats && flagStats.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Statistik Penanda</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {flagStats.map((flagStat) => (
                <div key={flagStat.flagId} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: `${flagStat.color}20` }}
                      >
                        {flagStat.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-900">{flagStat.name}</h4>
                        <p className="text-xs text-slate-500">{flagStat.flagId}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-600">Transaksi: </span>
                      <span className="font-bold text-slate-900">{flagStat.count}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Total: </span>
                      <span className="font-bold text-emerald-600">{formatCurrency(flagStat.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Status - Compact Table */}
        {accounts && accounts.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Status Akun</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-2 py-2 font-semibold text-slate-900">Nomor Akun</th>
                    <th className="text-left px-2 py-2 font-semibold text-slate-900">Bank</th>
                    <th className="text-left px-2 py-2 font-semibold text-slate-900">Saldo</th>
                    <th className="text-left px-2 py-2 font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-2 py-2 font-mono text-slate-900">{account.accountNumber}</td>
                      <td className="px-2 py-2 text-slate-600">{account.Bank.name}</td>
                      <td className="px-2 py-2 font-semibold text-emerald-600">{formatCurrency(parseFloat(account.lastBalance))}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          account.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {account.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Transactions - Compact Table */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Transaksi Terbaru</h3>
          {!recentTransactions || recentTransactions.length === 0 ? (
            <div className="text-center py-6">
              <BanknotesIcon className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">Tidak ada transaksi terbaru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-2 py-2 font-semibold text-slate-900">Tanggal</th>
                    <th className="text-left px-2 py-2 font-semibold text-slate-900">Deskripsi</th>
                    <th className="text-left px-2 py-2 font-semibold text-slate-900">Tipe</th>
                    <th className="text-right px-2 py-2 font-semibold text-slate-900">Jumlah</th>
                    <th className="text-left px-2 py-2 font-semibold text-slate-900">Label</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-2 py-2 text-slate-600 whitespace-nowrap">
                        {new Date(transaction.tanggal).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })}
                      </td>
                      <td className="px-2 py-2 text-slate-700 truncate max-w-xs" title={transaction.description}>
                        {transaction.description}
                      </td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'Kredit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`px-2 py-2 text-right font-semibold ${
                        transaction.type === 'Kredit' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'Debit' ? '-' : '+'}{formatCurrency(transaction.Amount)}
                      </td>
                      <td className="px-2 py-2">
                        {transaction.flag ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                            {transaction.flag}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}