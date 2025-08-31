'use client'

import { useState, useEffect } from 'react'
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
  InformationCircleIcon
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
  startTime: string
  endTime: string
  daysOfWeek: number[]
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
  const [isSyncSubmitting, setIsSyncSubmitting] = useState(false)

  const { register: registerAccount, handleSubmit: handleAccountSubmit, reset: resetAccount, watch: watchAccount, setValue: setValueAccount, formState: { errors: accountErrors } } = useForm<AccountFormData>()
  const { register: registerCron, handleSubmit: handleCronSubmit, reset: resetCron, watch: watchCron, setValue: setCronValue, formState: { errors: cronErrors } } = useForm<CronFormData>()

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
      resetCron({
        isActive: false,
        cronExpression: '0 */6 * * *',
        browserType: 'chrome',
        maxRetries: 3,
        startTime: '08:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5]
      })
    }
    
    setIsCronModalOpen(true)
  }

  const onSubmitAccount = async (data: AccountFormData) => {
    try {
      setIsSubmitting(true)
      
      // Validate bankId
      if (!data.bankId) {
        console.error('Please select a bank')
        return
      }
      
      // Note: This would need to be implemented in the API service
      console.log('Creating account:', data)
      // await apiService.createAccount(data)
      setIsAccountModalOpen(false)
      fetchAccounts()
      resetAccount()
    } catch (error) {
      console.error('Failed to save account:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitCron = async (data: CronFormData) => {
    if (!selectedAccountForCron) return

    try {
      setIsSubmitting(true)
      
      // Validate required fields
      if (data.isActive && !data.cronExpression) {
        console.error('Please select a sync frequency')
        return
      }
      
      if (data.isActive && !data.browserType) {
        console.error('Please select a browser type')
        return
      }
      
      // Note: This uses the existing API method from the documentation
      // await apiService.updateScrapingOptions(selectedAccountForCron.id, data)
      console.log('Updating cron settings:', data)
      setIsCronModalOpen(false)
      fetchAccounts()
      resetCron()
    } catch (error) {
      console.error('Failed to update cron settings:', error)
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
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-400">
              {accounts.length} akun • {accounts.filter(a => a.isActive).length} aktif
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleCreateAccount} 
              variant="outline" 
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Tambah Akun
            </Button>
            <Button onClick={handleSyncAll} className="flex items-center">
              <RocketLaunchIcon className="h-4 w-4 mr-2" />
              Sinkronisasi Semua Akun
            </Button>
          </div>
        </div>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BuildingLibraryIcon className="h-5 w-5 mr-2" />
              Akun BSI
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Akun</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Status Sinkronisasi</TableHead>
                  <TableHead>Sinkronisasi Terakhir</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{account.accountNumber}</div>
                        <div className="text-sm text-gray-500">
                          ID Perusahaan: {account.companyId}
                        </div>
                        <div className="text-sm text-gray-500">
                          Pengguna: {account.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{account.Bank.fullName}</div>
                        <div className="text-sm text-gray-500">{account.Bank.code}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(account.lastBalance)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(account)}
                        {account.ScrapingOption?.errorMessage && (
                          <div className="text-xs text-red-600 max-w-xs truncate" title={account.ScrapingOption.errorMessage}>
                            {account.ScrapingOption.errorMessage}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {getLastRunInfo(account)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.ScrapingOption ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {account.ScrapingOption.cronExpression}
                          </div>
                          <div className="text-gray-500">
                            {account.ScrapingOption.isActive ? 'Aktif' : 'Nonaktif'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Tidak ada jadwal</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncAccount(account.id)}
                          loading={syncingAccounts.has(account.id)}
                          disabled={!account.isActive}
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Sinkronisasi
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCron(account)}
                          title="Kelola Jadwal Cron"
                        >
                          <CogIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {accounts.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <BuildingLibraryIcon className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                <p>Tidak ada akun ditemukan</p>
                <p className="text-sm">Hubungi administrator untuk menambahkan akun BSI</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-white">
                    {accounts.filter(a => a.ScrapingOption?.lastStatus === 'success').length}
                  </div>
                  <div className="text-sm text-slate-400">Successful Syncs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-white">
                    {accounts.filter(a => a.ScrapingOption?.lastStatus === 'error').length}
                  </div>
                  <div className="text-sm text-slate-400">Failed Syncs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-white">
                    {accounts.filter(a => a.ScrapingOption?.isActive).length}
                  </div>
                  <div className="text-sm text-slate-400">Auto-Sync Enabled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Add Account Modal */}
        <Modal
          isOpen={isAccountModalOpen}
          onClose={() => {
            setIsAccountModalOpen(false)
            resetAccount()
          }}
          title="Tambah Akun BSI Baru"
          size="lg"
        >
          <form onSubmit={handleAccountSubmit(onSubmitAccount)} className="space-y-6">
            {/* Header Info */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center">
                <BuildingLibraryIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-white">Integrasi Akun BSI</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Tambahkan akun Bank Syariah Indonesia baru untuk sinkronisasi transaksi otomatis
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Selection */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-300 border-b border-slate-600 pb-2">Informasi Bank</h4>
                
                <Select
                  options={banks.map(bank => ({
                    value: bank.id.toString(),
                    label: `${bank.fullName} (${bank.code})`
                  }))}
                  label="Institusi Bank"
                  value={watchAccount('bankId')?.toString() || ''}
                  onChange={(value) => setValueAccount('bankId', parseInt(value as string))}
                  error={accountErrors.bankId?.message}
                />

                <Input
                  label="Nomor Rekening"
                  {...registerAccount('accountNumber', { 
                    required: 'Nomor rekening wajib diisi',
                    pattern: {
                      value: /^[0-9]{10,20}$/,
                      message: 'Masukkan nomor rekening yang valid (10-20 digit)'
                    }
                  })}
                  error={accountErrors.accountNumber?.message}
                  placeholder="contoh: 1234567890123456"
                />

                <Input
                  label="ID Perusahaan"
                  {...registerAccount('companyId', { required: 'ID Perusahaan wajib diisi' })}
                  error={accountErrors.companyId?.message}
                  placeholder="Masukkan identifikasi perusahaan"
                />
              </div>

              {/* Credentials */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-300 border-b border-slate-600 pb-2">Kredensial BSI</h4>
                
                <Input
                  label="Nama Pengguna"
                  {...registerAccount('username', { required: 'Nama pengguna wajib diisi' })}
                  error={accountErrors.username?.message}
                  placeholder="Nama pengguna BSI"
                />

                <Input
                  label="Kata Sandi"
                  type="password"
                  {...registerAccount('password', { 
                    required: 'Kata sandi wajib diisi',
                    minLength: {
                      value: 6,
                      message: 'Kata sandi minimal 6 karakter'
                    }
                  })}
                  error={accountErrors.password?.message}
                  placeholder="Kata sandi BSI"
                />

                {/* Security Note */}
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400">Pemberitahuan Keamanan</p>
                      <p className="text-xs text-yellow-300 mt-1">
                        Kredensial dienkripsi dan disimpan dengan aman. Hanya personel yang berwenang yang dapat mengakses informasi ini.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300 border-b border-slate-600 pb-2">Pengaturan Sinkronisasi</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...registerAccount('autoSync')}
                      className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-white">Aktifkan sinkronisasi otomatis</span>
                  </label>
                  <p className="text-xs text-slate-400 ml-6">Ambil transaksi baru secara otomatis setiap hari</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...registerAccount('autoSync')}
                      className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-white">Akun aktif</span>
                  </label>
                  <p className="text-xs text-slate-400 ml-6">Akun aktif dan siap digunakan</p>
                </div>
              </div>
            </div>

            {/* Information Panel */}
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Apa yang terjadi selanjutnya?</h4>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• Kredensial akun akan diverifikasi dengan BSI</li>
                    <li>• Sinkronisasi transaksi awal akan dilakukan</li>
                    <li>• Sinkronisasi harian otomatis akan dijadwalkan</li>
                    <li>• Anda dapat memantau status sinkronisasi dari halaman akun</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-600">
              <div className="text-xs text-slate-400">
                Semua kredensial dienkripsi dan disimpan dengan aman
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAccountModalOpen(false)
                    resetAccount()
                  }}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  loading={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </div>
          </form>
        </Modal>

        {/* Cron Management Modal */}
        <Modal
          isOpen={isCronModalOpen}
          onClose={() => setIsCronModalOpen(false)}
          title={`Cron Settings - ${selectedAccountForCron?.accountNumber}`}
          size="lg"
        >
          <form onSubmit={handleCronSubmit(onSubmitCron)} className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                {...registerCron('isActive')}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-white">
                Enable Automatic Sync
              </label>
            </div>

            {watchCron('isActive') && (
              <>
                {/* Cron Expression */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                  label="Sync Frequency"
                  value={watchCron('cronExpression') || ''}
                  onChange={(value) => setCronValue('cronExpression', value as string)}
                  options={[
                    { value: '0 */1 * * *', label: 'Every Hour' },
                    { value: '0 */2 * * *', label: 'Every 2 Hours' },
                    { value: '0 */3 * * *', label: 'Every 3 Hours' },
                    { value: '0 */6 * * *', label: 'Every 6 Hours' },
                    { value: '0 */12 * * *', label: 'Every 12 Hours' },
                    { value: '0 0 * * *', label: 'Daily at Midnight' },
                    { value: '0 9 * * *', label: 'Daily at 9 AM' }
                  ]}
                  error={cronErrors.cronExpression?.message}
                />

                  <Select
                    label="Browser Type"
                    value={watchCron('browserType') || ''}
                    onChange={(value) => setCronValue('browserType', value as 'chrome' | 'firefox')}
                    options={[
                      { value: 'chrome', label: 'Chrome' },
                      { value: 'firefox', label: 'Firefox' }
                    ]}
                    error={cronErrors.browserType?.message}
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Time"
                    type="time"
                    {...registerCron('startTime')}
                    error={cronErrors.startTime?.message}
                  />

                  <Input
                    label="End Time"
                    type="time"
                    {...registerCron('endTime')}
                    error={cronErrors.endTime?.message}
                  />
                </div>

                {/* Days of Week */}
                <div>
                  <label className="text-sm font-medium text-white mb-3 block">
                    Active Days
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { value: 1, label: 'Mon' },
                      { value: 2, label: 'Tue' },
                      { value: 3, label: 'Wed' },
                      { value: 4, label: 'Thu' },
                      { value: 5, label: 'Fri' },
                      { value: 6, label: 'Sat' },
                      { value: 0, label: 'Sun' }
                    ].map(day => (
                      <label key={day.value} className="flex flex-col items-center p-2 border border-slate-600 rounded-md cursor-pointer hover:bg-slate-800">
                        <input
                          type="checkbox"
                          value={day.value}
                          {...registerCron('daysOfWeek')}
                          className="mb-1"
                        />
                        <span className="text-xs text-slate-300">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Max Retries */}
                <Input
                  label="Max Retries"
                  type="number"
                  min="1"
                  max="10"
                  {...registerCron('maxRetries', { 
                    required: 'Max retries is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 retry' },
                    max: { value: 10, message: 'Maximum 10 retries' }
                  })}
                  error={cronErrors.maxRetries?.message}
                />

                {/* Info Box */}
                <div className="text-sm text-slate-300 bg-slate-800 p-4 rounded-md border border-slate-600">
                  <h4 className="font-medium text-blue-400 mb-2">Cron Schedule Info:</h4>
                  <p className="mb-2">The system will automatically sync this account based on the schedule you set.</p>
                  <p><strong>Current Expression:</strong> <code className="bg-slate-700 px-2 py-1 rounded">{watchCron('cronExpression')}</code></p>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCronModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Save Settings
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