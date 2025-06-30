/**
 * Debug script to check authentication and RLS policies
 * Run this to diagnose why conversation creation is failing
 */

const { createClient } = require('@supabase/supabase-js')
const { config } = require('dotenv')
const path = require('path')

// Load environment variables from root directory
config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAuthAndRLS() {
  console.log('🔍 Debugging Authentication and RLS Policies...\n')
  
  try {
    // Step 1: Check Supabase connection
    console.log('1. Testing Supabase connection...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.log('❌ Supabase connection failed:', healthError.message)
      return
    }
    console.log('✅ Supabase connection OK\n')

    // Step 2: Check current user
    console.log('2. Checking current user...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('❌ Error getting user:', userError.message)
      return
    }
    
    if (!user) {
      console.log('❌ No user is currently authenticated')
      console.log('💡 Try logging in first\n')
      
      // Try to sign in with a test user
      console.log('3. Attempting to sign in with test credentials...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message)
        console.log('💡 You may need to create a test user first\n')
        return
      }
      
      console.log('✅ Signed in successfully as:', signInData.user?.email)
      user = signInData.user
    } else {
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        role: user.role
      })
    }
    console.log()

    // Step 3: Check RLS policies on conversations table
    console.log('3. Checking RLS policies on conversations table...')
    
    // Check if RLS is enabled
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'conversations' })
      .single()
    
    if (rlsError) {
      console.log('⚠️  Could not check RLS status:', rlsError.message)
    } else {
      console.log('RLS Status:', rlsStatus)
    }

    // Step 4: Test conversation creation with debug info
    console.log('4. Testing conversation creation...')
    
    const testConversation = {
      title: 'Test Conversation',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    }
    
    console.log('Attempting to insert conversation:', testConversation)
    
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert(testConversation)
      .select()
      .single()
    
    if (convError) {
      console.log('❌ Conversation creation failed:', {
        code: convError.code,
        message: convError.message,
        details: convError.details,
        hint: convError.hint
      })
      
      // Step 5: Debug RLS policies in detail
      console.log('\n5. Debugging RLS policies in detail...')
      await debugRLSPolicies()
      
    } else {
      console.log('✅ Conversation created successfully:', conversation)
      
      // Clean up test conversation
      await supabase.from('conversations').delete().eq('id', conversation.id)
      console.log('✅ Test conversation cleaned up')
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

async function debugRLSPolicies() {
  console.log('Checking current policies on conversations table...')
  
  try {
    // Check policies using raw SQL
    const { data: policies, error } = await supabase
      .rpc('get_table_policies', { table_name: 'conversations' })
    
    if (error) {
      console.log('⚠️  Could not fetch policies:', error.message)
      
      // Alternative: Check if we can query pg_policies directly
      const { data: altPolicies, error: altError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'conversations')
      
      if (altError) {
        console.log('⚠️  Could not fetch policies via pg_policies:', altError.message)
      } else {
        console.log('Policies found:', altPolicies)
      }
    } else {
      console.log('Policies found:', policies)
    }
    
    // Test auth.uid() function
    console.log('\nTesting auth.uid() function...')
    const { data: authUid, error: authError } = await supabase
      .rpc('get_current_user_id')
    
    if (authError) {
      console.log('⚠️  Could not get auth.uid():', authError.message)
    } else {
      console.log('Current auth.uid():', authUid)
    }
    
  } catch (error) {
    console.log('❌ Error debugging policies:', error.message)
  }
}

// Helper function to create RPC functions if they don't exist
async function createHelperFunctions() {
  console.log('Creating helper functions for debugging...')
  
  const functions = [
    `
    CREATE OR REPLACE FUNCTION check_rls_status(table_name text)
    RETURNS jsonb AS $$
    DECLARE
      result jsonb;
    BEGIN
      SELECT jsonb_build_object(
        'rls_enabled', relrowsecurity,
        'force_rls', relforcerowsecurity
      ) INTO result
      FROM pg_class 
      WHERE relname = table_name;
      
      RETURN result;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
    `
    CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
    RETURNS jsonb AS $$
    DECLARE
      result jsonb;
    BEGIN
      SELECT jsonb_agg(
        jsonb_build_object(
          'policyname', policyname,
          'permissive', permissive,
          'roles', roles,
          'cmd', cmd,
          'qual', qual,
          'with_check', with_check
        )
      ) INTO result
      FROM pg_policies 
      WHERE tablename = table_name;
      
      RETURN COALESCE(result, '[]'::jsonb);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
    `
    CREATE OR REPLACE FUNCTION get_current_user_id()
    RETURNS uuid AS $$
    BEGIN
      RETURN auth.uid();
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  ]
  
  for (const func of functions) {
    const { error } = await supabase.rpc('exec_sql', { sql: func })
    if (error) {
      console.log('⚠️  Could not create helper function:', error.message)
    }
  }
}

// Run the debug
async function main() {
  await createHelperFunctions()
  await debugAuthAndRLS()
}

main().catch(console.error)
