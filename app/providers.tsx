'use client'

import { ReactNode, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import all RainbowKit components to avoid SSR issues
const RainbowKitProviders = dynamic(
  () => import('./components/RainbowKitProviders'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#1A1A1A] dark:text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }
)

export function Providers({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#1A1A1A] dark:text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return <RainbowKitProviders>{children}</RainbowKitProviders>
} 