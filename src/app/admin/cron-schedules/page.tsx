'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Table, Pagination, Modal, LoadingPage } from '@/components/ui'
import { apiService } from '@/services/api'
import { PlusIcon, PencilIcon, TrashIcon, ClockIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'

interface CronSchedule {
  id: number
  accountId?: number
  cronExpression: string
  enabled: boolean
  description?: string
  lastRun?: string
  nextRun?: string
  status?: string
  createdAt: string
  account?: any
}

export default function CronSchedulesPage() {
  const [schedules, setSchedules] = useState<CronSchedule[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<CronSchedule | null>(null)
  const [formData, setFormData] = useState({
    cronExpression: '',
    enabled: true,
    description: '',
    accountId: 0
  })

  useEffect(() => {
    fetchSchedules()
    fetchStats()
  }, [])

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getCronSchedules()
      if (response.success) {
        setSchedules(response.data.schedules)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedules')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiService.getCronScheduleStats()
      if (response.success) {
        setStats(response.data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSchedule) {
        await apiService.updateCronSchedule(editingSchedule.id, formData)
      } else {
        // For new schedules, we need an account ID
        if (formData.accountId === 0) {
          setError('Account ID is required for new schedules')
          return
        }
        await apiService.upsertSchedule(formData.accountId, formData)
      }
      setIsModalOpen(false)
      setEditingSchedule(null)
      setFormData({ cronExpression: '', enabled: true, description: '', accountId: 0 })
      fetchSchedules()
      fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule')
    }
  }

  const handleEdit = (schedule: CronSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      cronExpression: schedule.cronExpression,
      enabled: schedule.enabled,
      description: schedule.description || '',
      accountId: schedule.accountId || 0
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await apiService.deleteCronSchedule(id)
        fetchSchedules()
        fetchStats()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete schedule')
      }
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await apiService.toggleCronSchedule(id)
      fetchSchedules()
      fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle schedule')
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Cron Schedules" description="Manage automated task schedules">
        <LoadingPage text="Loading schedules..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Cron Schedules" description="Manage automated task schedules">
      <div className="space-y-4">
        {/* Compact Header with Inline Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Cron Schedules</h2>
                <p className="text-xs text-slate-500">Automated task schedules</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingSchedule(null)
                setFormData({ cronExpression: '', enabled: true, description: '', accountId: 0 })
                setIsModalOpen(true)
              }}
              className="btn-primary h-9 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Add Schedule
            </Button>
          </div>

          {/* Inline Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Total</div>
                <div className="text-lg font-semibold text-slate-900">{stats?.total || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Active</div>
                <div className="text-lg font-semibold text-emerald-600">{stats?.active || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Inactive</div>
                <div className="text-lg font-semibold text-slate-600">{stats?.inactive || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Schedules Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {!schedules || schedules?.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                No schedules found
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Cron Expression</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Account</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Last Run</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Next Run</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {schedules?.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-xs text-slate-900">{schedule.cronExpression}</td>
                      <td className="px-4 py-2 text-sm text-slate-700">{schedule.description || '-'}</td>
                      <td className="px-4 py-2">
                        {schedule.account ? (
                          <span className="text-xs text-slate-900">
                            {schedule.account.accountNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          schedule.enabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {schedule.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {schedule.lastRun ? (
                          <span className="text-xs text-slate-600">
                            {new Date(schedule.lastRun).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {schedule.nextRun ? (
                          <span className="text-xs text-slate-600">
                            {new Date(schedule.nextRun).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggle(schedule.id)}
                            className={`p-1 rounded ${schedule.enabled ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title={schedule.enabled ? 'Pause' : 'Resume'}
                          >
                            {schedule.enabled ? (
                              <PauseIcon className="h-4 w-4" />
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add/Edit Schedule Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Cron Expression"
                value={formData.cronExpression}
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                placeholder="*/5 * * * *"
                required
              />
              <p className="mt-1 text-xs text-slate-400">
                Format: minute hour day month weekday (e.g., */5 * * * * for every 5 minutes)
              </p>
            </div>
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Schedule description"
            />
            {!editingSchedule && (
              <Input
                label="Account ID"
                type="number"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: parseInt(e.target.value) })}
                placeholder="Enter account ID"
                required
              />
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
              />
              <label htmlFor="enabled" className="ml-2 text-sm text-slate-300">
                Enabled
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSchedule ? 'Update' : 'Create'} Schedule
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}