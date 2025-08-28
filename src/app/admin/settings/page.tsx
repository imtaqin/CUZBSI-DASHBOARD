'use client'

import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  ServerIcon,
  BellIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  return (
    <AdminLayout title="Settings" description="Configure system settings and preferences">
      <div className="space-y-6">
        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Manage your profile, password, and personal preferences.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">• Profile Information</div>
                <div className="text-sm text-slate-400">• Change Password</div>
                <div className="text-sm text-slate-400">• Email Preferences</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-600" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Configure security options and access permissions.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">• Two-Factor Authentication</div>
                <div className="text-sm text-slate-400">• Session Management</div>
                <div className="text-sm text-slate-400">• API Access Tokens</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ServerIcon className="h-5 w-5 mr-2 text-purple-600" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configure system-wide settings and integrations.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">• BSI API Configuration</div>
                <div className="text-sm text-gray-500">• Sync Schedules</div>
                <div className="text-sm text-gray-500">• Data Retention</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-orange-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage notification preferences and alerts.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">• Email Notifications</div>
                <div className="text-sm text-gray-500">• Sync Alerts</div>
                <div className="text-sm text-gray-500">• Error Notifications</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configure language, timezone, and currency settings.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">• Language: English</div>
                <div className="text-sm text-gray-500">• Timezone: Asia/Jakarta</div>
                <div className="text-sm text-gray-500">• Currency: IDR</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CogIcon className="h-5 w-5 mr-2 text-gray-600" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Advanced configuration options for power users.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">• Debug Mode</div>
                <div className="text-sm text-gray-500">• Export Data</div>
                <div className="text-sm text-gray-500">• System Logs</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Application</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Version: 1.0.0</div>
                  <div>Build: 2025.01.001</div>
                  <div>Environment: Development</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Server Status</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Database: Connected
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Socket.IO: Connected
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    BSI API: Testing Required
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