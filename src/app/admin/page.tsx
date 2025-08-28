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
      title="Dashboard" 
      description="Overview of your BSI transaction management system"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingLibraryIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-400 truncate">
                      Total Accounts
                    </dt>
                    <dd className="text-3xl font-bold text-white">
                      {stats.totalAccounts}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-sm">
                  <span className="text-green-600 font-medium">
                    {stats.activeAccounts} active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-400 truncate">
                      Total Transactions
                    </dt>
                    <dd className="text-3xl font-bold text-white">
                      {stats.totalTransactions.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-sm">
                  <CalendarDaysIcon className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-blue-600 font-medium">
                    {stats.todayTransactions} today
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-400 truncate">
                      Total Balance
                    </dt>
                    <dd className="text-2xl font-bold text-white">
                      {formatCurrency(stats.totalBalance)}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FlagIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-400 truncate">
                      Flagged Transactions
                    </dt>
                    <dd className="text-3xl font-bold text-white">
                      {stats.flaggedTransactions}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-sm">
                  <span className="text-purple-600 font-medium">
                    {stats.newFlags} new
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600 mr-2" />
                Transaction Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transactionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Account Balances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BanknotesIcon className="h-5 w-5 text-green-600 mr-2" />
                Account Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={balanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Balance']} />
                    <Bar dataKey="balance" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                No recent transactions
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-600">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Flag
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-700 divide-y divide-slate-600">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-600">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                          {new Date(transaction.tanggal).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                          {transaction.Account.accountNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-200 max-w-xs truncate">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === 'Kredit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                          {formatCurrency(transaction.Amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.flag ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-blue-100">
                              {transaction.flag}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">No flag</span>
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