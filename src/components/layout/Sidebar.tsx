'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  ShieldCheckIcon,
  ShieldExclamationIcon,
  FlagIcon,
  LinkIcon,
  ClockIcon,
  BellIcon,
  BanknotesIcon,
  TableCellsIcon,
  KeyIcon,
  ChatBubbleLeftIcon
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
    name: 'Dasbor',
    href: '/admin',
    icon: HomeIcon,
  },
  {
    name: 'Bank',
    href: '/admin/banks',
    icon: BuildingLibraryIcon,
    permission: 'banks.manage'
  },
  {
    name: 'Akun',
    href: '/admin/accounts',
    icon: CreditCardIcon,
  },
  {
    name: 'Transaksi',
    href: '/admin/transactions',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Penanda',
    href: '/admin/flags',
    icon: FlagIcon,
  },
  {
    name: 'Riwayat Penanda',
    href: '/admin/flag-mappings',
    icon: LinkIcon,
  },
  {
    name: 'Jadwal Cron',
    href: '/admin/cron-schedules',
    icon: ClockIcon,
    permission: 'schedules.manage'
  },
  {
    name: 'Notifikasi',
    href: '/admin/notification-templates',
    icon: BellIcon,
  },
  {
    name: 'Log WhatsApp',
    href: '/admin/whatsapp-logs',
    icon: ChatBubbleLeftIcon,
  },
  {
    name: 'Google Sheets',
    href: '/admin/google-sheets',
    icon: TableCellsIcon,
  },
  {
    name: 'Kunci API',
    href: '/admin/api-keys',
    icon: KeyIcon,
  },
  {
    name: 'Pengguna',
    href: '/admin/users',
    icon: UsersIcon,
    permission: 'users.manage'
  },
  {
    name: 'Peran',
    href: '/admin/roles',
    icon: ShieldCheckIcon,
    permission: 'users.manage'
  },
  {
    name: 'Izin',
    href: '/admin/permissions',
    icon: ShieldExclamationIcon,
    permission: 'users.manage'
  },
  {
    name: 'Log',
    href: '/admin/logs',
    icon: DocumentTextIcon,
    permission: 'logs.view'
  },
  {
    name: 'Pengaturan',
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

  // Don't show sidebar on login page
  if (pathname === '/login') {
    return null
  }

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
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 shadow-lg bg-white border border-slate-200"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex flex-col w-full max-w-sm bg-white shadow-xl">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
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
      <div className={cn("hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30", className)}>
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
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-slate-200 bg-white">
        <Image
          src="/image/logo-cuzbsi.png"
          alt="CUZBSI Logo"
          width={40}
          height={40}
          className="object-contain flex-shrink-0"
        />
        <h1 className="text-lg font-bold text-gray-800 tracking-tight truncate">CUZBSI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-150 min-h-[44px]",
                isActive
                  ? "bg-green-50 text-green-700 shadow-sm border border-green-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors duration-150 flex-shrink-0",
                  isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="truncate flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-100 text-red-800 flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <Link
            href="/admin/profile"
            onClick={onItemClick}
            className={cn(
              "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-150 min-h-[44px]",
              pathname === '/admin/profile'
                ? "bg-green-50 text-green-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <UserIcon className="mr-3 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Profil</span>
          </Link>
          <button
            onClick={() => {
              onLogout()
              if (onItemClick) onItemClick()
            }}
            className="w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-all duration-150 min-h-[44px]"
          >
            <ArrowLeftEndOnRectangleIcon className="mr-3 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  )
}