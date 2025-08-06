#!/usr/bin/env node

/**
 * Restore Daily Video System Script
 * 
 * This script restores the system after emergency stop and debugging.
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

async function restoreSystem() {
  console.log('🔄 RESTORE - Daily Video System')
  console.log('=' .repeat(50))
  
  try {
    // 1. Re-enable API keys (except those with real errors)
    console.log('🔓 Re-enabling API keys...')
    
    const { data: keys, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, name, service, last_error')
      .eq('service', 'gemini')
      .eq('is_active', false)
    
    if (fetchError) {
      console.error('❌ Error fetching API keys:', fetchError.message)
    } else if (keys && keys.length > 0) {
      for (const key of keys) {
        // Only re-enable keys that were disabled by emergency stop
        if (key.last_error && key.last_error.includes('Emergency stop')) {
          const { error: updateError } = await supabase
            .from('api_keys')
            .update({ 
              is_active: true,
              last_error: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', key.id)
          
          if (updateError) {
            console.error(`❌ Error updating key ${key.name}:`, updateError.message)
          } else {
            console.log(`✅ Re-enabled API key: ${key.name}`)
          }
        } else {
          console.log(`⚠️  Skipped key ${key.name} (has real error: ${key.last_error})`)
        }
      }
    } else {
      console.log('ℹ️  No disabled API keys found')
    }
    
    // 2. Re-enable automation (but keep it manual for safety)
    console.log('\n▶️  System ready for manual operation...')
    
    const { error: settingsError } = await supabase
      .from('daily_video_settings')
      .update({
        last_error: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
    
    if (settingsError) {
      console.error('❌ Error updating settings:', settingsError.message)
    } else {
      console.log('✅ Settings cleared')
    }
    
    console.log('\n📊 System Status:')
    console.log('   🔓 API keys restored')
    console.log('   ⏸️  Automation still paused (enable manually in admin)')
    console.log('   ✅ Ready for testing')
    
    console.log('\n🔧 Next steps:')
    console.log('   1. Fix token limit issue in video-processor.ts')
    console.log('   2. Test with single video first')
    console.log('   3. Enable automation when ready')
    
    console.log('\n✅ System restore completed')
    
  } catch (error) {
    console.error('💥 System restore failed:', error.message)
    process.exit(1)
  }
}

// Run restore
restoreSystem().catch(error => {
  console.error('💥 Restore crashed:', error)
  process.exit(1)
})
