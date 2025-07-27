/**
 * Core API Key Manager
 * Handles all API key operations including retrieval, rotation, health checks, and usage tracking
 */

import { createClient } from '@supabase/supabase-js'
import { decryptApiKey, maskApiKey } from './api-key-encryption'
import type { 
  ApiKey, 
  ApiKeyDecrypted, 
  ApiKeyError, 
  ApiKeyRotationResult,
  ApiKeyUsage,
  ApiKeyServiceConfig 
} from '../types/api-keys.types'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Default service configuration
const DEFAULT_CONFIG: ApiKeyServiceConfig = {
  serviceName: 'gemini',
  maxRetries: 3,
  retryDelay: 1000,
  healthCheckInterval: 300000, // 5 minutes
  usageThreshold: 0.9 // 90% usage threshold
}

/**
 * Creates a custom API Key Error
 */
function createApiKeyError(
  code: ApiKeyError['code'],
  message: string,
  keyId?: string,
  serviceName?: string,
  details?: any
): ApiKeyError {
  const error = new Error(message) as ApiKeyError
  error.code = code
  error.keyId = keyId
  error.serviceName = serviceName
  error.details = details
  return error
}

/**
 * Gets an active API key for the specified service
 * @param serviceName - The service name (e.g., 'gemini')
 * @param config - Optional service configuration
 * @returns Promise<ApiKeyDecrypted> - The active API key with decrypted key
 */
export async function getActiveApiKey(
  serviceName: string = 'gemini',
  config: Partial<ApiKeyServiceConfig> = {}
): Promise<ApiKeyDecrypted> {
  const serviceConfig = { ...DEFAULT_CONFIG, ...config, serviceName }
  
  try {
    console.log(`🔑 Getting active API key for service: ${serviceName}`)
    
    // Query for active keys, ordered by usage (lowest first) and creation date
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .eq('is_active', true)
      .order('current_usage', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
    
    if (error) {
      console.error('❌ Database error:', error)
      throw createApiKeyError('DATABASE_ERROR', 'Failed to fetch API key from database', undefined, serviceName, error)
    }
    
    if (!keys || keys.length === 0) {
      console.error(`❌ No active API keys found for service: ${serviceName}`)
      throw createApiKeyError('KEY_NOT_FOUND', `No active API keys available for service: ${serviceName}`, undefined, serviceName)
    }
    
    const key = keys[0] as ApiKey
    
    try {
      // Decrypt the API key
      const decryptedKey = decryptApiKey(key.encrypted_key)
      
      console.log(`✅ Retrieved active API key: ${key.key_name} (Usage: ${key.current_usage}/${key.usage_limit})`)
      
      return {
        ...key,
        decrypted_key: decryptedKey
      }
    } catch (decryptError) {
      console.error(`❌ Failed to decrypt API key ${key.key_name}:`, decryptError)
      throw createApiKeyError('DECRYPTION_FAILED', 'Failed to decrypt API key', key.id, serviceName, decryptError)
    }
    
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error // Re-throw custom API key errors
    }
    console.error('❌ Unexpected error in getActiveApiKey:', error)
    throw createApiKeyError('DATABASE_ERROR', 'Unexpected error while fetching API key', undefined, serviceName, error)
  }
}

/**
 * Marks an API key as inactive
 * @param keyId - The ID of the key to deactivate
 * @param reason - The reason for deactivation
 * @returns Promise<boolean> - Success status
 */
export async function markKeyAsInactive(keyId: string, reason: string): Promise<boolean> {
  try {
    console.log(`🚫 Marking API key as inactive: ${keyId} - Reason: ${reason}`)
    
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
    
    if (error) {
      console.error('❌ Failed to mark key as inactive:', error)
      throw createApiKeyError('DATABASE_ERROR', 'Failed to update key status', keyId, undefined, error)
    }
    
    console.log(`✅ API key marked as inactive: ${keyId}`)
    return true
    
  } catch (error) {
    console.error('❌ Error marking key as inactive:', error)
    return false
  }
}

/**
 * Increments the usage counter for an API key
 * @param keyId - The ID of the key to increment usage for
 * @returns Promise<boolean> - Success status
 */
