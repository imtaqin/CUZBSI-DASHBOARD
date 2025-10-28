'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Button, Input, LoadingPage } from '@/components/ui'
import { apiService } from '@/services/api'
import {
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Settings {
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    avatar?: string
  }
  email?: {
    emailNotifications?: boolean
    transactionAlerts?: boolean
    weeklyReports?: boolean
  }
  security?: {
    twoFactorEnabled?: boolean
    sessionTimeout?: number
  }
  system?: {
    theme?: string
    language?: string
  }
  notifications?: {
    pushNotifications?: boolean
    soundEnabled?: boolean
  }
  regional?: {
    timezone?: string
    dateFormat?: string
    currency?: string
  }
  advanced?: {
    debugMode?: boolean
    apiRateLimit?: number
  }
}

const settingsSections = [
  { id: 'profile', name: 'Profile', icon: UserIcon, description: 'Personal information' },
  // { id: 'email', name: 'Email', icon: BellIcon, description: 'Email preferences' },
  // { id: 'security', name: 'Security', icon: ShieldCheckIcon, description: 'Security settings' },
  // { id: 'system', name: 'System', icon: ComputerDesktopIcon, description: 'System preferences' },
  // { id: 'notifications', name: 'Notifications', icon: BellIcon, description: 'Notification settings' },
  // { id: 'regional', name: 'Regional', icon: GlobeAltIcon, description: 'Regional settings' },
  // { id: 'advanced', name: 'Advanced', icon: CogIcon, description: 'Advanced options' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    profile: {},
    email: {},
    security: {},
    system: {},
    notifications: {},
    regional: {},
    advanced: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const fetchSettings = async () => {
    try {
      const response = await apiService.getSettings()
      if (response.success) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.data.settings
        }))
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (section: keyof Settings, data: any) => {
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      let response
      switch (section) {
        case 'profile':
          response = await apiService.updateProfile(data)
          break
        case 'email':
          response = await apiService.updateEmailPreferences(data)
          break
        case 'security':
          response = await apiService.updateSecuritySettings(data)
          break
        case 'system':
          response = await apiService.updateSystemSettings(data)
          break
        case 'notifications':
          response = await apiService.updateNotificationSettings(data)
          break
        case 'regional':
          response = await apiService.updateRegionalSettings(data)
          break
        case 'advanced':
          response = await apiService.updateAdvancedSettings(data)
          break
        default:
          throw new Error('Unknown settings section')
      }

      if (response.success) {
        setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`)
        fetchSettings()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await apiService.exportData({
        format: 'json',
        includeTransactions: true,
        includeAccounts: true
      })
      if (response.success) {
        const link = document.createElement('a')
        link.href = response.data.exportUrl
        link.download = 'data-export.json'
        link.click()
        setSuccess('Data exported successfully')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Settings" description="System settings and preferences">
        <LoadingPage text="Loading settings..." />
      </AdminLayout>
    )
  }

  const currentSection = settingsSections.find(s => s.id === activeTab)

  return (
    <AdminLayout title="Settings" description="System settings and preferences">
      <div className="space-y-2 sm:space-y-3 lg:space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Manage your system settings and preferences</p>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <DocumentArrowDownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            Export Data
          </Button>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg animate-in fade-in">
            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg animate-in fade-in">
            <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Main Content: Sidebar + Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Sidebar - Settings Menu */}
          <div className="md:col-span-1">
            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden sticky top-4">
              <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Settings</h3>
              </div>
              <nav className="flex md:flex-col gap-1 md:gap-0 overflow-x-auto md:overflow-x-visible p-2 md:p-0">
                {settingsSections.map((section) => {
                  const Icon = section.icon
                  const isActive = activeTab === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`flex-shrink-0 md:flex-shrink flex items-center gap-2 px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm whitespace-nowrap md:whitespace-normal transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-b-2 md:border-b-0 md:border-l-4 border-blue-500'
                          : 'text-slate-700 hover:bg-slate-50 md:border-l-4 border-transparent'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden md:inline">{section.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <div className="bg-white rounded border border-slate-200 shadow-sm">
              {/* Section Header */}
              <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  {currentSection && <currentSection.icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />}
                  <div>
                    <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">{currentSection?.name}</h2>
                    <p className="text-xs text-slate-600 mt-0.5">{currentSection?.description}</p>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              <div className="p-3 sm:p-4 lg:p-6">
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSave('profile', settings.profile)
                  }} className="space-y-3 sm:space-y-4">
                    <Input
                      label="First Name"
                      value={settings.profile?.firstName || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, firstName: e.target.value }
                      })}
                      placeholder="Enter first name"
                    />
                    <Input
                      label="Last Name"
                      value={settings.profile?.lastName || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, lastName: e.target.value }
                      })}
                      placeholder="Enter last name"
                    />
                    <Input
                      label="Phone Number"
                      value={settings.profile?.phone || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, phone: e.target.value }
                      })}
                      placeholder="Enter phone number"
                    />
                    <Input
                      label="Avatar URL"
                      value={settings.profile?.avatar || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, avatar: e.target.value }
                      })}
                      placeholder="Enter avatar URL"
                    />
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSaving} size="sm">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Email Preferences */}
                {/* {activeTab === 'email' && (
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSave('email', settings.email)
                  }} className="space-y-3 sm:space-y-4">
                    <div className="space-y-3">
                      {[
                        { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email notifications for important events' },
                        { id: 'transactionAlerts', label: 'Transaction Alerts', desc: 'Get notified about new transactions' },
                        { id: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly summary reports' }
                      ].map(option => (
                        <label key={option.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={(settings.email as any)?.[option.id] || false}
                            onChange={(e) => setSettings({
                              ...settings,
                              email: { ...(settings.email || {}), [option.id]: e.target.checked }
                            })}
                            className="h-4 w-4 text-blue-600 rounded border-slate-300 mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-slate-900">{option.label}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSaving} size="sm">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )} */}

                {/* Security Settings */}
                {/* {activeTab === 'security' && (
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSave('security', settings.security)
                  }} className="space-y-3 sm:space-y-4">
                    <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.security?.twoFactorEnabled || false}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...(settings.security || {}), twoFactorEnabled: e.target.checked }
                        })}
                        className="h-4 w-4 text-blue-600 rounded border-slate-300 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-600 mt-0.5">Add an extra layer of security to your account</p>
                      </div>
                    </label>

                    <div className="pt-2">
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security?.sessionTimeout || 30}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...(settings.security || {}), sessionTimeout: parseInt(e.target.value) }
                        })}
                        min="5"
                        max="1440"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-600 mt-1.5">How long before automatic logout (5-1440 minutes)</p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSaving} size="sm">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )} */}

                {/* System Settings */}
                {/* {activeTab === 'system' && (
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSave('system', settings.system)
                  }} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Theme</label>
                      <select
                        value={settings.system?.theme || 'dark'}
                        onChange={(e) => setSettings({
                          ...settings,
                          system: { ...settings.system, theme: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Language</label>
                      <select
                        value={settings.system?.language || 'en'}
                        onChange={(e) => setSettings({
                          ...settings,
                          system: { ...settings.system, language: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="id">Bahasa Indonesia</option>
                      </select>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSaving} size="sm">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )} */}

                {/* Notification Settings */}
                {/* {activeTab === 'notifications' && (
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSave('notifications', settings.notifications)
                  }} className="space-y-3 sm:space-y-4">
                    <div className="space-y-3">
                      {[
                        { id: 'pushNotifications', label: 'Push Notifications', desc: 'Receive push notifications on your device' },
                        { id: 'soundEnabled', label: 'Sound Enabled', desc: 'Play sound for notifications' }
                      ].map(option => (
                        <label key={option.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={(settings.notifications as any)?.[option.id] || false}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...(settings.notifications || {}), [option.id]: e.target.checked }
                            })}
                            className="h-4 w-4 text-blue-600 rounded border-slate-300 mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-900">{option.label}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSaving} size="sm">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )} */}

                {/* Regional Settings */}
                {/* {activeTab === 'regional' && (
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSave('regional', settings.regional)
                  }} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Timezone</label>
                      <select
                        value={settings.regional?.timezone || 'Asia/Jakarta'}
                        onChange={(e) => setSettings({
                          ...settings,
                          regional: { ...settings.regional, timezone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Asia/Jakarta">Asia/Jakarta</option>
                        <option value="Asia/Singapore">Asia/Singapore</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Date Format</label>
                      <select
                        value={settings.regional?.dateFormat || 'DD/MM/YYYY'}
                        onChange={(e) => setSettings({
                          ...settings,
                          regional: { ...settings.regional, dateFormat: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Currency</label>
                      <select
                        value={settings.regional?.currency || 'IDR'}
                        onChange={(e) => setSettings({
                          ...settings,
                          regional: { ...settings.regional, currency: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="IDR">IDR (Indonesian Rupiah)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                      </select>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSaving} size="sm">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )} */}

                {/* Advanced Settings */}
                {/* {activeTab === 'advanced' && (
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSave('advanced', settings.advanced)
                  }} className="space-y-3 sm:space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                      <p className="text-xs sm:text-sm text-yellow-700">
                        <strong>⚠️ Warning:</strong> Advanced settings require careful configuration. Incorrect changes may affect system performance.
                      </p>
                    </div>

                    <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.advanced?.debugMode || false}
                        onChange={(e) => setSettings({
                          ...settings,
                          advanced: { ...(settings.advanced || {}), debugMode: e.target.checked }
                        })}
                        className="h-4 w-4 text-blue-600 rounded border-slate-300 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-900">Debug Mode</p>
                        <p className="text-xs text-slate-600 mt-0.5">Enable detailed logging for troubleshooting</p>
                      </div>
                    </label>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                        API Rate Limit (requests/minute)
                      </label>
                      <input
                        type="number"
                        value={settings.advanced?.apiRateLimit || 100}
                        onChange={(e) => setSettings({
                          ...settings,
                          advanced: { ...(settings.advanced || {}), apiRateLimit: parseInt(e.target.value) }
                        })}
                        min="1"
                        max="1000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-600 mt-1.5">Maximum API requests allowed per minute (1-1000)</p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSaving} size="sm">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
