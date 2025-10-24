import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CUZBSI Dashboard',
  description: 'CUZBSI Transaction Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        <AuthProvider>
          {/* Fixed Sidebar - Always visible on desktop */}
          <Sidebar />

          {/* Main content - Has left padding to account for fixed sidebar */}
          <div className="lg:pl-64 min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
