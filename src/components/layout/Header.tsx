'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { Button } from '@/components/ui'
import {
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Close notification dropdown when profile menu opens
  useEffect(() => {
    if (isProfileMenuOpen) {
      setIsNotificationDropdownOpen(false)
    }
  }, [isProfileMenuOpen])

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Title and Search */}
          <div className="flex items-center flex-1 min-w-0">
            {title && (
              <div className="mr-2 sm:mr-4 flex-shrink-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h1>
              </div>
            )}
            {/* Search Bar */}
            <div className="hidden sm:block max-w-xs md:max-w-md w-full ml-2 sm:ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                aria-label="Notifications"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full bg-red-500 text-white ring-2 ring-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                isOpen={isNotificationDropdownOpen}
                onClose={() => setIsNotificationDropdownOpen(false)}
              />
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-white" />
                </div>
              </button>

              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 sm:w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <a
                    href="/admin/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                  >
                    <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">Your Profile</span>
                  </a>

                  <a
                    href="/admin/settings"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                  >
                    <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">Settings</span>
                  </a>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}