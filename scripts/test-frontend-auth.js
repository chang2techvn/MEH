#!/usr/bin/env node

/**
 * Test Frontend Auth Script
 * Test authentication from frontend perspective
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFrontendAuth() {
  console.log('🧪 Testing Frontend Auth Flow')
  console.log('=' .repeat(50))
  
  try {
    // 1. Test login with admin credentials
    console.log('\n🔐 Testing login...')
    
    // You'll need to replace these with your actual admin credentials
    const testEmail = 'admin@university.edu'
    // Note: We can't test password login without the actual password
    
    console.log(`Testing with email: ${testEmail}`)
    
    // 2. Test getting current session
    console.log('\n📋 Checking current session...')
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message)
    } else if (session?.session?.user) {
      console.log('✅ Session found!')
      console.log('User ID:', session.session.user.id)
      console.log('Email:', session.session.user.email)
      
      // 3. Test fetching user data like auth context does
      console.log('\n👤 Testing user data fetch (like auth context)...')
      
      const userId = session.session.user.id
      
      // Test profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, background_url, role')
        .eq('user_id', userId)
        .single()
      
      console.log('Profile query:')
      if (profileError) {
        console.log('❌ Profile error:', profileError.message)
      } else {
        console.log('✅ Profile data:', profileData)
      }
      
      // Test users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('role, account_status, is_active')
        .eq('id', userId)
        .single()
      
      console.log('Users query:')
      if (userError) {
        console.log('❌ Users error:', userError.message)
      } else {
        console.log('✅ Users data:', userRecord)
      }
      
      // 4. Simulate auth context user object
      if (profileData || userRecord) {
        const userData = {
          id: session.session.user.id,
          email: session.session.user.email,
          name: profileData?.full_name || session.session.user.email?.split('@')[0],
          avatar: profileData?.avatar_url,
          background_url: profileData?.background_url,
          role: userRecord?.role || profileData?.role || 'student',
          accountStatus: userRecord?.account_status || 'approved',
          isActive: userRecord?.is_active !== false
        }
        
        console.log('\n🎯 Final user object (as auth context would create):')
        console.log(JSON.stringify(userData, null, 2))
        
        // 5. Check admin access
        if (userData.role === 'admin') {
          console.log('\n✅ ADMIN ACCESS: User should see admin menu')
        } else {
          console.log('\n❌ NO ADMIN ACCESS: User role is:', userData.role)
        }
        
        if (userData.accountStatus !== 'approved') {
          console.log('⚠️  ACCOUNT STATUS ISSUE:', userData.accountStatus)
        }
        
        if (!userData.isActive) {
          console.log('⚠️  ACCOUNT INACTIVE:', userData.isActive)
        }
      }
      
    } else {
      console.log('❌ No active session found')
      console.log('💡 You need to be logged in to test this')
      console.log('   1. Go to the app and log in with admin credentials')
      console.log('   2. Then run this script to see the session data')
    }
    
    // 6. Manual test instructions
    console.log('\n📝 Manual Test Instructions:')
    console.log('1. Clear browser cookies/localStorage')
    console.log('2. Go to http://localhost:3000/auth/login')
    console.log('3. Login with admin@university.edu')
    console.log('4. Check if Admin menu appears in header')
    console.log('5. If not, open browser DevTools > Console to see auth errors')
    console.log('6. Also check Network tab for failed API calls')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testFrontendAuth()
