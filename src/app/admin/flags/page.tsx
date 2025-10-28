'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Button, Input, Modal, LoadingPage, Badge } from '@/components/ui'
import { CustomEmojiPicker } from '@/components/EmojiPicker'
import { apiService } from '@/services/api'
import { PlusIcon, PencilIcon, TrashIcon, FlagIcon, BellIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface Flag {
  id: string
  name: string
  description: string
  color: string
  icon: string
  notificationTemplateId?: number | null
  sendWhatsApp: boolean
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
  NotificationTemplate?: {
    id: number
    name: string
    messageTemplate: string
    useSpintax: boolean
    isActive: boolean
  } | null
  mappingCount: number
}

export default function FlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<Flag | null>(null)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    color: '#10B981',
    icon: '💚',
    notificationTemplateId: null as number | null,
    sendWhatsApp: true,
    isActive: true,
    priority: 5
  })

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getFlags()
      if (response.success) {
        setFlags(response.data.flags)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat penanda')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingFlag) {
        await apiService.updateFlag(editingFlag.id, formData)
      } else {
        await apiService.createFlag(formData)
      }
      setIsModalOpen(false)
      setEditingFlag(null)
      setFormData({
        id: '',
        name: '',
        description: '',
        color: '#10B981',
        icon: '💚',
        notificationTemplateId: null,
        sendWhatsApp: true,
        isActive: true,
        priority: 5
      })
      fetchFlags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan penanda')
    }
  }

  const handleEdit = (flag: Flag) => {
    setEditingFlag(flag)
    setFormData({
      id: flag.id,
      name: flag.name,
      description: flag.description,
      color: flag.color,
      icon: flag.icon,
      notificationTemplateId: flag.notificationTemplateId || null,
      sendWhatsApp: flag.sendWhatsApp,
      isActive: flag.isActive,
      priority: flag.priority
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus penanda ini?')) {
      try {
        await apiService.deleteFlag(id)
        fetchFlags()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menghapus penanda')
      }
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Penanda Transaksi" description="Kelola penanda transaksi">
        <LoadingPage text="Memuat penanda..." />
      </AdminLayout>
    )
  }

  // Statistics
  const activeFlags = flags.filter(f => f.isActive).length
  const whatsappEnabled = flags.filter(f => f.sendWhatsApp).length
  const highPriority = flags.filter(f => f.priority >= 8).length

  return (
    <AdminLayout title="Penanda Transaksi" description="Kelola kategori dan penanda transaksi">
      <div className="space-y-4">
        {/* Header with Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FlagIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Penanda Transaksi</h2>
                <p className="text-xs text-slate-500">Kelola kategori dan penanda untuk transaksi</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingFlag(null)
                setFormData({
                  id: '',
                  name: '',
                  description: '',
                  color: '#10B981',
                  icon: '💚',
                  notificationTemplateId: null,
                  sendWhatsApp: true,
                  isActive: true,
                  priority: 5
                })
                setIsModalOpen(true)
              }}
              className="btn-primary h-9 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Tambah Penanda
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 pt-3 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Total Penanda</div>
              <div className="text-lg font-semibold text-slate-900">{flags.length}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Aktif</div>
              <div className="text-lg font-semibold text-emerald-600">{activeFlags}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">WhatsApp Enabled</div>
              <div className="text-lg font-semibold text-blue-600">{whatsappEnabled}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Prioritas Tinggi</div>
              <div className="text-lg font-semibold text-purple-600">{highPriority}</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Flags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!flags || flags.length === 0 ? (
            <div className="col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <FlagIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Tidak ada penanda</p>
              <p className="text-xs text-slate-400 mt-1">Klik "Tambah Penanda" untuk membuat penanda baru</p>
            </div>
          ) : (
            flags.map((flag) => (
              <div key={flag.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{flag.icon}</span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{flag.name}</h3>
                        <p className="text-xs text-slate-500">ID: {flag.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {flag.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                          <CheckCircleIcon className="h-3 w-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                          <XCircleIcon className="h-3 w-3" />
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{flag.description}</p>

                  {/* Color & Priority */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: flag.color }}
                      />
                      <span className="text-xs text-slate-500 font-mono">{flag.color}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">Prioritas:</span>
                      <span className={`text-xs font-semibold ${
                        flag.priority >= 8 ? 'text-purple-600' : flag.priority >= 5 ? 'text-blue-600' : 'text-slate-600'
                      }`}>
                        {flag.priority}
                      </span>
                    </div>
                  </div>

                  {/* Notification Template */}
                  {flag.NotificationTemplate ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BellIcon className="h-3.5 w-3.5 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-900">{flag.NotificationTemplate.name}</span>
                      </div>
                      {flag.sendWhatsApp && (
                        <span className="text-xs text-blue-700">WhatsApp diaktifkan</span>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-3 text-center">
                      <span className="text-xs text-slate-500">Tanpa template notifikasi</span>
                    </div>
                  )}

                  {/* Mapping Count */}
                  {flag.mappingCount > 0 && (
                    <div className="text-xs text-slate-500 mb-3">
                      <span className="font-medium">{flag.mappingCount}</span> pemetaan aktif
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(flag)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <PencilIcon className="h-3.5 w-3.5 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(flag.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingFlag ? 'Edit Penanda' : 'Tambah Penanda'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ID Penanda"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="donatur_tetap"
                required
                disabled={!!editingFlag}
              />

              <Input
                label="Nama Penanda"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Donatur Tetap"
                required
              />

              <div className="col-span-2">
                <Input
                  label="Deskripsi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi penanda"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Warna
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-9 w-14 rounded border border-slate-300 bg-white cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#10B981"
                    className="flex-1"
                  />
                </div>
              </div>

              <CustomEmojiPicker
                value={formData.icon}
                onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
                label="Icon (Emoji)"
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Prioritas
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Template Notifikasi ID
                </label>
                <input
                  type="number"
                  value={formData.notificationTemplateId || ''}
                  onChange={(e) => setFormData({ ...formData, notificationTemplateId: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Opsional"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sendWhatsApp}
                  onChange={(e) => setFormData({ ...formData, sendWhatsApp: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">Kirim WhatsApp</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">Aktif</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                size="sm"
              >
                Batal
              </Button>
              <Button type="submit" size="sm">
                {editingFlag ? 'Perbarui' : 'Buat'} Penanda
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
