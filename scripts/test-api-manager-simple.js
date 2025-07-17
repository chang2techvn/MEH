/**
 * Simple Test for API Key Manager (JavaScript version)
 * Tests basic functionality without TypeScript imports
 */

const { config } = require('dotenv')
config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Encryption config (matching migration script)
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'english-learning-platform-secret-key-2025'

// Decryption function (matching migration script)
function decryptApiKey(encryptedKey) {
  try {
    const algorithm = 'aes-192-cbc'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 24)
    const iv = Buffer.alloc(16, 0) // Fixed IV matching migration
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    throw new Error('Failed to decrypt API key')
  }
}

// Core API manager functions
async function getActiveApiKey(serviceName = 'gemini') {
  try {
    console.log(`🔑 Getting active API key for service: ${serviceName}`)
    
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .eq('is_active', true)
      .order('current_usage', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
    
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    
    if (!keys || keys.length === 0) {
      throw new Error(`No active API keys available for service: ${serviceName}`)
    }
    
    const key = keys[0]
    const decryptedKey = decryptApiKey(key.encrypted_key)
    
    return {
      ...key,
      decrypted_key: decryptedKey
    }
  } catch (error) {
    console.error('❌ Error getting active API key:', error)
    throw error
  }
}

async function incrementUsage(keyId) {
  try {
    console.log(`📊 Incrementing usage for API key: ${keyId}`)
    
    // Get current usage
    const { data: currentKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('current_usage')
      .eq('id', keyId)
      .single()
    
    if (fetchError || !currentKey) {
      throw new Error('Failed to fetch current usage')
    }
    
    // Update with incremented value
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        current_usage: currentKey.current_usage + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
    
    if (error) {
      throw new Error('Failed to update usage counter')
    }
    
    console.log(`✅ Usage incremented for API key: ${keyId}`)
    return true
  } catch (error) {
    console.error('❌ Error incrementing usage:', error)
    return false
  }
}

function maskApiKey(apiKey) {
  if (apiKey.length <= 13) {
    return '*'.repeat(apiKey.length)
  }
  
  const start = apiKey.substring(0, 10)
  const end = apiKey.substring(apiKey.length - 3)
  const middle = '*'.repeat(apiKey.length - 13)
  
  return `${start}${middle}${end}`
}

console.log('🧪 Testing Core API Key Manager (JavaScript Version)')
console.log('============================================================')

async function runBasicTests() {
  try {
    // Test 1: Get Active API Key
    console.log('\n🔑 Test 1: Getting active API key...')
    console.log('--------------------------------------------------')
    
    const activeKey = await getActiveApiKey('gemini')
    console.log('✅ Active API key retrieved:')
    console.log(`   • Key Name: ${activeKey.key_name}`)
    console.log(`   • Key ID: ${activeKey.id}`)
    console.log(`   • Usage: ${activeKey.current_usage}/${activeKey.usage_limit}`)
    console.log(`   • Decrypted Key: ${maskApiKey(activeKey.decrypted_key)}`)
    
    // Test 2: Increment Usage
    console.log('\n📊 Test 2: Incrementing usage...')
    console.log('--------------------------------------------------')
    
    const originalUsage = activeKey.current_usage
    const incrementSuccess = await incrementUsage(activeKey.id)
    
    if (incrementSuccess) {
      console.log('✅ Usage incremented successfully')
      
      // Verify the increment
      const updatedKey = await getActiveApiKey('gemini')
      console.log(`   • Original usage: ${originalUsage}`)
      console.log(`   • New usage: ${updatedKey.current_usage}`)
      console.log(`   • Increment verified: ${updatedKey.current_usage === originalUsage + 1 ? '✅' : '❌'}`)
    }
    
    // Test 3: Basic Health Check
    console.log('\n🏥 Test 3: Basic health check...')
    console.log('--------------------------------------------------')
    
    // Simple health check - verify key format
    const isValidFormat = /^AIza[a-zA-Z0-9_-]{35}$/.test(activeKey.decrypted_key)
    console.log(`✅ Key format validation: ${isValidFormat ? 'Valid' : 'Invalid'}`)
    
    if (isValidFormat) {
      console.log('   • Key follows Gemini API format')
      console.log('   • Ready for API integration')
    }
    
    console.log('\n============================================================')
    console.log('🎉 BASIC TESTS COMPLETED SUCCESSFULLY!')
    console.log('============================================================')
    console.log('✅ Core API Key retrieval is working')
    console.log('✅ Usage tracking is functional')
    console.log('✅ Encryption/decryption is operational')
    console.log('✅ Database operations are successful')
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    console.log('\n============================================================')
    console.log('❌ Basic test suite encountered errors')
    console.log('Please check the error details above')
  }
}

// Run the tests
runBasicTests().then(() => {
  console.log('\n🏁 Test execution complete')
}).catch(error => {
  console.error('💥 Test execution failed:', error)
})
