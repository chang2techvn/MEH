#!/usr/bin/env node

/**
 * Simple API Key Recovery Test
 * Test recovery logic directly without importing TypeScript files
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Test recovery logic directly
 */
async function testRecovery() {
  try {
    console.log('🧪 Testing API Key Recovery Logic...\n')

    // 1. Get inactive keys that are 24+ hours old
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    console.log(`🔍 Looking for keys inactive since: ${twentyFourHoursAgo.toLocaleString()}`)
    
    const { data: inactiveKeys, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', 'gemini')
      .eq('is_active', false)
      .lt('updated_at', twentyFourHoursAgo.toISOString())

    if (fetchError) {
      console.error('❌ Error fetching inactive keys:', fetchError)
      return
    }

    console.log(`📊 Found ${inactiveKeys?.length || 0} keys eligible for recovery\n`)

    if (!inactiveKeys || inactiveKeys.length === 0) {
      console.log('✅ No keys need recovery')
      return
    }

    // 2. Show what would be recovered
    console.log('🔄 Keys that would be recovered:')
    inactiveKeys.forEach((key, index) => {
      const inactiveHours = (Date.now() - new Date(key.updated_at).getTime()) / (1000 * 60 * 60)
      const days = Math.floor(inactiveHours / 24)
      const hours = Math.floor(inactiveHours % 24)
      
      console.log(`${index + 1}. ${key.key_name}`)
      console.log(`   Inactive: ${days}d ${hours}h`)
      console.log(`   Usage: ${key.current_usage || 0}/${key.usage_limit || 'unlimited'}`)
      console.log('')
    })

    // 3. Ask for confirmation before actual recovery
    const args = process.argv.slice(2)
    const shouldRecover = args.includes('--actually-recover')

    if (!shouldRecover) {
      console.log('💡 To actually perform recovery, run with --actually-recover flag')
      console.log('   node scripts/test-recovery-simple.js --actually-recover')
      return
    }

    // 4. Perform actual recovery
    console.log('🚀 Performing actual recovery...\n')
    
    let recoveredCount = 0
    const errors = []

    for (const key of inactiveKeys) {
      try {
        console.log(`🔄 Recovering: ${key.key_name}...`)
        
        // Update the key to active and reset usage
        const { error: updateError } = await supabase
          .from('api_keys')
          .update({
            is_active: true,
            current_usage: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', key.id)

        if (updateError) {
          console.error(`❌ Failed to recover ${key.key_name}:`, updateError)
          errors.push(`${key.key_name}: ${updateError.message}`)
        } else {
          console.log(`✅ Recovered: ${key.key_name}`)
          recoveredCount++
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ Error recovering ${key.key_name}:`, error)
        errors.push(`${key.key_name}: ${error.message}`)
      }
    }

    // 5. Summary
    console.log('\n📋 RECOVERY SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Total eligible keys: ${inactiveKeys.length}`)
    console.log(`Successfully recovered: ${recoveredCount}`)
    console.log(`Errors: ${errors.length}`)
    
    if (errors.length > 0) {
      console.log('\nErrors:')
      errors.forEach(error => console.log(`  - ${error}`))
    }

    console.log('\n✅ Recovery test completed!')

  } catch (error) {
    console.error('❌ Recovery test failed:', error)
  }
}

testRecovery().catch(console.error)
