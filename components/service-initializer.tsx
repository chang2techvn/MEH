"use client"

import { useInitializeSingleChatService } from '@/hooks/use-initialize-single-chat-service'

/**
 * Component to initialize various services when app starts
 * Should be placed in the app layout
 */
export function ServiceInitializer() {
  // Initialize single chat service with system config
  useInitializeSingleChatService()

  // This component doesn't render anything
  return null
}

export default ServiceInitializer
