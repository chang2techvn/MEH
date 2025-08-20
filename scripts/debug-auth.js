#!/usr/bin/env node

/**
 * Debug Authentication Script
 * Debug authentication and admin access issues
 * Usage: node scripts/debug-auth.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

async function debugAuth() {
  console.log('🔍 Debugging Authentication Issues')
  console.log('=' .repeat(50))
  
  try {
    // 1. Check admin users in database
    console.log('\n📊 Checking admin users in database...')
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, is_active, account_status, created_at')
      .eq('role', 'admin')
    
    if (adminError) {
      console.error('❌ Error fetching admin users:', adminError.message)
      return
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️  No admin users found in database!')
      console.log('💡 You need to create an admin user first')
      return
    }
    
    console.log(`✅ Found ${adminUsers.length} admin user(s):`)
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name || 'No name'})`)
      console.log(`   - ID: ${user.id}`)
      console.log(`   - Role: ${user.role}`)
      console.log(`   - Active: ${user.is_active}`)
      console.log(`   - Status: ${user.account_status}`)
      console.log(`   - Created: ${user.created_at}`)
      console.log('')
    })

    // 2. Check auth.users table
    console.log('🔐 Checking auth.users table...')
    const { data: authUsers, error: authError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email, created_at, confirmed_at, last_sign_in_at')
      .in('email', adminUsers.map(u => u.email))
    
    if (authError) {
      console.log('⚠️  Could not check auth.users:', authError.message)
    } else {
      console.log(`📋 Auth users found: ${authUsers?.length || 0}`)
      if (authUsers && authUsers.length > 0) {
        authUsers.forEach(user => {
          console.log(`- ${user.email}: confirmed=${!!user.confirmed_at}, last_sign_in=${user.last_sign_in_at}`)
        })
      }
    }

    // 3. Test RLS policies
    console.log('\n🛡️  Testing RLS policies...')
    
    // Test with anon client (should fail)
    const { data: anonData, error: anonError } = await supabaseClient
      .from('users')
      .select('id, email, role')
      .limit(1)
    
    console.log('Anonymous client test:')
    if (anonError) {
      console.log('❌ Anonymous access blocked (this is expected):', anonError.message)
    } else {
      console.log(`⚠️  Anonymous access allowed! Found ${anonData?.length || 0} users`)
    }

    // 4. Check if middleware is working
    console.log('\n🔧 Middleware and Route Protection Check:')
    console.log('💡 Common issues:')
    console.log('1. Session cookies might be invalid after RLS changes')
    console.log('2. Middleware might not be checking auth correctly')
    console.log('3. User role might not be properly set in session')
    console.log('4. Account status might be preventing access')
    
    // 5. Check problematic users
    const problematicUsers = adminUsers.filter(user => 
      !user.is_active || user.account_status !== 'approved'
    )
    
    if (problematicUsers.length > 0) {
      console.log('\n⚠️  Found problematic admin users:')
      problematicUsers.forEach(user => {
        console.log(`- ${user.email}: active=${user.is_active}, status=${user.account_status}`)
      })
      
      console.log('\n🔧 Fixing admin users...')
      for (const user of problematicUsers) {
        const { error: fixError } = await supabaseAdmin
          .from('users')
          .update({
            is_active: true,
            account_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        if (fixError) {
          console.log(`❌ Failed to fix ${user.email}:`, fixError.message)
        } else {
          console.log(`✅ Fixed ${user.email}`)
        }
      }
    }

    // 6. Create test session
    console.log('\n🧪 Testing login process...')
    const testEmail = adminUsers[0].email
    console.log(`Attempting to sign in with: ${testEmail}`)
    
    // Note: This won't work without password, but shows the process
    console.log('💡 To test login:')
    console.log('1. Clear browser cookies/localStorage')
    console.log('2. Go to /auth/login')
    console.log('3. Login with admin credentials')
    console.log('4. Check if admin menu appears')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

async function createSQLFixes() {
  console.log('\n📝 Creating SQL fixes...')
  
  const fs = require('fs')
  const sqlContent = `
-- Fix admin users and ensure they can access the system
-- Run this in Supabase SQL Editor

-- 1. Ensure all admin users are active and approved
UPDATE public.users 
SET 
  is_active = true,
  account_status = 'approved',
  updated_at = now()
WHERE role = 'admin';

-- 2. Check current admin users
SELECT 
  id, email, name, role, is_active, account_status, created_at
FROM public.users 
WHERE role = 'admin';

-- 3. If you need to promote a user to admin:
-- UPDATE public.users 
-- SET role = 'admin', account_status = 'approved', is_active = true
-- WHERE email = 'your-email@example.com';

-- 4. Verify RLS policies are working
-- This should return data when run as authenticated user:
-- SELECT id, email, role FROM public.users LIMIT 5;
`

  fs.writeFileSync('./scripts/fix-admin-access.sql', sqlContent)
  console.log('📄 Created fix-admin-access.sql')
}

// Run debug
debugAuth().then(() => {
  createSQLFixes()
}).catch(console.error)
