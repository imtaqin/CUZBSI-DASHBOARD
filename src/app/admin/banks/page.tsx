'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Button, Input, Modal, LoadingPage } from '@/components/ui'
import { apiService } from '@/services/api'
import type { Bank } from '@/types'
import { PlusIcon, PencilIcon, TrashIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline'

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    fullName: '',
    logo: ''
  })

  useEffect(() => {
    fetchBanks()
  }, [])

  const fetchBanks = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getBanks()
      if (response.success) {
        setBanks(response.data.banks)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch banks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBank) {
        await apiService.updateBank(editingBank.id, formData)
      } else {
        await apiService.createBank(formData)
      }
      setIsModalOpen(false)
      setEditingBank(null)
      setFormData({ name: '', code: '', fullName: '', logo: '' })
      fetchBanks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bank')
    }
  }

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank)
    setFormData({
      name: bank.name,
      code: bank.code,
      fullName: bank.fullName,
      logo: ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this bank?')) {
      try {
        await apiService.deleteBank(id)
        fetchBanks()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete bank')
      }
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Banks" description="Manage bank information">
        <LoadingPage text="Loading banks..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Banks" description="Manage bank information">
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              <span className="font-medium text-slate-900">{banks?.length || 0}</span>
              <span className="text-slate-500"> Total Banks</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-green-600">{banks?.filter(b => b.isActive).length || 0}</span>
              <span className="text-slate-500"> Active</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-red-600">{banks?.filter(b => !b.isActive).length || 0}</span>
              <span className="text-slate-500"> Inactive</span>
            </div>
          </div>

          <Button
            onClick={() => {
              setEditingBank(null)
              setFormData({ name: '', code: '', fullName: '', logo: '' })
              setIsModalOpen(true)
            }}
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Bank
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-md">
            {error}
          </div>
        )}

        {/* Compact DataTable */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">Full Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!banks || banks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      <BuildingLibraryIcon className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-medium">No banks found</p>
                      <p className="text-xs mt-1">Click "Add Bank" to create a new bank</p>
                    </td>
                  </tr>
                ) : (
                  banks.map((bank) => (
                    <tr key={bank.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-sm text-slate-900">{bank.name}</td>
                      <td className="px-4 py-2 text-sm text-slate-600 font-mono">{bank.code}</td>
                      <td className="px-4 py-2 text-sm text-slate-600">{bank.fullName}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                          bank.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {bank.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(bank)}
                            title="Edit"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(bank.id)}
                            title="Delete"
                          >
                            <TrashIcon className="h-3.5 w-3.5 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compact Add/Edit Bank Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBank ? 'Edit Bank' : 'Add Bank'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="BSI"
                required
              />

              <Input
                label="Bank Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="451"
                required
              />

              <div className="col-span-2">
                <Input
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Bank Syariah Indonesia"
                  required
                />
              </div>

              <div className="col-span-2">
                <Input
                  label="Logo URL (Optional)"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <BuildingLibraryIcon className="h-4 w-4 mr-1" />
                {editingBank ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}