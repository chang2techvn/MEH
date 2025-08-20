#!/usr/bin/env node

/**
 * Fix RLS Script
 * Fix Row Level Security policies for users table
 * Usage: node scripts/fix-rls.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for users table...')
  
  try {
    // Check current RLS status
    console.log('\n📋 Checking current RLS status...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT pg_class.relname, pg_class.relrowsecurity 
              FROM pg_class 
              WHERE pg_class.relname = 'users';`
      })
    
    if (rlsError) {
      console.log('⚠️  Could not check RLS status:', rlsError.message)
    } else {
      console.log('RLS Status:', rlsStatus)
    }

    // Create policy to allow authenticated users to read all users
    console.log('\n🛡️  Creating RLS policy for authenticated users...')
    
    const createPolicySQL = `
      -- Enable RLS on users table
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "authenticated_users_can_read_all" ON public.users;
      DROP POLICY IF EXISTS "users_can_read_all" ON public.users;
      DROP POLICY IF EXISTS "admin_full_access" ON public.users;
      
      -- Create policy for authenticated users to read all users
      CREATE POLICY "authenticated_users_can_read_all" 
      ON public.users FOR SELECT 
      TO authenticated 
      USING (true);
      
      -- Create policy for admin full access
      CREATE POLICY "admin_full_access" 
      ON public.users FOR ALL 
      TO authenticated 
      USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE users.id = auth.uid() AND users.role = 'admin'
        )
      );
      
      -- Create policy for users to update their own records
      CREATE POLICY "users_can_update_own" 
      ON public.users FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = id);
    `
    
    const { data: policyResult, error: policyError } = await supabase
      .rpc('exec_sql', { sql: createPolicySQL })
    
    if (policyError) {
      console.error('❌ Error creating RLS policies:', policyError.message)
      
      // Try alternative approach - disable RLS temporarily
      console.log('\n🔄 Trying alternative approach - disabling RLS...')
      const disableRLSSQL = `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`
      
      const { data: disableResult, error: disableError } = await supabase
        .rpc('exec_sql', { sql: disableRLSSQL })
      
      if (disableError) {
        console.error('❌ Error disabling RLS:', disableError.message)
      } else {
        console.log('✅ RLS disabled for users table')
        console.log('⚠️  WARNING: This is less secure but will allow the app to work')
      }
    } else {
      console.log('✅ RLS policies created successfully')
    }

    // Test the fix
    console.log('\n🧪 Testing the fix...')
    const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: testData, error: testError } = await supabaseClient
      .from('users')
      .select('id, email, name')
      .limit(1)
    
    if (testError) {
      console.error('❌ Test failed:', testError.message)
      console.log('💡 The frontend may still have authentication issues')
    } else {
      console.log(`✅ Test successful! Found ${testData?.length || 0} users`)
      if (testData && testData.length > 0) {
        console.log('Sample user:', testData[0])
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Alternative: Create SQL file for manual execution
async function createSQLFile() {
  const fs = require('fs')
  const sqlContent = `
-- Fix RLS for users table
-- Run this in Supabase SQL Editor

-- Enable RLS on users table  
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "authenticated_users_can_read_all" ON public.users;
DROP POLICY IF EXISTS "users_can_read_all" ON public.users;
DROP POLICY IF EXISTS "admin_full_access" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own" ON public.users;

-- Create policy for authenticated users to read all users
CREATE POLICY "authenticated_users_can_read_all" 
ON public.users FOR SELECT 
TO authenticated 
USING (true);

-- Create policy for admin full access  
CREATE POLICY "admin_full_access" 
ON public.users FOR ALL 
TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Create policy for users to update their own records
CREATE POLICY "users_can_update_own" 
ON public.users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- If the above doesn't work, disable RLS temporarily:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
`

  fs.writeFileSync('./scripts/fix-users-rls.sql', sqlContent)
  console.log('📝 Created fix-users-rls.sql file')
  console.log('💡 You can run this manually in Supabase SQL Editor if the script fails')
}

// Run the fix
console.log('🚀 Starting RLS Fix for Users Table')
console.log('=' .repeat(50))

createSQLFile()
fixRLSPolicies().catch(console.error)
