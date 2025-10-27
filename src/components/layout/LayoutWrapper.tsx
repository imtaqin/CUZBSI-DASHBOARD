'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()

  // Don't show sidebar on login page
  const isLoginPage = pathname === '/login'

  return (
    <>
      {!isLoginPage && <Sidebar />}

      <div className={isLoginPage ? 'min-h-screen' : 'lg:pl-64 min-h-screen'}>
        {children}
      </div>
    </>
  )
}
