'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, LoadingPage, Modal, Input, Select } from '@/components/ui'
import { SyncNotification } from '@/components/SyncNotification'
import { SyncConfigModal, type SyncConfig } from '@/components/SyncConfigModal'
import { apiService } from '@/services/api'
import { socketService } from '@/services/socket'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Account, Bank, ScrapingOption } from '@/types'
import { useForm } from 'react-hook-form'
import {
  BuildingLibraryIcon,
  RocketLaunchIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PlusIcon,
  PencilIcon,
  InformationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface AccountFormData {
  accountNumber: string
  companyId: string
  username: string
  password: string
  bankId: number
  autoSync: boolean
  isActive: boolean
}

interface CronFormData {
  isActive: boolean
  cronExpression: string
  browserType: 'chrome' | 'firefox'
  maxRetries: number
  lookbackDays?: number
  startTime?: string
  endTime?: string
  daysOfWeek?: number[]
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncingAccounts, setSyncingAccounts] = useState<Set<number>>(new Set())
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isCronModalOpen, setIsCronModalOpen] = useState(false)
  const [isSyncNotificationOpen, setIsSyncNotificationOpen] = useState(false)
  const [syncNotificationProps, setSyncNotificationProps] = useState<{
    syncType: 'single' | 'all'
    accountName?: string
  }>({ syncType: 'all' })
  const [isSyncConfigOpen, setIsSyncConfigOpen] = useState(false)
  const [syncConfigProps, setSyncConfigProps] = useState<{
    syncType: 'single' | 'all'
    accountId?: number
    accountName?: string
  }>({ syncType: 'all' })
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [selectedAccountForCron, setSelectedAccountForCron] = useState<Account | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSyncSubmitting, setIsSyncSubmitting] = useState(false)

  const { register: registerAccount, handleSubmit: handleAccountSubmit, reset: resetAccount, watch: watchAccount, setValue: setValueAccount, formState: { errors: accountErrors } } = useForm<AccountFormData>()
  const { register: registerCron, handleSubmit: handleCronSubmit, reset: resetCron, watch: watchCron, setValue: setCronValue, formState: { errors: cronErrors } } = useForm<CronFormData>({
    defaultValues: {
      isActive: true,
      cronExpression: '*/5 * * * *',
      browserType: 'chrome',
      maxRetries: 3,
      lookbackDays: 2,
      startTime: '00:00',
      endTime: '23:59',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
    }
  })

  useEffect(() => {
    fetchAccounts()
    fetchBanks()
  }, [])

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getAccounts()
      if (response.success) {
        setAccounts(response.data.accounts)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBanks = async () => {
    try {
      const response = await apiService.getBanks()
      if (response.success) {
        setBanks(response.data.banks)
      }
    } catch (error) {
      console.error('Failed to fetch banks:', error)
    }
  }

  const handleCreateAccount = () => {
    setEditingAccount(null)
    resetAccount()
    setIsAccountModalOpen(true)
  }

  const handleEditCron = async (account: Account) => {
    setSelectedAccountForCron(account)
    
    if (account.ScrapingOption) {
      const option = account.ScrapingOption
      setCronValue('isActive', option.isActive)
      setCronValue('cronExpression', option.cronExpression)
      setCronValue('browserType', option.browserType as 'chrome' | 'firefox')
      setCronValue('maxRetries', option.maxRetries)
    } else {
      // Default values - all active by default
      resetCron({
        isActive: true,
        cronExpression: '*/5 * * * *', // Default to 5 minutes
        browserType: 'chrome',
        maxRetries: 3,
        lookbackDays: 2,
        startTime: '00:00',
        endTime: '23:59',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // All days active
      })
    }
    
    setIsCronModalOpen(true)
  }

  const onSubmitAccount = async (data: AccountFormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Validate bankId
      if (!data.bankId || data.bankId <= 0) {
        setSubmitError('Silakan pilih bank')
        return
      }

      await apiService.createAccount(data)
      setIsAccountModalOpen(false)
      fetchAccounts()
      resetAccount()
    } catch (error: any) {
      console.error('Failed to save account:', error)
      setSubmitError(error.response?.data?.message || 'Gagal membuat akun. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitCron = async (data: CronFormData) => {
    if (!selectedAccountForCron) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Validate required fields
      if (data.isActive && !data.cronExpression) {
        setSubmitError('Please select a sync frequency')
        return
      }

      if (data.isActive && !data.browserType) {
        setSubmitError('Please select a browser type')
        return
      }

      // Prepare scraping options data according to API specification
      const scrapingOptions = {
        isActive: data.isActive,
        cronExpression: data.cronExpression,
        lookbackDays: data.lookbackDays || 2, // Default to 2 days
        maxRetries: data.maxRetries || 3,
        browserType: data.browserType,
        daysOfWeek: data.daysOfWeek ? data.daysOfWeek.join(',') : '0,1,2,3,4,5,6', // Convert array to comma-separated string
        throttleTime: 0 // Default throttle time
      }

      // Update scraping options using the correct endpoint
      await apiService.updateBsiScrapingOption(selectedAccountForCron.id, scrapingOptions)

      setIsCronModalOpen(false)
      fetchAccounts()
      resetCron()
      setSelectedAccountForCron(null)
    } catch (error) {
      console.error('Failed to update scraping options:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to update scraping options')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSyncAccount = async (accountId: number) => {
    const account = accounts.find(a => a.id === accountId)
    
    // Show sync configuration modal first
    setSyncConfigProps({
      syncType: 'single',
      accountId,
      accountName: account ? `${account.accountNumber} (${account.Bank.name})` : 'Unknown Account'
    })
    setIsSyncConfigOpen(true)
  }

  const executeSyncAccount = async (accountId: number, config: SyncConfig) => {
    try {
      const account = accounts.find(a => a.id === accountId)
      
      // Show sync notification
      setSyncNotificationProps({
        syncType: 'single',
        accountName: account ? `${account.accountNumber} (${account.Bank.name})` : 'Unknown Account'
      })
      setIsSyncNotificationOpen(true)
      
      setSyncingAccounts(prev => new Set([...prev, accountId]))
      await apiService.syncAccount(accountId, {
        startDate: config.startDate,
        endDate: config.endDate,
        enablePreview: config.enablePreview
      })
      // Note: Real-time updates will be handled by the socket connection
    } catch (error) {
      console.error('Failed to start sync:', error)
    } finally {
      setSyncingAccounts(prev => {
        const newSet = new Set(prev)
        newSet.delete(accountId)
        return newSet
      })
    }
  }

  const handleSyncAll = async () => {
    // Show sync configuration modal first
    setSyncConfigProps({
      syncType: 'all'
    })
    setIsSyncConfigOpen(true)
  }

  const executeSyncAll = async (config: SyncConfig) => {
    try {
      // Show sync notification
      setSyncNotificationProps({
        syncType: 'all'
      })
      setIsSyncNotificationOpen(true)
      
      const accountIds = accounts.map(account => account.id)
      setSyncingAccounts(new Set(accountIds))
      await apiService.syncAllAccounts({
        startDate: config.startDate,
        endDate: config.endDate,
        enablePreview: config.enablePreview
      })
    } catch (error) {
      console.error('Failed to start batch sync:', error)
    } finally {
      setSyncingAccounts(new Set())
    }
  }

  const getStatusBadge = (account: Account) => {
    if (!account.ScrapingOption) {
      return <Badge variant="secondary">No Scraping</Badge>
    }

    const option = account.ScrapingOption
    if (!option.isActive) {
      return <Badge variant="destructive">Disabled</Badge>
    }

    switch (option.lastStatus) {
      case 'success':
        return <Badge variant="success">Active</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'running':
        return <Badge variant="info">Running</Badge>
      default:
        return <Badge variant="warning">Pending</Badge>
    }
  }

  const getLastRunInfo = (account: Account) => {
    if (!account.ScrapingOption?.lastRun) {
      return 'Never'
    }
    return formatDate(account.ScrapingOption.lastRun)
  }

  if (isLoading) {
    return (
      <AdminLayout title="Akun" description="Kelola akun BSI dan pengaturan sinkronisasi">
        <LoadingPage text="Memuat akun..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Akun" description="Kelola akun BSI dan pengaturan sinkronisasi">
      <div className="space-y-3 sm:space-y-4">
        {/* Compact Header */}
        <div className="bg-white px-3 sm:px-4 py-3 rounded-lg border border-slate-200">
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="col-span-2 sm:col-span-1 grid grid-cols-2 sm:flex sm:items-center gap-3 sm:space-x-6">
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-slate-900">{accounts.length}</span>
                <span className="text-slate-500 hidden sm:inline"> Total Akun</span>
                <span className="text-slate-500 sm:hidden"> Total</span>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-green-600">{accounts.filter(a => a.isActive).length}</span>
                <span className="text-slate-500"> Aktif</span>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-blue-600">{accounts.filter(a => a.ScrapingOption?.isActive).length}</span>
                <span className="text-slate-500 hidden sm:inline"> Auto-Sync</span>
                <span className="text-slate-500 sm:hidden"> Sync</span>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-red-600">{accounts.filter(a => a.ScrapingOption?.lastStatus === 'error').length}</span>
                <span className="text-slate-500"> Error</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
              <Button
                onClick={handleCreateAccount}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial"
              >
                <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Tambah Akun</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
              <Button onClick={handleSyncAll} size="sm" className="flex-1 sm:flex-initial">
                <RocketLaunchIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Sync Semua</span>
                <span className="sm:hidden">Sync</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 text-center py-12">
            <BuildingLibraryIcon className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-400">Tidak ada akun ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">Klik "Tambah Akun" untuk menambahkan akun BSI</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card Header with Bank Logo */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {account.Bank.logoUrl ? (
                        <img
                          src={account.Bank.logoUrl}
                          alt={account.Bank.name}
                          className="h-8 w-8 rounded-md object-contain flex-shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-slate-300 flex items-center justify-center flex-shrink-0">
                          <BuildingLibraryIcon className="h-4 w-4 text-slate-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900">{account.Bank.name}</div>
                        <div className="text-xs text-slate-500">{account.Bank.code}</div>
                      </div>
                    </div>
                    {getStatusBadge(account)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Account Number */}
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Nomor Rekening</div>
                    <div className="text-sm font-mono font-semibold text-slate-900 break-all">
                      {account.accountNumber}
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="bg-slate-50 rounded-md p-3">
                    <div className="text-xs text-slate-500 mb-1">Saldo Terakhir</div>
                    <div className="text-lg font-bold text-emerald-600">
                      {formatCurrency(account.lastBalance)}
                    </div>
                  </div>

                  {/* Account Type */}
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Tipe Akun</div>
                    <div className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {account.accountType}
                    </div>
                  </div>

                  {/* Sync Info */}
                  {account.ScrapingOption ? (
                    <div className="border-t border-slate-100 pt-3">
                      <div className="text-xs text-slate-500 mb-2">Sinkronisasi Otomatis</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">Jadwal:</span>
                          <span className="text-xs font-mono font-semibold text-slate-900">
                            {account.ScrapingOption.cronExpression}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">Status:</span>
                          <span
                            className={`text-xs font-medium ${
                              account.ScrapingOption.isActive
                                ? 'text-green-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {account.ScrapingOption.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">Sinkronisasi Terakhir:</span>
                          <span className="text-xs text-slate-700">{getLastRunInfo(account)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 pt-3 text-center">
                      <span className="text-xs text-slate-400">Tidak ada jadwal sinkronisasi</span>
                    </div>
                  )}

                  {/* Error Message */}
                  {account.ScrapingOption?.errorMessage && (
                    <div className="bg-red-50 border border-red-100 rounded-md p-2">
                      <p className="text-xs text-red-600 line-clamp-2">
                        <strong>Error:</strong> {account.ScrapingOption.errorMessage}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncAccount(account.id)}
                    loading={syncingAccounts.has(account.id)}
                    disabled={!account.isActive}
                    className="flex-1"
                  >
                    <PlayIcon className="h-3.5 w-3.5 mr-1" />
                    Sync
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCron(account)}
                    className="flex-1"
                  >
                    <CogIcon className="h-3.5 w-3.5 mr-1" />
                    Jadwal
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact Add Account Modal */}
        <Modal
          isOpen={isAccountModalOpen}
          onClose={() => {
            setIsAccountModalOpen(false)
            resetAccount()
            setSubmitError(null)
          }}
          title="Tambah Akun BSI"
          size="lg"
        >
          <form onSubmit={handleAccountSubmit(onSubmitAccount)} className="space-y-4">
            {/* Error Display */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{submitError}</p>
              </div>
            )}

            {/* Bank Selection Grid */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Pilih Bank</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {banks.map(bank => {
                  const isSelected = watchAccount('bankId') === bank.id
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setValueAccount('bankId', bank.id)}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5">
                          <CheckIcon className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}

                      {/* Bank Logo */}
                      <div className="w-8 h-8 mb-1.5 flex items-center justify-center bg-slate-50 rounded border border-slate-200">
                        {bank.logoUrl ? (
                          <Image
                            src={bank.logoUrl}
                            alt={bank.name}
                            width={32}
                            height={32}
                            className="h-7 w-7 object-contain"
                          />
                        ) : (
                          <BuildingLibraryIcon className="h-4 w-4 text-slate-400" />
                        )}
                      </div>

                      {/* Bank Info */}
                      <div className="text-center min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{bank.name}</div>
                        <div className="text-[10px] text-slate-500">{bank.code}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
              {accountErrors.bankId && (
                <p className="text-xs text-red-600 mt-1">{accountErrors.bankId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">

              <Input
                label="Nomor Rekening"
                {...registerAccount('accountNumber', {
                  required: 'Nomor rekening wajib diisi',
                  pattern: {
                    value: /^[0-9]{10,20}$/,
                    message: 'Masukkan nomor rekening yang valid'
                  }
                })}
                error={accountErrors.accountNumber?.message}
                placeholder="1234567890123456"
              />

              <Input
                label="ID Perusahaan"
                {...registerAccount('companyId', { required: 'ID Perusahaan wajib diisi' })}
                error={accountErrors.companyId?.message}
                placeholder="ID Perusahaan"
              />

              <Input
                label="Username"
                {...registerAccount('username', { required: 'Username wajib diisi' })}
                error={accountErrors.username?.message}
                placeholder="Username BSI"
              />

              <Input
                label="Password"
                type="password"
                {...registerAccount('password', {
                  required: 'Password wajib diisi',
                  minLength: {
                    value: 6,
                    message: 'Password minimal 6 karakter'
                  }
                })}
                error={accountErrors.password?.message}
                placeholder="Password BSI"
              />
            </div>

            {/* Compact Settings */}
            <div className="bg-slate-50 rounded-md p-3 space-y-2">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  {...registerAccount('autoSync')}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                  defaultChecked
                />
                <span className="text-slate-700">Aktifkan sinkronisasi otomatis</span>
              </label>

              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  {...registerAccount('isActive')}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                  defaultChecked
                />
                <span className="text-slate-700">Akun aktif</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAccountModalOpen(false)
                  resetAccount()
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={isSubmitting}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Tambah Akun
              </Button>
            </div>
          </form>
        </Modal>

        {/* Compact Cron Settings Modal */}
        <Modal
          isOpen={isCronModalOpen}
          onClose={() => setIsCronModalOpen(false)}
          title="Jadwal Sinkronisasi"
          size="md"
        >
          <form onSubmit={handleCronSubmit(onSubmitCron)} className="space-y-4">
            {/* Account Info */}
            <div className="bg-slate-50 rounded-md p-3">
              <div className="text-xs text-slate-500">Akun</div>
              <div className="text-sm font-medium text-slate-900">{selectedAccountForCron?.accountNumber}</div>
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{submitError}</p>
              </div>
            )}

            {/* Enable/Disable */}
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                id="isActive"
                {...registerCron('isActive')}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              <span className="font-medium text-slate-900">Aktifkan Sinkronisasi Otomatis</span>
            </label>

            {watchCron('isActive') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Frekuensi"
                    value={watchCron('cronExpression') || ''}
                    onChange={(value) => setCronValue('cronExpression', value as string)}
                    options={[
                      { value: '*/2 * * * *', label: 'Setiap 2 Menit' },
                      { value: '*/5 * * * *', label: 'Setiap 5 Menit' },
                      { value: '*/10 * * * *', label: 'Setiap 10 Menit' },
                      { value: '*/15 * * * *', label: 'Setiap 15 Menit' },
                      { value: '*/20 * * * *', label: 'Setiap 20 Menit' },
                      { value: '*/30 * * * *', label: 'Setiap 30 Menit' },
                      { value: '0 */1 * * *', label: 'Setiap Jam' },
                      { value: '0 */2 * * *', label: 'Setiap 2 Jam' },
                      { value: '0 */3 * * *', label: 'Setiap 3 Jam' },
                      { value: '0 */6 * * *', label: 'Setiap 6 Jam' },
                      { value: '0 */12 * * *', label: 'Setiap 12 Jam' },
                      { value: '0 0 * * *', label: 'Harian (Tengah Malam)' },
                      { value: '0 9 * * *', label: 'Harian (09:00)' }
                    ]}
                    error={cronErrors.cronExpression?.message}
                  />

                  <Select
                    label="Browser"
                    value={watchCron('browserType') || ''}
                    onChange={(value) => setCronValue('browserType', value as 'chrome' | 'firefox')}
                    options={[
                      { value: 'chrome', label: 'Chrome' },
                      { value: 'firefox', label: 'Firefox' }
                    ]}
                    error={cronErrors.browserType?.message}
                  />

                  <Input
                    label="Waktu Mulai"
                    type="time"
                    {...registerCron('startTime')}
                    error={cronErrors.startTime?.message}
                  />

                  <Input
                    label="Waktu Selesai"
                    type="time"
                    {...registerCron('endTime')}
                    error={cronErrors.endTime?.message}
                  />

                  <div className="col-span-2">
                    <Input
                      label="Max Percobaan Ulang"
                      type="number"
                      min="1"
                      max="10"
                      {...registerCron('maxRetries', {
                        required: 'Max retries wajib diisi',
                        valueAsNumber: true,
                        min: { value: 1, message: 'Minimum 1' },
                        max: { value: 10, message: 'Maximum 10' }
                      })}
                      error={cronErrors.maxRetries?.message}
                    />
                  </div>
                </div>

                {/* Lookback Days Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">
                    Lookback Days (Hari ke Belakang)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 5, 7, 10, 14, 21, 30].map((days) => (
                      <Button
                        key={days}
                        type="button"
                        variant={watchCron('lookbackDays') === days ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCronValue('lookbackDays', days)}
                        className="text-xs h-8"
                      >
                        {days} {days === 1 ? 'Hari' : 'Hari'}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Pilih berapa hari transaksi ke belakang yang akan disinkronisasi (max 30 hari)
                  </p>
                </div>

                {/* Days of Week */}
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-2 block">
                    Hari Aktif
                  </label>
                  <div className="grid grid-cols-7 gap-1">
                    {[
                      { value: 1, label: 'Sen' },
                      { value: 2, label: 'Sel' },
                      { value: 3, label: 'Rab' },
                      { value: 4, label: 'Kam' },
                      { value: 5, label: 'Jum' },
                      { value: 6, label: 'Sab' },
                      { value: 0, label: 'Min' }
                    ].map(day => {
                      const currentDays = watchCron('daysOfWeek') || []
                      const isChecked = currentDays.includes(day.value)

                      return (
                        <label key={day.value} className="flex flex-col items-center p-1.5 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 text-center">
                          <input
                            type="checkbox"
                            value={day.value}
                            checked={isChecked}
                            onChange={(e) => {
                              const days = watchCron('daysOfWeek') || []
                              if (e.target.checked) {
                                setCronValue('daysOfWeek', [...days, day.value])
                              } else {
                                setCronValue('daysOfWeek', days.filter(d => d !== day.value))
                              }
                            }}
                            className="mb-0.5 scale-75"
                          />
                          <span className="text-xs text-slate-700">{day.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-xs text-blue-800">
                  <strong>Cron:</strong> <code className="bg-blue-100 px-1.5 py-0.5 rounded">{watchCron('cronExpression')}</code>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCronModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" loading={isSubmitting}>
                <CogIcon className="h-4 w-4 mr-1" />
                Simpan
              </Button>
            </div>
          </form>
        </Modal>

        {/* Sync Configuration Modal */}
        <SyncConfigModal
          isOpen={isSyncConfigOpen}
          onClose={() => setIsSyncConfigOpen(false)}
          onConfirm={(config) => {
            setIsSyncConfigOpen(false)
            setIsSyncSubmitting(true)
            if (syncConfigProps.syncType === 'single' && syncConfigProps.accountId) {
              executeSyncAccount(syncConfigProps.accountId, config)
            } else if (syncConfigProps.syncType === 'all') {
              executeSyncAll(config)
            }
            setIsSyncSubmitting(false)
          }}
          syncType={syncConfigProps.syncType}
          accountName={syncConfigProps.accountName}
          isSubmitting={isSyncSubmitting}
        />

        {/* Sync Notification */}
        <SyncNotification
          isOpen={isSyncNotificationOpen}
          onClose={() => setIsSyncNotificationOpen(false)}
          syncType={syncNotificationProps.syncType}
          accountName={syncNotificationProps.accountName}
        />
      </div>
    </AdminLayout>
  )
}