'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Table, Pagination, Modal, LoadingPage } from '@/components/ui'
import { apiService } from '@/services/api'
import { PlusIcon, PencilIcon, TrashIcon, BellIcon, EyeIcon } from '@heroicons/react/24/outline'

interface NotificationTemplate {
  id: number
  name: string
  type: 'text' | 'invoice'
  messageTemplate: string
  description?: string
  useSpintax: boolean
  isActive: boolean
  variables?: string[]
  previewData?: any
  invoiceConfig?: any
  createdAt: string
  updatedAt: string
  Flags?: any[]
}

interface TemplateVariable {
  key: string
  description: string
  example: string
}

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [variables, setVariables] = useState<TemplateVariable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [previewData, setPreviewData] = useState<{ template: NotificationTemplate; preview: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'text' as 'text' | 'invoice',
    message: '',
    description: '',
    useSpintax: false,
    isActive: true
  })
  const [previewFormData, setPreviewFormData] = useState({
    transactionId: 0,
    testData: '{}'
  })

  useEffect(() => {
    fetchTemplates()
    fetchVariables()
  }, [])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getNotificationTemplates()
      if (response.success) {
        setTemplates(response.data.templates)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVariables = async () => {
    try {
      const response = await apiService.getTemplateVariables()
      if (response.success) {
        setVariables(response.data.variables)
      }
    } catch (err) {
      console.error('Failed to fetch variables:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTemplate) {
        await apiService.updateNotificationTemplate(editingTemplate.id, formData)
      } else {
        await apiService.createNotificationTemplate(formData)
      }
      setIsModalOpen(false)
      setEditingTemplate(null)
      setFormData({ name: '', type: 'text', message: '', description: '', useSpintax: false, isActive: true })
      fetchTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    }
  }

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      type: template.type || 'text',
      message: template.messageTemplate,
      description: template.description || '',
      useSpintax: template.useSpintax || false,
      isActive: template.isActive
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await apiService.deleteNotificationTemplate(id)
        fetchTemplates()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete template')
      }
    }
  }

  const handlePreview = async (template: NotificationTemplate) => {
    try {
      let testData = {}
      if (previewFormData.transactionId > 0) {
        const response = await apiService.previewTemplate(template.id, {
          transactionId: previewFormData.transactionId
        })
        if (response.success) {
          setPreviewData({ template, preview: response.data.preview })
          setIsPreviewModalOpen(true)
          return
        }
      } else {
        try {
          testData = JSON.parse(previewFormData.testData)
        } catch {
          testData = { amount: '1000000', description: 'Test transaction' }
        }
        const response = await apiService.previewTemplate(template.id, {
          testData
        })
        if (response.success) {
          setPreviewData({ template, preview: response.data.preview })
          setIsPreviewModalOpen(true)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview template')
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Notification Templates" description="Manage notification templates">
        <LoadingPage text="Loading templates..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Notification Templates" description="Manage notification templates">
      <div className="space-y-4">
        {/* Compact Header with Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BellIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Notification Templates</h2>
                <p className="text-xs text-slate-500">WhatsApp message templates with variables & spintax</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingTemplate(null)
                setFormData({ name: '', type: 'text', message: '', description: '', useSpintax: false, isActive: true })
                setIsModalOpen(true)
              }}
              className="btn-primary h-9 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Add Template
            </Button>
          </div>

          {/* Inline Stats */}
          <div className="grid grid-cols-4 gap-4 pt-3 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Total Templates</div>
              <div className="text-lg font-semibold text-slate-900">{templates?.length || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Active</div>
              <div className="text-lg font-semibold text-emerald-600">{templates?.filter(t => t.isActive).length || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Text Templates</div>
              <div className="text-lg font-semibold text-blue-600">{templates?.filter(t => t.type === 'text').length || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Invoice Templates</div>
              <div className="text-lg font-semibold text-purple-600">{templates?.filter(t => t.type === 'invoice').length || 0}</div>
            </div>
          </div>
        </div>

        {/* Available Variables */}
        {variables?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Available Variables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {variables.map((variable, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <code className="text-xs text-blue-600 font-mono">{`{{${variable.key}}}`}</code>
                  <p className="text-xs text-slate-700 mt-1 font-medium">{variable.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Example: {variable.example}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {!templates || templates?.length === 0 ? (
            <div className="col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <BellIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">No templates found</p>
              <p className="text-xs text-slate-400 mt-1">Create your first notification template</p>
            </div>
          ) : (
            templates?.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          template.type === 'invoice' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {template.type === 'invoice' ? 'Invoice' : 'Text'}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          template.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {template.description && (
                        <p className="text-xs text-slate-500">{template.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="mb-3">
                    <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
                      <p className="text-xs text-slate-700 line-clamp-3 whitespace-pre-wrap">
                        {template.messageTemplate}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      {template.useSpintax && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Spintax</span>
                        </div>
                      )}
                      {template.variables && template.variables.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span>{template.variables.length} variables</span>
                        </div>
                      )}
                    </div>
                    <div>
                      {new Date(template.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handlePreview(template)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <EyeIcon className="h-3.5 w-3.5 inline mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <PencilIcon className="h-3.5 w-3.5 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
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

        {/* Add/Edit Template Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTemplate ? 'Edit Template' : 'Add Template'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Donatur Template"
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type || 'text'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'invoice' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="invoice">Invoice</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description (Optional)
              </label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Template for regular donors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message Template
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter message template (use {{variable}} for variables and {option1|option2} for spintax)"
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Available variables: {'{{senderName}}'}, {'{{amount}}'}, {'{{date}}'}, {'{{description}}'}, {'{{flag}}'}, {'{{accountNumber}}'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.useSpintax || false}
                  onChange={(e) => setFormData({ ...formData, useSpintax: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">Enable Spintax</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </form>
        </Modal>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Preview Template"
        >
          {previewData && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Template:</h3>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-sm text-slate-200">{previewData.template.message}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Preview:</h3>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-sm text-slate-200">{previewData.preview}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Test Data:</h3>
                <div className="space-y-2">
                  <Input
                    label="Transaction ID (optional)"
                    type="number"
                    value={previewFormData.transactionId}
                    onChange={(e) => setPreviewFormData({ ...previewFormData, transactionId: parseInt(e.target.value) })}
                    placeholder="Leave 0 to use custom test data"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Custom Test Data (JSON)
                    </label>
                    <textarea
                      value={previewFormData.testData}
                      onChange={(e) => setPreviewFormData({ ...previewFormData, testData: e.target.value })}
                      placeholder='{"amount": "1000000", "description": "Test transaction"}'
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => handlePreview(previewData.template)}
                >
                  Refresh Preview
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  )
}