'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, Pagination, LoadingPage, Modal, Input, Select } from '@/components/ui'
import { apiService } from '@/services/api'
import type { Role, Permission, PaginationInfo } from '@/types'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'

interface RoleFormData {
  name: string
  description: string
  permissionIds: number[]
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<RoleFormData>()

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [pagination.page, searchTerm])

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getRoles({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined
      })
      if (response.success) {
        setRoles(response.data.roles)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await apiService.getPermissions()
      if (response.success) {
        setPermissions(response.data.permissions)
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }

  const handleCreateRole = () => {
    setEditingRole(null)
    reset()
    setIsModalOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setValue('name', role.name)
    setValue('description', role.description)
    setValue('permissionIds', role.Permissions.map(permission => permission.id))
    setIsModalOpen(true)
  }

  const handleDeleteRole = async (roleId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus peran ini?')) {
      try {
        await apiService.deleteRole(roleId)
        fetchRoles()
      } catch (error) {
        console.error('Failed to delete role:', error)
      }
    }
  }

  const onSubmit = async (data: RoleFormData) => {
    try {
      setIsSubmitting(true)
      if (editingRole) {
        await apiService.updateRole(editingRole.id, data)
      } else {
        await apiService.createRole(data)
      }
      setIsModalOpen(false)
      fetchRoles()
      reset()
    } catch (error) {
      console.error('Failed to save role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (isLoading) {
    return (
      <AdminLayout title="Manajemen Peran" description="Kelola peran dan izin akses sistem">
        <LoadingPage text="Memuat peran..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Manajemen Peran" description="Kelola peran dan izin akses sistem">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari peran..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button onClick={handleCreateRole}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Tambah Peran
          </Button>
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Peran ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Izin</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      {role.name}
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.Permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission.id} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ))}
                        {role.Permissions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{role.Permissions.length - 3} lainnya
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {role.Users?.length || 0} pengguna
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(role.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
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
          </CardContent>
        </Card>

        {/* Role Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRole ? 'Edit Peran' : 'Buat Peran'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nama Peran"
              {...register('name', { required: 'Nama peran wajib diisi' })}
              error={errors.name?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                {...register('description', { required: 'Deskripsi wajib diisi' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan deskripsi peran..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Izin Akses
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3">
                {permissions.map((permission) => (
                  <label key={permission.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      value={permission.id}
                      {...register('permissionIds', { required: 'Minimal satu izin harus dipilih' })}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                      <div className="text-xs text-gray-500">{permission.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.permissionIds && (
                <p className="text-sm text-red-600 mt-1">{errors.permissionIds.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editingRole ? 'Perbarui' : 'Buat'} Peran
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}