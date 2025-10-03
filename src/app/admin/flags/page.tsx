'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, Pagination, LoadingPage, Modal, Input, Select } from '@/components/ui'
import { apiService } from '@/services/api'
import type { Account } from '@/types'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'

interface FlagMapping {
  id: number
  accountNumber: string
  flag: string
  keywords: string
  createdAt: string
}

interface FlagFormData {
  accountNumber: string
  flag: string
  keywords: string
}

const AVAILABLE_FLAGS = [
  { value: 'donatur', label: 'Donatur', color: 'bg-green-600' },
  { value: 'member', label: 'Member', color: 'bg-blue-600' },
  { value: 'sponsor', label: 'Sponsor', color: 'bg-purple-600' },
  { value: 'grant', label: 'Grant', color: 'bg-emerald-600' },
  { value: 'fundraising', label: 'Fundraising', color: 'bg-teal-600' },
  { value: 'operational', label: 'Operational', color: 'bg-red-600' },
  { value: 'program', label: 'Program', color: 'bg-orange-600' },
  { value: 'admin', label: 'Administrative', color: 'bg-yellow-600' },
  { value: 'marketing', label: 'Marketing', color: 'bg-pink-600' },
  { value: 'utilities', label: 'Utilities', color: 'bg-indigo-600' },
  { value: 'internal', label: 'Internal Transfer', color: 'bg-gray-600' },
  { value: 'external', label: 'External Transfer', color: 'bg-slate-600' }
]

export default function FlagsPage() {
  const [flagMappings, setFlagMappings] = useState<FlagMapping[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FlagMapping | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FlagFormData>()

  useEffect(() => {
    fetchFlagMappings()
    fetchAccounts()
  }, [])

  const fetchFlagMappings = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getFlagMappings()
      if (response.success) {
        setFlagMappings(response.data.flagMappings)
      }
    } catch (error) {
      console.error('Failed to fetch flag mappings:', error)
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
      console.error('Failed to fetch accounts:', error)
    }
  }

  const handleCreateFlag = () => {
    setEditingFlag(null)
    reset()
    setIsModalOpen(true)
  }

  const handleEditFlag = (flagMapping: FlagMapping) => {
    setEditingFlag(flagMapping)
    setValue('accountNumber', flagMapping.accountNumber)
    setValue('flag', flagMapping.flag)
    setValue('keywords', flagMapping.keywords)
    setIsModalOpen(true)
  }

  const handleDeleteFlag = async (flagId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus mapping flag ini?')) {
      try {
        await apiService.deleteFlagMapping(flagId)
        fetchFlagMappings()
      } catch (error) {
        console.error('Failed to delete flag mapping:', error)
      }
    }
  }

  const onSubmit = async (data: FlagFormData) => {
    try {
      setIsSubmitting(true)
      if (editingFlag) {
        await apiService.updateFlagMapping(editingFlag.id, data)
      } else {
        await apiService.createFlagMapping(data)
      }
      setIsModalOpen(false)
      fetchFlagMappings()
      reset()
    } catch (error) {
      console.error('Failed to save flag mapping:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredMappings = flagMappings.filter(mapping =>
    mapping.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.flag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.keywords.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFlagColor = (flagValue: string) => {
    const flag = AVAILABLE_FLAGS.find(f => f.value === flagValue)
    return flag?.color || 'bg-gray-600'
  }

  const getFlagLabel = (flagValue: string) => {
    const flag = AVAILABLE_FLAGS.find(f => f.value === flagValue)
    return flag?.label || flagValue
  }

  if (isLoading) {
    return (
      <AdminLayout title="Manajemen Flag" description="Kelola mapping flag otomatis untuk transaksi">
        <LoadingPage text="Memuat flag mappings..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Manajemen Flag" description="Kelola mapping flag otomatis untuk transaksi">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Mappings</p>
                  <p className="text-2xl font-bold">{flagMappings.length}</p>
                </div>
                <TagIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unique Flags</p>
                  <p className="text-2xl font-bold">{new Set(flagMappings.map(f => f.flag)).size}</p>
                </div>
                <FlagIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Covered Accounts</p>
                  <p className="text-2xl font-bold">{new Set(flagMappings.map(f => f.accountNumber)).size}</p>
                </div>
                <TagIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari flag mapping..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button onClick={handleCreateFlag}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Tambah Flag Mapping
          </Button>
        </div>

        {/* Flag Mappings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlagIcon className="h-5 w-5 mr-2" />
              Flag Mappings ({filteredMappings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Akun</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-medium">
                      {mapping.accountNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getFlagColor(mapping.flag)}`}></div>
                        <Badge variant="outline">
                          {getFlagLabel(mapping.flag)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate" title={mapping.keywords}>
                          {mapping.keywords}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(mapping.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFlag(mapping)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFlag(mapping.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredMappings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Tidak ada flag mapping ditemukan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flag Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingFlag ? 'Edit Flag Mapping' : 'Buat Flag Mapping'}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Akun
              </label>
              <Select
                options={[
                  ...accounts.map(account => ({
                    value: account.accountNumber,
                    label: `${account.accountNumber} - ${account.accountName || account.Bank?.name}`
                  }))
                ]}
                value=""
                onChange={(value) => setValue('accountNumber', value as string)}
                placeholder="Pilih akun"
              />
              <input
                type="hidden"
                {...register('accountNumber', { required: 'Nomor akun wajib dipilih' })}
              />
              {errors.accountNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.accountNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flag
              </label>
              <Select
                options={AVAILABLE_FLAGS.map(flag => ({
                  value: flag.value,
                  label: flag.label
                }))}
                value=""
                onChange={(value) => setValue('flag', value as string)}
                placeholder="Pilih flag"
              />
              <input
                type="hidden"
                {...register('flag', { required: 'Flag wajib dipilih' })}
              />
              {errors.flag && (
                <p className="text-sm text-red-600 mt-1">{errors.flag.message}</p>
              )}
            </div>

            <Input
              label="Keywords"
              placeholder="Masukkan keywords dipisahkan dengan koma (contoh: TRANSFER,SALARY,BONUS)"
              {...register('keywords', { required: 'Keywords wajib diisi' })}
              error={errors.keywords?.message}
              helperText="Keywords yang akan digunakan untuk mencocokkan deskripsi transaksi"
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editingFlag ? 'Perbarui' : 'Buat'} Mapping
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}