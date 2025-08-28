'use client'

import { useEffect, useState } from 'react'

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <div suppressHydrationWarning>{children}</div>
  }

  return <>{children}</>
}