/**
 * API Key Health Monitoring System
 * Provides health checks, monitoring, and automatic recovery for API keys
 */

import { createClient } from '@supabase/supabase-js'
import { getActiveApiKey, markKeyAsInactive, rotateToNextKey } from './api-key-manager'
import { decryptApiKey, maskApiKey } from './api-key-encryption'
import type { ApiKeyHealth, ApiKeyMetrics } from '../types/api-keys.types'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
  geminiTestEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
}

/**
 * Performs a health check on a specific API key
 * @param keyId - The ID of the key to check
 * @param serviceName - The service name (e.g., 'gemini')
 * @returns Promise<ApiKeyHealth> - Health status of the key
 */
export async function checkKeyHealth(keyId: string, serviceName: string = 'gemini'): Promise<ApiKeyHealth> {
  const startTime = Date.now()
  
  try {
    
    // Get the key from database
    const { data: key, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .single()
    
    if (error || !key) {
      return {
        keyId,
        keyName: 'unknown',
        isActive: false,
        isHealthy: false,
        lastChecked: new Date(),
        errorCount: 1,
        lastError: 'Key not found in database'
      }
    }
    
    // Basic health status
    const health: ApiKeyHealth = {
      keyId: key.id,
      keyName: key.key_name,
      isActive: key.is_active,
      isHealthy: false,
      lastChecked: new Date(),
      errorCount: 0
    }
    
    // If key is inactive, mark as unhealthy
    if (!key.is_active) {
      health.isHealthy = false
      health.lastError = 'Key is marked as inactive'
      return health
    }
    
    // Check if usage is within limits
    if (key.current_usage >= key.usage_limit) {
      health.isHealthy = false
      health.lastError = 'Usage limit exceeded'
      return health
    }
    
    // Perform actual API health check for Gemini
    if (serviceName === 'gemini') {
      try {
        const decryptedKey = decryptApiKey(key.encrypted_key)
        const isApiHealthy = await performGeminiHealthCheck(decryptedKey)
        
        health.isHealthy = isApiHealthy
        if (!isApiHealthy) {
          health.errorCount = 1
          health.lastError = 'API endpoint health check failed'
        }
      } catch (error) {
        health.isHealthy = false
        health.errorCount = 1
        health.lastError = error instanceof Error ? error.message : 'Health check failed'
      }
    }
    
    const duration = Date.now() - startTime
    
    return health
    
  } catch (error) {
    console.error('❌ Error during health check:', error)
    return {
      keyId,
      keyName: 'unknown',
      isActive: false,
      isHealthy: false,
      lastChecked: new Date(),
      errorCount: 1,
      lastError: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Performs a health check on Gemini API
 * @param apiKey - The decrypted API key
 * @returns Promise<boolean> - True if healthy
 */
async function performGeminiHealthCheck(apiKey: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_CONFIG.timeout)
    
    const response = await fetch(`${HEALTH_CHECK_CONFIG.geminiTestEndpoint}?key=${apiKey}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    clearTimeout(timeoutId)
    
    // Check response status
    if (response.status === 200) {
      return true
    } else if (response.status === 403) {
      return false
    } else if (response.status === 429) {
      return false
    } else if (response.status >= 500) {
      return false
    }
    
    return false
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
    } else {
    }
    return false
  }
}

/**
 * Performs health checks on all keys for a service
 * @param serviceName - The service name
 * @returns Promise<ApiKeyHealth[]> - Health status for all keys
 */
export async function checkAllKeysHealth(serviceName: string = 'gemini'): Promise<ApiKeyHealth[]> {
  try {
    
    // Get all keys for the service
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, key_name')
      .eq('service_name', serviceName)
      .order('created_at', { ascending: true })
    
    if (error || !keys) {
      console.error('❌ Failed to fetch keys for health check:', error)
      return []
    }
    
    // Perform health checks in parallel (but limit concurrency)
    const healthChecks = keys.map(key => checkKeyHealth(key.id, serviceName))
    const healthResults = await Promise.all(healthChecks)
    
    const healthyCount = healthResults.filter(h => h.isHealthy).length
    
    return healthResults
    
  } catch (error) {
    console.error('❌ Error checking all keys health:', error)
    return []
  }
}

/**
 * Gets comprehensive metrics for all API keys
 * @param serviceName - The service name
 * @returns Promise<ApiKeyMetrics> - Metrics summary
 */
export async function getApiKeyMetrics(serviceName: string = 'gemini'): Promise<ApiKeyMetrics> {
  try {
    
    // Get all keys with their usage
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
    
    if (error || !keys) {
      console.error('❌ Failed to fetch keys for metrics:', error)
      return {
        totalKeys: 0,
        activeKeys: 0,
        inactiveKeys: 0,
        totalUsage: 0,
        averageUsage: 0,
        errorRate: 0,
        healthyKeys: 0
      }
    }
    
    // Calculate basic metrics
    const totalKeys = keys.length
    const activeKeys = keys.filter(k => k.is_active).length
    const inactiveKeys = totalKeys - activeKeys
    const totalUsage = keys.reduce((sum, k) => sum + k.current_usage, 0)
    const averageUsage = totalKeys > 0 ? totalUsage / totalKeys : 0
    
    // Perform health checks for active keys
    const healthChecks = await Promise.all(
      keys.filter(k => k.is_active).map(k => checkKeyHealth(k.id, serviceName))
    )
    
    const healthyKeys = healthChecks.filter(h => h.isHealthy).length
    const errorRate = activeKeys > 0 ? (activeKeys - healthyKeys) / activeKeys : 0
    
    const metrics: ApiKeyMetrics = {
      totalKeys,
      activeKeys,
      inactiveKeys,
      totalUsage,
      averageUsage,
      errorRate,
      healthyKeys
    }
    
    return metrics
    
  } catch (error) {
    console.error('❌ Error getting API key metrics:', error)
    return {
      totalKeys: 0,
      activeKeys: 0,
      inactiveKeys: 0,
      totalUsage: 0,
      averageUsage: 0,
      errorRate: 0,
      healthyKeys: 0
    }
  }
}

/**
 * Monitors API keys and performs automatic recovery
 * @param serviceName - The service name
 * @returns Promise<void>
 */
export async function monitorAndRecover(serviceName: string = 'gemini'): Promise<void> {
  try {
    
    const healthResults = await checkAllKeysHealth(serviceName)
    const unhealthyKeys = healthResults.filter(h => !h.isHealthy && h.isActive)
    
    if (unhealthyKeys.length > 0) {
      
      for (const unhealthyKey of unhealthyKeys) {
        try {
          // Mark as inactive and try to rotate
          await markKeyAsInactive(unhealthyKey.keyId, unhealthyKey.lastError || 'Health check failed')
          
          // Log the recovery action
          
        } catch (error) {
          console.error(`❌ Failed to recover key ${unhealthyKey.keyName}:`, error)
        }
      }
    }
    
    // Check if we have enough healthy keys
    const healthyKeys = healthResults.filter(h => h.isHealthy).length

    
  } catch (error) {
    console.error('❌ Error during monitoring and recovery:', error)
  }
}

/**
 * Performs a comprehensive system health check
 * @param serviceName - The service name
 * @returns Promise<{healthy: boolean, details: any}> - Overall system health
 */
export async function performSystemHealthCheck(serviceName: string = 'gemini'): Promise<{healthy: boolean, details: any}> {
  try {
    
    const metrics = await getApiKeyMetrics(serviceName)
    const healthResults = await checkAllKeysHealth(serviceName)
    
    const systemHealth = {
      healthy: metrics.healthyKeys >= 1 && metrics.activeKeys >= 2,
      details: {
        metrics,
        healthResults,
        timestamp: new Date().toISOString(),
        recommendations: [] as string[]
      }
    }
    
    // Add recommendations
    if (metrics.healthyKeys < 2) {
      systemHealth.details.recommendations.push('Consider activating more API keys')
    }
    
    if (metrics.errorRate > 0.5) {
      systemHealth.details.recommendations.push('High error rate detected, check API key validity')
    }
    
    if (metrics.averageUsage > metrics.activeKeys * 800) { // Assuming 1000 limit per key
      systemHealth.details.recommendations.push('Usage approaching limits, consider adding more keys')
    }
    
    return systemHealth
    
  } catch (error) {
    console.error('❌ Error during system health check:', error)
    return {
      healthy: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
}
