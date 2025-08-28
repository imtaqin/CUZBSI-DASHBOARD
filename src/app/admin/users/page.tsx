'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, Pagination, LoadingPage, Modal, Input, Select } from '@/components/ui'
import { apiService } from '@/services/api'
import type { User, Role, PaginationInfo } from '@/types'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'

interface UserFormData {
  email: string
  password: string
  firstName: string
  lastName: string
  roleIds: number[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<UserFormData>()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [pagination.page, searchTerm])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined
      })
      if (response.success) {
        setUsers(response.data.users)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await apiService.getRoles({ limit: 100 })
      if (response.success) {
        setRoles(response.data.roles)
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    reset()
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setValue('email', user.email)
    setValue('firstName', user.firstName)
    setValue('lastName', user.lastName)
    setValue('roleIds', user.Roles.map(role => role.id))
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(userId)
        fetchUsers()
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true)
      if (editingUser) {
        await apiService.updateUser(editingUser.id, {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          roleIds: data.roleIds
        })
      } else {
        await apiService.createUser(data)
      }
      setIsModalOpen(false)
      fetchUsers()
      reset()
    } catch (error) {
      console.error('Failed to save user:', error)
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
      <AdminLayout title="User Management" description="Manage system users and their roles">
        <LoadingPage text="Loading users..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="User Management" description="Manage system users and their roles">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button onClick={handleCreateUser}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Users ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.Roles.map((role) => (
                          <Badge key={role.id} variant="secondary" className="text-xs">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "destructive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
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

        {/* User Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUser ? 'Edit User' : 'Create User'}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                {...register('firstName', { required: 'First name is required' })}
                error={errors.firstName?.message}
              />
              <Input
                label="Last Name"
                {...register('lastName', { required: 'Last name is required' })}
                error={errors.lastName?.message}
              />
            </div>

            <Input
              label="Email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              error={errors.email?.message}
            />

            {!editingUser && (
              <Input
                label="Password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                error={errors.password?.message}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={role.id}
                      {...register('roleIds', { required: 'At least one role is required' })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {role.name} - {role.description}
                    </span>
                  </label>
                ))}
              </div>
              {errors.roleIds && (
                <p className="text-sm text-red-600 mt-1">{errors.roleIds.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editingUser ? 'Update' : 'Create'} User
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}