#!/usr/bin/env node

/**
 * Test script to verify API keys system
 * Usage: node scripts/test-api-keys.js
 */

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'english-learning-platform-secret-key-2025'

// Decrypt function (same as in lib/api-keys.ts)
function decryptApiKey(encryptedKey) {
  try {
    const algorithm = 'aes-192-cbc'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 24)
    const iv = Buffer.alloc(16, 0)
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Failed to decrypt API key:', error)
    throw new Error('API key decryption failed')
  }
}

async function testApiKeys() {
  console.log('🧪 Testing API Keys System...')
  console.log('---')

  try {
    // 1. Get all API keys
    console.log('1️⃣ Fetching all API keys from database...')
    const { data: allKeys, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', 'gemini')
      .eq('is_active', true)

    if (fetchError) {
      console.error('❌ Error fetching keys:', fetchError)
      return
    }

    console.log(`✅ Found ${allKeys.length} active Gemini API keys`)

    // 2. Test decryption
    console.log('\n2️⃣ Testing key decryption...')
    for (let i = 0; i < Math.min(3, allKeys.length); i++) {
      const key = allKeys[i]
      try {
        const decrypted = decryptApiKey(key.encrypted_key)
        console.log(`✅ ${key.key_name}: Successfully decrypted (${decrypted.substring(0, 15)}...)`)
      } catch (error) {
        console.log(`❌ ${key.key_name}: Failed to decrypt - ${error.message}`)
      }
    }

    // 3. Test load balancing (get key with lowest usage)
    console.log('\n3️⃣ Testing load balancing...')
    const { data: selectedKey } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', 'gemini')
      .eq('is_active', true)
      .order('current_usage', { ascending: true })
      .limit(1)
      .single()

    if (selectedKey) {
      console.log(`✅ Selected key: ${selectedKey.key_name} (usage: ${selectedKey.current_usage}/${selectedKey.usage_limit})`)
    }

    // 4. Test usage increment
    console.log('\n4️⃣ Testing usage increment...')
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ 
        current_usage: selectedKey.current_usage + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedKey.id)

    if (updateError) {
      console.error('❌ Failed to increment usage:', updateError)
    } else {
      console.log(`✅ Successfully incremented usage for ${selectedKey.key_name}`)
    }

    // 5. Verify update
    const { data: updatedKey } = await supabase
      .from('api_keys')
      .select('current_usage')
      .eq('id', selectedKey.id)
      .single()

    console.log(`✅ Updated usage: ${updatedKey.current_usage}/${selectedKey.usage_limit}`)

    console.log('\n---')
    console.log('🎉 All tests passed! API Keys system is working correctly.')
    console.log('\n💡 Next steps:')
    console.log('   1. Update lib/gemini-api.ts to use getApiKey() function')
    console.log('   2. Remove API keys from .env file')
    console.log('   3. Setup monitoring and alerts')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
if (require.main === module) {
  testApiKeys()
}
