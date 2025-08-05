"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ApiKey, LegacyApiKey } from "../types"

interface UseAISettingsProps {
  initialApiKeys?: LegacyApiKey[]
}

interface UseAISettingsReturn {
  apiKeys: LegacyApiKey[]
  setApiKeys: (apiKeys: LegacyApiKey[]) => void
  isLoading: boolean
  refreshApiKeys: () => Promise<void>
  addApiKey: (apiKey: Omit<ApiKey, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  updateApiKey: (id: string, updates: Partial<Omit<ApiKey, 'id' | 'created_at' | 'updated_at'>>) => Promise<boolean>
  deleteApiKey: (id: string) => Promise<boolean>
}

// Helper function to convert Supabase data to legacy format
const convertToLegacyFormat = (supabaseKey: ApiKey): LegacyApiKey => {
  return {
    id: supabaseKey.id,
    name: supabaseKey.key_name,
    key: supabaseKey.encrypted_key,
    provider: supabaseKey.service_name,
    isActive: supabaseKey.is_active,
    isDefault: false, // We'll handle default logic separately
    createdAt: new Date(supabaseKey.created_at),
    lastUsed: null, // This field doesn't exist in Supabase schema
    usageCount: supabaseKey.current_usage,
    usageLimit: supabaseKey.usage_limit,
    expiresAt: supabaseKey.expires_at ? new Date(supabaseKey.expires_at) : null,
  }
}

// Helper function to convert legacy format to Supabase format
const convertToSupabaseFormat = (legacyKey: Partial<LegacyApiKey>): Partial<ApiKey> => {
  const supabaseKey: Partial<ApiKey> = {}
  
  if (legacyKey.name) supabaseKey.key_name = legacyKey.name
  if (legacyKey.key) supabaseKey.encrypted_key = legacyKey.key
  if (legacyKey.provider) supabaseKey.service_name = legacyKey.provider
  if (typeof legacyKey.isActive === 'boolean') supabaseKey.is_active = legacyKey.isActive
  if (typeof legacyKey.usageCount === 'number') supabaseKey.current_usage = legacyKey.usageCount
  if (legacyKey.usageLimit !== undefined) supabaseKey.usage_limit = legacyKey.usageLimit
  if (legacyKey.expiresAt !== undefined) {
    supabaseKey.expires_at = legacyKey.expiresAt ? legacyKey.expiresAt.toISOString() : null
  }
  
  return supabaseKey
}

export const useAISettings = ({ initialApiKeys = [] }: UseAISettingsProps): UseAISettingsReturn => {
  const [apiKeys, setApiKeys] = useState<LegacyApiKey[]>(initialApiKeys)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Fetch API keys from Supabase
  const refreshApiKeys = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching API keys:', error)
        return
      }

      // Convert Supabase format to legacy format
      const legacyKeys = data.map(convertToLegacyFormat)
      setApiKeys(legacyKeys)
    } catch (error) {
      console.error('Error in refreshApiKeys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new API key
  const addApiKey = async (newKey: Omit<ApiKey, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .insert([{
          service_name: newKey.service_name,
          key_name: newKey.key_name,
          encrypted_key: newKey.encrypted_key,
          is_active: newKey.is_active,
          usage_limit: newKey.usage_limit,
          current_usage: newKey.current_usage || 0,
          expires_at: newKey.expires_at,
        }])
        .select()
        .single()

      if (error) {
        console.error('Error adding API key:', error)
        return false
      }

      // Add to local state
      const newLegacyKey = convertToLegacyFormat(data)
      setApiKeys(prev => [newLegacyKey, ...prev])
      return true
    } catch (error) {
      console.error('Error in addApiKey:', error)
      return false
    }
  }

  // Update an API key
  const updateApiKey = async (id: string, updates: Partial<Omit<ApiKey, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating API key:', error)
        return false
      }

      // Update local state
      const updatedLegacyKey = convertToLegacyFormat(data)
      setApiKeys(prev => prev.map(key => key.id === id ? updatedLegacyKey : key))
      return true
    } catch (error) {
      console.error('Error in updateApiKey:', error)
      return false
    }
  }

  // Delete an API key
  const deleteApiKey = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting API key:', error)
        return false
      }

      // Remove from local state
      setApiKeys(prev => prev.filter(key => key.id !== id))
      return true
    } catch (error) {
      console.error('Error in deleteApiKey:', error)
      return false
    }
  }

  // Load data on mount
  useEffect(() => {
    refreshApiKeys()
  }, [])

  return {
    apiKeys,
    setApiKeys,
    isLoading,
    refreshApiKeys,
    addApiKey,
    updateApiKey,
    deleteApiKey,
  }
}
