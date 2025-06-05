// Test script for Supabase Authentication
import { createClient } from '@supabase/supabase-js'

// Using your production credentials from .env
const supabaseUrl = 'https://yvsjynosfwyhvisqhasp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c2p5bm9zZnd5aHZpc3FoYXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjE0MDIsImV4cCI6MjA2MzgzNzQwMn0.cFkFS9DaD5BCN4R34RDp3bs4kQbicq2NM6NpVASiSdY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthentication() {
  console.log('🔐 Testing Supabase Authentication...')
  console.log('=====================================')
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing connection to Supabase...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Session check failed:', sessionError.message)
    } else {
      console.log('✅ Connection successful!')
      console.log('Current session:', session ? 'Active' : 'No active session')
    }

    // Test 2: Test user registration (with dummy email)
    console.log('\n2. Testing user registration...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message)
    } else {
      console.log('✅ User registration successful!')
      console.log('User ID:', signUpData.user?.id)
      console.log('Email confirmation required:', !signUpData.user?.email_confirmed_at)
    }

    // Test 3: Check if profiles table exists and is accessible
    console.log('\n3. Testing profiles table access...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.log('❌ Profiles table access failed:', profilesError.message)
    } else {
      console.log('✅ Profiles table accessible!')
      console.log('Sample profiles count:', profiles?.length || 0)
    }

    // Test 4: Test database tables accessibility
    console.log('\n4. Testing core tables accessibility...')
    const tables = ['users', 'achievements', 'challenges', 'messages', 'posts', 'comments']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table} table: ${error.message}`)
        } else {
          console.log(`✅ ${table} table: Accessible (${data?.length || 0} sample records)`)
        }
      } catch (err) {
        console.log(`❌ ${table} table: Exception - ${err.message}`)
      }
    }

    // Test 5: Test Auth methods availability
    console.log('\n5. Testing Auth methods...')
    const authMethods = ['signUp', 'signInWithPassword', 'signOut', 'getSession', 'getUser']
    
    authMethods.forEach(method => {
      if (typeof supabase.auth[method] === 'function') {
        console.log(`✅ ${method}: Available`)
      } else {
        console.log(`❌ ${method}: Not available`)
      }
    })

  } catch (error) {
    console.log('❌ Authentication test failed with exception:', error.message)
  }
}

// Run the test
testAuthentication().then(() => {
  console.log('\n🏁 Authentication testing completed!')
}).catch(err => {
  console.error('Test script error:', err)
})
