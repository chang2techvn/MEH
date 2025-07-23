#!/usr/bin/env node

/**
 * Check API Keys Table Status
 * Simple script to inspect api_keys table and recovery candidates
 * Usage: node scripts/check-api-keys-status.js
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
 * Format hours to readable string
 */
function formatHours(hours) {
  if (hours < 24) {
    return `${Math.floor(hours)}h`
  } else {
    const days = Math.floor(hours / 24)
    const remainingHours = Math.floor(hours % 24)
    return `${days}d ${remainingHours}h`
  }
}

/**
 * Check API keys status
 */
async function checkApiKeysStatus() {
  try {
    console.log('🔍 Checking API Keys Status...\n')

    // 1. Get all API keys
    const { data: allKeys, error: allKeysError } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false })

    if (allKeysError) {
      console.error('❌ Error fetching API keys:', allKeysError)
      return
    }

    if (!allKeys || allKeys.length === 0) {
      console.log('⚠️ No API keys found in database')
      return
    }

    // 2. Overall statistics
    console.log('📊 OVERALL STATISTICS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Total API Keys: ${allKeys.length}`)
    
    const geminiKeys = allKeys.filter(k => k.service_name === 'gemini')
    console.log(`Gemini Keys: ${geminiKeys.length}`)
    
    const activeKeys = allKeys.filter(k => k.is_active)
    const inactiveKeys = allKeys.filter(k => !k.is_active)
    
    console.log(`Active Keys: ${activeKeys.length}`)
    console.log(`Inactive Keys: ${inactiveKeys.length}`)
    
    // 3. Recovery eligibility (24+ hours inactive)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const eligibleForRecovery = inactiveKeys.filter(k => 
      new Date(k.updated_at) < twentyFourHoursAgo
    )
    
    console.log(`Eligible for Recovery: ${eligibleForRecovery.length}\n`)

    // 4. Service breakdown
    console.log('🔧 BY SERVICE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const serviceStats = {}
    allKeys.forEach(key => {
      if (!serviceStats[key.service_name]) {
        serviceStats[key.service_name] = { total: 0, active: 0, inactive: 0 }
      }
      serviceStats[key.service_name].total++
      if (key.is_active) {
        serviceStats[key.service_name].active++
      } else {
        serviceStats[key.service_name].inactive++
      }
    })

    Object.entries(serviceStats).forEach(([service, stats]) => {
      console.log(`${service}:`)
      console.log(`  Total: ${stats.total}`)
      console.log(`  Active: ${stats.active}`)
      console.log(`  Inactive: ${stats.inactive}`)
    })
    console.log('')

    // 5. Recovery candidates (detailed)
    if (eligibleForRecovery.length > 0) {
      console.log('🔄 RECOVERY CANDIDATES (Inactive 24+ hours)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      eligibleForRecovery
        .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at)) // Oldest first
        .forEach((key, index) => {
          const inactiveHours = (Date.now() - new Date(key.updated_at).getTime()) / (1000 * 60 * 60)
          const inactiveTime = formatHours(inactiveHours)
          
          console.log(`${index + 1}. ${key.key_name}`)
          console.log(`   Service: ${key.service_name}`)
          console.log(`   Inactive: ${inactiveTime}`)
          console.log(`   Last Updated: ${new Date(key.updated_at).toLocaleString()}`)
          console.log(`   Usage: ${key.current_usage || 0}/${key.usage_limit || 'unlimited'}`)
          console.log('')
        })
    } else {
      console.log('✅ No keys eligible for recovery (all active or inactive < 24h)\n')
    }

    // 6. Recent activity (last 24 hours)
    const recentlyUpdated = allKeys.filter(k => 
      new Date(k.updated_at) > twentyFourHoursAgo
    )

    if (recentlyUpdated.length > 0) {
      console.log('⚡ RECENT ACTIVITY (Last 24 hours)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      recentlyUpdated
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)) // Newest first
        .forEach((key, index) => {
          const hoursAgo = (Date.now() - new Date(key.updated_at).getTime()) / (1000 * 60 * 60)
          const timeAgo = formatHours(hoursAgo)
          
          console.log(`${index + 1}. ${key.key_name}`)
          console.log(`   Status: ${key.is_active ? '🟢 Active' : '🔴 Inactive'}`)
          console.log(`   Updated: ${timeAgo} ago`)
          console.log(`   Service: ${key.service_name}`)
          console.log('')
        })
    }

    // 7. Usage statistics
    console.log('📈 USAGE STATISTICS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const keysWithUsage = allKeys.filter(k => k.current_usage > 0)
    const totalUsage = allKeys.reduce((sum, k) => sum + (k.current_usage || 0), 0)
    const avgUsage = allKeys.length > 0 ? (totalUsage / allKeys.length).toFixed(2) : 0
    
    console.log(`Keys with usage > 0: ${keysWithUsage.length}`)
    console.log(`Total usage across all keys: ${totalUsage}`)
    console.log(`Average usage per key: ${avgUsage}`)
    
    if (keysWithUsage.length > 0) {
      const topUsageKeys = keysWithUsage
        .sort((a, b) => (b.current_usage || 0) - (a.current_usage || 0))
        .slice(0, 5)
      
      console.log('\nTop 5 most used keys:')
      topUsageKeys.forEach((key, index) => {
        console.log(`  ${index + 1}. ${key.key_name}: ${key.current_usage}/${key.usage_limit || '∞'}`)
      })
    }

    console.log('\n✅ API Keys status check completed!')

  } catch (error) {
    console.error('❌ Error checking API keys status:', error)
  }
}

/**
 * Test recovery function directly (without cron endpoint)
 */
async function testRecoveryFunction() {
  try {
    console.log('🧪 Testing Recovery Function Directly...\n')

    // Import the recovery function
    const { recoverInactiveApiKeys } = require('../app/actions/api-key-recovery.ts')
    
    const result = await recoverInactiveApiKeys('gemini')
    
    console.log('📋 Recovery Result:')
    console.log(`Success: ${result.success}`)
    console.log(`Recovered Keys: ${result.recoveredKeys}`)
    console.log(`Total Inactive Keys: ${result.totalInactiveKeys}`)
    console.log(`Errors: ${result.errors.length}`)
    
    if (result.errors.length > 0) {
      console.log('Errors:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }
    
  } catch (error) {
    console.error('❌ Error testing recovery function:', error)
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--test-recovery')) {
    await testRecoveryFunction()
    return
  }
  
  await checkApiKeysStatus()
  
  if (args.includes('--with-recovery-test')) {
    console.log('\n' + '='.repeat(60) + '\n')
    await testRecoveryFunction()
  }
}

main().catch(console.error)
