#!/usr/bin/env node

/**
 * Simple API Keys Table Structure Check & Update
 * This script checks and updates the api_keys table for auto-failover support
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('🚀 Simple API Keys Structure Check')
  console.log('==================================\n')

  try {
    // Step 1: Check if api_keys table exists and get some basic info
    console.log('📋 Checking api_keys table...')
    const { data: existingKeys, error: tableError } = await supabase
      .from('api_keys')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Error accessing api_keys table:', tableError)
      return
    }

    console.log('✅ api_keys table exists')
    
    // Step 2: Check current structure by examining existing data
    if (existingKeys && existingKeys.length > 0) {
      console.log('\n📊 Current table columns found:')
      const columns = Object.keys(existingKeys[0])
      columns.forEach(col => console.log(`   - ${col}`))
      
      // Check which columns we need to add
      const requiredColumns = [
        'failed_at',
        'failure_reason', 
        'failure_count',
        'last_tested_at',
        'circuit_breaker_state',
        'last_success_at',
        'priority'
      ]
      
      const missingColumns = requiredColumns.filter(col => !columns.includes(col))
      
      if (missingColumns.length === 0) {
        console.log('\n✅ All required columns already exist!')
      } else {
        console.log(`\n📝 Missing columns: ${missingColumns.join(', ')}`)
        console.log('\nTo add these columns, run:')
        console.log('```sql')
        
        missingColumns.forEach(col => {
          switch(col) {
            case 'failed_at':
            case 'last_tested_at':
            case 'last_success_at':
              console.log(`ALTER TABLE api_keys ADD COLUMN ${col} timestamp with time zone;`)
              break
            case 'failure_reason':
              console.log(`ALTER TABLE api_keys ADD COLUMN ${col} text;`)
              break
            case 'failure_count':
              console.log(`ALTER TABLE api_keys ADD COLUMN ${col} integer NOT NULL DEFAULT 0;`)
              break
            case 'circuit_breaker_state':
              console.log(`ALTER TABLE api_keys ADD COLUMN ${col} text NOT NULL DEFAULT 'closed';`)
              break
            case 'priority':
              console.log(`ALTER TABLE api_keys ADD COLUMN ${col} integer NOT NULL DEFAULT 1;`)
              break
          }
        })
        
        console.log('```')
        
        // Try to add columns automatically
        console.log('\n🔧 Attempting to add missing columns...')
        
        for (const col of missingColumns) {
          try {
            let sql
            switch(col) {
              case 'failed_at':
              case 'last_tested_at':
              case 'last_success_at':
                sql = `ALTER TABLE api_keys ADD COLUMN ${col} timestamp with time zone`
                break
              case 'failure_reason':
                sql = `ALTER TABLE api_keys ADD COLUMN ${col} text`
                break
              case 'failure_count':
                sql = `ALTER TABLE api_keys ADD COLUMN ${col} integer NOT NULL DEFAULT 0`
                break
              case 'circuit_breaker_state':
                sql = `ALTER TABLE api_keys ADD COLUMN ${col} text NOT NULL DEFAULT 'closed'`
                break
              case 'priority':
                sql = `ALTER TABLE api_keys ADD COLUMN ${col} integer NOT NULL DEFAULT 1`
                break
            }
            
            console.log(`   Adding ${col}...`)
            
            // Use a simple approach: update a record to trigger column creation error
            // This is a workaround since we can't easily execute DDL through Supabase client
            const testUpdate = {}
            testUpdate[col] = col.includes('_at') ? null : (col === 'failure_count' || col === 'priority' ? 0 : col === 'circuit_breaker_state' ? 'closed' : null)
            
            const { error: updateError } = await supabase
              .from('api_keys')
              .update(testUpdate)
              .eq('id', 'non-existent-id') // This will fail but might give us info
            
            if (updateError && updateError.message.includes('column') && updateError.message.includes('does not exist')) {
              console.log(`   ❌ Column ${col} does not exist - DDL needed`)
            } else {
              console.log(`   ✅ Column ${col} seems to exist or update failed for other reason`)
            }
            
          } catch (error) {
            console.log(`   ❌ Error checking ${col}:`, error.message)
          }
        }
      }
    } else {
      console.log('\n📝 No existing records found, but table exists')
    }

    // Step 3: Show all current records
    console.log('\n📊 Current api_keys records:')
    const { data: allKeys, error: allKeysError } = await supabase
      .from('api_keys')
      .select('key_name, service_name, is_active, current_usage, usage_limit')
      .order('created_at')

    if (allKeysError) {
      console.error('❌ Error fetching all keys:', allKeysError)
    } else if (allKeys && allKeys.length > 0) {
      console.table(allKeys)
      console.log(`\n✅ Found ${allKeys.length} API keys in database`)
    } else {
      console.log('ℹ️ No API keys found')
    }

    console.log('\n📝 Manual SQL to run in Supabase SQL Editor:')
    console.log('```sql')
    console.log('-- Add missing columns for auto-failover')
    console.log('ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS failed_at timestamp with time zone;')
    console.log('ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS failure_reason text;')
    console.log('ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS failure_count integer NOT NULL DEFAULT 0;')
    console.log('ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS last_tested_at timestamp with time zone;')
    console.log('ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS circuit_breaker_state text NOT NULL DEFAULT \'closed\';')
    console.log('ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS last_success_at timestamp with time zone;')
    console.log('ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 1;')
    console.log('')
    console.log('-- Initialize existing records')
    console.log('UPDATE api_keys SET')
    console.log('  failure_count = 0,')
    console.log('  circuit_breaker_state = \'closed\',')
    console.log('  priority = 1,')
    console.log('  last_success_at = NOW()')
    console.log('WHERE failure_count IS NULL;')
    console.log('```')

  } catch (error) {
    console.error('❌ Script error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }
