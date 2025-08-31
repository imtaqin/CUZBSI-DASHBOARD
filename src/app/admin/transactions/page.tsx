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

const PREDEFINED_FLAGS: CustomFlag[] = [
  // Income flags
  { id: 'donatur', name: 'Donatur', color: 'bg-green-600', description: 'Donation received', category: 'income' },
  { id: 'member', name: 'Member', color: 'bg-blue-600', description: 'Membership fee', category: 'income' },
  { id: 'sponsor', name: 'Sponsor', color: 'bg-purple-600', description: 'Sponsorship income', category: 'income' },
  { id: 'grant', name: 'Grant', color: 'bg-emerald-600', description: 'Grant funding', category: 'income' },
  { id: 'fundraising', name: 'Fundraising', color: 'bg-teal-600', description: 'Fundraising event', category: 'income' },
  
  // Expense flags
  { id: 'operational', name: 'Operational', color: 'bg-red-600', description: 'Operational expenses', category: 'expense' },
  { id: 'program', name: 'Program', color: 'bg-orange-600', description: 'Program expenses', category: 'expense' },
  { id: 'admin', name: 'Administrative', color: 'bg-yellow-600', description: 'Administrative costs', category: 'expense' },
  { id: 'marketing', name: 'Marketing', color: 'bg-pink-600', description: 'Marketing & promotion', category: 'expense' },
  { id: 'utilities', name: 'Utilities', color: 'bg-indigo-600', description: 'Utilities & maintenance', category: 'expense' },
  
  // Transfer flags
  { id: 'internal', name: 'Internal Transfer', color: 'bg-gray-600', description: 'Internal account transfer', category: 'transfer' },
  { id: 'external', name: 'External Transfer', color: 'bg-slate-600', description: 'External transfer', category: 'transfer' },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [sortConfig, setSortConfig] = useState({ field: 'date', direction: 'desc' as 'asc' | 'desc' })
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set())
  const [flagModalOpen, setFlagModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [customFlags, setCustomFlags] = useState<CustomFlag[]>([])
  
  // Form handling for flag management
  const { register: registerFlag, handleSubmit: handleFlagSubmit, reset: resetFlag, watch: watchFlag, formState: { errors: flagErrors } } = useForm<FlagFormData>()

  const debouncedSearch = debounce((searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }, 300)

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
  }, [filters, pagination.currentPage, sortConfig])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getTransactions({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction
      })
      
      if (response.success) {
        setTransactions(response.data.transactions)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await apiService.getAccounts()
      if (response.success) {
        setAccounts(response.data.accounts)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleFlagTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setFlagModalOpen(true)
  }

  const getFlagVariant = (flag: string) => {
    const flagVariants: Record<string, string> = {
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

  const onSubmitFlag = async (data: FlagFormData) => {
    if (!selectedTransaction) return
    
    try {
      let flagToApply = data.flagId
      
      // Handle custom flag creation
      if (data.flagId === 'custom' && data.customFlag) {
        const newCustomFlag: CustomFlag = {
          id: `custom_${Date.now()}`,
          name: data.customFlag,
          color: 'bg-gray-500',
          description: data.notes || '',
          category: 'custom'
        }
        setCustomFlags(prev => [...prev, newCustomFlag])
        flagToApply = newCustomFlag.id
      }
      
      // Update transaction with flag
      const response = await apiService.updateTransactionFlag(selectedTransaction.id, {
        flagId: flagToApply,
        notes: data.notes
      })
      
      if (response.success) {
        // Update local state
        setTransactions(prev => prev.map(t => 
          t.id === selectedTransaction.id 
            ? { ...t, flag: flagToApply, notes: data.notes }
            : t
        ))
        
        // Close modal and reset form
        setFlagModalOpen(false)
        resetFlag()
        setSelectedTransaction(null)
        
        // Show success message
        console.log('Flag applied successfully')
      }
    } catch (error) {
      console.error('Failed to apply flag:', error)
      alert('Failed to apply flag. Please try again.')
    }
  }

  const handleBulkAction = (action: 'flag' | 'export' | 'delete') => {
    console.log(`Bulk action: ${action} for transactions:`, Array.from(selectedTransactions))
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

  const toggleSelectAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id)))
    }
  }

  if (isLoading && transactions.length === 0) {
    return (
      <AdminLayout title="Transaksi" description="Lihat dan kelola semua transaksi BSI">
        <LoadingPage text="Memuat transaksi..." />
      </AdminLayout>
    )
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <AdminLayout title="Manajemen Transaksi" description="Pelacakan dan analisis transaksi lanjutan">
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
                  <p className="text-2xl font-bold">{pagination.totalItems}</p>
                </div>
                <BanknotesIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pemasukan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
                <ArrowsUpDownIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
                <ArrowsUpDownIcon className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saldo Bersih</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
                      transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5" />
                Filter & Pencarian
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount} filter aktif</Badge>
                )}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({})}
                disabled={activeFiltersCount === 0}
              >
                Reset Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pencarian</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari transaksi..."
                    className="pl-10"
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Akun</label>
                <Select
                  value={filters.accountId?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('accountId', value ? parseInt(value) : undefined)}
                >
                  <option value="">Semua Akun</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipe</label>
                <Select
                  value={filters.type || ''}
                  onValueChange={(value) => handleFilterChange('type', value || undefined)}
                >
                  <option value="">Semua Tipe</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                  <option value="transfer">Transfer</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedTransactions.size > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedTransactions.size} transaksi dipilih
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('flag')}
                  >
                    <FlagIcon className="h-4 w-4 mr-2" />
                    Tandai
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Ekspor
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Tidak ada transaksi ditemukan</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.size === transactions.length && transactions.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-2">
                          Tanggal
                          <ArrowsUpDownIcon className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Akun</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Jumlah
                          <ArrowsUpDownIcon className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedTransactions.has(transaction.id)}
                            onChange={() => toggleTransactionSelection(transaction.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                            {formatDate(transaction.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={transaction.description}>
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                            {transaction.account?.name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getFlagVariant(transaction.type)}>
                            {transaction.type === 'income' ? 'Pemasukan' : 
                             transaction.type === 'expense' ? 'Pengeluaran' : 'Transfer'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={transaction.type === 'income' ? 'text-green-600' : 
                                         transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'}>
                            {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {transaction.flag ? (
                            <Badge variant="outline">
                              {PREDEFINED_FLAGS.find(f => f.id === transaction.flag)?.name || transaction.flag}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Belum ditandai</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFlagTransaction(transaction)}
                            >
                              <FlagIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flag Management Modal */}
        <Modal
          isOpen={flagModalOpen}
          onClose={() => {
            setFlagModalOpen(false)
            setSelectedTransaction(null)
            resetFlag()
          }}
          title="Kelola Penanda Transaksi"
        >
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Details */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Detail Transaksi</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Jumlah:</span>
                    <p className="font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tanggal:</span>
                    <p className="font-medium">{formatDate(selectedTransaction.date)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Akun:</span>
                    <p className="font-medium">{selectedTransaction.account?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deskripsi:</span>
                    <p className="font-medium">{selectedTransaction.description}</p>
                  </div>
                </div>
              </div>

              {/* Flag Selection Form */}
              <form onSubmit={handleFlagSubmit(onSubmitFlag)} className="space-y-6">
                {/* Predefined Flags */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Pilih Kategori Penanda</label>
                  <div className="space-y-2">
                    {['income', 'expense', 'transfer'].map(category => (
                      <div key={category}>
                        <h5 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                          {category === 'income' ? 'Pemasukan' : category === 'expense' ? 'Pengeluaran' : 'Transfer'}
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                          {PREDEFINED_FLAGS.filter(flag => flag.category === category).map(flag => (
                            <label key={flag.id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-muted/50">
                              <input
                                type="radio"
                                value={flag.id}
                                {...registerFlag('flagId')}
                                className="text-primary"
                              />
                              <span className={`w-3 h-3 rounded-full ${flag.color}`}></span>
                              <span className="text-sm">{flag.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Flag Option */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-muted/50">
                    <input
                      type="radio"
                      value="custom"
                      {...registerFlag('flagId')}
                      className="text-primary"
                    />
                    <span className="text-sm font-medium">Penanda Kustom</span>
                  </label>
                  
                  {watchFlag('flagId') === 'custom' && (
                    <div className="ml-6 space-y-2">
                      <Input
                        placeholder="Nama penanda kustom"
                        {...registerFlag('customFlag', { required: watchFlag('flagId') === 'custom' })}
                      />
                      {flagErrors.customFlag && (
                        <p className="text-sm text-destructive">Nama penanda kustom wajib diisi</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Remove Flag Option */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-muted/50">
                    <input
                      type="radio"
                      value=""
                      {...registerFlag('flagId')}
                      className="text-primary"
                    />
                    <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Hapus Penanda</span>
                  </label>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catatan (Opsional)</label>
                  <textarea
                    placeholder="Tambahkan catatan untuk transaksi ini..."
                    className="w-full p-2 border rounded-md resize-none"
                    rows={3}
                    {...registerFlag('notes')}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFlagModalOpen(false)
                      setSelectedTransaction(null)
                      resetFlag()
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit">
                    Terapkan Penanda
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  )
}