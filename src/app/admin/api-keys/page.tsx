'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Button, LoadingPage, Modal, Input } from '@/components/ui'
import { apiService } from '@/services/api'
import {
  PlusIcon,
  TrashIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  CpuChipIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface ApiKey {
  id: number
  serviceName: string
  name: string
  description: string
  apiKey: string
  apiSecret?: string | null
  apiUrl: string
  config: any
  isActive: boolean
  isPrimary: boolean
  lastUsedAt?: string | null
  usageCount: number
  errorCount: number
  lastError?: string | null
  expiresAt?: string | null
  isValid: boolean
  createdBy?: number | null
  metadata: any
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({})

  // Filters
  const [serviceFilter, setServiceFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchApiKeys()
  }, [activeFilter, serviceFilter])

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getApiKeys()

      if (response.success && response.data) {
        // API returns data as an array directly
        const keys = Array.isArray(response.data) ? response.data : response.data.apiKeys || []
        setApiKeys(keys)

        if ('pagination' in response && response.pagination) {
          setPagination(response.pagination as PaginationInfo)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const response = await apiService.toggleApiKey(id)
      if (response.success) {
        fetchApiKeys()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status')
    }
  }

  const handleSetPrimary = async (id: number) => {
    try {
      const response = await apiService.setApiKeyPrimary(id)
      if (response.success) {
        fetchApiKeys()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengatur sebagai primary')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus API key ini?')) return

    try {
      const response = await apiService.deleteApiKey(id)
      if (response.success) {
        fetchApiKeys()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus API key')
    }
  }

  const toggleShowKey = (id: number) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getServiceIcon = (serviceName: string) => {
    const iconClass = "h-6 w-6"
    const icons: Record<string, React.ReactElement> = {
      whatsapp: <ChatBubbleLeftIcon className={`${iconClass} text-green-600`} />,
      openrouter: <CpuChipIcon className={`${iconClass} text-purple-600`} />,
      capsolver: <ShieldCheckIcon className={`${iconClass} text-blue-600`} />,
      email: <GlobeAltIcon className={`${iconClass} text-slate-600`} />,
      sms: <ChatBubbleLeftIcon className={`${iconClass} text-slate-600`} />,
      payment: <KeyIcon className={`${iconClass} text-amber-600`} />,
      storage: <KeyIcon className={`${iconClass} text-slate-600`} />,
      default: <KeyIcon className={`${iconClass} text-slate-600`} />
    }
    return icons[serviceName.toLowerCase()] || icons.default
  }

  const filteredKeys = apiKeys.filter(key => {
    if (serviceFilter && key.serviceName !== serviceFilter) return false
    if (activeFilter === 'active' && !key.isActive) return false
    if (activeFilter === 'inactive' && key.isActive) return false
    return true
  })

  // Statistics
  const totalKeys = apiKeys.length
  const activeKeys = apiKeys.filter(k => k.isActive).length
  const primaryKeys = apiKeys.filter(k => k.isPrimary).length
  const invalidKeys = apiKeys.filter(k => !k.isValid).length
  const uniqueServices = new Set(apiKeys.map(k => k.serviceName)).size

  if (isLoading) {
    return (
      <AdminLayout title="API Keys" description="Kelola API keys layanan eksternal">
        <LoadingPage text="Memuat API keys..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="API Keys" description="Kelola API keys layanan eksternal">
      <div className="space-y-4">
        {/* Header with Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <KeyIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">API Keys</h2>
                <p className="text-xs text-slate-500">Kelola API keys untuk layanan eksternal</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowModal(true)}
              className="btn-primary h-9 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Tambah API Key
            </Button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-5 gap-4 pt-3 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Total</div>
              <div className="text-lg font-semibold text-slate-900">{totalKeys}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Aktif</div>
              <div className="text-lg font-semibold text-emerald-600">{activeKeys}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Utama</div>
              <div className="text-lg font-semibold text-amber-600">{primaryKeys}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Layanan</div>
              <div className="text-lg font-semibold text-blue-600">{uniqueServices}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Tidak Valid</div>
              <div className="text-lg font-semibold text-red-600">{invalidKeys}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-200">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-9 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Layanan</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="openrouter">OpenRouter AI</option>
            <option value="capsolver">CapSolver</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
            className="h-9 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Saja</option>
            <option value="inactive">Nonaktif Saja</option>
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* API Keys Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredKeys?.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <KeyIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Tidak ada API keys</p>
              <p className="text-xs text-slate-400 mt-1">Klik "Tambah API Key" untuk membuat API key baru</p>
            </div>
          ) : (
            filteredKeys?.map((key) => (
              <div key={key.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-200">
                          {getServiceIcon(key.serviceName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900">{key.name}</h3>
                            {key.isPrimary && (
                              <StarIcon className="h-4 w-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{key.serviceName}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-3">{key.description}</p>

                      {/* API Key Display */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-700">API Key:</span>
                          <button
                            onClick={() => toggleShowKey(key.id)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {showKeys[key.id] ? (
                              <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <code className="text-xs bg-white px-3 py-2 rounded border border-slate-200 block font-mono">
                          {showKeys[key.id] ? key.apiKey : key.apiKey}
                        </code>
                        {key.apiSecret && (
                          <>
                            <div className="text-xs font-medium text-slate-700 mt-2 mb-1">API Secret:</div>
                            <code className="text-xs bg-white px-3 py-2 rounded border border-slate-200 block font-mono">
                              {key.apiSecret}
                            </code>
                          </>
                        )}
                      </div>

                      {/* API URL */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                        <GlobeAltIcon className="h-4 w-4" />
                        <a href={key.apiUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                          {key.apiUrl}
                        </a>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Penggunaan:</span>
                          <span className="font-semibold text-slate-900 ml-1">{key.usageCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Error:</span>
                          <span className="font-semibold text-red-600 ml-1">{key.errorCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Terakhir Digunakan:</span>
                          <span className="font-medium text-slate-900 ml-1">
                            {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('id-ID') : 'Belum pernah'}
                          </span>
                        </div>
                      </div>

                      {/* Last Error */}
                      {key.lastError && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-2">
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-red-900">Error Terakhir:</div>
                            <div className="text-xs text-red-700">{key.lastError}</div>
                          </div>
                        </div>
                      )}

                      {/* Provider Info */}
                      {key.metadata?.provider && (
                        <div className="mt-3 text-xs text-slate-500">
                          Penyedia: <span className="font-medium text-slate-700">{key.metadata.provider}</span>
                          {key.metadata.source && (
                            <span className="ml-2">
                              | Sumber: <span className="font-medium text-slate-700">{key.metadata.source}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Section - Status & Actions */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                      {/* Status Badges */}
                      <div className="flex flex-col gap-1 items-end">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          key.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {key.isActive ? (
                            <>
                              <CheckCircleIcon className="h-3 w-3" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-3 w-3" />
                              Nonaktif
                            </>
                          )}
                        </span>
                        {!key.isValid && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            Tidak Valid
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-2">
                        {!key.isPrimary && key.isActive && (
                          <button
                            onClick={() => handleSetPrimary(key.id)}
                            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md flex items-center gap-1"
                          >
                            <StarIcon className="h-3.5 w-3.5" />
                            Jadikan Utama
                          </button>
                        )}
                        <button
                          onClick={() => handleToggle(key.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 ${
                            key.isActive
                              ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {key.isActive ? (
                            <>
                              <XCircleIcon className="h-3.5 w-3.5" />
                              Nonaktifkan
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              Aktifkan
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md flex items-center gap-1"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit API Key Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingKey(null)
          }}
          title={editingKey ? 'Edit API Key' : 'Tambah API Key'}
        >
          <ApiKeyForm
            editingKey={editingKey}
            onSuccess={() => {
              setShowModal(false)
              setEditingKey(null)
              fetchApiKeys()
            }}
            onCancel={() => {
              setShowModal(false)
              setEditingKey(null)
            }}
          />
        </Modal>
      )}
    </AdminLayout>
  )
}

// API Key Form Component
interface ApiKeyFormProps {
  editingKey: ApiKey | null
  onSuccess: () => void
  onCancel: () => void
}

function ApiKeyForm({ editingKey, onSuccess, onCancel }: ApiKeyFormProps) {
  const [formData, setFormData] = useState({
    serviceName: editingKey?.serviceName || '',
    name: editingKey?.name || '',
    description: editingKey?.description || '',
    apiKey: editingKey?.apiKey || '',
    apiSecret: editingKey?.apiSecret || '',
    apiUrl: editingKey?.apiUrl || '',
    isActive: editingKey?.isActive ?? true,
    isPrimary: editingKey?.isPrimary ?? false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Service configurations with auto-fill data
  const serviceConfigs: Record<string, { defaultUrl: string; description: string; requiresSecret?: boolean }> = {
    whatsapp: {
      defaultUrl: 'https://api.goowa.id',
      description: 'WhatsApp messaging service via Goowa.id API'
    },
    openrouter: {
      defaultUrl: 'https://openrouter.ai/api/v1',
      description: 'AI-powered transaction classification using OpenRouter'
    },
    capsolver: {
      defaultUrl: 'https://api.capsolver.com',
      description: 'CAPTCHA solving service for bank automation'
    },
    email: {
      defaultUrl: 'https://api.smtp.com',
      description: 'Email notification service'
    },
    sms: {
      defaultUrl: 'https://api.sms.com',
      description: 'SMS notification service'
    },
    payment: {
      defaultUrl: 'https://api.payment.com',
      description: 'Payment gateway integration'
    },
    storage: {
      defaultUrl: 'https://storage.googleapis.com',
      description: 'Cloud storage service'
    }
  }

  // Auto-fill URL and description when service is selected
  const handleServiceChange = (serviceName: string) => {
    const config = serviceConfigs[serviceName]
    if (config && !editingKey) {
      setFormData({
        ...formData,
        serviceName,
        apiUrl: config.defaultUrl,
        description: config.description
      })
    } else {
      setFormData({ ...formData, serviceName })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = editingKey
        ? await apiService.updateApiKey(editingKey.id, formData)
        : await apiService.createApiKey(formData)

      if (response.success) {
        onSuccess()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan API key')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Layanan <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.serviceName}
          onChange={(e) => handleServiceChange(e.target.value)}
          required
          disabled={!!editingKey}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          <option value="">Pilih Layanan</option>
          <option value="whatsapp">WhatsApp (Goowa.id)</option>
          <option value="openrouter">OpenRouter AI</option>
          <option value="capsolver">CapSolver</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="payment">Payment Gateway</option>
          <option value="storage">Cloud Storage</option>
        </select>
        {formData.serviceName && (
          <p className="text-xs text-slate-500 mt-1">
            {serviceConfigs[formData.serviceName]?.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nama <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Contoh: WhatsApp API Production"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          API URL <span className="text-red-500">*</span>
        </label>
        <Input
          type="url"
          value={formData.apiUrl}
          onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
          required
          placeholder="https://api.example.com"
          className="bg-slate-50"
          readOnly={!editingKey && !!formData.serviceName}
        />
        <p className="text-xs text-slate-500 mt-1">Auto-filled based on service selection</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          API Key <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={formData.apiKey}
          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          required
          placeholder="Masukkan API key"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          API Secret (Opsional)
        </label>
        <Input
          type="text"
          value={formData.apiSecret || ''}
          onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
          placeholder="Masukkan API secret jika ada"
        />
        <p className="text-xs text-slate-500 mt-1">Only required for some services</p>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Aktifkan</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPrimary}
            onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-slate-700">Jadikan Utama</span>
        </label>
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-200">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="flex-1 btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Menyimpan...' : editingKey ? 'Update' : 'Tambah'}
        </Button>
      </div>
    </form>
  )
}
