'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, Pagination, LoadingPage, Select, Input, Modal } from '@/components/ui'
import { apiService } from '@/services/api'
import { formatCurrency, formatDate, debounce } from '@/lib/utils'
import type { Transaction, Account, PaginationInfo } from '@/types'
import { useForm } from 'react-hook-form'
import {
  FunnelIcon,
  FlagIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  BanknotesIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface TransactionFilters {
  accountId?: number
  startDate?: string
  endDate?: string
  type?: string
  flag?: string
  search?: string
  minAmount?: number
  maxAmount?: number
}

interface CustomFlag {
  id: string
  name: string
  color: string
  description: string
  category: 'income' | 'expense' | 'transfer' | 'custom'
}

interface FlagFormData {
  flagId?: string
  customFlag?: string
  description?: string
  amount?: string
  notes?: string
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  template: 'detailed' | 'summary' | 'financial'
  dateRange: 'current' | 'custom'
  customStartDate?: string
  customEndDate?: string
  includeFlags: boolean
  groupBy: 'none' | 'account' | 'flag' | 'type' | 'date'
}

// Predefined flag categories
const PREDEFINED_FLAGS: CustomFlag[] = [
  // Income Categories
  { id: 'donatur', name: 'Donatur', color: 'bg-green-600', description: 'Donation received', category: 'income' },
  { id: 'member', name: 'Member', color: 'bg-blue-600', description: 'Membership fee', category: 'income' },
  { id: 'sponsor', name: 'Sponsor', color: 'bg-purple-600', description: 'Sponsorship income', category: 'income' },
  { id: 'grant', name: 'Grant', color: 'bg-emerald-600', description: 'Grant funding', category: 'income' },
  { id: 'fundraising', name: 'Fundraising', color: 'bg-teal-600', description: 'Fundraising event', category: 'income' },
  
  // Expense Categories  
  { id: 'operational', name: 'Operational', color: 'bg-red-600', description: 'Operational expenses', category: 'expense' },
  { id: 'program', name: 'Program', color: 'bg-orange-600', description: 'Program expenses', category: 'expense' },
  { id: 'admin', name: 'Administrative', color: 'bg-yellow-600', description: 'Administrative costs', category: 'expense' },
  { id: 'marketing', name: 'Marketing', color: 'bg-pink-600', description: 'Marketing & promotion', category: 'expense' },
  { id: 'utilities', name: 'Utilities', color: 'bg-indigo-600', description: 'Utilities & maintenance', category: 'expense' },
  
  // Transfer Categories
  { id: 'internal', name: 'Internal Transfer', color: 'bg-gray-600', description: 'Internal account transfer', category: 'transfer' },
  { id: 'external', name: 'External Transfer', color: 'bg-slate-600', description: 'External transfer', category: 'transfer' },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [availableFlags, setAvailableFlags] = useState<string[]>([])
  const [customFlags, setCustomFlags] = useState<CustomFlag[]>(PREDEFINED_FLAGS)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [flagModalOpen, setFlagModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [bulkActionMode, setBulkActionMode] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set())
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{field: string, direction: 'asc' | 'desc'}>({field: 'tanggal', direction: 'desc'})
  const [isExporting, setIsExporting] = useState(false)
  
  const { register: registerFlag, handleSubmit: handleFlagSubmit, reset: resetFlag, watch: watchFlag, formState: { errors: flagErrors } } = useForm<FlagFormData>()
  const { register: registerExport, handleSubmit: handleExportSubmit, watch: watchExport, formState: { errors: exportErrors } } = useForm<ExportOptions>()

  // Debounced search
  const debouncedSearch = debounce((term: string) => {
    setFilters(prev => ({ ...prev, search: term }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }, 500)

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    fetchTransactions()
  }, [pagination.page, filters, sortConfig])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getTransactions({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      })
      if (response.success) {
        setTransactions(response.data.transactions)
        setAccounts(response.data.accounts)
        setAvailableFlags(response.data.flags)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({})
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleFlagTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    resetFlag({
      flagId: transaction.flag || '',
      customFlag: '',
      description: '',
      notes: ''
    })
    setFlagModalOpen(true)
  }

  const getTransactionTypeVariant = (type: string) => {
    return type === 'Kredit' ? 'success' : 'destructive'
  }

  const getFlagVariant = (flag?: string) => {
    if (!flag) return 'secondary'
    const customFlag = customFlags.find(f => f.id === flag || f.name === flag)
    if (customFlag) return 'default'
    
    const flagVariants: Record<string, any> = {
      income: 'success',
      expense: 'destructive',
      transfer: 'info',
      pending: 'warning'
    }
    return flagVariants[flag] || 'secondary'
  }

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleBulkAction = (action: 'flag' | 'export' | 'delete') => {
    console.log(`Bulk action: ${action} for transactions:`, Array.from(selectedTransactions))
    // Implement bulk actions here
  }

  const toggleTransactionSelection = (id: number) => {
    setSelectedTransactions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAllTransactions = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id)))
    }
  }

  const onSubmitFlag = async (data: FlagFormData) => {
    if (!selectedTransaction) return
    
    try {
      const flagValue = data.flagId === 'custom' ? data.customFlag : data.flagId
      await apiService.flagTransaction(selectedTransaction.id, flagValue || '')
      setFlagModalOpen(false)
      fetchTransactions()
      resetFlag()
    } catch (error) {
      console.error('Failed to flag transaction:', error)
    }
  }

  const onSubmitExport = async (data: ExportOptions) => {
    try {
      setIsExporting(true)

      // Determine which transactions to export
      const transactionsToExport = selectedTransactions.size > 0 
        ? transactions.filter(t => selectedTransactions.has(t.id))
        : transactions

      // Apply date range if custom
      let filteredTransactions = transactionsToExport
      if (data.dateRange === 'custom' && data.customStartDate && data.customEndDate) {
        filteredTransactions = transactionsToExport.filter(t => {
          const transactionDate = new Date(t.tanggal).toISOString().split('T')[0]
          return transactionDate >= data.customStartDate! && transactionDate <= data.customEndDate!
        })
      }

      if (filteredTransactions.length === 0) {
        alert('No transactions found for the selected criteria.')
        setIsExporting(false)
        return
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `transactions_${data.template}_${timestamp}`

      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))

      if (data.format === 'csv') {
        await exportToCSV(filteredTransactions, data, filename)
      } else if (data.format === 'excel') {
        await exportToExcel(filteredTransactions, data, filename)
      } else if (data.format === 'pdf') {
        await exportToPDF(filteredTransactions, data, filename)
      }

      setExportModalOpen(false)
      setIsExporting(false)

      // Show success message
      alert(`Successfully exported ${filteredTransactions.length} transactions as ${data.format.toUpperCase()}!`)
    } catch (error) {
      console.error('Export failed:', error)
      setIsExporting(false)
      alert('Export failed. Please try again.')
    }
  }

  const exportToCSV = async (data: Transaction[], options: ExportOptions, filename: string) => {
    const headers = [
      'Date',
      'Account Number',
      'Bank',
      'Description',
      'Type',
      'Amount',
      'Balance',
      ...(options.includeFlags ? ['Flag'] : []),
      'Notes'
    ]

    const rows = data.map(transaction => [
      formatDate(transaction.tanggal),
      transaction.Account.accountNumber,
      transaction.Account.Bank.name,
      transaction.description,
      transaction.type,
      transaction.Amount,
      transaction.Balance,
      ...(options.includeFlags ? [transaction.flag || ''] : []),
      ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  }

  const exportToExcel = async (data: Transaction[], options: ExportOptions, filename: string) => {
    // For Excel, we'll create a more structured format
    const workbookData = [
      ['TRANSACTION REPORT'],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Template: ${options.template.toUpperCase()}`],
      [`Total Records: ${data.length}`],
      [],
      [
        'Date',
        'Account Number',
        'Bank',
        'Description',
        'Type',
        'Amount',
        'Balance',
        ...(options.includeFlags ? ['Flag'] : [])
      ],
      ...data.map(transaction => [
        formatDate(transaction.tanggal),
        transaction.Account.accountNumber,
        transaction.Account.Bank.name,
        transaction.description,
        transaction.type,
        parseFloat(transaction.Amount),
        parseFloat(transaction.Balance),
        ...(options.includeFlags ? [transaction.flag || ''] : [])
      ]),
      [],
      ['SUMMARY'],
      ['Total Income:', data.filter(t => t.type === 'Kredit').reduce((sum, t) => sum + parseFloat(t.Amount), 0)],
      ['Total Expenses:', data.filter(t => t.type === 'Debit').reduce((sum, t) => sum + parseFloat(t.Amount), 0)],
      ['Net Amount:', data.reduce((sum, t) => sum + (t.type === 'Kredit' ? parseFloat(t.Amount) : -parseFloat(t.Amount)), 0)]
    ]

    // Convert to CSV format for simplicity (in a real app, you'd use a library like xlsx)
    const csvContent = workbookData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')

    downloadFile(csvContent, `${filename}.csv`, 'application/vnd.ms-excel')
  }

  const exportToPDF = async (data: Transaction[], options: ExportOptions, filename: string) => {
    // Create HTML content for PDF
    const totalIncome = data.filter(t => t.type === 'Kredit').reduce((sum, t) => sum + parseFloat(t.Amount), 0)
    const totalExpenses = data.filter(t => t.type === 'Debit').reduce((sum, t) => sum + parseFloat(t.Amount), 0)
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4f46e5; color: white; }
            .credit { color: green; }
            .debit { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Transaction Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Template: ${options.template.toUpperCase()}</p>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Records:</strong> ${data.length}</p>
            <p><strong>Total Income:</strong> ${formatCurrency(totalIncome)}</p>
            <p><strong>Total Expenses:</strong> ${formatCurrency(totalExpenses)}</p>
            <p><strong>Net Amount:</strong> ${formatCurrency(totalIncome - totalExpenses)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                ${options.includeFlags ? '<th>Flag</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${data.map(transaction => `
                <tr>
                  <td>${formatDate(transaction.tanggal)}</td>
                  <td>${transaction.Account.accountNumber}<br><small>${transaction.Account.Bank.name}</small></td>
                  <td>${transaction.description}</td>
                  <td><span class="${transaction.type === 'Kredit' ? 'credit' : 'debit'}">${transaction.type}</span></td>
                  <td class="${transaction.type === 'Kredit' ? 'credit' : 'debit'}">${formatCurrency(transaction.Amount)}</td>
                  <td>${formatCurrency(transaction.Balance)}</td>
                  ${options.includeFlags ? `<td>${transaction.flag || '-'}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    // Create a blob and download (for PDF, in a real app you'd use jsPDF or similar)
    downloadFile(htmlContent, `${filename}.html`, 'text/html')
    alert('PDF export: HTML file downloaded. In a production app, this would be converted to PDF.')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading && transactions.length === 0) {
    return (
      <AdminLayout title="Transactions" description="View and manage all BSI transactions">
        <LoadingPage text="Loading transactions..." />
      </AdminLayout>
    )
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <AdminLayout title="Transaction Management" description="Advanced transaction tracking and analysis">
      <div className="space-y-6">
        {/* Enhanced Header with Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BanknotesIcon className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(transactions.reduce((sum, t) => sum + (t.type === 'Kredit' ? parseFloat(t.Amount) : 0), 0))}
                  </div>
                  <div className="text-sm text-slate-400">Total Income</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CreditCardIcon className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(transactions.reduce((sum, t) => sum + (t.type === 'Debit' ? parseFloat(t.Amount) : 0), 0))}
                  </div>
                  <div className="text-sm text-slate-400">Total Expenses</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FlagIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {transactions.filter(t => t.flag).length}
                  </div>
                  <div className="text-sm text-slate-400">Flagged</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {pagination.total}
                  </div>
                  <div className="text-sm text-slate-400">Total Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Search and Actions Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-4 flex-1">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search transactions, descriptions, amounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filter Toggles */}
                <div className="flex gap-2">
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative"
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                  
                  <Button
                    variant={showAdvancedFilters ? "default" : "outline"}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
                    Advanced
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setBulkActionMode(!bulkActionMode)}
                  className={bulkActionMode ? "ring-2 ring-blue-500" : ""}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  {bulkActionMode ? 'Exit Bulk' : 'Bulk Actions'}
                </Button>
                
                <Button
                  onClick={() => setExportModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                {selectedTransactions.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-md text-white text-sm">
                    <span>{selectedTransactions.size} selected</span>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-blue-700" onClick={() => handleBulkAction('flag')}>
                      <FlagIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" onClick={clearFilters}>
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Transaction Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <Select
                  options={[
                    { value: '', label: 'All Accounts' },
                    ...accounts.map(account => ({
                      value: account.id.toString(),
                      label: `${account.accountNumber} (${account.Bank.code})`
                    }))
                  ]}
                  value={filters.accountId?.toString() || ''}
                  onChange={(value) => handleFilterChange('accountId', value)}
                  label="Account"
                />

                <Input
                  type="date"
                  label="Start Date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />

                <Input
                  type="date"
                  label="End Date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />

                <Select
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'Kredit', label: 'Credit (+)' },
                    { value: 'Debit', label: 'Debit (-)' }
                  ]}
                  value={filters.type || ''}
                  onChange={(value) => handleFilterChange('type', value)}
                  label="Transaction Type"
                />

                <Select
                  options={[
                    { value: '', label: 'All Flags' },
                    { value: 'unflagged', label: 'Unflagged Only' },
                    ...customFlags.map(flag => ({
                      value: flag.id,
                      label: flag.name
                    })),
                    ...availableFlags.filter(flag => !customFlags.some(cf => cf.id === flag || cf.name === flag)).map(flag => ({
                      value: flag,
                      label: flag.charAt(0).toUpperCase() + flag.slice(1)
                    }))
                  ]}
                  value={filters.flag || ''}
                  onChange={(value) => handleFilterChange('flag', value)}
                  label="Flag Category"
                />
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="border-t border-slate-600 pt-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Advanced Filters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400">Amount Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min amount"
                          value={filters.minAmount || ''}
                          onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                          className="text-xs"
                        />
                        <Input
                          type="number"
                          placeholder="Max amount"
                          value={filters.maxAmount || ''}
                          onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <Select
                      options={[
                        { value: '', label: 'All Categories' },
                        { value: 'income', label: 'Income Flags' },
                        { value: 'expense', label: 'Expense Flags' },
                        { value: 'transfer', label: 'Transfer Flags' },
                        { value: 'custom', label: 'Custom Flags' }
                      ]}
                      value={''}
                      onChange={(value) => console.log('Filter by category:', value)}
                      label="Flag Category"
                    />

                    <Input
                      type="text"
                      label="Description Contains"
                      placeholder="Search in description"
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400">Quick Date Filters</label>
                      <div className="grid grid-cols-2 gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0]
                            handleFilterChange('startDate', today)
                            handleFilterChange('endDate', today)
                          }}
                          className="text-xs"
                        >
                          Today
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            const today = new Date()
                            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                            handleFilterChange('startDate', lastWeek.toISOString().split('T')[0])
                            handleFilterChange('endDate', today.toISOString().split('T')[0])
                          }}
                          className="text-xs"
                        >
                          Last 7d
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            const today = new Date()
                            const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                            handleFilterChange('startDate', lastMonth.toISOString().split('T')[0])
                            handleFilterChange('endDate', today.toISOString().split('T')[0])
                          }}
                          className="text-xs"
                        >
                          Last 30d
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            const today = new Date()
                            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                            handleFilterChange('startDate', startOfMonth.toISOString().split('T')[0])
                            handleFilterChange('endDate', today.toISOString().split('T')[0])
                          }}
                          className="text-xs"
                        >
                          This Month
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {bulkActionMode && (
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.size === transactions.length && transactions.length > 0}
                          onChange={selectAllTransactions}
                          className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                      </TableHead>
                    )}
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('tanggal')}
                    >
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        Date
                        {sortConfig.field === 'tanggal' && (
                          <ArrowsUpDownIcon className={`h-4 w-4 ml-1 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center">
                        Type
                        {sortConfig.field === 'type' && (
                          <ArrowsUpDownIcon className={`h-4 w-4 ml-1 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('Amount')}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        {sortConfig.field === 'Amount' && (
                          <ArrowsUpDownIcon className={`h-4 w-4 ml-1 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('flag')}
                    >
                      <div className="flex items-center">
                        <FlagIcon className="h-4 w-4 mr-1" />
                        Flag
                        {sortConfig.field === 'flag' && (
                          <ArrowsUpDownIcon className={`h-4 w-4 ml-1 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow 
                      key={transaction.id} 
                      className={`hover:bg-slate-800 transition-colors ${
                        selectedTransactions.has(transaction.id) ? 'bg-blue-950 ring-1 ring-blue-500' : ''
                      }`}
                    >
                      {bulkActionMode && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedTransactions.has(transaction.id)}
                            onChange={() => toggleTransactionSelection(transaction.id)}
                            className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                          />
                        </TableCell>
                      )}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 text-slate-400 mr-2" />
                          <div>
                            <div className="text-white">{formatDate(transaction.tanggal)}</div>
                            <div className="text-xs text-slate-500">
                              {new Date(transaction.tanggal).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{transaction.Account.accountNumber}</div>
                          <div className="text-sm text-slate-400">
                            {transaction.Account.Bank.name} • {transaction.Account.Bank.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          <div className="truncate text-white" title={transaction.description}>
                            {transaction.description}
                          </div>
                          {transaction.description.length > 50 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
                              onClick={() => alert(transaction.description)}
                            >
                              Show full
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={getTransactionTypeVariant(transaction.type)}
                            className="flex items-center"
                          >
                            {transaction.type === 'Kredit' ? (
                              <ArrowsUpDownIcon className="h-3 w-3 mr-1 text-green-400" />
                            ) : (
                              <ArrowsUpDownIcon className="h-3 w-3 mr-1 text-red-400 rotate-180" />
                            )}
                            {transaction.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className={`font-mono font-bold ${
                            transaction.type === 'Kredit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'Kredit' ? '+' : '-'}{formatCurrency(transaction.Amount)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Rp {Number(transaction.Amount).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-mono text-slate-300">
                          {formatCurrency(transaction.Balance)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {transaction.flag ? (
                            <div className="flex items-center space-x-1">
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  customFlags.find(f => f.id === transaction.flag || f.name === transaction.flag)?.color || 'bg-slate-500'
                                }`}
                              />
                              <Badge variant={getFlagVariant(transaction.flag)} className="text-xs">
                                {transaction.flag}
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center text-slate-500 text-xs">
                              <TagIcon className="h-3 w-3 mr-1" />
                              No flag
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alert('View transaction details')}
                            className="text-slate-400 hover:text-white"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFlagTransaction(transaction)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <FlagIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alert('Edit transaction')}
                            className="text-slate-400 hover:text-white"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {transactions.length === 0 && !isLoading && (
              <div className="text-center py-8 text-slate-400">
                <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                <p>No transactions found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
            
            {pagination.totalPages > 1 && (
              <div className="p-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  showInfo
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Flag Management Modal */}
        <Modal
          isOpen={flagModalOpen}
          onClose={() => {
            setFlagModalOpen(false)
            resetFlag()
          }}
          title="Advanced Flag Management"
          size="lg"
        >
          {selectedTransaction && (
            <form onSubmit={handleFlagSubmit(onSubmitFlag)} className="space-y-6">
              {/* Transaction Summary */}
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-300">Transaction Details</div>
                  <Badge variant={getTransactionTypeVariant(selectedTransaction.type)}>
                    {selectedTransaction.type}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className={`font-mono font-bold ${
                      selectedTransaction.type === 'Kredit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedTransaction.type === 'Kredit' ? '+' : '-'}{formatCurrency(selectedTransaction.Amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-white">{formatDate(selectedTransaction.tanggal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account:</span>
                    <span className="text-white">{selectedTransaction.Account.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Description:</span>
                    <p className="text-white text-sm mt-1 bg-slate-900 p-2 rounded border">
                      {selectedTransaction.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Flag Categories */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-3 block">
                    Select Flag Category
                  </label>
                  
                  {/* Predefined Categories */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide flex items-center">
                        <BanknotesIcon className="h-4 w-4 mr-1 text-green-500" />
                        Income Categories
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {customFlags.filter(flag => flag.category === 'income').map((flag) => (
                          <label key={flag.id} className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              {...registerFlag('flagId')}
                              value={flag.id}
                              className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${flag.color} mr-2`} />
                                <span className="text-sm font-medium text-white">{flag.name}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{flag.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide flex items-center">
                        <CreditCardIcon className="h-4 w-4 mr-1 text-red-500" />
                        Expense Categories
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {customFlags.filter(flag => flag.category === 'expense').map((flag) => (
                          <label key={flag.id} className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              {...registerFlag('flagId')}
                              value={flag.id}
                              className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${flag.color} mr-2`} />
                                <span className="text-sm font-medium text-white">{flag.name}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{flag.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide flex items-center">
                        <ArrowsUpDownIcon className="h-4 w-4 mr-1 text-gray-500" />
                        Transfer Categories
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {customFlags.filter(flag => flag.category === 'transfer').map((flag) => (
                          <label key={flag.id} className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              {...registerFlag('flagId')}
                              value={flag.id}
                              className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${flag.color} mr-2`} />
                                <span className="text-sm font-medium text-white">{flag.name}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{flag.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Custom Flag Option */}
                    <div className="border-t border-slate-600 pt-4">
                      <label className="flex items-center p-3 rounded-lg border border-dashed border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          {...registerFlag('flagId')}
                          value="custom"
                          className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <PlusIcon className="w-4 h-4 text-blue-400 mr-2" />
                            <span className="text-sm font-medium text-white">Create Custom Flag</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Enter your own custom flag name</p>
                        </div>
                      </label>
                    </div>

                    {/* No Flag Option */}
                    <div>
                      <label className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          {...registerFlag('flagId')}
                          value=""
                          className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <XMarkIcon className="w-4 h-4 text-slate-400 mr-2" />
                            <span className="text-sm font-medium text-white">Remove Flag</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Clear any existing flag</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Custom Flag Input */}
                {watchFlag('flagId') === 'custom' && (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                    <Input
                      {...registerFlag('customFlag', { required: watchFlag('flagId') === 'custom' ? 'Custom flag name is required' : false })}
                      label="Custom Flag Name"
                      placeholder="Enter custom flag name (e.g., Special Event, Emergency Fund)"
                      error={flagErrors.customFlag?.message}
                    />
                    <Input
                      {...registerFlag('description')}
                      label="Description (Optional)"
                      placeholder="Describe what this flag represents"
                    />
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    {...registerFlag('notes')}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Add any additional notes about this transaction..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-600">
                <div className="flex items-center text-xs text-slate-400">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Last flagged: {selectedTransaction.updatedAt ? new Date(selectedTransaction.updatedAt).toLocaleString() : 'Never'}
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setFlagModalOpen(false)
                      resetFlag()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <FlagIcon className="h-4 w-4 mr-2" />
                    Apply Flag
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Modal>

        {/* Professional Export Modal */}
        <Modal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          title="Export Transactions"
          size="lg"
        >
          <form onSubmit={handleExportSubmit(onSubmitExport)} className="space-y-6">
            {/* Export Summary */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">Export Summary</h3>
                <DocumentArrowDownIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Total Transactions:</span>
                  <span className="text-white font-medium ml-2">{pagination.total}</span>
                </div>
                <div>
                  <span className="text-slate-400">Filtered Results:</span>
                  <span className="text-white font-medium ml-2">{transactions.length}</span>
                </div>
                <div>
                  <span className="text-slate-400">Income Total:</span>
                  <span className="text-green-400 font-medium ml-2">
                    {formatCurrency(transactions.reduce((sum, t) => sum + (t.type === 'Kredit' ? parseFloat(t.Amount) : 0), 0))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Expense Total:</span>
                  <span className="text-red-400 font-medium ml-2">
                    {formatCurrency(transactions.reduce((sum, t) => sum + (t.type === 'Debit' ? parseFloat(t.Amount) : 0), 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Format */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300 block">Export Format</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      {...registerExport('format', { required: 'Please select an export format' })}
                      value="pdf"
                      className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 text-red-400 mr-2" />
                        <span className="text-sm font-medium text-white">PDF Report</span>
                      </div>
                      <p className="text-xs text-slate-400">Professional formatted document</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      {...registerExport('format')}
                      value="excel"
                      className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-white">Excel Workbook</span>
                      </div>
                      <p className="text-xs text-slate-400">Spreadsheet with formulas & charts</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      {...registerExport('format')}
                      value="csv"
                      className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-sm font-medium text-white">CSV Data</span>
                      </div>
                      <p className="text-xs text-slate-400">Raw data for analysis</p>
                    </div>
                  </label>
                </div>
                {exportErrors.format && (
                  <p className="text-red-400 text-xs mt-1">{exportErrors.format.message}</p>
                )}
              </div>

              {/* Template Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300 block">Report Template</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      {...registerExport('template', { required: 'Please select a template' })}
                      value="detailed"
                      className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-white">Detailed Report</div>
                      <p className="text-xs text-slate-400">All transaction details</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      {...registerExport('template')}
                      value="summary"
                      className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-white">Summary Report</div>
                      <p className="text-xs text-slate-400">Aggregated data & totals</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      {...registerExport('template')}
                      value="financial"
                      className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-white">Financial Statement</div>
                      <p className="text-xs text-slate-400">Income/expense analysis</p>
                    </div>
                  </label>
                </div>
                {exportErrors.template && (
                  <p className="text-red-400 text-xs mt-1">{exportErrors.template.message}</p>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 block">Date Range</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...registerExport('dateRange')}
                    value="current"
                    defaultChecked
                    className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                  />
                  <span className="ml-2 text-sm text-white">Use current filters</span>
                  <span className="ml-2 text-xs text-slate-400">
                    ({filters.startDate || 'All time'} - {filters.endDate || 'Now'})
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...registerExport('dateRange')}
                    value="custom"
                    className="text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                  />
                  <span className="ml-2 text-sm text-white">Custom range</span>
                </label>
              </div>

              {watchExport('dateRange') === 'custom' && (
                <div className="grid grid-cols-2 gap-3 ml-6 animate-in slide-in-from-top-2">
                  <Input
                    type="date"
                    {...registerExport('customStartDate')}
                    label="Start Date"
                  />
                  <Input
                    type="date"
                    {...registerExport('customEndDate')}
                    label="End Date"
                  />
                </div>
              )}
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 block">Additional Options</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...registerExport('includeFlags')}
                    className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-white">Include flag information</span>
                </label>

                <div className="ml-6">
                  <Select
                    {...registerExport('groupBy')}
                    options={[
                      { value: 'none', label: 'No grouping' },
                      { value: 'account', label: 'Group by Account' },
                      { value: 'flag', label: 'Group by Flag' },
                      { value: 'type', label: 'Group by Type' },
                      { value: 'date', label: 'Group by Date' }
                    ]}
                    label="Group transactions by"
                    defaultValue="none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-600">
              <div className="text-xs text-slate-400">
                Export will include {selectedTransactions.size > 0 ? selectedTransactions.size : transactions.length} transactions
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setExportModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isExporting}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  {isExporting ? 'Generating...' : 'Generate Export'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}