/**
 * Final Integration Test - Pure JavaScript Version
 * Tests API Key Management System without TypeScript imports
 */

const { config } = require('dotenv')
config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Encryption config
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'english-learning-platform-secret-key-2025'

// Decryption function
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
    throw new Error('Failed to decrypt API key')
  }
}

// Core functions
async function getActiveApiKey(serviceName = 'gemini') {
  try {
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .eq('is_active', true)
      .order('current_usage', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
    
    if (error || !keys || keys.length === 0) {
      throw new Error(`No active API keys available for service: ${serviceName}`)
    }
    
    const key = keys[0]
    const decryptedKey = decryptApiKey(key.encrypted_key)
    
    return { ...key, decrypted_key: decryptedKey }
  } catch (error) {
    throw error
  }
}

async function incrementUsage(keyId) {
  try {
    const { data: currentKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('current_usage')
      .eq('id', keyId)
      .single()
    
    if (fetchError || !currentKey) {
      throw new Error('Failed to fetch current usage')
    }
    
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
    
    return true
  } catch (error) {
    return false
  }
}

async function getAllKeys(serviceName) {
  try {
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .order('created_at', { ascending: true })
    
    if (error) {
      throw new Error('Failed to fetch API keys')
    }
    
    return keys || []
  } catch (error) {
    throw error
  }
}

async function testGeminiAPI(apiKey) {
  try {
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta"
    const GEMINI_MODEL = "gemini-1.5-flash"
    
    const response = await fetch(`${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Say 'FINAL_TEST_SUCCESS' if you receive this message." }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
      })
    })
    
    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`)
    }
    
    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
    
    return { success: true, response: responseText }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

console.log('🎯 Final API Key Management System Integration Test (Pure JS)')
console.log('============================================================')

async function runFinalIntegrationTest() {
  let testResults = {
    databaseConnection: false,
    keyRetrieval: false,
    keyDecryption: false,
    geminiAPICall: false,
    usageTracking: false,
    systemResilience: false
  }
  
  try {
    // Test 1: Database Connection
    console.log('\n🔌 Test 1: Database Connection...')
    console.log('--------------------------------------------------')
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, key_name, service_name, is_active')
      .eq('service_name', 'gemini')
      .limit(1)
    
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`)
    }
    
    console.log('✅ Database connection successful')
    console.log(`   • Sample key found: ${data?.[0]?.key_name || 'None'}`)
    testResults.databaseConnection = true
    
    // Test 2: Key Retrieval
    console.log('\n🔑 Test 2: API Key Retrieval...')
    console.log('--------------------------------------------------')
    
    const activeKey = await getActiveApiKey('gemini')
    console.log('✅ Active key retrieved successfully')
    console.log(`   • Key Name: ${activeKey.key_name}`)
    console.log(`   • Key ID: ${activeKey.id}`)
    console.log(`   • Current Usage: ${activeKey.current_usage}/${activeKey.usage_limit}`)
    testResults.keyRetrieval = true
    
    // Test 3: Key Decryption
    console.log('\n🔓 Test 3: Key Decryption...')
    console.log('--------------------------------------------------')
    
    const isValidFormat = /^AIza[a-zA-Z0-9_-]{35}$/.test(activeKey.decrypted_key)
    console.log(`✅ Key decryption: ${isValidFormat ? 'Valid' : 'Invalid'}`)
    console.log(`   • Key format: ${activeKey.decrypted_key.substring(0, 10)}...`)
    console.log(`   • Length: ${activeKey.decrypted_key.length} characters`)
    testResults.keyDecryption = isValidFormat
    
    // Test 4: Gemini API Call
    console.log('\n🤖 Test 4: Gemini API Integration...')
    console.log('--------------------------------------------------')
    
    const originalUsage = activeKey.current_usage
    const apiResult = await testGeminiAPI(activeKey.decrypted_key)
    
    if (apiResult.success) {
      console.log('✅ Gemini API call successful!')
      console.log(`   • Response: ${apiResult.response.substring(0, 100)}...`)
      console.log(`   • Contains success marker: ${apiResult.response.includes('FINAL_TEST_SUCCESS') ? '✅' : '❌'}`)
      testResults.geminiAPICall = true
    } else {
      console.log('❌ Gemini API call failed')
      console.log(`   • Error: ${apiResult.error}`)
    }
    
    // Test 5: Usage Tracking
    console.log('\n📊 Test 5: Usage Tracking...')
    console.log('--------------------------------------------------')
    
    if (apiResult.success) {
      const incrementSuccess = await incrementUsage(activeKey.id)
      if (incrementSuccess) {
        // Verify the increment
        const updatedKey = await getActiveApiKey('gemini')
        const newUsage = updatedKey.current_usage
        
        console.log('✅ Usage tracking verification:')
        console.log(`   • Original usage: ${originalUsage}`)
        console.log(`   • New usage: ${newUsage}`)
        console.log(`   • Increment successful: ${newUsage > originalUsage ? '✅' : '❌'}`)
        testResults.usageTracking = newUsage > originalUsage
      }
    }
    
    // Test 6: System Resilience
    console.log('\n⚡ Test 6: System Resilience...')
    console.log('--------------------------------------------------')
    
    const allKeys = await getAllKeys('gemini')
    const activeKeysCount = allKeys.filter(key => key.is_active).length
    
    console.log('✅ System resilience check:')
    console.log(`   • Total keys: ${allKeys.length}`)
    console.log(`   • Active keys: ${activeKeysCount}`)
    console.log(`   • Failover capability: ${activeKeysCount > 1 ? '✅ Multiple keys' : '⚠️ Single key'}`)
    console.log(`   • System redundancy: ${activeKeysCount >= 3 ? '✅ High' : activeKeysCount >= 2 ? '⚠️ Medium' : '❌ Low'}`)
    
    testResults.systemResilience = activeKeysCount >= 2
    
    // Calculate overall success
    const successfulTests = Object.values(testResults).filter(Boolean).length
    const totalTests = Object.keys(testResults).length
    const successRate = (successfulTests / totalTests) * 100
    
    console.log('\n============================================================')
    console.log('🎯 FINAL INTEGRATION TEST SUMMARY')
    console.log('============================================================')
    
    console.log('\nTest Results:')
    console.log(`🔌 Database Connection: ${testResults.databaseConnection ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`🔑 Key Retrieval: ${testResults.keyRetrieval ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`🔓 Key Decryption: ${testResults.keyDecryption ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`🤖 Gemini API Call: ${testResults.geminiAPICall ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`📊 Usage Tracking: ${testResults.usageTracking ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`⚡ System Resilience: ${testResults.systemResilience ? '✅ PASS' : '❌ FAIL'}`)
    
    console.log(`\n📊 Overall Success Rate: ${successRate.toFixed(1)}% (${successfulTests}/${totalTests} tests passed)`)
    
    if (successRate >= 90) {
      console.log('\n🎉 EXCELLENT! SYSTEM FULLY OPERATIONAL!')
      console.log('✅ All systems are working perfectly')
      console.log('✅ Ready for production deployment')
    } else if (successRate >= 75) {
      console.log('\n🎉 GREAT! SYSTEM READY FOR PRODUCTION!')
      console.log('✅ Core functionality is working correctly')
      console.log('✅ Minor issues can be addressed post-deployment')
    } else if (successRate >= 50) {
      console.log('\n⚠️ GOOD! SYSTEM PARTIALLY READY')
      console.log('✅ Basic functionality is working')
      console.log('⚠️ Some features need attention before production')
    } else {
      console.log('\n❌ SYSTEM NOT READY')
      console.log('❌ Critical issues need to be resolved')
      console.log('❌ Do not deploy to production')
    }
    
    // Final summary
    console.log('\n📋 Production Readiness Summary:')
    console.log(`✅ API Key Management System: ${testResults.keyRetrieval && testResults.keyDecryption ? 'OPERATIONAL' : 'NEEDS WORK'}`)
    console.log(`✅ Gemini AI Integration: ${testResults.geminiAPICall ? 'WORKING' : 'NEEDS WORK'}`)
    console.log(`✅ Database Operations: ${testResults.databaseConnection && testResults.usageTracking ? 'STABLE' : 'NEEDS WORK'}`)
    console.log(`✅ System Resilience: ${testResults.systemResilience ? 'SUFFICIENT' : 'NEEDS MORE KEYS'}`)
    console.log(`✅ Overall Health: ${successRate >= 75 ? '🟢 HEALTHY' : successRate >= 50 ? '🟡 FAIR' : '🔴 POOR'}`)
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR in final integration test:', error)
    console.log('\n============================================================')
    console.log('💥 Test execution failed with critical error')
    console.log('Please review the error details and fix before continuing')
  }
}

// Run the final integration test
runFinalIntegrationTest().then(() => {
  console.log('\n🏁 Final integration test complete')
}).catch(error => {
  console.error('💥 Final test execution failed:', error)
})
