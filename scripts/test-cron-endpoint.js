#!/usr/bin/env node

/**
 * Test Cron Endpoint
 * Test the /api/cron/daily-video-refresh endpoint specifically for API key recovery
 */

require('dotenv').config()

const CRON_SECRET = process.env.CRON_SECRET
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

if (!CRON_SECRET) {
  console.error('❌ CRON_SECRET not found in environment variables')
  process.exit(1)
}

/**
 * Test cron endpoint with timeout
 */
async function testCronEndpoint() {
  try {
    console.log('🧪 Testing Cron Endpoint...')
    console.log(`URL: ${BASE_URL}/api/cron/daily-video-refresh`)
    console.log('Method: POST with Authorization header\n')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      console.log('⏰ Request timed out after 30 seconds')
    }, 30000) // 30 second timeout

    const response = await fetch(`${BASE_URL}/api/cron/daily-video-refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Error Response: ${errorText}`)
      return
    }

    const result = await response.json()
    
    console.log('\n📋 CRON ENDPOINT RESPONSE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Success: ${result.success}`)
    console.log(`Duration: ${result.duration}`)
    console.log(`Generated At: ${result.generatedAt}`)
    
    if (result.apiKeyRecovery) {
      console.log('\n🔑 API Key Recovery Results:')
      console.log(`  Success: ${result.apiKeyRecovery.success}`)
      console.log(`  Recovered Keys: ${result.apiKeyRecovery.recoveredKeys}`)
      console.log(`  Total Inactive Keys: ${result.apiKeyRecovery.totalInactiveKeys}`)
      if (result.apiKeyRecovery.errors?.length > 0) {
        console.log(`  Errors: ${result.apiKeyRecovery.errors.join(', ')}`)
      }
    }
    
    if (result.dailyChallenge) {
      console.log('\n🎯 Daily Challenge:')
      console.log(`  Generated: ${result.dailyChallenge.title}`)
    }
    
    if (result.practiceChallenges) {
      console.log(`\n📚 Practice Challenges: ${result.practiceChallenges.count}/3`)
    }
    
    if (result.errors?.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }

    console.log('\n✅ Cron endpoint test completed!')

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Request was aborted due to timeout')
    } else {
      console.error('❌ Error testing cron endpoint:', error.message)
    }
  }
}

/**
 * Test without authorization (should fail)
 */
async function testUnauthorized() {
  try {
    console.log('\n🔒 Testing Unauthorized Request...')
    
    const response = await fetch(`${BASE_URL}/api/cron/daily-video-refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log(`📡 Unauthorized Response Status: ${response.status}`)
    
    if (response.status === 401) {
      console.log('✅ Correctly rejected unauthorized request')
    } else {
      console.log('⚠️ Unexpected response to unauthorized request')
    }

  } catch (error) {
    console.error('❌ Error testing unauthorized request:', error.message)
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--test-auth')) {
    await testUnauthorized()
    return
  }
  
  await testCronEndpoint()
  
  if (args.includes('--with-auth-test')) {
    await testUnauthorized()
  }
}

main().catch(console.error)
