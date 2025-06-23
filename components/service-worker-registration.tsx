"use client"

import { useEffect } from 'react'
import { registerSW, useNetworkStatus } from '@/lib/service-worker'

export default function ServiceWorkerRegistration() {
  const { isOnline, isOffline } = useNetworkStatus()

  useEffect(() => {
    // Only register service worker in production or if explicitly enabled
    if (
      process.env.NODE_ENV === 'production' || 
      process.env.NEXT_PUBLIC_SW_ENABLED === 'true'
    ) {
      registerSW({
        onSuccess: (registration) => {
          console.log('SW registered successfully:', registration)
        },
        onUpdate: (registration) => {
          console.log('SW updated:', registration)
          // You could show a "New version available" toast here
        },
        onError: (error) => {
          console.error('SW registration failed:', error)
        },
      })
    }
  }, [])

  // Show network status indicator (optional)
  if (isOffline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">You're offline</span>
        </div>
      </div>
    )
  }

  return null
}
