"use client"

import { useState, useEffect, useCallback } from 'react'
import { systemConfigService } from '@/lib/system-config'
import type { DefaultAssistantConfig } from '@/types/system-config.types'

export function useSystemConfig() {
  const [defaultAssistant, setDefaultAssistant] = useState<DefaultAssistantConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDefaultAssistant = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const config = await systemConfigService.getDefaultAssistant()
      setDefaultAssistant(config)
    } catch (err) {
      console.error('Error fetching default assistant:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch default assistant')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateDefaultAssistant = useCallback(async (config: DefaultAssistantConfig): Promise<boolean> => {
    try {
      setError(null)
      const success = await systemConfigService.updateDefaultAssistant(config)
      if (success) {
        // Immediately update local state for instant UI feedback
        setDefaultAssistant(config)
        // Clear cache to ensure fresh data on next fetch
        systemConfigService.clearCache('default_assistant')
        
        // Verify the update by fetching from server
        setTimeout(async () => {
          try {
            const updatedConfig = await systemConfigService.getDefaultAssistant()
            setDefaultAssistant(updatedConfig)
          } catch (err) {
            console.warn('Failed to verify update:', err)
          }
        }, 100)
      }
      return success
    } catch (err) {
      console.error('Error updating default assistant:', err)
      setError(err instanceof Error ? err.message : 'Failed to update default assistant')
      return false
    }
  }, [])

  const refreshConfig = useCallback(() => {
    systemConfigService.clearCache('default_assistant')
    fetchDefaultAssistant()
  }, [fetchDefaultAssistant])

  useEffect(() => {
    fetchDefaultAssistant()
  }, [fetchDefaultAssistant])

  return {
    defaultAssistant,
    isLoading,
    error,
    updateDefaultAssistant,
    refreshConfig,
    refetch: fetchDefaultAssistant
  }
}

export default useSystemConfig
