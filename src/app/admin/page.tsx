'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, LoadingPage } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { apiService } from '@/services/api'
import type { DashboardData } from '@/types'
import {
  UsersIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  FlagIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

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
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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

  // Prepare chart data
  const transactionTrendData = chartData.transactionDates.map((date, index) => ({
    date,
    transactions: chartData.transactionCounts[index]
  }))

  const balanceData = chartData.balanceLabels.map((label, index) => ({
    name: label,
    balance: chartData.balanceData[index]
  }))

  return (
    <AdminLayout 
      title="Dasbor" 
      description="Ringkasan sistem manajemen transaksi BSI Anda"
    >
      <div className="space-y-4 lg:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingLibraryIcon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                </div>
                <div className="ml-3 lg:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-slate-400 truncate">
                      Total Akun
                    </dt>
                    <dd className="text-xl lg:text-3xl font-bold text-white">
                      {stats.totalAccounts}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs lg:text-sm">
                  <span className="text-green-600 font-medium">
                    {stats.activeAccounts} aktif
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <div className="ml-3 lg:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-slate-400 truncate">
                      Total Transaksi
                    </dt>
                    <dd className="text-xl lg:text-3xl font-bold text-white">
                      {stats.totalTransactions.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs lg:text-sm">
                  <CalendarDaysIcon className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500 mr-1" />
                  <span className="text-blue-600 font-medium">
                    {stats.todayTransactions} hari ini
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
                </div>
                <div className="ml-3 lg:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-slate-400 truncate">
                      Total Saldo
                    </dt>
                    <dd className="text-lg lg:text-2xl font-bold text-white">
                      {formatCurrency(stats.totalBalance)}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FlagIcon className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
                </div>
                <div className="ml-3 lg:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-slate-400 truncate">
                      Transaksi Ditandai
                    </dt>
                    <dd className="text-xl lg:text-3xl font-bold text-white">
                      {stats.flaggedTransactions}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs lg:text-sm">
                  <span className="text-purple-600 font-medium">
                    {stats.newFlags} baru
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Transaction Trend */}
          <Card>
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="flex items-center text-sm lg:text-base">
                <ArrowTrendingUpIcon className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 mr-2" />
                Tren Transaksi (7 Hari Terakhir)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transactionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#9CA3AF"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#9CA3AF"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Account Balances */}
          <Card>
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="flex items-center text-sm lg:text-base">
                <BanknotesIcon className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 mr-2" />
                Saldo Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={balanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      stroke="#9CA3AF"
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      tick={{ fontSize: 12 }}
                      stroke="#9CA3AF"
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Balance']}
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Bar dataKey="balance" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-3 lg:pb-6">
            <CardTitle className="flex items-center text-sm lg:text-base">
              Transaksi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                Tidak ada transaksi terbaru
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-600">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden sm:table-cell">
                        Akun
                      </th>
                      <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Deskripsi
                      </th>
                      <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden md:table-cell">
                        Tipe
                      </th>
                      <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden lg:table-cell">
                        Penanda
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-700 divide-y divide-slate-600">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-600">
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-200">
                          <div className="flex flex-col">
                            <span>{new Date(transaction.tanggal).toLocaleDateString()}</span>
                            <span className="text-xs text-slate-400 sm:hidden">
                              {transaction.Account.accountNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-200 hidden sm:table-cell">
                          {transaction.Account.accountNumber}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-slate-200">
                          <div className="max-w-xs truncate" title={transaction.description}>
                            {transaction.description}
                          </div>
                          <div className="md:hidden mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === 'Kredit' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm hidden md:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === 'Kredit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium">
                          <div className="flex flex-col items-end">
                            <span className={transaction.type === 'Kredit' ? 'text-green-400' : 'text-red-400'}>
                              {formatCurrency(transaction.Amount)}
                            </span>
                            <div className="lg:hidden mt-1">
                              {transaction.flag ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-blue-100">
                                  {transaction.flag}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">Tidak ada</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm hidden lg:table-cell">
                          {transaction.flag ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-blue-100">
                              {transaction.flag}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Tidak ada penanda</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}