'use client'

import { useAuth } from '@/context/AuthContext'
import { Loading } from '@/components/ui'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    // This will be handled by middleware/auth guard
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header title={title} description={description} />
        
        <main className="flex-1 py-3 lg:py-6">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}