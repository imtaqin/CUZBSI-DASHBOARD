'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Title and Search */}
          <div className="flex items-center flex-1">
            {title && (
              <div className="mr-4">
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>
            )}
            {/* Search Bar */}
            <div className="hidden md:block max-w-md w-full lg:ml-4">
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
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              type="button"
              className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

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
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  <a
                    href="/admin/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                    Your Profile
                  </a>
                  
                  <a
                    href="/admin/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                    Settings
                  </a>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                    Sign out
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