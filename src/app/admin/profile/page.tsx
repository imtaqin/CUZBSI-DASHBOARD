'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  })

  const handleSave = () => {
    // Here you would call the API to update user profile
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    })
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <AdminLayout title="Profile" description="Manage your account profile and settings">
      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-500">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {user.Roles.map((role) => (
                      <Badge key={role.id} variant="secondary">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                    <Input
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      <div className="mt-1 text-sm text-gray-900">{user.firstName}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Name</label>
                      <div className="mt-1 text-sm text-gray-900">{user.lastName}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                    <div className="mt-1 text-sm text-gray-900 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Status</label>
                    <div className="mt-1">
                      <Badge variant={user.isActive ? "success" : "destructive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <div className="mt-1 text-sm text-gray-900 flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Password</label>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-gray-400">••••••••••••</span>
                  <Button variant="outline" size="sm">
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Roles & Permissions</h4>
                <div className="space-y-3">
                  {user.Roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{role.name}</div>
                          <div className="text-xs text-gray-500">{role.description}</div>
                        </div>
                        <Badge variant="secondary">{role.name}</Badge>
                      </div>
                      {role.Permissions && role.Permissions.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">Permissions:</div>
                          <div className="flex flex-wrap gap-1">
                            {role.Permissions.slice(0, 3).map((permission) => (
                              <Badge key={permission.id} variant="outline" className="text-xs">
                                {permission.name}
                              </Badge>
                            ))}
                            {role.Permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.Permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}