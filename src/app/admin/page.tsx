'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { LoadingPage } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { apiService } from '@/services/api'
import type { DashboardData } from '@/types'
import dynamic from 'next/dynamic'
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

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

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
      <div className="space-y-2 sm:space-y-3 lg:space-y-4">
        {/* Key Metrics - Mobile First: 2x2 grid on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3">
          {/* Total Accounts */}
          <div className="bg-white rounded border border-slate-200 p-2 sm:p-3 lg:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-slate-600 uppercase line-clamp-1">Akun</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.totalAccounts}</p>
              <p className="text-xs text-emerald-600 font-medium truncate">{stats.activeAccounts} aktif</p>
              <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 bg-green-100 rounded flex items-center justify-center -mt-1">
                <BuildingLibraryIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded border border-slate-200 p-2 sm:p-3 lg:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-slate-600 uppercase line-clamp-1">Transaksi</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.totalTransactions}</p>
              <p className="text-xs text-blue-600 font-medium truncate">{stats.todayTransactions} hari ini</p>
              <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 bg-blue-100 rounded flex items-center justify-center -mt-1">
                <CreditCardIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Balance */}
          <div className="bg-white rounded border border-slate-200 p-2 sm:p-3 lg:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-slate-600 uppercase line-clamp-1">Saldo</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 truncate">{formatCurrency(stats.totalBalance)}</p>
              <p className="text-xs text-slate-500 truncate">IDR</p>
              <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 bg-amber-100 rounded flex items-center justify-center -mt-1">
                <BanknotesIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Flagged Transactions */}
          <div className="bg-white rounded border border-slate-200 p-2 sm:p-3 lg:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-slate-600 uppercase line-clamp-1">Ditandai</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.flaggedTransactions}</p>
              <p className="text-xs text-purple-600 font-medium truncate">{stats.newFlags || 0} baru</p>
              <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 bg-purple-100 rounded flex items-center justify-center -mt-1">
                <FlagIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - Stack on mobile, side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          {/* Transaction Chart */}
          {transactionChartData.length > 0 && (
            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-2 sm:p-3 lg:p-4 pb-0">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Transaksi Mingguan</h3>
              </div>
              <Chart
                type="area"
                series={[
                  {
                    name: 'Transaksi',
                    data: transactionChartData.map(d => d.transactions),
                  }
                ]}
                options={{
                  chart: {
                    type: 'area',
                    toolbar: { show: false },
                    sparkline: { enabled: false },
                  },
                  colors: ['#3b82f6'],
                  fill: {
                    type: 'gradient',
                    gradient: {
                      shadeIntensity: 1,
                      opacityFrom: 0.45,
                      opacityTo: 0.05,
                      stops: [20, 100, 100, 100]
                    }
                  },
                  stroke: {
                    curve: 'smooth',
                    width: 2,
                    colors: ['#3b82f6']
                  },
                  dataLabels: { enabled: false },
                  xaxis: {
                    categories: transactionChartData.map(d => d.date),
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
                  },
                  yaxis: {
                    labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
                  },
                  grid: {
                    borderColor: '#e2e8f0',
                    xaxis: { lines: { show: false } },
                    yaxis: { lines: { show: true } },
                  },
                  tooltip: {
                    theme: 'dark',
                    style: { fontSize: '11px' },
                  },
                }}
                height={220}
              />
            </div>
          )}

          {/* Balance Chart */}
          {balanceChartData && balanceChartData.length > 0 ? (
            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-2 sm:p-3 lg:p-4 pb-0">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Saldo Rekening</h3>
              </div>
              <Chart
                type="bar"
                series={[
                  {
                    name: 'Saldo',
                    data: balanceChartData.map(d => d.balance),
                  }
                ]}
                options={{
                  chart: {
                    type: 'bar',
                    toolbar: { show: false },
                    sparkline: { enabled: false },
                  },
                  colors: ['#10b981'],
                  plotOptions: {
                    bar: {
                      borderRadius: 8,
                      columnWidth: '60%',
                      distributed: false,
                    },
                  },
                  dataLabels: { enabled: false },
                  stroke: { show: true, width: 0, colors: ['transparent'] },
                  xaxis: {
                    categories: balanceChartData.map(d => d.account),
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    labels: {
                      style: { fontSize: '10px', colors: '#94a3b8' },
                      offsetY: 5,
                    },
                  },
                  yaxis: {
                    labels: {
                      style: { fontSize: '11px', colors: '#94a3b8' },
                      formatter: (value) => `${(value / 1000000).toFixed(0)}M`,
                    },
                  },
                  grid: {
                    borderColor: '#e2e8f0',
                    xaxis: { lines: { show: false } },
                    yaxis: { lines: { show: true } },
                  },
                  tooltip: {
                    theme: 'dark',
                    style: { fontSize: '11px' },
                    y: {
                      formatter: (value) => formatCurrency(value),
                    },
                  },
                }}
                height={240}
              />
            </div>
          ) : (
            <div className="bg-white rounded border border-slate-200 shadow-sm p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-4">Saldo Rekening</h3>
              <div className="flex items-center justify-center h-48 text-slate-400">
                <p className="text-xs sm:text-sm">Tidak ada data saldo</p>
              </div>
            </div>
          )}
        </div>

        {/* Flag Statistics - Compact */}
        {flagStats && flagStats.length > 0 && (
          <div className="bg-white rounded border border-slate-200 p-2 sm:p-3 lg:p-4 shadow-sm">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2">Statistik Penanda</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2">
              {flagStats.map((flagStat) => (
                <div key={flagStat.flagId} className="border border-slate-200 rounded p-1.5 sm:p-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-1.5">
                    <div
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded flex items-center justify-center text-xs sm:text-sm flex-shrink-0"
                      style={{ backgroundColor: `${flagStat.color}20` }}
                    >
                      {flagStat.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{flagStat.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{flagStat.flagId}</p>
                      <div className="mt-1 flex items-center justify-between text-xs gap-1">
                        <span className="text-slate-600">{flagStat.count} txn</span>
                        <span className="font-bold text-emerald-600 truncate text-right">{formatCurrency(flagStat.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Status - Responsive */}
        {accounts && accounts.length > 0 && (
          <div className="bg-white rounded border border-slate-200 p-2 sm:p-3 lg:p-4 shadow-sm">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2">Status Akun</h3>
            <div className="hidden sm:block overflow-x-auto text-xs">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-2 py-1.5 font-semibold text-slate-900">Nomor Akun</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-slate-900">Bank</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-slate-900">Saldo</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-2 py-1.5 font-mono text-slate-900 truncate text-xs">{account.accountNumber}</td>
                      <td className="px-2 py-1.5 text-slate-600 text-xs">{account.Bank.name}</td>
                      <td className="px-2 py-1.5 font-semibold text-emerald-600 text-xs">{formatCurrency(parseFloat(account.lastBalance))}</td>
                      <td className="px-2 py-1.5">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${
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
            <div className="sm:hidden space-y-1.5">
              {accounts.slice(0, 5).map((account) => (
                <div key={account.id} className="border border-slate-200 rounded p-2 hover:bg-slate-50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-semibold text-slate-900 truncate">{account.accountNumber}</span>
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${
                      account.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {account.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 truncate">{account.Bank.name}</div>
                  <div className="text-sm font-semibold text-emerald-600">{formatCurrency(parseFloat(account.lastBalance))}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions - Responsive */}
        <div className="bg-white rounded border border-slate-200 p-2 sm:p-3 lg:p-4 shadow-sm">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2">Transaksi Terbaru</h3>
          {!recentTransactions || recentTransactions.length === 0 ? (
            <div className="text-center py-4">
              <BanknotesIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 text-slate-300" />
              <p className="text-xs sm:text-sm text-slate-500">Tidak ada transaksi terbaru</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-2 py-1.5 font-semibold text-slate-900">Tanggal</th>
                      <th className="text-left px-2 py-1.5 font-semibold text-slate-900">Deskripsi</th>
                      <th className="text-left px-2 py-1.5 font-semibold text-slate-900">Tipe</th>
                      <th className="text-right px-2 py-1.5 font-semibold text-slate-900">Jumlah</th>
                      <th className="text-left px-2 py-1.5 font-semibold text-slate-900">Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-2 py-1.5 text-slate-600 whitespace-nowrap">
                          {new Date(transaction.tanggal).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })}
                        </td>
                        <td className="px-2 py-1.5 text-slate-700 truncate" title={transaction.description}>
                          {transaction.description}
                        </td>
                        <td className="px-2 py-1.5">
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${
                            transaction.type === 'Kredit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.type === 'Kredit' ? '+' : '-'}
                          </span>
                        </td>
                        <td className={`px-2 py-1.5 text-right font-semibold ${
                          transaction.type === 'Kredit' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.Amount)}
                        </td>
                        <td className="px-2 py-1.5">
                          {transaction.flag && (
                            <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-700 truncate">
                              {transaction.flag}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-1.5">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="border border-slate-200 rounded p-2 hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-slate-600">
                        {new Date(transaction.tanggal).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })}
                      </span>
                      <span className={`inline-flex px-1.5 py-0.5 font-semibold rounded text-xs ${
                        transaction.type === 'Kredit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type === 'Kredit' ? '+' : '-'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-1 mb-1">{transaction.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold" style={{
                        color: transaction.type === 'Kredit' ? '#059669' : '#dc2626'
                      }}>
                        {formatCurrency(transaction.Amount)}
                      </div>
                      {transaction.flag && (
                        <span className="inline-flex px-1.5 py-0.5 font-semibold rounded bg-purple-100 text-purple-700 truncate max-w-[100px] text-xs">
                          {transaction.flag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}