export async function incrementUsage(keyId: string): Promise<boolean> {
  try {
    console.log(`📊 Incrementing usage for API key: ${keyId}`)
    
    // First get current usage
    const { data: currentKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('current_usage')
      .eq('id', keyId)
      .single()
    
    if (fetchError || !currentKey) {
      console.error('❌ Failed to fetch current usage:', fetchError)
      throw createApiKeyError('DATABASE_ERROR', 'Failed to fetch current usage', keyId, undefined, fetchError)
    }
    
    // Update with incremented value
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        current_usage: currentKey.current_usage + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
    
    if (error) {
      console.error('❌ Failed to increment usage:', error)
      throw createApiKeyError('DATABASE_ERROR', 'Failed to update usage counter', keyId, undefined, error)
    }
    
    console.log(`✅ Usage incremented for API key: ${keyId}`)
    return true
    
  } catch (error) {
    console.error('❌ Error incrementing usage:', error)
    return false
  }
}

/**
 * Rotates to the next available API key for a service
 * @param serviceName - The service name
 * @param currentKeyId - The current key ID that failed
 * @param reason - The reason for rotation
 * @returns Promise<ApiKeyRotationResult> - The rotation result
 */
export async function rotateToNextKey(
  serviceName: string,
  currentKeyId?: string,
  reason: string = 'Service unavailable'
): Promise<ApiKeyRotationResult> {
  try {
    console.log(`🔄 Rotating API key for service: ${serviceName} - Reason: ${reason}`)
    
    // Mark current key as inactive if provided
    if (currentKeyId) {
      await markKeyAsInactive(currentKeyId, reason)
    }
    
    // Get the next available key
    try {
      const nextKey = await getActiveApiKey(serviceName)
      
      console.log(`✅ Successfully rotated to new API key: ${nextKey.key_name}`)
      
      return {
        success: true,
        previousKeyId: currentKeyId,
        newKeyId: nextKey.id,
        reason,
        timestamp: new Date()
      }
    } catch (error) {
      console.error(`❌ No alternative API keys available for service: ${serviceName}`)
      
      return {
        success: false,
        previousKeyId: currentKeyId,
        reason: `No alternative keys available: ${reason}`,
        timestamp: new Date()
      }
    }
    
  } catch (error) {
    console.error('❌ Error during key rotation:', error)
    return {
      success: false,
      previousKeyId: currentKeyId,
      reason: `Rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date()
    }
  }
}

/**
 * Gets usage statistics for an API key
 * @param keyId - The ID of the key
 * @returns Promise<ApiKeyUsage | null> - Usage statistics or null if not found
 */
export async function getKeyUsage(keyId: string): Promise<ApiKeyUsage | null> {
  try {
    const { data: key, error } = await supabase
      .from('api_keys')
      .select('id, key_name, current_usage, usage_limit')
      .eq('id', keyId)
      .single()
    
    if (error || !key) {
      console.error('❌ Key not found:', keyId)
      return null
    }
    
    const usagePercentage = (key.current_usage / key.usage_limit) * 100
    const isNearLimit = usagePercentage >= 90
    
    return {
      keyId: key.id,
      keyName: key.key_name,
      currentUsage: key.current_usage,
      usageLimit: key.usage_limit,
      usagePercentage,
      isNearLimit
    }
    
  } catch (error) {
    console.error('❌ Error getting key usage:', error)
    return null
  }
}

/**
 * Gets all API keys for a service with their status
 * @param serviceName - The service name
 * @returns Promise<ApiKey[]> - Array of API keys
 */
export async function getAllKeys(serviceName: string): Promise<ApiKey[]> {
  try {
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('❌ Failed to fetch all keys:', error)
      throw createApiKeyError('DATABASE_ERROR', 'Failed to fetch API keys', undefined, serviceName, error)
    }
    
    return keys || []
    
  } catch (error) {
    console.error('❌ Error getting all keys:', error)
    throw error
  }
}

/**
 * Resets usage counters for all keys (for daily reset)
 * @param serviceName - The service name
 * @returns Promise<boolean> - Success status
 */
export async function resetDailyUsage(serviceName: string): Promise<boolean> {
  try {
    console.log(`🔄 Resetting daily usage for service: ${serviceName}`)
    
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        current_usage: 0,
        updated_at: new Date().toISOString()
      })
      .eq('service_name', serviceName)
    
    if (error) {
      console.error('❌ Failed to reset daily usage:', error)
      return false
    }
    
    console.log(`✅ Daily usage reset for service: ${serviceName}`)
    return true
    
  } catch (error) {
    console.error('❌ Error resetting daily usage:', error)
    return false
  }
}

/**
 * Gets all active API keys for the specified service, ordered by usage
 * @param serviceName - The service name (e.g., 'gemini')
 * @returns Promise<ApiKeyDecrypted[]> - Array of active API keys with decrypted keys
 */
export async function getAllActiveApiKeys(
  serviceName: string = 'gemini'
): Promise<ApiKeyDecrypted[]> {
  try {
    console.log(`🔑 Getting all active API keys for service: ${serviceName}`)
    
    // Query for all active keys, ordered by usage (lowest first) and creation date
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .eq('is_active', true)
      .order('current_usage', { ascending: true })
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('❌ Database error:', error)
      throw createApiKeyError('DATABASE_ERROR', 'Failed to fetch API keys from database', undefined, serviceName, error)
    }
    
    if (!keys || keys.length === 0) {
      console.error(`❌ No active API keys found for service: ${serviceName}`)
      throw createApiKeyError('KEY_NOT_FOUND', `No active API keys available for service: ${serviceName}`, undefined, serviceName)
    }
    
    const decryptedKeys: ApiKeyDecrypted[] = []
    
    for (const key of keys) {
      try {
        // Decrypt the API key
        const decryptedKey = decryptApiKey(key.encrypted_key)
        
        decryptedKeys.push({
          ...key,
          decrypted_key: decryptedKey
        })
        
        console.log(`✅ Decrypted API key: ${key.key_name} (Usage: ${key.current_usage}/${key.usage_limit})`)
        
      } catch (decryptError) {
        console.error(`❌ Failed to decrypt API key ${key.key_name}:`, decryptError)
        // Continue with other keys instead of failing completely
      }
    }
    
    if (decryptedKeys.length === 0) {
      throw createApiKeyError('DECRYPTION_FAILED', 'Failed to decrypt any API keys', undefined, serviceName)
    }
    
    console.log(`✅ Retrieved ${decryptedKeys.length} active API keys for service: ${serviceName}`)
    return decryptedKeys
    
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error // Re-throw custom API key errors
    }
    console.error('❌ Unexpected error in getAllActiveApiKeys:', error)
    throw createApiKeyError('DATABASE_ERROR', 'Unexpected error while fetching API keys', undefined, serviceName, error)
  }
}
