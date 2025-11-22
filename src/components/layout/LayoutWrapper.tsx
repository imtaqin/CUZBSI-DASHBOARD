'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()

  // Don't show sidebar on login page, error pages
  const isLoginPage = pathname === '/login'
  const isErrorPage = pathname === '/not-found' || pathname?.includes('error')

  return (
    <>
      {!isLoginPage && !isErrorPage && <Sidebar />}

      <div className={isLoginPage || isErrorPage ? 'min-h-screen' : 'lg:pl-64 min-h-screen'}>
        {children}
      </div>
    </>
  )
}
