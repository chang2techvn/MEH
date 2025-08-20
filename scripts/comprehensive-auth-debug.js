#!/usr/bin/env node

/**
 * Comprehensive Auth Debug Script
 * Check cookies, session, middleware, and all auth-related issues
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

async function comprehensiveAuthDebug() {
  console.log('🔍 Comprehensive Auth Debug')
  console.log('=' .repeat(60))
  
  try {
    // 1. Check user data in database
    console.log('\n📊 1. Database User Check')
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, account_status, is_active')
      .eq('email', 'teacher1@university.edu')
    
    if (usersError) {
      console.log('❌ Users query error:', usersError.message)
    } else {
      console.log('✅ Users table:', users[0])
    }
    
    // 2. Check profile data
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, role, full_name')
      .eq('user_id', users[0]?.id)
    
    if (profilesError) {
      console.log('❌ Profiles query error:', profilesError.message)
    } else {
      console.log('✅ Profiles table:', profiles[0])
    }
    
    // 3. Test middleware logic simulation
    console.log('\n🛡️  2. Middleware Logic Test')
    const testUserId = users[0]?.id
    
    if (testUserId) {
      // Simulate what middleware does
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('role, account_status, is_active')
        .eq('id', testUserId)
        .single()
      
      console.log('Middleware user query result:')
      if (userError) {
        console.log('❌ Middleware would fail here:', userError.message)
        console.log('💡 This is why /admin redirects to login!')
      } else {
        console.log('✅ Middleware query OK:', userData)
        
        // Check middleware conditions
        if (userData.account_status !== 'approved') {
          console.log('❌ Middleware: account_status not approved:', userData.account_status)
        }
        if (!userData.is_active) {
          console.log('❌ Middleware: user not active:', userData.is_active)
        }
        if (userData.role !== 'admin') {
          console.log('❌ Middleware: user not admin:', userData.role)
        }
        
        if (userData.account_status === 'approved' && userData.is_active && userData.role === 'admin') {
          console.log('✅ Middleware should allow admin access')
        }
      }
    }
    
    // 4. Check RLS policies
    console.log('\n🔐 3. RLS Policy Test')
    
    // Test anonymous access
    const { data: anonTest, error: anonError } = await supabaseClient
      .from('users')
      .select('role')
      .limit(1)
    
    console.log('Anonymous access test:')
    if (anonError) {
      console.log('❌ Anonymous blocked (expected):', anonError.message)
    } else {
      console.log('⚠️  Anonymous allowed:', anonTest?.length, 'users visible')
    }
    
    // 5. Check auth.users table
    console.log('\n👤 4. Auth Users Check')
    try {
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authError) {
        console.log('❌ Auth users error:', authError.message)
      } else {
        const targetUser = authUsers.users.find(u => u.email === 'teacher1@university.edu')
        if (targetUser) {
          console.log('✅ Auth user found:')
          console.log('  - ID:', targetUser.id)
          console.log('  - Email:', targetUser.email)
          console.log('  - Confirmed:', targetUser.email_confirmed_at ? 'Yes' : 'No')
          console.log('  - Last sign in:', targetUser.last_sign_in_at)
          console.log('  - Created:', targetUser.created_at)
        } else {
          console.log('❌ Auth user not found')
        }
      }
    } catch (authError) {
      console.log('❌ Auth admin error:', authError.message)
    }
    
    // 6. Session cookie analysis
    console.log('\n🍪 5. Session & Cookie Analysis')
    console.log('💡 Manual checks needed:')
    console.log('1. Open browser DevTools → Application → Cookies')
    console.log('2. Look for cookies starting with "sb-"')
    console.log('3. Check if cookies exist and are not expired')
    console.log('4. Try clearing cookies and login again')
    
    console.log('\n🔧 6. Potential Issues & Solutions:')
    console.log('─'.repeat(40))
    
    // Common issues checklist
    const issues = [
      'Middleware can\'t read user data from database (RLS)',
      'Session cookies are corrupted or expired', 
      'User role mismatch between tables',
      'Auth context vs Middleware using different data',
      'CORS or domain issues with cookies',
      'Next.js SSR vs Client-side auth mismatch'
    ]
    
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`)
    })
    
    console.log('\n🚀 7. Recommended Debug Steps:')
    console.log('─'.repeat(40))
    console.log('1. Add console.log to middleware.ts to see exact failure point')
    console.log('2. Check browser Network tab when accessing /admin')
    console.log('3. Verify session cookies in browser DevTools')
    console.log('4. Test with fresh incognito window')
    console.log('5. Check if user can access other protected routes')
    
  } catch (error) {
    console.error('❌ Debug script error:', error.message)
  }
}

comprehensiveAuthDebug()
