/**
 * Test Script: API Key Retrieval from Supabase Database
 * Tests the ability to fetch and decrypt API keys from api_keys table
 */

// Load environment variables
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Encryption configuration (matching migrate-api-keys.js)
const ENCRYPTION_ALGORITHM = 'aes-192-cbc'
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'english-learning-platform-secret-key-2025'

console.log('🧪 Testing API Key Retrieval from Supabase Database')
console.log('=' .repeat(60))

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Decrypt an encrypted API key (matching migrate-api-keys.js encryption)
 */
function decryptApiKey(encryptedKey) {
  try {
    const algorithm = 'aes-192-cbc'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 24)
    const iv = Buffer.alloc(16, 0) // Fixed IV matching encryption
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('❌ Decryption failed:', error.message)
    return null
  }
}

/**
 * Test: Get active API key for Gemini service
 */
async function testGetActiveApiKey(serviceName = 'gemini') {
  console.log(`\n🔍 Test 1: Getting active API key for service "${serviceName}"`)
  console.log('-'.repeat(50))
  
  try {
    // Query active API keys
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .eq('is_active', true)
      .order('current_usage', { ascending: true })
      .limit(1)

    if (error) {
      console.error('❌ Database query failed:', error.message)
      return false
    }

    if (!apiKeys || apiKeys.length === 0) {
      console.error('❌ No active API keys found for service:', serviceName)
      return false
    }

    const apiKey = apiKeys[0]
    console.log('✅ Active API key found:')
    console.log(`   • Key Name: ${apiKey.key_name}`)
    console.log(`   • Usage: ${apiKey.current_usage}/${apiKey.usage_limit}`)
    console.log(`   • Status: ${apiKey.is_active ? 'ACTIVE' : 'INACTIVE'}`)
    console.log(`   • Created: ${new Date(apiKey.created_at).toLocaleDateString()}`)

    // Test decryption
    const decryptedKey = decryptApiKey(apiKey.encrypted_key)
    if (decryptedKey) {
      console.log(`✅ Decryption successful: ${decryptedKey.substring(0, 10)}...${decryptedKey.substring(decryptedKey.length - 4)}`)
      return { success: true, apiKey: decryptedKey, keyInfo: apiKey }
    } else {
      console.error('❌ Failed to decrypt API key')
      return false
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

/**
 * Test: Get all available API keys for service
 */
async function testGetAllApiKeys(serviceName = 'gemini') {
  console.log(`\n📋 Test 2: Getting all API keys for service "${serviceName}"`)
  console.log('-'.repeat(50))
  
  try {
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .order('current_usage', { ascending: true })

    if (error) {
      console.error('❌ Database query failed:', error.message)
      return false
    }

    console.log(`✅ Found ${apiKeys.length} total API keys:`)
    
    apiKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key.key_name}`)
      console.log(`      Status: ${key.is_active ? '🟢 ACTIVE' : '🔴 INACTIVE'}`)
      console.log(`      Usage: ${key.current_usage}/${key.usage_limit}`)
      console.log(`      Updated: ${new Date(key.updated_at).toLocaleString()}`)
    })

    return { success: true, count: apiKeys.length, keys: apiKeys }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

/**
 * Test: Update usage counter
 */
async function testUpdateUsage(keyName) {
  console.log(`\n🔄 Test 3: Updating usage counter for "${keyName}"`)
  console.log('-'.repeat(50))
  
  try {
    // Get current usage
    const { data: currentKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('current_usage, usage_limit')
      .eq('key_name', keyName)
      .single()

    if (fetchError) {
      console.error('❌ Failed to fetch current usage:', fetchError.message)
      return false
    }

    const newUsage = currentKey.current_usage + 1
    console.log(`   Current usage: ${currentKey.current_usage}`)
    console.log(`   New usage: ${newUsage}`)

    // Update usage
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ 
        current_usage: newUsage,
        updated_at: new Date().toISOString()
      })
      .eq('key_name', keyName)

    if (updateError) {
      console.error('❌ Failed to update usage:', updateError.message)
      return false
    }

    console.log('✅ Usage counter updated successfully')
    
    // Verify update
    const { data: updatedKey, error: verifyError } = await supabase
      .from('api_keys')
      .select('current_usage')
      .eq('key_name', keyName)
      .single()

    if (verifyError) {
      console.error('❌ Failed to verify update:', verifyError.message)
      return false
    }

    console.log(`✅ Verified new usage: ${updatedKey.current_usage}`)
    return { success: true, newUsage: updatedKey.current_usage }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting API Key Retrieval Tests...\n')

  // Check environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL)
    console.error('   - SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_KEY)
    process.exit(1)
  }

  const results = {
    test1: false,
    test2: false,
    test3: false
  }

  // Test 1: Get active API key
  const test1Result = await testGetActiveApiKey('gemini')
  results.test1 = !!test1Result.success

  // Test 2: Get all API keys
  const test2Result = await testGetAllApiKeys('gemini')
  results.test2 = !!test2Result.success

  // Test 3: Update usage (only if we have a key from test 1)
  if (test1Result.success && test1Result.keyInfo) {
    const test3Result = await testUpdateUsage(test1Result.keyInfo.key_name)
    results.test3 = !!test3Result.success
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Test 1 (Get Active Key): ${results.test1 ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Test 2 (Get All Keys): ${results.test2 ? 'PASSED' : 'FAILED'}`)
  console.log(`✅ Test 3 (Update Usage): ${results.test3 ? 'PASSED' : 'FAILED'}`)
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests PASSED! API key retrieval system is working correctly.')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests FAILED! Please check the issues above.')
    process.exit(1)
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Fatal error during testing:', error)
  process.exit(1)
})
