#!/usr/bin/env node

/**
 * API Keys Auto Recovery Script
 * Resets inactive API keys after 24 hours
 * Usage: node scripts/api-key-recovery.js
 * 
 * This script should be run via cron job every hour:
 * 0 * * * * /usr/bin/node /path/to/scripts/api-key-recovery.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Find API keys that have been inactive for more than 24 hours
 */
async function findKeysToRecover() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('is_active', false)
      .lt('updated_at', twentyFourHoursAgo.toISOString())

    if (error) {
      console.error('❌ Error fetching inactive keys:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return []
  }
}

/**
 * Reset usage counters daily (optional)
 */
async function resetDailyUsage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  try {
    // Only reset if we haven't reset today
    const { data: lastReset, error: checkError } = await supabase
      .from('api_keys')
      .select('updated_at')
      .gt('updated_at', today.toISOString())
      .limit(1)

    if (checkError) {
      console.error('❌ Error checking last reset:', checkError)
      return false
    }

    // If any key was updated today, skip reset
    if (lastReset && lastReset.length > 0) {
      console.log('ℹ️  Usage counters already reset today')
      return false
    }

    // Reset all usage counters to 0
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        current_usage: 0,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all

    if (error) {
      console.error('❌ Error resetting usage counters:', error)
      return false
    }

    console.log('✅ Daily usage counters reset successfully')
    return true
  } catch (error) {
    console.error('❌ Unexpected error during usage reset:', error)
    return false
  }
}

/**
 * Recover (reactivate) API keys
 */
async function recoverKeys(keys) {
  if (keys.length === 0) {
    console.log('ℹ️  No keys to recover')
    return
  }

  console.log(`🔄 Attempting to recover ${keys.length} API keys...`)

  for (const key of keys) {
    try {
      // Test the API key first (implement health check here)
      const isHealthy = await testApiKeyHealth(key)
      
      if (isHealthy) {
        // Reactivate the key
        const { error } = await supabase
          .from('api_keys')
          .update({ 
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', key.id)

        if (error) {
          console.error(`❌ Error reactivating key ${key.key_name}:`, error)
        } else {
          console.log(`✅ Successfully recovered key: ${key.key_name}`)
        }
      } else {
        console.log(`⚠️  Key ${key.key_name} still unhealthy, keeping inactive`)
      }
    } catch (error) {
      console.error(`❌ Error processing key ${key.key_name}:`, error)
    }
  }
}

/**
 * Test if an API key is healthy (placeholder - implement actual health check)
 */
async function testApiKeyHealth(key) {
  // TODO: Implement actual health check based on service
  // For now, assume all keys are healthy after 24 hours
  
  if (key.service_name === 'gemini') {
    // Could make a lightweight API call to test
    // For now, return true to enable recovery
    return true
  }
  
  return true
}

/**
 * Log recovery activity
 */
async function logRecoveryActivity(recoveredKeys, resetUsage) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    recovered_keys: recoveredKeys.length,
    usage_reset: resetUsage,
    details: recoveredKeys.map(k => ({
      key_name: k.key_name,
      service_name: k.service_name,
      inactive_since: k.updated_at
    }))
  }

  console.log('📊 Recovery Summary:', JSON.stringify(logEntry, null, 2))
  
  // Could store this in a recovery_logs table for monitoring
  // For now, just log to console
}

/**
 * Main recovery function
 */
async function main() {
  const startTime = new Date()
  console.log(`🚀 Starting API key recovery process at ${startTime.toISOString()}`)
  
  try {
    // Find keys to recover
    const keysToRecover = await findKeysToRecover()
    console.log(`🔍 Found ${keysToRecover.length} keys to potentially recover`)

    // Reset daily usage if it's a new day (run at midnight)
    const hour = new Date().getHours()
    const shouldResetUsage = hour === 0 // Run at midnight
    const usageReset = shouldResetUsage ? await resetDailyUsage() : false

    // Recover eligible keys
    await recoverKeys(keysToRecover)

    // Log activity
    await logRecoveryActivity(keysToRecover, usageReset)

    const endTime = new Date()
    const duration = endTime - startTime
    console.log(`✅ Recovery process completed in ${duration}ms`)

  } catch (error) {
    console.error('❌ Recovery process failed:', error)
    process.exit(1)
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('⚠️  Recovery process interrupted')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('⚠️  Recovery process terminated')
  process.exit(0)
})

// Run the script
if (require.main === module) {
  main()
}

module.exports = { findKeysToRecover, recoverKeys, testApiKeyHealth }
