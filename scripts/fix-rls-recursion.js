#!/usr/bin/env node

/**
 * Fix RLS Infinite Recursion Script
 * Detect and fix infinite recursion in RLS policies
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSRecursion() {
  console.log('🔧 Fixing RLS Infinite Recursion')
  console.log('=' .repeat(50))
  
  try {
    // The error occurs when creating natural_conversation_sessions
    // which tries to join with users table that has recursive policies
    
    console.log('\n1. Testing the problematic query...')
    
    // Try to reproduce the error
    try {
      const { data: testData, error: testError } = await supabaseAdmin
        .from('natural_conversation_sessions')
        .select('*, users!natural_conversation_sessions_user_id_fkey(profiles(full_name, avatar_url))')
        .limit(1)
      
      if (testError) {
        console.log('❌ Confirmed error:', testError.message)
        if (testError.message.includes('infinite recursion')) {
          console.log('💡 This is the RLS recursion issue!')
        }
      } else {
        console.log('✅ Query works with admin client')
      }
    } catch (err) {
      console.log('❌ Query failed:', err.message)
    }
    
    console.log('\n2. Checking current policies on users table...')
    
    // Get list of policies (we'll need to use a different approach)
    console.log('💡 Need to fix policies that reference themselves')
    
  } catch (error) {
    console.error('❌ Script error:', error.message)
  }
}

fixRLSRecursion()
