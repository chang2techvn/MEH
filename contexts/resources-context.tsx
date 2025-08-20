'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAIAssistants } from '@/hooks/use-ai-assistants'
import { useChatSessions } from '@/hooks/use-chat-sessions'

interface ResourcesContextType {
  // AI Assistants data
  aiAssistants: any[]
  aiLoading: boolean
  aiError: any
  getAIById: (id: string) => any
  
  // Chat Sessions data
  chatSessions: any[]
  
  // Cache status
  isCacheReady: boolean
  isInitialLoad: boolean
  
  // Refresh methods
  refreshAIAssistants: () => void
  refreshChatSessions: () => void
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined)

interface ResourcesProviderProps {
  children: ReactNode
}

export function ResourcesProvider({ children }: ResourcesProviderProps) {
  const [isCacheReady, setIsCacheReady] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Load AI Assistants data
  const { 
    aiAssistants, 
    loading: aiLoading, 
    error: aiError, 
    getAIById,
    refetch: refetchAIAssistants 
  } = useAIAssistants()
  
  // Load Chat Sessions data
  const { 
    sessions: chatSessions,
    reload: reloadChatSessions 
  } = useChatSessions()
  
  // Mark cache as ready when core data is loaded
  useEffect(() => {
    if (!aiLoading && aiAssistants.length > 0) {
      console.log('📦 Resources cache ready - AI Assistants loaded:', aiAssistants.length)
      setIsCacheReady(true)
      setIsInitialLoad(false)
    }
  }, [aiLoading, aiAssistants.length])
  
  // Preload resources data immediately when context mounts
  useEffect(() => {
    console.log('🚀 Resources context initializing...')
    // Data loading is handled by individual hooks
  }, [])

  const value: ResourcesContextType = {
    // AI Assistants
    aiAssistants,
    aiLoading,
    aiError,
    getAIById,
    
    // Chat Sessions
    chatSessions,
    
    // Cache status
    isCacheReady,
    isInitialLoad,
    
    // Refresh methods
    refreshAIAssistants: refetchAIAssistants,
    refreshChatSessions: reloadChatSessions
  }

  return (
    <ResourcesContext.Provider value={value}>
      {children}
    </ResourcesContext.Provider>
  )
}

export function useResourcesContext() {
  const context = useContext(ResourcesContext)
  if (context === undefined) {
    throw new Error('useResourcesContext must be used within a ResourcesProvider')
  }
  return context
}
