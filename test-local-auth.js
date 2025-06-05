// Test script for Supabase Authentication using LOCAL instance
import { createClient } from '@supabase/supabase-js'

// Using your local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyNzQ0LCJleHAiOjE5NjA3Njg3NDR9.AzZvBr_zEtGBgXXqGNfDGsIHN5YGwuO0kKkYqcKPGws'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLocalAuthentication() {
  console.log('🔐 Testing LOCAL Supabase Authentication...')
  console.log('==========================================')
  
  try {
    // Test 1: Check if we can connect to local Supabase
    console.log('1. Testing connection to LOCAL Supabase...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Session check failed:', sessionError.message)
    } else {
      console.log('✅ Connection successful!')
      console.log('Current session:', session ? 'Active' : 'No active session')
    }

    // Test 2: Test user registration with valid email
    console.log('\n2. Testing user registration...')
    const testEmail = `testuser${Date.now()}@test.com`
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
      console.log('Email confirmed:', !!signUpData.user?.email_confirmed_at)
      
      // If registration successful, try to sign in
      console.log('\n2.1. Testing sign in with new user...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })
      
      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message)
      } else {
        console.log('✅ Sign in successful!')
        console.log('Signed in user ID:', signInData.user?.id)
      }
    }

    // Test 3: Check database tables accessibility (should work with local instance)
    console.log('\n3. Testing core tables accessibility...')
    const tables = ['profiles', 'achievements', 'challenges', 'messages', 'posts', 'comments']
    
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

    // Test 4: Test if we can insert into profiles (if user is signed in)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log('\n4. Testing profile creation for authenticated user...')
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: `testuser_${Date.now()}`,
          full_name: 'Test User',
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (profileError) {
        console.log('❌ Profile creation failed:', profileError.message)
      } else {
        console.log('✅ Profile creation successful!')
        console.log('Profile data:', profileData)
      }
    }

  } catch (error) {
    console.log('❌ Authentication test failed with exception:', error.message)
  }
}

// Run the test
testLocalAuthentication().then(() => {
  console.log('\n🏁 LOCAL Authentication testing completed!')
}).catch(err => {
  console.error('Test script error:', err)
})
