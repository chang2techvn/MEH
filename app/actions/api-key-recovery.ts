/**
 * API Key Recovery Server Action
 * Handles automatic recovery of inactive API keys after 24 hours
 */

'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RecoveryResult {
  success: boolean
  recoveredKeys: number
  totalInactiveKeys: number
  errors: string[]
  timestamp: string
}

/**
 * Recovers API keys that have been inactive for more than 24 hours
 * @param serviceName - The service name (e.g., 'gemini')
 * @returns Promise<RecoveryResult> - Recovery operation result
 */
export async function recoverInactiveApiKeys(serviceName: string = 'gemini'): Promise<RecoveryResult> {
  const result: RecoveryResult = {
    success: false,
    recoveredKeys: 0,
    totalInactiveKeys: 0,
    errors: [],
    timestamp: new Date().toISOString()
  }

  try {
    console.log(`🔄 Starting API key recovery for service: ${serviceName}`)

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // Get inactive keys that were updated more than 24 hours ago
    const { data: inactiveKeys, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .eq('is_active', false)
      .lt('updated_at', twentyFourHoursAgo.toISOString())

    if (fetchError) {
      result.errors.push(`Failed to fetch inactive keys: ${fetchError.message}`)
      return result
    }

    result.totalInactiveKeys = inactiveKeys?.length || 0

    if (!inactiveKeys || inactiveKeys.length === 0) {
      console.log('✅ No inactive keys found that are eligible for recovery')
      result.success = true
      return result
    }

    console.log(`📋 Found ${inactiveKeys.length} inactive keys eligible for recovery`)

    // Reset usage counters and reactivate keys
    const recoveryPromises = inactiveKeys.map(async (key) => {
      try {
        const { error: updateError } = await supabase
          .from('api_keys')
          .update({
            is_active: true,
            current_usage: 0, // Reset usage counter
            updated_at: new Date().toISOString()
          })
          .eq('id', key.id)

        if (updateError) {
          result.errors.push(`Failed to recover key ${key.key_name}: ${updateError.message}`)
          return false
        }

        console.log(`✅ Recovered API key: ${key.key_name}`)
        return true
      } catch (error) {
        result.errors.push(`Error recovering key ${key.key_name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return false
      }
    })

    const recoveryResults = await Promise.all(recoveryPromises)
    result.recoveredKeys = recoveryResults.filter(Boolean).length

    result.success = result.errors.length === 0
    
    console.log(`🎉 Recovery complete: ${result.recoveredKeys}/${result.totalInactiveKeys} keys recovered`)

    // Revalidate any cached data
    revalidatePath('/api/ai')
    revalidatePath('/admin')

    return result

  } catch (error) {
    console.error('❌ Error during API key recovery:', error)
    result.errors.push(`Recovery operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return result
  }
}

/**
 * Gets recovery statistics for monitoring
 * @param serviceName - The service name
 * @returns Promise<object> - Recovery statistics
 */
export async function getRecoveryStats(serviceName: string = 'gemini') {
  try {
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // Get all keys
    const { data: allKeys, error: allError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)

    if (allError) {
      throw new Error(`Failed to fetch keys: ${allError.message}`)
    }

    // Get inactive keys eligible for recovery
    const { data: eligibleKeys, error: eligibleError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .eq('is_active', false)
      .lt('updated_at', twentyFourHoursAgo.toISOString())

    if (eligibleError) {
      throw new Error(`Failed to fetch eligible keys: ${eligibleError.message}`)
    }

    const activeKeys = allKeys?.filter(k => k.is_active) || []
    const inactiveKeys = allKeys?.filter(k => !k.is_active) || []

    return {
      totalKeys: allKeys?.length || 0,
      activeKeys: activeKeys.length,
      inactiveKeys: inactiveKeys.length,
      eligibleForRecovery: eligibleKeys?.length || 0,
      lastUpdated: new Date().toISOString()
    }

  } catch (error) {
    console.error('❌ Error getting recovery stats:', error)
    return {
      totalKeys: 0,
      activeKeys: 0,
      inactiveKeys: 0,
      eligibleForRecovery: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastUpdated: new Date().toISOString()
    }
  }
}

/**
 * Manually triggers recovery for a specific API key
 * @param keyId - The ID of the key to recover
 * @returns Promise<boolean> - Success status
 */
export async function recoverSpecificKey(keyId: string): Promise<boolean> {
  try {
    console.log(`🔄 Manually recovering API key: ${keyId}`)

    const { error } = await supabase
      .from('api_keys')
      .update({
        is_active: true,
        current_usage: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)

    if (error) {
      console.error(`❌ Failed to recover key ${keyId}:`, error)
      return false
    }

    console.log(`✅ Successfully recovered API key: ${keyId}`)
    
    // Revalidate cached data
    revalidatePath('/api/ai')
    revalidatePath('/admin')

    return true

  } catch (error) {
    console.error('❌ Error during manual recovery:', error)
    return false
  }
}

/**
 * Resets daily usage counters for all keys (for daily cron job)
 * @param serviceName - The service name
 * @returns Promise<boolean> - Success status
 */
export async function resetDailyUsageCounters(serviceName: string = 'gemini'): Promise<boolean> {
  try {
    console.log(`🔄 Resetting daily usage counters for service: ${serviceName}`)

    const { error } = await supabase
      .from('api_keys')
      .update({
        current_usage: 0,
        updated_at: new Date().toISOString()
      })
      .eq('service_name', serviceName)

    if (error) {
      console.error('❌ Failed to reset daily usage counters:', error)
      return false
    }

    console.log(`✅ Daily usage counters reset for service: ${serviceName}`)
    
    // Revalidate cached data
    revalidatePath('/api/ai')

    return true

  } catch (error) {
    console.error('❌ Error resetting daily usage counters:', error)
    return false
  }
}
