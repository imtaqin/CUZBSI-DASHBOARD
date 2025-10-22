import { ReactNode } from 'react'
import { Header } from './Header'

interface AdminLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar will be handled by the parent layout */}
        <div className="flex-1 flex flex-col">
          <Header title={title} />
          <main className="flex-1 p-4">
            <div className="max-w-7xl mx-auto">
              {description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}