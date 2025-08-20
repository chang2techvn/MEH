#!/usr/bin/env node

/**
 * Comprehensive Authentication Diagnosis Script
 * Find exact cause of login freeze and session loss
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

async function diagnoseAuthSystem() {
  console.log('🏥 AUTHENTICATION SYSTEM DIAGNOSIS')
  console.log('=' .repeat(60))
  
  try {
    // 1. Basic Connection Test
    console.log('\n📡 1. BASIC CONNECTION TEST')
    console.log('─'.repeat(40))
    
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.log('❌ CRITICAL: Database connection failed:', healthError.message)
      return
    }
    console.log('✅ Database connection OK')
    
    // 2. RLS Policy Analysis
    console.log('\n🛡️  2. RLS POLICY ANALYSIS')
    console.log('─'.repeat(40))
    
    // Test with different clients
    const tests = [
      { name: 'Service Role', client: supabaseAdmin },
      { name: 'Anonymous', client: supabaseClient }
    ]
    
    for (const test of tests) {
      try {
        const { data, error } = await test.client
          .from('users')
          .select('id, email, role, account_status, is_active')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${test.name} client: ${error.message}`)
        } else {
          console.log(`✅ ${test.name} client: Found ${data?.length || 0} users`)
        }
      } catch (err) {
        console.log(`❌ ${test.name} client exception:`, err.message)
      }
    }
    
    // 3. Specific User Test
    console.log('\n👤 3. SPECIFIC USER TEST')
    console.log('─'.repeat(40))
    
    const testEmail = 'teacher1@university.edu'
    const { data: userCheck, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single()
    
    if (userError) {
      console.log('❌ User lookup failed:', userError.message)
    } else {
      console.log('✅ User found:', {
        id: userCheck.id,
        email: userCheck.email,
        role: userCheck.role,
        account_status: userCheck.account_status,
        is_active: userCheck.is_active
      })
      
      // Test profile lookup
      const { data: profileCheck, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', userCheck.id)
        .single()
      
      if (profileError) {
        console.log('❌ Profile lookup failed:', profileError.message)
      } else {
        console.log('✅ Profile found:', {
          user_id: profileCheck.user_id,
          role: profileCheck.role,
          full_name: profileCheck.full_name
        })
      }
    }
    
    // 4. Auth System Test
    console.log('\n🔐 4. AUTH SYSTEM TEST')
    console.log('─'.repeat(40))
    
    try {
      // Test session retrieval
      const { data: session, error: sessionError } = await supabaseClient.auth.getSession()
      
      if (sessionError) {
        console.log('❌ Session error:', sessionError.message)
      } else if (session?.session) {
        console.log('✅ Active session found for:', session.session.user?.email)
        
        // Test user data retrieval with active session
        const { data: authUserData, error: authDataError } = await supabaseClient
          .from('users')
          .select('role, account_status, is_active')
          .eq('id', session.session.user.id)
          .single()
        
        if (authDataError) {
          console.log('❌ Auth user data error:', authDataError.message)
          console.log('💡 This explains why login freezes!')
        } else {
          console.log('✅ Auth user data retrieved:', authUserData)
        }
      } else {
        console.log('ℹ️  No active session (expected if logged out)')
      }
    } catch (authError) {
      console.log('❌ Auth system error:', authError.message)
    }
    
    // 5. Login Flow Simulation
    console.log('\n🚪 5. LOGIN FLOW SIMULATION')
    console.log('─'.repeat(40))
    
    try {
      // Simulate what happens during login without actually logging in
      console.log('Simulating login process...')
      
      // Check if user exists in auth.users
      const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authUsersError) {
        console.log('❌ Cannot list auth users:', authUsersError.message)
      } else {
        const authUser = authUsers.users.find(u => u.email === testEmail)
        if (authUser) {
          console.log('✅ User exists in auth.users:', {
            id: authUser.id,
            email: authUser.email,
            confirmed: !!authUser.email_confirmed_at
          })
          
          // Test what auth context would do after successful login
          console.log('Testing auth context flow...')
          
          // Simulate getUserData function from auth context
          const [profileData, userRecord] = await Promise.all([
            supabaseClient.from('profiles').select('full_name, avatar_url, background_url, role').eq('user_id', authUser.id).single(),
            supabaseClient.from('users').select('role, account_status, is_active').eq('id', authUser.id).single()
          ])
          
          console.log('Auth context simulation:')
          console.log('  Profile query:', profileData.error ? `❌ ${profileData.error.message}` : '✅ Success')
          console.log('  Users query:', userRecord.error ? `❌ ${userRecord.error.message}` : '✅ Success')
          
          if (profileData.error || userRecord.error) {
            console.log('💡 LOGIN FREEZE CAUSE: Auth context cannot fetch user data after login!')
          }
        } else {
          console.log('❌ User not found in auth.users')
        }
      }
    } catch (loginError) {
      console.log('❌ Login simulation error:', loginError.message)
    }
    
    // 6. Middleware Simulation
    console.log('\n🚧 6. MIDDLEWARE SIMULATION')
    console.log('─'.repeat(40))
    
    if (userCheck) {
      try {
        // Simulate middleware query
        const { data: middlewareData, error: middlewareError } = await supabaseClient
          .from('users')
          .select('role, account_status, is_active')
          .eq('id', userCheck.id)
          .maybeSingle()
        
        if (middlewareError) {
          console.log('❌ Middleware query would fail:', middlewareError.message)
          console.log('💡 This explains /admin redirect to login!')
        } else {
          console.log('✅ Middleware query would succeed:', middlewareData)
        }
      } catch (middlewareError) {
        console.log('❌ Middleware simulation error:', middlewareError.message)
      }
    }
    
    // 7. Diagnosis Summary
    console.log('\n🔍 7. DIAGNOSIS SUMMARY')
    console.log('─'.repeat(40))
    
    console.log('Potential Issues:')
    console.log('1. RLS policies blocking client access to users/profiles tables')
    console.log('2. Auth context cannot fetch user data after login (causes freeze)')
    console.log('3. Middleware cannot verify user permissions (causes redirects)')
    console.log('4. Session cookies might be corrupted')
    console.log('5. Account status validation causing auth failures')
    
    // 8. Recommended Fixes
    console.log('\n💊 8. RECOMMENDED FIXES')
    console.log('─'.repeat(40))
    
    console.log('Immediate fixes needed:')
    console.log('1. Fix RLS policies to allow authenticated users to read their own data')
    console.log('2. Ensure auth context can fetch user data without freezing')
    console.log('3. Remove problematic account status checks that block auth')
    console.log('4. Clear browser cookies and test with fresh session')
    
  } catch (error) {
    console.error('❌ Diagnosis script error:', error.message)
  }
}

diagnoseAuthSystem()
