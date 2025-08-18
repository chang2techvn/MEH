"use client"

import { useEffect } from 'react'
import { singleChatService } from '@/lib/single-chat-service'

/**
 * Hook to initialize single chat service with system config
 * Should be used in app layout or main component
 */
export function useInitializeSingleChatService() {
  useEffect(() => {
    // Initialize the service with system config
    const initializeService = async () => {
      try {
        await singleChatService.initialize()
      } catch (error) {
        console.error('Failed to initialize single chat service:', error)
      }
    }

    initializeService()
  }, [])
}

export default useInitializeSingleChatService
