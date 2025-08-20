#!/usr/bin/env node

/**
 * Comprehensive Auth Debug Script
 * Check all aspects of authentication flow
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

async function debugAuthFlow() {
  console.log('🔍 Comprehensive Authentication Debug')
  console.log('=' .repeat(60))
  
  try {
    // 1. Check specific user data with admin client
    console.log('\n📊 User Data Check (Admin Client)')
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, account_status, is_active, created_at')
      .eq('id', '13df7bf1-d38f-4b58-b444-3dfa67e04f17')
      .single()
    
    if (userError) {
      console.log('❌ Error fetching user:', userError.message)
    } else {
      console.log('✅ User data:', userData)
    }

    // 2. Check profile data
    console.log('\n👤 Profile Data Check')
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, role, full_name')
      .eq('user_id', '13df7bf1-d38f-4b58-b444-3dfa67e04f17')
      .single()
    
    if (profileError) {
      console.log('❌ Error fetching profile:', profileError.message)
    } else {
      console.log('✅ Profile data:', profileData)
    }

    // 3. Test middleware query simulation
    console.log('\n🛡️  Middleware Query Simulation (Anon Client)')
    const { data: middlewareTest, error: middlewareError } = await supabaseClient
      .from('users')
      .select('role, account_status, is_active')
      .eq('id', '13df7bf1-d38f-4b58-b444-3dfa67e04f17')
      .single()
    
    if (middlewareError) {
      console.log('❌ Middleware query would fail:', middlewareError.message)
      console.log('🔧 This explains why /admin redirects to login!')
    } else {
      console.log('✅ Middleware query would succeed:', middlewareTest)
    }

    // 4. Test current session (if exists)
    console.log('\n🔐 Current Session Check')
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message)
    } else if (session?.user) {
      console.log('✅ Active session found:', {
        userId: session.user.id,
        email: session.user.email,
        aud: session.user.aud,
        role: session.user.role
      })
      
      // Test if this session can access users table
      console.log('\n🧪 Testing session access to users table...')
      const { data: sessionUserData, error: sessionUserError } = await supabaseClient
        .from('users')
        .select('role, account_status, is_active')
        .eq('id', session.user.id)
        .single()
      
      if (sessionUserError) {
        console.log('❌ Session cannot access users table:', sessionUserError.message)
        console.log('💡 This is why middleware fails!')
      } else {
        console.log('✅ Session can access users table:', sessionUserData)
      }
    } else {
      console.log('❌ No active session found')
    }

    // 5. Check RLS policies effectiveness
    console.log('\n🛡️  RLS Policy Test')
    
    // Test if anon can read users (should fail)
    const { data: anonUsers, error: anonError } = await supabaseClient
      .from('users')
      .select('id, email')
      .limit(1)
    
    if (anonError) {
      console.log('✅ Anonymous access properly blocked:', anonError.message)
    } else {
      console.log('⚠️  Anonymous access allowed (might be issue):', anonUsers?.length || 0, 'users')
    }

    // 6. Environment check
    console.log('\n🔧 Environment Configuration')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing') 
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Create diagnostic commands
function createDiagnosticSQL() {
  const fs = require('fs')
  const sqlContent = `
-- Diagnostic SQL for debugging auth issues
-- Run these in Supabase SQL Editor

-- 1. Check user and profile data
SELECT 
  u.id,
  u.email,
  u.role as user_role,
  u.account_status,
  u.is_active,
  p.role as profile_role,
  p.full_name
FROM public.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17';

-- 2. Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users';

-- 3. Test authenticated access (run while logged in)
-- This should work if logged in as the user
SELECT role, account_status, is_active 
FROM public.users 
WHERE id = auth.uid();

-- 4. Check auth.users table (admin only)
SELECT id, email, created_at, confirmed_at, last_sign_in_at
FROM auth.users 
WHERE id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17';

-- 5. Test if current user can read their own record
SELECT current_setting('request.jwt.claims', true)::json ->> 'sub' as current_user_id;
`

  fs.writeFileSync('./scripts/diagnostic-auth.sql', sqlContent)
  console.log('\n📝 Created diagnostic-auth.sql for manual testing')
}

console.log('🚀 Starting Comprehensive Auth Debug...')
debugAuthFlow().then(() => {
  createDiagnosticSQL()
  
  console.log('\n💡 Next Steps:')
  console.log('1. Check browser DevTools > Application > Cookies for Supabase auth tokens')
  console.log('2. Clear all cookies and try login again')
  console.log('3. Check if middleware.ts is getting correct session data')
  console.log('4. Verify RLS policies allow authenticated users to read users table')
}).catch(console.error)
