'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, LoadingPage } from '@/components/ui'
import { apiService } from '@/services/api'
import { 
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon
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
        fetchSettings() // Refresh settings
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
        // Create download link
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

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'email', name: 'Email Preferences', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'system', name: 'System', icon: ComputerDesktopIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'regional', name: 'Regional', icon: GlobeAltIcon },
    { id: 'advanced', name: 'Advanced', icon: CogIcon },
  ]

  return (
    <AdminLayout title="Settings" description="System settings and preferences">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">Manage your system settings and preferences</p>
          </div>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-4 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-300 text-sm p-4 rounded-lg">
            {success}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleSave('profile', settings.profile)
                }} className="space-y-4">
                  <Input
                    label="First Name"
                    value={settings.profile?.firstName || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, firstName: e.target.value }
                    })}
                  />
                  <Input
                    label="Last Name"
                    value={settings.profile?.lastName || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, lastName: e.target.value }
                    })}
                  />
                  <Input
                    label="Phone Number"
                    value={settings.profile?.phone || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, phone: e.target.value }
                    })}
                  />
                  <Input
                    label="Avatar URL"
                    value={settings.profile?.avatar || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, avatar: e.target.value }
                    })}
                  />
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Email Preferences */}
          {activeTab === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellIcon className="h-5 w-5" />
                  Email Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleSave('email', settings.email)
                }} className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.email?.emailNotifications || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...(settings.email || {}), emailNotifications: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 text-sm text-slate-300">
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="transactionAlerts"
                      checked={settings.email?.transactionAlerts || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...(settings.email || {}), transactionAlerts: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
                    />
                    <label htmlFor="transactionAlerts" className="ml-2 text-sm text-slate-300">
                      Transaction Alerts
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="weeklyReports"
                      checked={settings.email?.weeklyReports || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...(settings.email || {}), weeklyReports: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
                    />
                    <label htmlFor="weeklyReports" className="ml-2 text-sm text-slate-300">
                      Weekly Reports
                    </label>
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Email Preferences'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleSave('security', settings.security)
                }} className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorEnabled"
                      checked={settings.security?.twoFactorEnabled || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...(settings.security || {}), twoFactorEnabled: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
                    />
                    <label htmlFor="twoFactorEnabled" className="ml-2 text-sm text-slate-300">
                      Two-Factor Authentication
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <Input
                      type="number"
                      value={settings.security?.sessionTimeout || 30}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...(settings.security || {}), sessionTimeout: parseInt(e.target.value) }
                      })}
                      min="5"
                      max="1440"
                    />
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Security Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ComputerDesktopIcon className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleSave('system', settings.system)
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.system?.theme || 'dark'}
                      onChange={(e) => setSettings({
                        ...settings,
                        system: { ...settings.system, theme: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.system?.language || 'en'}
                      onChange={(e) => setSettings({
                        ...settings,
                        system: { ...settings.system, language: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="id">Bahasa Indonesia</option>
                    </select>
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save System Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellIcon className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleSave('notifications', settings.notifications)
                }} className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      checked={settings.notifications?.pushNotifications || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, pushNotifications: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
                    />
                    <label htmlFor="pushNotifications" className="ml-2 text-sm text-slate-300">
                      Push Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="soundEnabled"
                      checked={settings.notifications?.soundEnabled || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, soundEnabled: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
                    />
                    <label htmlFor="soundEnabled" className="ml-2 text-sm text-slate-300">
                      Sound Enabled
                    </label>
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Regional Settings */}
          {activeTab === 'regional' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5" />
                  Regional Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleSave('regional', settings.regional)
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.regional?.timezone || 'Asia/Jakarta'}
                      onChange={(e) => setSettings({
                        ...settings,
                        regional: { ...settings.regional, timezone: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta</option>
                      <option value="Asia/Singapore">Asia/Singapore</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date Format
                    </label>
                    <select
                      value={settings.regional?.dateFormat || 'DD/MM/YYYY'}
                      onChange={(e) => setSettings({
                        ...settings,
                        regional: { ...settings.regional, dateFormat: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.regional?.currency || 'IDR'}
                      onChange={(e) => setSettings({
                        ...settings,
                        regional: { ...settings.regional, currency: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="IDR">IDR (Indonesian Rupiah)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Regional Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleSave('advanced', settings.advanced)
                }} className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="debugMode"
                      checked={settings.advanced?.debugMode || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        advanced: { ...settings.advanced, debugMode: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800"
                    />
                    <label htmlFor="debugMode" className="ml-2 text-sm text-slate-300">
                      Debug Mode
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      API Rate Limit (requests per minute)
                    </label>
                    <Input
                      type="number"
                      value={settings.advanced?.apiRateLimit || 100}
                      onChange={(e) => setSettings({
                        ...settings,
                        advanced: { ...settings.advanced, apiRateLimit: parseInt(e.target.value) }
                      })}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Advanced Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}