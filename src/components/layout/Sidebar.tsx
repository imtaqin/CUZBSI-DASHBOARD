'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import {
  HomeIcon,
  UsersIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowLeftEndOnRectangleIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  permission?: string
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: UsersIcon,
    permission: 'users.manage'
  },
  {
    name: 'Role Management',
    href: '/admin/roles',
    icon: ShieldCheckIcon,
    permission: 'users.manage'
  },
  {
    name: 'Accounts',
    href: '/admin/accounts',
    icon: BuildingLibraryIcon,
  },
  {
    name: 'Transactions',
    href: '/admin/transactions',
    icon: CreditCardIcon,
  },
  {
    name: 'Real-time Logs',
    href: '/admin/logs',
    icon: DocumentTextIcon,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: CogIcon,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const hasPermission = (permission?: string) => {
    if (!permission) return true
    if (!user?.Roles) return false
    
    return user.Roles.some(role => 
      role.Permissions?.some(perm => perm.name === permission)
    )
  }

  const filteredItems = sidebarItems.filter(item => hasPermission(item.permission))

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-75"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex flex-col w-64 bg-slate-900 shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent 
              filteredItems={filteredItems}
              pathname={pathname}
              user={user}
              onLogout={handleLogout}
              onItemClick={() => setIsMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn("hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0", className)}>
        <SidebarContent 
          filteredItems={filteredItems}
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
        />
      </div>
    </>
  )
}

interface SidebarContentProps {
  filteredItems: SidebarItem[]
  pathname: string
  user: any
  onLogout: () => void
  onItemClick?: () => void
}

function SidebarContent({ filteredItems, pathname, user, onLogout, onItemClick }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 shadow-sm">
      {/* Logo/Brand */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">CUZBSI Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors duration-200",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 border-t border-slate-700">
        <div className="px-4 py-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center space-x-2">
            <Link
              href="/admin/profile"
              onClick={onItemClick}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 text-center"
            >
              Profile
            </Link>
            <button
              onClick={onLogout}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
            >
              <ArrowLeftEndOnRectangleIcon className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}