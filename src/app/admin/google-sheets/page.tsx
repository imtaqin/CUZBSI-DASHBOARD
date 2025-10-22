'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Button, LoadingPage, Modal } from '@/components/ui'
import { apiService } from '@/services/api'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  QuestionMarkCircleIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface GoogleSheetConfig {
  id: number
  name: string
  spreadsheetId: string
  sheetName: string
  serviceAccountEmail: string
  privateKey?: string
  columnMapping: Record<string, string>
  autoSync: boolean
  syncOnlyFlagged: boolean
  syncFlags: string[]
  hasHeader: boolean
  headerRow: number
  startRow: number
  appendOnly: boolean
  clearBeforeSync: boolean
  dateFormat: string
  isActive: boolean
  totalSynced: number
  lastSyncAt?: string
  createdAt: string
  updatedAt: string
}

interface SyncHistory {
  id: number
  syncedAt: string
  transactionCount: number
  status: 'success' | 'failed'
  error?: string
}

export default function GoogleSheetsPage() {
  const [configs, setConfigs] = useState<GoogleSheetConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showTutorialModal, setShowTutorialModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<GoogleSheetConfig | null>(null)
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([])
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null)
  const [isSyncing, setIsSyncing] = useState<Record<number, boolean>>({})
  const [useJsonUpload, setUseJsonUpload] = useState(true)
  const [jsonCredentials, setJsonCredentials] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    spreadsheetId: '',
    sheetName: 'Sheet1',
    serviceAccountEmail: '',
    privateKey: '',
    columnMapping: {
      date: 'A',
      description: 'B',
      amount: 'C',
      senderName: 'D',
      flag: 'E'
    },
    autoSync: true,
    syncOnlyFlagged: false,
    syncFlags: [] as string[],
    hasHeader: true,
    headerRow: 1,
    startRow: 2,
    appendOnly: true,
    clearBeforeSync: false,
    dateFormat: 'DD/MM/YYYY HH:mm'
  })

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getGoogleSheets()
      if (response.success) {
        // API returns data as array directly, not nested in configs
        setConfigs(Array.isArray(response.data) ? response.data : [])
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat konfigurasi Google Sheets')
    } finally {
      setIsLoading(false)
    }
  }

  const extractCredentialsFromJson = () => {
    try {
      const parsed = JSON.parse(jsonCredentials)

      if (parsed.client_email && parsed.private_key) {
        setFormData(prev => ({
          ...prev,
          serviceAccountEmail: parsed.client_email,
          privateKey: parsed.private_key
        }))
        setError('')
        alert('Credentials berhasil diekstrak dari JSON!')
      } else {
        setError('JSON tidak valid. Pastikan file berisi client_email dan private_key')
      }
    } catch (err) {
      setError('Format JSON tidak valid. Pastikan Anda paste seluruh isi file JSON credentials.')
    }
  }

  const handleOpenModal = (config?: GoogleSheetConfig) => {
    if (config) {
      setEditingConfig(config)
      setFormData({
        name: config.name,
        spreadsheetId: config.spreadsheetId,
        sheetName: config.sheetName,
        serviceAccountEmail: config.serviceAccountEmail,
        privateKey: '',
        columnMapping: config.columnMapping,
        autoSync: config.autoSync,
        syncOnlyFlagged: config.syncOnlyFlagged,
        syncFlags: config.syncFlags,
        hasHeader: config.hasHeader,
        headerRow: config.headerRow || 1,
        startRow: config.startRow || 2,
        appendOnly: config.appendOnly !== undefined ? config.appendOnly : true,
        clearBeforeSync: config.clearBeforeSync || false,
        dateFormat: config.dateFormat
      })
    } else {
      setEditingConfig(null)
      setFormData({
        name: '',
        spreadsheetId: '',
        sheetName: 'Sheet1',
        serviceAccountEmail: '',
        privateKey: '',
        columnMapping: {
          date: 'A',
          description: 'B',
          amount: 'C',
          senderName: 'D',
          flag: 'E'
        },
        autoSync: true,
        syncOnlyFlagged: false,
        syncFlags: [],
        hasHeader: true,
        headerRow: 1,
        startRow: 2,
        appendOnly: true,
        clearBeforeSync: false,
        dateFormat: 'DD/MM/YYYY HH:mm'
      })
    }
    setJsonCredentials('')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // If using JSON upload, extract credentials first before submitting
    if (useJsonUpload && jsonCredentials) {
      try {
        const parsed = JSON.parse(jsonCredentials)
        if (parsed.client_email && parsed.private_key) {
          formData.serviceAccountEmail = parsed.client_email
          formData.privateKey = parsed.private_key
        } else {
          setError('JSON tidak valid. Pastikan file berisi client_email dan private_key')
          return
        }
      } catch (err) {
        setError('Format JSON tidak valid. Pastikan Anda paste seluruh isi file JSON credentials.')
        return
      }
    }

    try {
      const response = editingConfig
        ? await apiService.updateGoogleSheet(editingConfig.id, formData)
        : await apiService.createGoogleSheet(formData)

      if (response.success) {
        setShowModal(false)
        fetchConfigs()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konfigurasi Google Sheets ini?')) return

    try {
      const response = await apiService.deleteGoogleSheet(id)
      if (response.success) {
        fetchConfigs()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus konfigurasi')
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const response = await apiService.toggleGoogleSheet(id)
      if (response.success) {
        fetchConfigs()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status konfigurasi')
    }
  }

  const handleTestConnection = async (id: number) => {
    try {
      setError('')
      const response = await apiService.testGoogleSheet(id)
      if (response.success) {
        alert('Koneksi berhasil! Google Sheet dapat diakses.')
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tes koneksi gagal')
    }
  }

  const handleSync = async (id: number) => {
    try {
      setIsSyncing(prev => ({ ...prev, [id]: true }))
      setError('')
      const response = await apiService.syncGoogleSheet(id, {})
      if (response.success) {
        alert(`Berhasil menyinkronkan ${response.data.syncedCount || 0} transaksi!`)
        fetchConfigs()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sinkronisasi gagal')
    } finally {
      setIsSyncing(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleViewHistory = async (id: number) => {
    try {
      setSelectedConfigId(id)
      const response = await apiService.getGoogleSheetHistory(id)
      if (response.success) {
        setSyncHistory(response.data.history || [])
        setShowHistoryModal(true)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat riwayat')
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Google Sheets" description="Kelola integrasi Google Sheets">
        <LoadingPage text="Memuat konfigurasi Google Sheets..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Integrasi Google Sheets"
      description="Konfigurasi ekspor otomatis transaksi ke Google Sheets"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Konfigurasi Aktif</h2>
              <p className="text-sm text-slate-500">{configs.length} sheet terkonfigurasi</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowTutorialModal(true)}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex-1 sm:flex-initial"
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Tutorial</span>
            </Button>
            <Button onClick={() => handleOpenModal()} className="btn-primary flex-1 sm:flex-initial">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah Konfigurasi</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Configurations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((config) => (
            <div key={config.id} className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 break-words">{config.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Sheet: {config.sheetName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(config.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        config.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {config.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start sm:items-center text-xs sm:text-sm text-slate-600">
                    <DocumentTextIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="truncate break-all">{config.spreadsheetId}</span>
                  </div>
                  <div className="flex items-start sm:items-center text-xs sm:text-sm text-slate-600">
                    <ClockIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words">Sinkronisasi terakhir: {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString('id-ID') : 'Belum pernah'}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-slate-600">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    <span>Total: <span className="font-semibold">{config.totalSynced || 0}</span> transaksi</span>
                  </div>
                  {config.autoSync && (
                    <div className="flex items-center text-xs sm:text-sm text-emerald-600">
                      <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Sinkronisasi otomatis aktif</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <button
                    onClick={() => handleSync(config.id)}
                    disabled={isSyncing[config.id]}
                    className="px-3 py-2 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-md flex items-center justify-center gap-1 disabled:opacity-50 col-span-2 sm:col-span-1"
                  >
                    <ArrowPathIcon className={`h-3.5 w-3.5 ${isSyncing[config.id] ? 'animate-spin' : ''}`} />
                    <span>{isSyncing[config.id] ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
                  </button>
                  <button
                    onClick={() => handleTestConnection(config.id)}
                    className="px-3 py-2 text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-md flex items-center justify-center gap-1"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    <span>Tes</span>
                  </button>
                  <button
                    onClick={() => handleViewHistory(config.id)}
                    className="px-3 py-2 text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-md flex items-center justify-center gap-1"
                  >
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Riwayat</span>
                  </button>
                  <button
                    onClick={() => handleOpenModal(config)}
                    className="px-3 py-2 text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-md flex items-center justify-center gap-1"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="px-3 py-2 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-md flex items-center justify-center gap-1"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {configs.length === 0 && (
            <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
              <DocumentTextIcon className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-slate-500 mb-2">Belum ada konfigurasi Google Sheets</p>
              <p className="text-xs text-slate-400 mb-4">Klik tutorial untuk mempelajari cara setup</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => setShowTutorialModal(true)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                  Lihat Tutorial
                </Button>
                <Button onClick={() => handleOpenModal()} className="btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  Buat Konfigurasi Pertama
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tutorial Modal */}
      <Modal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        title="Tutorial: Cara Mendapatkan Google Sheets Credentials"
        size="lg"
      >
        <div className="prose prose-sm max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900 font-medium mb-2">
              📌 Panduan Lengkap Setup Google Sheets API
            </p>
            <p className="text-xs text-blue-700">
              Ikuti langkah-langkah berikut untuk mendapatkan credentials yang diperlukan
            </p>
          </div>

          <h3 className="text-base font-semibold text-slate-900 mb-3">Langkah 1: Buat Project di Google Cloud</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 mb-4">
            <li>Buka <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
            <li>Klik dropdown project di bagian atas, lalu klik "New Project"</li>
            <li>Beri nama project (contoh: "CUZBSI Transaction Sync")</li>
            <li>Klik "Create" dan tunggu hingga project selesai dibuat</li>
          </ol>

          <h3 className="text-base font-semibold text-slate-900 mb-3">Langkah 2: Aktifkan Google Sheets API</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 mb-4">
            <li>Di project yang baru dibuat, buka menu "APIs & Services" → "Library"</li>
            <li>Cari "Google Sheets API"</li>
            <li>Klik pada hasil pencarian dan klik tombol "Enable"</li>
            <li>Tunggu beberapa saat hingga API aktif</li>
          </ol>

          <h3 className="text-base font-semibold text-slate-900 mb-3">Langkah 3: Buat Service Account</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 mb-4">
            <li>Buka menu "APIs & Services" → "Credentials"</li>
            <li>Klik "Create Credentials" → pilih "Service Account"</li>
            <li>Isi nama service account (contoh: "sheets-sync-service")</li>
            <li>Klik "Create and Continue"</li>
            <li>Pada "Grant this service account access to project", pilih role "Editor"</li>
            <li>Klik "Continue" lalu "Done"</li>
          </ol>

          <h3 className="text-base font-semibold text-slate-900 mb-3">Langkah 4: Download Credentials JSON</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 mb-4">
            <li>Di halaman Credentials, klik pada service account yang baru dibuat</li>
            <li>Buka tab "Keys"</li>
            <li>Klik "Add Key" → "Create new key"</li>
            <li>Pilih format "JSON" dan klik "Create"</li>
            <li>File JSON akan otomatis terdownload - <strong>simpan file ini dengan aman!</strong></li>
          </ol>

          <h3 className="text-base font-semibold text-slate-900 mb-3">Langkah 5: Share Google Sheet ke Service Account</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 mb-4">
            <li>Buka file JSON yang didownload, cari field "client_email"</li>
            <li>Copy email tersebut (contoh: service@project.iam.gserviceaccount.com)</li>
            <li>Buka Google Sheet yang ingin Anda gunakan</li>
            <li>Klik tombol "Share" di kanan atas</li>
            <li>Paste email service account tadi</li>
            <li>Berikan akses "Editor"</li>
            <li>Klik "Send" (hilangkan centang "Notify people")</li>
          </ol>

          <h3 className="text-base font-semibold text-slate-900 mb-3">Langkah 6: Dapatkan Spreadsheet ID</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-slate-700 mb-2">Buka Google Sheet Anda, lihat URL-nya:</p>
            <code className="text-xs bg-white px-2 py-1 rounded border border-slate-300 block overflow-x-auto">
              https://docs.google.com/spreadsheets/d/<strong className="text-blue-600">1abc...xyz</strong>/edit
            </code>
            <p className="text-xs text-slate-600 mt-2">
              Bagian yang di-bold adalah <strong>Spreadsheet ID</strong> Anda
            </p>
          </div>

          <h3 className="text-base font-semibold text-slate-900 mb-3">Langkah 7: Paste Credentials di Form</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-900 mb-2">
              ✅ Sekarang Anda siap untuk membuat konfigurasi!
            </p>
            <p className="text-xs text-green-700">
              Buka file JSON yang didownload, copy seluruh isinya, lalu paste di form konfigurasi.
              Sistem akan otomatis mengekstrak email dan private key yang diperlukan.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200">
          <Button onClick={() => setShowTutorialModal(false)} className="btn-secondary">
            Tutup
          </Button>
          <Button
            onClick={() => {
              setShowTutorialModal(false)
              handleOpenModal()
            }}
            className="btn-primary"
          >
            Buat Konfigurasi Sekarang
          </Button>
        </div>
      </Modal>

      {/* Configuration Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingConfig ? 'Edit Konfigurasi' : 'Konfigurasi Baru'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Konfigurasi</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sheet Donasi Utama"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID Spreadsheet</label>
              <input
                type="text"
                value={formData.spreadsheetId}
                onChange={(e) => setFormData({ ...formData, spreadsheetId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1abc...xyz"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Ditemukan di URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sheet</label>
              <input
                type="text"
                value={formData.sheetName}
                onChange={(e) => setFormData({ ...formData, sheetName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sheet1"
                required
              />
            </div>

            {/* Credentials Input Method Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Metode Input Credentials</span>
              </div>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={useJsonUpload}
                    onChange={() => setUseJsonUpload(true)}
                    className="text-blue-600"
                  />
                  <span className="text-xs text-blue-800">Paste JSON (Mudah)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!useJsonUpload}
                    onChange={() => setUseJsonUpload(false)}
                    className="text-blue-600"
                  />
                  <span className="text-xs text-blue-800">Input Manual</span>
                </label>
              </div>
            </div>

            {useJsonUpload ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Paste JSON Credentials
                </label>
                <textarea
                  value={jsonCredentials}
                  onChange={(e) => setJsonCredentials(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                  placeholder='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
                />
                <Button
                  type="button"
                  onClick={extractCredentialsFromJson}
                  className="mt-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  Ekstrak Credentials
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Paste seluruh isi file JSON yang didownload dari Google Cloud, lalu klik "Ekstrak Credentials"
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Service Account</label>
                  <input
                    type="email"
                    value={formData.serviceAccountEmail}
                    onChange={(e) => setFormData({ ...formData, serviceAccountEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="service@project.iam.gserviceaccount.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Private Key</label>
                  <textarea
                    value={formData.privateKey}
                    onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;..."
                    required={!editingConfig}
                  />
                  {editingConfig && (
                    <p className="text-xs text-slate-500 mt-1">Kosongkan untuk mempertahankan key yang ada</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Format Tanggal</label>
              <input
                type="text"
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="DD/MM/YYYY HH:mm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Baris Header</label>
                <input
                  type="number"
                  min="1"
                  value={formData.headerRow}
                  onChange={(e) => setFormData({ ...formData, headerRow: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Baris Mulai Data</label>
                <input
                  type="number"
                  min="1"
                  value={formData.startRow}
                  onChange={(e) => setFormData({ ...formData, startRow: parseInt(e.target.value) || 2 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoSync}
                  onChange={(e) => setFormData({ ...formData, autoSync: e.target.checked })}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-slate-700">Sinkronisasi otomatis</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasHeader}
                  onChange={(e) => setFormData({ ...formData, hasHeader: e.target.checked })}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-slate-700">Ada baris header</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.appendOnly}
                  onChange={(e) => setFormData({ ...formData, appendOnly: e.target.checked })}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-slate-700">Hanya tambahkan (tidak update data lama)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.clearBeforeSync}
                  onChange={(e) => setFormData({ ...formData, clearBeforeSync: e.target.checked })}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-slate-700">Hapus data sebelum sinkronisasi</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" className="btn-primary flex-1">
                <CloudArrowUpIcon className="h-4 w-4" />
                {editingConfig ? 'Perbarui' : 'Buat'} Konfigurasi
              </Button>
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Batal
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="Riwayat Sinkronisasi"
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {syncHistory.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Tidak ada riwayat sinkronisasi</p>
            ) : (
              syncHistory.map((entry) => (
                <div key={entry.id} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(entry.syncedAt).toLocaleString('id-ID')}
                    </span>
                    {entry.status === 'success' ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {entry.transactionCount} transaksi telah disinkronkan
                  </p>
                  {entry.error && (
                    <p className="text-xs text-red-600 mt-1">{entry.error}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}
