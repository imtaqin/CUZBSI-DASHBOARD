'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, LoadingPage } from '@/components/ui'
import { apiService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: '',
        avatar: ''
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await apiService.updateProfile(profileData)
      if (response.success) {
        setSuccess('Profile updated successfully')
        updateUser(response.data.user)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await apiService.changePassword(passwordData)
      if (response.success) {
        setSuccess('Password changed successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <AdminLayout title="Profile" description="User profile management">
        <LoadingPage text="Loading profile..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Profile" description="User profile management">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-slate-400">Manage your personal information and security settings</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-slate-800 border-slate-600 text-slate-400"
                  />
                  <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
                </div>

                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  placeholder="Enter your first name"
                />

                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  placeholder="Enter your last name"
                />

                <Input
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />

                <Input
                  label="Avatar URL"
                  value={profileData.avatar}
                  onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                  placeholder="Enter avatar URL"
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter your new password"
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm your new password"
                  required
                />

                <div className="bg-slate-800 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Password Requirements:</h4>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Include both uppercase and lowercase letters</li>
                    <li>• Include at least one number</li>
                    <li>• Include at least one special character</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* User Roles */}
        <Card>
          <CardHeader>
            <CardTitle>User Roles & Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.Roles && user.Roles.length > 0 ? (
                user.Roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">{role.name}</h4>
                      <p className="text-sm text-slate-400">{role.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.Permissions && role.Permissions.map((permission) => (
                        <span
                          key={permission.id}
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                        >
                          {permission.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400">
                  No roles assigned
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}