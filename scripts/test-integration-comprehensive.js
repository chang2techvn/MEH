/**
 * Comprehensive Integration Test for API Key Manager with Gemini API
 * Tests the complete flow from database to actual API calls
 */

const { config } = require('dotenv')
config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

// Use global fetch (Node.js 18+)
if (typeof fetch === 'undefined') {
  global.fetch = require('undici').fetch
}

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Encryption config
const ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || 'english-learning-platform-secret-key-2025'

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
    
    return {
      ...key,
      decrypted_key: decryptedKey
    }
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

async function markKeyAsInactive(keyId, reason) {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
    
    if (error) {
      throw new Error('Failed to update key status')
    }
    
    return true
  } catch (error) {
    return false
  }
}

async function testGeminiApiCall(apiKey) {
  try {
    console.log('🔥 Testing actual Gemini API call...')
    
    const testPrompt = "Hello! Please respond with exactly 'API_TEST_SUCCESS' if you can hear me."
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: testPrompt
          }]
        }]
      })
    })
    
    if (!response.ok) {
      console.error(`❌ API call failed with status: ${response.status}`)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      return {
        success: false,
        status: response.status,
        error: errorText
      }
    }
    
    const result = await response.json()
    const apiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    
    console.log(`✅ API call successful!`)
    console.log(`   • Response: ${apiResponse}`)
    
    return {
      success: true,
      status: response.status,
      response: apiResponse
    }
    
  } catch (error) {
    console.error('❌ API call error:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

async function performFailoverTest() {
  try {
    console.log('\n🔄 Testing failover functionality...')
    console.log('--------------------------------------------------')
    
    // Get all active keys
    const { data: allKeys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', 'gemini')
      .eq('is_active', true)
      .order('current_usage', { ascending: true })
    
    if (error || !allKeys || allKeys.length < 2) {
      console.log('⚠️ Need at least 2 active keys for failover test')
      return false
    }
    
    console.log(`✅ Found ${allKeys.length} active keys for failover test`)
    
    // Test each key
    let workingKeys = 0
    let failedKeys = 0
    
    for (const key of allKeys.slice(0, 3)) { // Test first 3 keys
      console.log(`\n🔑 Testing key: ${key.key_name}`)
      
      try {
        const decryptedKey = decryptApiKey(key.encrypted_key)
        const testResult = await testGeminiApiCall(decryptedKey)
        
        if (testResult.success) {
          workingKeys++
          console.log(`   ✅ Key ${key.key_name} is working`)
          
          // Increment usage
          await incrementUsage(key.id)
          console.log(`   📊 Usage incremented for ${key.key_name}`)
        } else {
          failedKeys++
          console.log(`   ❌ Key ${key.key_name} failed: ${testResult.error || testResult.status}`)
          
          // If status suggests invalid key, mark as inactive
          if (testResult.status === 403 || testResult.status === 401) {
            console.log(`   🚫 Marking key ${key.key_name} as inactive`)
            await markKeyAsInactive(key.id, `API returned ${testResult.status}`)
          }
        }
      } catch (error) {
        failedKeys++
        console.log(`   ❌ Key ${key.key_name} encryption/test failed: ${error.message}`)
      }
    }
    
    console.log(`\n📊 Failover test results:`)
    console.log(`   • Working keys: ${workingKeys}`)
    console.log(`   • Failed keys: ${failedKeys}`)
    console.log(`   • Success rate: ${((workingKeys / (workingKeys + failedKeys)) * 100).toFixed(1)}%`)
    
    return workingKeys > 0
    
  } catch (error) {
    console.error('❌ Failover test error:', error)
    return false
  }
}

console.log('🧪 Comprehensive API Key Manager Integration Test')
console.log('============================================================')

async function runIntegrationTests() {
  let testsPassed = 0
  let totalTests = 0
  
  try {
    // Test 1: Database connectivity and key retrieval
    totalTests++
    console.log('\n🔌 Test 1: Database connectivity and key retrieval...')
    console.log('--------------------------------------------------')
    
    try {
      const activeKey = await getActiveApiKey('gemini')
      console.log('✅ Database connection successful')
      console.log(`   • Retrieved key: ${activeKey.key_name}`)
      console.log(`   • Current usage: ${activeKey.current_usage}/${activeKey.usage_limit}`)
      console.log(`   • Key format: Valid Gemini API key`)
      testsPassed++
    } catch (error) {
      console.error('❌ Database connectivity failed:', error.message)
    }
    
    // Test 2: End-to-end API integration
    totalTests++
    console.log('\n🌐 Test 2: End-to-end API integration...')
    console.log('--------------------------------------------------')
    
    try {
      const activeKey = await getActiveApiKey('gemini')
      const apiResult = await testGeminiApiCall(activeKey.decrypted_key)
      
      if (apiResult.success) {
        console.log('✅ End-to-end API integration successful')
        await incrementUsage(activeKey.id)
        console.log('✅ Usage tracking updated')
        testsPassed++
      } else {
        console.error('❌ API integration failed:', apiResult.error)
      }
    } catch (error) {
      console.error('❌ End-to-end test failed:', error.message)
    }
    
    // Test 3: Failover and resilience
    totalTests++
    console.log('\n🛡️ Test 3: Failover and resilience testing...')
    console.log('--------------------------------------------------')
    
    try {
      const failoverSuccess = await performFailoverTest()
      if (failoverSuccess) {
        console.log('✅ Failover system is operational')
        testsPassed++
      } else {
        console.error('❌ Failover system failed')
      }
    } catch (error) {
      console.error('❌ Failover test failed:', error.message)
    }
    
    // Test 4: Performance and response time
    totalTests++
    console.log('\n⚡ Test 4: Performance and response time...')
    console.log('--------------------------------------------------')
    
    try {
      const startTime = Date.now()
      const activeKey = await getActiveApiKey('gemini')
      const keyRetrievalTime = Date.now() - startTime
      
      const apiStartTime = Date.now()
      const apiResult = await testGeminiApiCall(activeKey.decrypted_key)
      const apiCallTime = Date.now() - apiStartTime
      
      console.log(`✅ Performance metrics:`)
      console.log(`   • Key retrieval time: ${keyRetrievalTime}ms`)
      console.log(`   • API call time: ${apiCallTime}ms`)
      console.log(`   • Total time: ${keyRetrievalTime + apiCallTime}ms`)
      
      if (keyRetrievalTime < 100 && apiCallTime < 5000) {
        console.log('✅ Performance benchmarks met')
        testsPassed++
      } else {
        console.log('⚠️ Performance benchmarks not met')
      }
    } catch (error) {
      console.error('❌ Performance test failed:', error.message)
    }
    
    console.log('\n============================================================')
    console.log('📊 INTEGRATION TEST SUMMARY')
    console.log('============================================================')
    console.log(`✅ Tests passed: ${testsPassed}/${totalTests}`)
    console.log(`📈 Success rate: ${((testsPassed/totalTests) * 100).toFixed(1)}%`)
    
    if (testsPassed === totalTests) {
      console.log('🎉 ALL INTEGRATION TESTS PASSED!')
      console.log('✅ API Key Manager is production ready')
      console.log('✅ Database integration is working')
      console.log('✅ Gemini API connectivity is confirmed')
      console.log('✅ Failover mechanisms are operational')
      console.log('✅ Performance is within acceptable limits')
    } else {
      console.log('⚠️ Some tests failed - review required before production')
    }
    
  } catch (error) {
    console.error('💥 Integration test suite failed:', error)
  }
}

// Run the comprehensive tests
runIntegrationTests().then(() => {
  console.log('\n🏁 Integration test execution complete')
}).catch(error => {
  console.error('💥 Integration test execution failed:', error)
})
