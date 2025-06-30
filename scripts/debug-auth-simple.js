/**
 * Simple debug script to check authentication and RLS policies
 * Run this to diagnose why conversation creation is failing
 */

const { createClient } = require('@supabase/supabase-js')

// Use local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321'
// You need to get this key from Supabase Studio or config
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

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
    }
    
    if (!user) {
      console.log('❌ No user is currently authenticated')
      console.log('💡 Need to sign in first\n')
      
      // List existing users to see what we have
      console.log('3. Checking existing users...')
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, name')
        .limit(5)
      
      if (usersError) {
        console.log('❌ Could not fetch users:', usersError.message)
      } else {
        console.log('Available users:', users)
        
        if (users && users.length > 0) {
          console.log('\n4. Attempting to test conversation creation without auth...')
          await testConversationCreation()
        }
      }
    } else {
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email
      })
      
      console.log('\n3. Testing conversation creation with authenticated user...')
      await testConversationCreation()
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('Stack:', error.stack)
  }
}

async function testConversationCreation() {
  console.log('Testing conversation creation...')
  
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
    
    // Try to get more info about RLS
    console.log('\nDebugging RLS policies...')
    await checkRLSPolicies()
    
  } else {
    console.log('✅ Conversation created successfully:', conversation)
    
    // Clean up test conversation
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversation.id)
    
    if (deleteError) {
      console.log('⚠️  Could not clean up test conversation:', deleteError.message)
    } else {
      console.log('✅ Test conversation cleaned up')
    }
  }
}

async function checkRLSPolicies() {
  console.log('Checking RLS status...')
  
  try {
    // Try to query pg_tables to see if RLS is enabled
    const { data, error } = await supabase
      .rpc('check_table_rls', { table_name: 'conversations' })
    
    if (error) {
      console.log('Could not check RLS via RPC:', error.message)
      
      // Try alternative approach - check policies
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies')
      
      if (policiesError) {
        console.log('Could not get policies:', policiesError.message)
      } else {
        console.log('Policies result:', policies)
      }
    } else {
      console.log('RLS status:', data)
    }
    
  } catch (error) {
    console.log('Error checking RLS:', error.message)
  }
}

// Run the debug
debugAuthAndRLS().catch(console.error)
