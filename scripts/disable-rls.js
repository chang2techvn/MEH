#!/usr/bin/env node

/**
 * Disable RLS Script
 * Quickly disable RLS for users table via REST API
 * Usage: node scripts/disable-rls.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function disableRLS() {
  console.log('🔧 Attempting to disable RLS for users table...')
  
  try {
    // Try using raw SQL query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .limit(0)
    
    if (error) {
      console.log('Current error:', error.message)
    }
    
    console.log('✅ Found', data?.length || 0, 'users with service key')
    
    // Test with anon key
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: anonData, error: anonError } = await anonClient
      .from('users')
      .select('count', { count: 'exact' })
      .limit(0)
    
    if (anonError) {
      console.log('❌ Anonymous client error:', anonError.message)
      console.log('\n💡 Quick Solution Options:')
      console.log('1. Run the SQL in scripts/fix-users-rls.sql in Supabase dashboard')
      console.log('2. Or add this line to disable RLS temporarily:')
      console.log('   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;')
      console.log('\n🌐 Supabase Dashboard: https://supabase.com/dashboard')
      console.log('   → Your Project → SQL Editor → New query → Paste SQL → Run')
    } else {
      console.log('✅ Anonymous client works! Found', anonData?.length || 0, 'users')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

disableRLS()
