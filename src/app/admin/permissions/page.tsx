'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, LoadingPage } from '@/components/ui'
import { apiService } from '@/services/api'
import type { Permission } from '@/types'
import {
  ShieldExclamationIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([])

  useEffect(() => {
    fetchPermissions()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = permissions.filter(permission => 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPermissions(filtered)
    } else {
      setFilteredPermissions(permissions)
    }
  }, [permissions, searchTerm])

  const fetchPermissions = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getPermissions()
      if (response.success) {
        setPermissions(response.data.permissions)
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const getPermissionCategory = (permissionName: string) => {
    const parts = permissionName.split('.')
    return parts[0] || 'general'
  }

  const getPermissionAction = (permissionName: string) => {
    const parts = permissionName.split('.')
    return parts[1] || permissionName
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'users': 'bg-blue-100 text-blue-800',
      'accounts': 'bg-green-100 text-green-800',
      'transactions': 'bg-purple-100 text-purple-800',
      'dashboard': 'bg-orange-100 text-orange-800',
      'system': 'bg-red-100 text-red-800',
      'general': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['general']
  }

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      'view': 'bg-emerald-100 text-emerald-800',
      'create': 'bg-blue-100 text-blue-800',
      'edit': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-red-100 text-red-800',
      'manage': 'bg-purple-100 text-purple-800',
      'export': 'bg-indigo-100 text-indigo-800'
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <AdminLayout title="Manajemen Izin" description="Lihat semua izin akses yang tersedia dalam sistem">
        <LoadingPage text="Memuat izin..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Manajemen Izin" description="Lihat semua izin akses yang tersedia dalam sistem">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari izin..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-sm text-gray-600">
            Total: {filteredPermissions.length} izin
          </div>
        </div>

        {/* Permissions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldExclamationIcon className="h-5 w-5 mr-2" />
              Daftar Izin Akses ({filteredPermissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Izin</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => {
                  const category = getPermissionCategory(permission.name)
                  const action = getPermissionAction(permission.name)
                  
                  return (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium font-mono text-sm">
                        {permission.name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(category)}>
                          {category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(action)}>
                          {action}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm text-gray-900">
                          {permission.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(permission.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            
            {filteredPermissions.length === 0 && (
              <div className="text-center py-12">
                <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada izin ditemukan</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada izin yang tersedia.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission Categories Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(
            filteredPermissions.reduce((acc, permission) => {
              const category = getPermissionCategory(permission.name)
              acc[category] = (acc[category] || 0) + 1
              return acc
            }, {} as { [key: string]: number })
          ).map(([category, count]) => (
            <Card key={category}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={getCategoryColor(category)}>
                      {category}
                    </Badge>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                    <p className="text-sm text-gray-600">izin</p>
                  </div>
                  <ShieldExclamationIcon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Izin Akses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Kategori Izin:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">users</Badge>
                    <span className="text-sm text-gray-600">Manajemen pengguna</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">accounts</Badge>
                    <span className="text-sm text-gray-600">Manajemen akun</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-100 text-purple-800">transactions</Badge>
                    <span className="text-sm text-gray-600">Manajemen transaksi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-orange-100 text-orange-800">dashboard</Badge>
                    <span className="text-sm text-gray-600">Akses dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">system</Badge>
                    <span className="text-sm text-gray-600">Pengaturan sistem</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Jenis Aksi:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-emerald-100 text-emerald-800">view</Badge>
                    <span className="text-sm text-gray-600">Melihat data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">create</Badge>
                    <span className="text-sm text-gray-600">Membuat data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">edit</Badge>
                    <span className="text-sm text-gray-600">Mengedit data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">delete</Badge>
                    <span className="text-sm text-gray-600">Menghapus data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-100 text-purple-800">manage</Badge>
                    <span className="text-sm text-gray-600">Mengelola penuh</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-indigo-100 text-indigo-800">export</Badge>
                    <span className="text-sm text-gray-600">Ekspor data</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}