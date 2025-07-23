#!/usr/bin/env node

/**
 * Test API Key Recovery Script
 * Tests the integrated API key recovery logic in the daily cron job
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const cronSecret = process.env.CRON_SECRET

if (!supabaseUrl || !supabaseServiceKey || !cronSecret) {
  console.error('❌ Missing environment variables. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Test the daily cron job with API key recovery
 */
async function testDailyCronWithRecovery() {
  try {
    console.log('🧪 Testing Daily Cron Job with API Key Recovery...\n')

    // 1. Check current API keys status
    console.log('1. 📊 Current API Keys Status:')
    const { data: currentKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('id, key_name, service_name, is_active, updated_at')
      .eq('service_name', 'gemini')

    if (keysError) {
      console.error('❌ Error fetching API keys:', keysError)
      return
    }

    if (!currentKeys || currentKeys.length === 0) {
      console.log('⚠️ No Gemini API keys found in database')
      return
    }

    console.log(`   Total keys: ${currentKeys.length}`)
    console.log(`   Active keys: ${currentKeys.filter(k => k.is_active).length}`)
    console.log(`   Inactive keys: ${currentKeys.filter(k => !k.is_active).length}`)

    // Show inactive keys eligible for recovery (24+ hours old)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const eligibleForRecovery = currentKeys.filter(k => 
      !k.is_active && new Date(k.updated_at) < twentyFourHoursAgo
    )
    
    console.log(`   Eligible for recovery: ${eligibleForRecovery.length}`)
    if (eligibleForRecovery.length > 0) {
      eligibleForRecovery.forEach(key => {
        const hoursInactive = Math.floor((Date.now() - new Date(key.updated_at).getTime()) / (1000 * 60 * 60))
        console.log(`     - ${key.key_name}: inactive for ${hoursInactive}h`)
      })
    }
    console.log('')

    // 2. Call the daily cron endpoint (includes API key recovery)
    console.log('2. 🚀 Calling Daily Cron Endpoint (with API Key Recovery):')
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/cron/daily-video-refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Cron job failed: ${response.status} ${errorText}`)
      return
    }

    const result = await response.json()
    console.log('✅ Cron job completed successfully!')
    
    // 3. Display results
    console.log('\n3. 📋 Results Summary:')
    console.log(`   Duration: ${result.duration}`)
    console.log(`   Daily Challenge: ${result.dailyChallenge ? '✅ Generated' : '🔄 Already existed'}`)
    console.log(`   Practice Challenges: ${result.practiceChallenges.count}/3 generated`)
    
    // API Key Recovery results
    if (result.apiKeyRecovery) {
      console.log('   🔑 API Key Recovery:')
      console.log(`     - Status: ${result.apiKeyRecovery.success ? '✅ Success' : '❌ Failed'}`)
      console.log(`     - Keys recovered: ${result.apiKeyRecovery.recoveredKeys}`)
      console.log(`     - Total inactive keys: ${result.apiKeyRecovery.totalInactiveKeys}`)
      
      if (result.apiKeyRecovery.errors && result.apiKeyRecovery.errors.length > 0) {
        console.log(`     - Errors: ${result.apiKeyRecovery.errors.join(', ')}`)
      }
    }

    if (result.errors && result.errors.length > 0) {
      console.log(`   ⚠️ Errors: ${result.errors.length}`)
      result.errors.forEach(error => console.log(`     - ${error}`))
    }

    // 4. Check updated API keys status
    console.log('\n4. 📊 Updated API Keys Status:')
    const { data: updatedKeys, error: updatedKeysError } = await supabase
      .from('api_keys')
      .select('id, key_name, service_name, is_active, updated_at')
      .eq('service_name', 'gemini')

    if (updatedKeysError) {
      console.error('❌ Error fetching updated API keys:', updatedKeysError)
      return
    }

    console.log(`   Total keys: ${updatedKeys.length}`)
    console.log(`   Active keys: ${updatedKeys.filter(k => k.is_active).length}`)
    console.log(`   Inactive keys: ${updatedKeys.filter(k => !k.is_active).length}`)

    // Show any newly activated keys
    const newlyActivated = updatedKeys.filter(updated => {
      const original = currentKeys.find(orig => orig.id === updated.id)
      return original && !original.is_active && updated.is_active
    })

    if (newlyActivated.length > 0) {
      console.log('   🎉 Newly Activated Keys:')
      newlyActivated.forEach(key => {
        console.log(`     - ${key.key_name}: ✅ Reactivated`)
      })
    }

    console.log('\n✅ Test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

/**
 * Create a test inactive API key for testing recovery
 */
async function createTestInactiveKey() {
  try {
    console.log('🔧 Creating test inactive API key...')
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        service_name: 'gemini',
        key_name: 'test-recovery-key',
        encrypted_key: 'encrypted-test-key-data',
        is_active: false,
        updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25 hours ago
      })
      .select()

    if (error) {
      console.error('❌ Error creating test key:', error)
      return
    }

    console.log('✅ Test inactive key created successfully')
    return data[0]
  } catch (error) {
    console.error('❌ Error creating test key:', error)
  }
}

/**
 * Clean up test keys
 */
async function cleanupTestKeys() {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('key_name', 'test-recovery-key')

    if (error) {
      console.error('❌ Error cleaning up test keys:', error)
      return
    }

    console.log('🧹 Test keys cleaned up')
  } catch (error) {
    console.error('❌ Error cleaning up test keys:', error)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--create-test-key')) {
    await createTestInactiveKey()
    return
  }
  
  if (args.includes('--cleanup')) {
    await cleanupTestKeys()
    return
  }
  
  await testDailyCronWithRecovery()
}

main().catch(console.error)
