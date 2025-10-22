'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Button, Input, Modal, LoadingPage, Badge } from '@/components/ui'
import { apiService } from '@/services/api'
import { PlusIcon, PencilIcon, TrashIcon, FlagIcon, LinkIcon, UserIcon, PhoneIcon, CreditCardIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface FlagMapping {
  id: number
  senderName: string
  phoneNumber: string
  accountNumber: string
  flagId: string
  notes?: string | null
  isActive: boolean
  name: string
  flag: string
  createdAt: string
  updatedAt: string
  Flag: {
    id: string
    name: string
    description: string
    color: string
    icon: string
    isActive: boolean
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function FlagMappingsPage() {
  const [flagMappings, setFlagMappings] = useState<FlagMapping[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMapping, setEditingMapping] = useState<FlagMapping | null>(null)
  const [formData, setFormData] = useState({
    senderName: '',
    phoneNumber: '',
    accountNumber: '',
    flagId: '',
    notes: ''
  })

  useEffect(() => {
    fetchFlagMappings()
  }, [])

  const fetchFlagMappings = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getFlagMappings()
      if (response.success) {
        setFlagMappings(response.data.mappings)
        if (response.data.pagination) {
          setPagination(response.data.pagination)
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat riwayat penanda')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingMapping) {
        await apiService.updateFlagMapping(editingMapping.id, formData)
      } else {
        await apiService.createFlagMapping(formData)
      }
      setIsModalOpen(false)
      setEditingMapping(null)
      setFormData({ senderName: '', phoneNumber: '', accountNumber: '', flagId: '', notes: '' })
      fetchFlagMappings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pemetaan penanda')
    }
  }

  const handleEdit = (mapping: FlagMapping) => {
    setEditingMapping(mapping)
    setFormData({
      senderName: mapping.senderName,
      phoneNumber: mapping.phoneNumber,
      accountNumber: mapping.accountNumber,
      flagId: mapping.flagId,
      notes: mapping.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pemetaan penanda ini?')) {
      try {
        await apiService.deleteFlagMapping(id)
        fetchFlagMappings()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menghapus pemetaan penanda')
      }
    }
  }

  const toggleActiveStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiService.updateFlagMapping(id, { isActive: !currentStatus })
      fetchFlagMappings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status')
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Riwayat Penanda" description="Kelola riwayat pemetaan penanda">
        <LoadingPage text="Memuat riwayat penanda..." />
      </AdminLayout>
    )
  }

  // Statistics
  const activeCount = flagMappings.filter(m => m.isActive).length
  const uniqueSenders = new Set(flagMappings.map(m => m.senderName)).size

  return (
    <AdminLayout title="Riwayat Penanda" description="Kelola riwayat pemetaan penanda transaksi">
      <div className="space-y-3 sm:space-y-4">
        {/* Header with Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Riwayat Penanda</h2>
                <p className="text-xs text-slate-500 hidden sm:block">Pemetaan otomatis penanda berdasarkan pengirim</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingMapping(null)
                setFormData({ senderName: '', phoneNumber: '', accountNumber: '', flagId: '', notes: '' })
                setIsModalOpen(true)
              }}
              className="btn-primary h-9 text-sm w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah Pemetaan</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Total</div>
              <div className="text-sm sm:text-lg font-semibold text-slate-900">{pagination.total}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Aktif</div>
              <div className="text-sm sm:text-lg font-semibold text-emerald-600">{activeCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Pengirim</div>
              <div className="text-sm sm:text-lg font-semibold text-blue-600">{uniqueSenders}</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Mappings Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {!flagMappings || flagMappings.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <LinkIcon className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">Tidak ada pemetaan penanda</p>
              <p className="text-xs mt-1">Klik "Tambah Pemetaan" untuk membuat pemetaan baru</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-slate-100">
                {flagMappings.map((mapping) => (
                  <div key={mapping.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <UserIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{mapping.senderName}</div>
                          <div className="text-xs text-slate-500">{mapping.name}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleActiveStatus(mapping.id, mapping.isActive)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full transition-colors flex-shrink-0 ${
                          mapping.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {mapping.isActive ? (
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
                      </button>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <PhoneIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700">{mapping.phoneNumber}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <CreditCardIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-700">{mapping.accountNumber}</span>
                      </div>

                      {mapping.Flag && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <span className="text-lg flex-shrink-0">{mapping.Flag.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{mapping.Flag.name}</div>
                            <div className="text-xs text-slate-500">{mapping.Flag.description}</div>
                          </div>
                        </div>
                      )}

                      {mapping.notes && (
                        <div className="bg-slate-50 border border-slate-100 rounded p-2 text-xs text-slate-600">
                          {mapping.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleEdit(mapping)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mapping.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Pengirim</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Kontak</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Akun</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Penanda</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Catatan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {flagMappings.map((mapping) => (
                      <tr key={mapping.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="text-sm font-medium text-slate-900">{mapping.senderName}</div>
                              <div className="text-xs text-slate-500">{mapping.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <PhoneIcon className="h-3 w-3" />
                            {mapping.phoneNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <CreditCardIcon className="h-3 w-3" />
                            {mapping.accountNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {mapping.Flag ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{mapping.Flag.icon}</span>
                              <div>
                                <div className="text-sm font-medium text-slate-900">{mapping.Flag.name}</div>
                                <div className="text-xs text-slate-500">{mapping.Flag.description}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {mapping.notes ? (
                            <span className="text-sm text-slate-600 max-w-xs truncate block" title={mapping.notes}>
                              {mapping.notes}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActiveStatus(mapping.id, mapping.isActive)}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                              mapping.isActive
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {mapping.isActive ? (
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
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEdit(mapping)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(mapping.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingMapping ? 'Edit Pemetaan Penanda' : 'Tambah Pemetaan Penanda'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nama Pengirim"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                placeholder="M AZMI HABIBURRAHMAN"
                required
              />

              <Input
                label="Nama Lengkap"
                value={formData.name || formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                placeholder="Nama lengkap"
              />

              <Input
                label="Nomor Telepon"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="6285162772731"
                required
              />

              <Input
                label="Nomor Akun"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="1231235656465"
                required
              />

              <div className="col-span-2">
                <Input
                  label="ID Penanda"
                  value={formData.flagId}
                  onChange={(e) => setFormData({ ...formData, flagId: e.target.value })}
                  placeholder="donatur"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan ID penanda yang valid (contoh: donatur, infaq, sedekah)
                </p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tambahkan catatan..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                {editingMapping ? 'Perbarui' : 'Buat'} Pemetaan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
