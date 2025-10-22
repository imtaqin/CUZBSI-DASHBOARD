'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Button, Input, Modal, LoadingPage, Pagination, Badge } from '@/components/ui'
import { apiService } from '@/services/api'
import { formatCurrency, debounce } from '@/lib/utils'
import type { Transaction, Account, PaginationInfo } from '@/types'
import { useForm } from 'react-hook-form'
import {
  FunnelIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  BanknotesIcon,
  UserIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon,
  EyeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

interface TransactionFilters {
  accountId?: number
  startDate?: string
  endDate?: string
  type?: string
  flag?: string
  search?: string
}

interface FlagFormData {
  flagId?: string
  phoneNumber?: string
  name?: string
  notes?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [flags, setFlags] = useState<any[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [sortConfig, setSortConfig] = useState({ field: 'tanggal', direction: 'desc' as 'asc' | 'desc' })
  const [flagModalOpen, setFlagModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const { register: registerFlag, handleSubmit: handleFlagSubmit, reset: resetFlag, setValue: setFlagValue } = useForm<FlagFormData>()

  const debouncedSearch = debounce((searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }, 300)

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
    fetchFlags()
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
        if (response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.page,
            totalPages: response.data.pagination.totalPages,
            totalItems: response.data.pagination.total,
            itemsPerPage: response.data.pagination.limit
          })
        }
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

  const fetchFlags = async () => {
    try {
      const response = await apiService.getFlags()
      if (response.success) {
        setFlags(response.data.flags)
      }
    } catch (error) {
      console.error('Error fetching flags:', error)
    }
  }

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFlagTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    // Pre-fill flag if already set
    if (transaction.flag) {
      setFlagValue('flagId', transaction.flag)
    }
    // Pre-fill phone and name if available
    if (transaction.senderPhone) {
      setFlagValue('phoneNumber', transaction.senderPhone)
    }
    if (transaction.senderName) {
      setFlagValue('name', transaction.senderName)
    }
    setFlagModalOpen(true)
  }

  const onSubmitFlag = async (data: FlagFormData) => {
    if (!selectedTransaction) return

    try {
      const response = await apiService.updateTransactionFlag(selectedTransaction.id, {
        flag: data.flagId,
        flagId: data.flagId,
        phoneNumber: data.phoneNumber,
        name: data.name,
        notes: data.notes
      })

      if (response.success) {
        await fetchTransactions()
        setFlagModalOpen(false)
        resetFlag()
        setSelectedTransaction(null)
      }
    } catch (error) {
      console.error('Failed to apply flag:', error)
      alert('Gagal menerapkan penanda. Silakan coba lagi.')
    }
  }

  if (isLoading && transactions.length === 0) {
    return (
      <AdminLayout title="Transaksi" description="Lihat dan kelola semua transaksi">
        <LoadingPage text="Memuat transaksi..." />
      </AdminLayout>
    )
  }

  // Calculate statistics
  const totalKredit = transactions.filter(t => t.type === 'Kredit').reduce((sum, t) => sum + parseFloat(t.Amount), 0)
  const totalDebit = transactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + parseFloat(t.Amount), 0)
  const processedCount = transactions.filter(t => t.isProcessed).length
  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <AdminLayout title="Transaksi" description="Kelola transaksi bank">
      <div className="space-y-4">
        {/* Header with Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Transaksi</h2>
                <p className="text-xs text-slate-500">Kelola dan pantau transaksi bank</p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-4 gap-4 pt-3 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Total Transaksi</div>
              <div className="text-lg font-semibold text-slate-900">{pagination.totalItems}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Total Pemasukan</div>
              <div className="text-lg font-semibold text-emerald-600">{formatCurrency(totalKredit)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Total Pengeluaran</div>
              <div className="text-lg font-semibold text-red-600">{formatCurrency(totalDebit)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Diproses</div>
              <div className="text-lg font-semibold text-blue-600">{processedCount}/{transactions.length}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white px-4 py-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <FunnelIcon className="h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">{activeFiltersCount}</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
              disabled={activeFiltersCount === 0}
              className="text-xs"
            >
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Cari transaksi..."
                className="pl-8 h-9 text-sm"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>

            <select
              value={filters.accountId?.toString() || ''}
              onChange={(e) => handleFilterChange('accountId', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-9 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Akun</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber} - {account.Bank?.name}
                </option>
              ))}
            </select>

            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="h-9 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Tipe</option>
              <option value="Kredit">Pemasukan</option>
              <option value="Debit">Pengeluaran</option>
            </select>

            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              className="h-9 text-sm"
              placeholder="Tanggal Mulai"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BanknotesIcon className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium">Tidak ada transaksi</p>
                <p className="text-xs mt-1">Transaksi akan muncul di sini</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('tanggal')}
                    >
                      <div className="flex items-center gap-1">
                        Tanggal
                        <ArrowsUpDownIcon className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Deskripsi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Pengirim</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Akun</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Tipe</th>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('Amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Jumlah
                        <ArrowsUpDownIcon className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Penanda</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-900">
                          {new Date(transaction.tanggal).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(transaction.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-900 max-w-xs truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                        {transaction.unique && (
                          <div className="text-xs text-slate-500 font-mono">{transaction.unique}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {transaction.senderName ? (
                          <div className="text-sm text-slate-900 flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            {transaction.senderName}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                        {transaction.senderPhone && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <PhoneIcon className="h-3 w-3" />
                            {transaction.senderPhone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-900">{transaction.Account?.accountNumber}</div>
                        <div className="text-xs text-slate-500">{transaction.Account?.Bank?.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          transaction.type === 'Kredit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type}
                        </span>
                        {transaction.isProcessed && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                            <CheckCircleIcon className="h-3 w-3" />
                            Diproses
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={`font-mono text-sm font-medium ${
                          transaction.type === 'Kredit' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'Debit' ? '-' : '+'}{formatCurrency(parseFloat(transaction.Amount))}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Saldo: {formatCurrency(parseFloat(transaction.Balance))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {transaction.flag ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            <FlagIcon className="h-3 w-3" />
                            {flags.find(f => f.id === transaction.flag)?.name || transaction.flag}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleFlagTransaction(transaction)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                            title="Kelola Penanda"
                          >
                            <FlagIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {transactions.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Flag Management Modal */}
        <Modal
          isOpen={flagModalOpen}
          onClose={() => {
            setFlagModalOpen(false)
            setSelectedTransaction(null)
            resetFlag()
          }}
          title="Kelola Penanda Transaksi"
          size="lg"
        >
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Details */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Detail Transaksi</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Jumlah:</span>
                    <p className="font-semibold text-slate-900">{formatCurrency(parseFloat(selectedTransaction.Amount))}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Tanggal:</span>
                    <p className="font-semibold text-slate-900">{new Date(selectedTransaction.tanggal).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Akun:</span>
                    <p className="font-semibold text-slate-900">{selectedTransaction.Account?.accountNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Tipe:</span>
                    <p className="font-semibold text-slate-900">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                        selectedTransaction.type === 'Kredit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {selectedTransaction.type}
                      </span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block mb-1">Deskripsi:</span>
                    <p className="font-medium text-slate-900">{selectedTransaction.description}</p>
                  </div>
                  {selectedTransaction.senderName && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block mb-1">Pengirim:</span>
                      <p className="font-medium text-slate-900">{selectedTransaction.senderName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Flag Selection Form */}
              <form onSubmit={handleFlagSubmit(onSubmitFlag)} className="space-y-6">
                {/* Flags from API */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Pilih Penanda</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {flags?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {flags.map(flag => (
                          <label key={flag.id} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                            <input
                              type="radio"
                              value={flag.id}
                              {...registerFlag('flagId')}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: flag.color || '#6b7280' }}
                            ></span>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-slate-900 block truncate">{flag.name}</span>
                              {flag.description && (
                                <span className="text-xs text-slate-500 block truncate">{flag.description}</span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">Tidak ada penanda tersedia</p>
                    )}
                  </div>
                </div>

                {/* Remove Flag Option */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      value=""
                      {...registerFlag('flagId')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <XMarkIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Hapus Penanda</span>
                  </label>
                </div>

                {/* Contact Information for Notification */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <h5 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4" />
                    Informasi Kontak untuk Notifikasi
                  </h5>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Nomor Telepon"
                      placeholder="08123456789"
                      {...registerFlag('phoneNumber')}
                      className="bg-white"
                    />

                    <Input
                      label="Nama"
                      placeholder="Nama penerima"
                      {...registerFlag('name')}
                      className="bg-white"
                    />
                  </div>

                  <p className="text-xs text-blue-700">
                    Nomor telepon akan digunakan untuk mengirim notifikasi WhatsApp jika penanda memiliki template notifikasi.
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Catatan (Opsional)</label>
                  <textarea
                    placeholder="Tambahkan catatan untuk transaksi ini..."
                    className="w-full p-3 border border-slate-200 rounded-lg resize-none text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    {...registerFlag('notes')}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
