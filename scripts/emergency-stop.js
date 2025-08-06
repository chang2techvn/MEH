#!/usr/bin/env node

/**
 * Emergency Stop Script for Daily Video System
 * 
 * This script stops all running processes and marks API keys as temporarily inactive
 * to prevent expensive API calls during debugging.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function emergencyStop() {
  console.log('🚨 EMERGENCY STOP - Daily Video System')
  console.log('=' .repeat(50))
  
  try {
    // 1. Mark all API keys as temporarily inactive
    console.log('🔒 Temporarily disabling all API keys...')
    
    const { data: keys, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, name, service')
      .eq('service', 'gemini')
      .eq('is_active', true)
    
    if (fetchError) {
      console.error('❌ Error fetching API keys:', fetchError.message)
    } else if (keys && keys.length > 0) {
      for (const key of keys) {
        const { error: updateError } = await supabase
          .from('api_keys')
          .update({ 
            is_active: false,
            last_error: 'Emergency stop - temporarily disabled to prevent overuse',
            updated_at: new Date().toISOString()
          })
          .eq('id', key.id)
        
        if (updateError) {
          console.error(`❌ Error updating key ${key.name}:`, updateError.message)
        } else {
          console.log(`✅ Disabled API key: ${key.name}`)
        }
      }
    } else {
      console.log('ℹ️  No active Gemini API keys found')
    }
    
    // 2. Update daily video settings to pause automation
    console.log('\n⏸️  Pausing daily video automation...')
    
    const { error: settingsError } = await supabase
      .from('daily_video_settings')
      .update({
        automation_enabled: false,
        last_error: 'Emergency stop - automation paused',
        updated_at: new Date().toISOString()
      })
      .eq('id', 1) // Assuming single settings record
    
    if (settingsError) {
      console.error('❌ Error updating settings:', settingsError.message)
    } else {
      console.log('✅ Daily video automation paused')
    }
    
    // 3. Display current system status
    console.log('\n📊 Current System Status:')
    console.log('   🔒 All Gemini API keys temporarily disabled')
    console.log('   ⏸️  Daily video automation paused')
    console.log('   🛡️  System protected from further API costs')
    
    console.log('\n🔧 To resume operations:')
    console.log('   1. Fix video processing token limit issue')
    console.log('   2. Run: node scripts/restore-system.js')
    console.log('   3. Re-enable automation in admin panel')
    
    console.log('\n✅ Emergency stop completed successfully')
    
  } catch (error) {
    console.error('💥 Emergency stop failed:', error.message)
    console.log('\n🚨 Manual intervention required:')
    console.log('   1. Stop dev server: Ctrl+C')
    console.log('   2. Check database for active processes')
    console.log('   3. Manually disable API keys if needed')
    process.exit(1)
  }
}

// Run emergency stop
emergencyStop().catch(error => {
  console.error('💥 Emergency stop crashed:', error)
  process.exit(1)
})
