#!/usr/bin/env node

/**
 * Script to check and validate api_keys table structure
 * Usage: node scripts/check-api-keys-structure.js
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
 * Check if api_keys table exists and has correct structure
 */
async function checkTableStructure() {
  console.log('🔍 Checking api_keys table structure...')
  
  try {
    // Try to select from the table to check if it exists
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .limit(1)

    if (error) {
      if (error.code === '42P01') { // Table does not exist
        console.error('❌ Table "api_keys" does not exist!')
        console.log('💡 Please create the table first using the following SQL:')
        console.log(createTableSQL)
        return false
      } else {
        console.error('❌ Error accessing api_keys table:', error)
        return false
      }
    }

    console.log('✅ Table "api_keys" exists and is accessible')
    return true
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

/**
 * Check existing API keys in the database
 */
async function checkExistingKeys() {
  console.log('📊 Checking existing API keys...')
  
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('service_name', { ascending: true })

    if (error) {
      console.error('❌ Error fetching API keys:', error)
      return
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No API keys found in database')
      console.log('💡 Run migration script: node scripts/migrate-api-keys.js')
      return
    }

    console.log(`✅ Found ${data.length} API keys:`)
    
    // Group by service
    const groupedKeys = data.reduce((acc, key) => {
      if (!acc[key.service_name]) {
        acc[key.service_name] = []
      }
      acc[key.service_name].push(key)
      return acc
    }, {})

    for (const [service, keys] of Object.entries(groupedKeys)) {
      console.log(`\n📱 ${service.toUpperCase()} Service:`)
      keys.forEach(key => {
        const status = key.is_active ? '🟢 ACTIVE' : '🔴 INACTIVE'
        const usage = `${key.current_usage || 0}/${key.usage_limit || 'unlimited'}`
        console.log(`   ${status} ${key.key_name} - Usage: ${usage}`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

/**
 * Validate key structure and data integrity
 */
async function validateKeyData() {
  console.log('\n🔍 Validating API key data integrity...')
  
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')

    if (error) {
      console.error('❌ Error fetching data for validation:', error)
      return
    }

    let validKeys = 0
    let issues = []

    data.forEach(key => {
      let keyValid = true

      // Check required fields
      if (!key.service_name) {
        issues.push(`❌ ${key.key_name || key.id}: Missing service_name`)
        keyValid = false
      }
      if (!key.key_name) {
        issues.push(`❌ ${key.id}: Missing key_name`)
        keyValid = false
      }
      if (!key.encrypted_key) {
        issues.push(`❌ ${key.key_name || key.id}: Missing encrypted_key`)
        keyValid = false
      }

      // Check data types
      if (key.is_active !== null && typeof key.is_active !== 'boolean') {
        issues.push(`⚠️  ${key.key_name}: is_active should be boolean`)
      }
      if (key.usage_limit !== null && typeof key.usage_limit !== 'number') {
        issues.push(`⚠️  ${key.key_name}: usage_limit should be number`)
      }
      if (key.current_usage !== null && typeof key.current_usage !== 'number') {
        issues.push(`⚠️  ${key.key_name}: current_usage should be number`)
      }

      // Check usage limits
      if (key.usage_limit && key.current_usage > key.usage_limit) {
        issues.push(`⚠️  ${key.key_name}: current_usage exceeds usage_limit`)
      }

      // Check expiration
      if (key.expires_at) {
        const expiry = new Date(key.expires_at)
        const now = new Date()
        if (expiry < now && key.is_active) {
          issues.push(`⚠️  ${key.key_name}: Expired but still active`)
        }
      }

      if (keyValid) validKeys++
    })

    console.log(`✅ Valid keys: ${validKeys}/${data.length}`)
    
    if (issues.length > 0) {
      console.log('\n🚨 Issues found:')
      issues.forEach(issue => console.log(`   ${issue}`))
    } else {
      console.log('🎉 All keys are valid!')
    }

  } catch (error) {
    console.error('❌ Validation error:', error)
  }
}

/**
 * SQL to create api_keys table
 */
const createTableSQL = `
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name VARCHAR(50) NOT NULL,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_service_active ON api_keys(service_name, is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_usage ON api_keys(current_usage);
`

/**
 * Main function
 */
async function main() {
  console.log('🚀 API Keys Structure Check')
  console.log('=' .repeat(50))

  // Check table structure
  const tableExists = await checkTableStructure()
  
  if (!tableExists) {
    process.exit(1)
  }

  // Check existing keys
  await checkExistingKeys()

  // Validate data
  await validateKeyData()

  console.log('\n' + '='.repeat(50))
  console.log('🏁 Structure check completed!')
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { checkTableStructure, checkExistingKeys, validateKeyData }