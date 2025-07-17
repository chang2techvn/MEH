#!/usr/bin/env node

/**
 * Script to migrate Gemini API keys from .env file to api_keys table
 * Usage: node scripts/migrate-api-keys-fixed.js
 */

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Encryption key for API keys
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'english-learning-platform-secret-key-2025'

/**
 * Simple encryption function for API keys
 */
function encryptApiKey(apiKey) {
  try {
    const algorithm = 'aes-192-cbc'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 24)
    const iv = Buffer.alloc(16, 0) // Fixed IV for compatibility
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt API key')
  }
}

/**
 * Extract Gemini API keys from configuration
 */
function extractGeminiApiKeys() {
  const apiKeys = []
  
  // API Keys with their associated accounts
  const geminiKeys = [
    // New API keys added
    {
      key: 'AIzaSyAZigxsUpHF5rJI8muXVXwcjblUiUxEuWs',
      account: 'windclothing'
    },
    {
      key: 'AIzaSyCmi5ypNneO56XOu9bVGkVr8hTe1d59S8U',
      account: 'otisclubchang'
    },
    {
      key: 'AIzaSyAATT_EBs4XJhZ8XfLzhrS_byn5RCjhbQs',
      account: 'huynhlinh'
    },
    {
      key: 'AIzaSyC06b8KM13J9xT0wF01JTvmg13r6Hv5oho',
      account: 'changaffiliate1'
    },
    {
      key: 'AIzaSyC12DdRh1vMvWIB9AZNr6y2xxiwBSYOXp8',
      account: 'nguyenchangwinwin'
    },
    {
      key: 'AIzaSyDPklzHsmo2C9PwwADmLAjZVAOGsEvPJic',
      account: 'outerity'
    },
    {
      key: 'AIzaSyDOMf0Lfh1nnfjiyQofKzi8S6fUqDw0EDg',
      account: 'ongchupolo'
    },
    {
      key: 'AIzaSyCsFKvAqLWuCvy4lHufmJRTEvU1sRSOnXo',
      account: 'changaffiliate2'
    }
  ]

  geminiKeys.forEach((item, index) => {
    if (item.key) {
      const keyName = `gemini-${item.account.replace(/[@.]/g, '-')}`
      apiKeys.push({
        service_name: 'gemini',
        key_name: keyName,
        encrypted_key: encryptApiKey(item.key),
        is_active: true,
        usage_limit: 1000,
        current_usage: 0,
        expires_at: null
      })
    }
  })

  return apiKeys
}

/**
 * Check existing API keys in database
 */
async function checkExistingKeys() {
  const { data, error } = await supabase
    .from('api_keys')
    .select('service_name, key_name, encrypted_key')
    .eq('service_name', 'gemini')

  if (error) {
    console.error('❌ Error checking existing keys:', error)
    return []
  }

  return data || []
}

/**
 * Filter out existing API keys
 */
function filterNewApiKeys(apiKeys, existingKeys) {
  const existingKeyNames = new Set(existingKeys.map(key => key.key_name))
  
  return apiKeys.filter(apiKey => {
    if (existingKeyNames.has(apiKey.key_name)) {
      console.log(`⏭️  Skipping existing key: ${apiKey.key_name}`)
      return false
    }
    return true
  })
}

/**
 * Insert API keys into database
 */
async function insertApiKeys(apiKeys) {
  console.log(`📝 Inserting ${apiKeys.length} API keys into database...`)

  for (const apiKey of apiKeys) {
    const { data, error } = await supabase
      .from('api_keys')
      .insert([apiKey])
      .select()

    if (error) {
      console.error(`❌ Error inserting key ${apiKey.key_name}:`, error)
    } else {
      console.log(`✅ Successfully inserted key: ${apiKey.key_name}`)
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting API keys migration...')
    console.log('📂 Source: Configuration file')
    console.log('🎯 Target: api_keys table in Supabase')
    console.log('---')

    // Extract API keys
    console.log('🔍 Extracting API keys from configuration...')
    const allApiKeys = extractGeminiApiKeys()
    console.log(`✅ Found ${allApiKeys.length} Gemini API keys`)

    // Check existing keys
    console.log('🔍 Checking for existing API keys...')
    const existingKeys = await checkExistingKeys()

    if (existingKeys.length > 0) {
      console.log(`⚠️  Found ${existingKeys.length} existing Gemini API keys in database:`)
      existingKeys.forEach(key => {
        console.log(`   - ${key.key_name}`)
      })
    }

    // Filter new keys
    const newApiKeys = filterNewApiKeys(allApiKeys, existingKeys)
    
    if (newApiKeys.length === 0) {
      console.log('✅ All API keys already exist in database. Nothing to add.')
      return
    }

    console.log(`📝 Will add ${newApiKeys.length} new API keys to database...`)
    newApiKeys.forEach(key => {
      console.log(`   + ${key.key_name}`)
    })

    // Insert keys
    await insertApiKeys(newApiKeys)

    console.log('---')
    console.log('🎉 Migration completed successfully!')
    console.log(`✅ Added ${newApiKeys.length} new API keys to database`)
    console.log('💡 Next steps:')
    console.log('   1. Update your application to use API keys from database')
    console.log('   2. Remove API keys from .env file for security')
    console.log('   3. Implement API key rotation and monitoring')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
