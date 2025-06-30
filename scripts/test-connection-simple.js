/**
 * Simple debug script to test Supabase connection and auth
 * Uses hardcoded values to avoid env issues
 */

const { createClient } = require('@supabase/supabase-js')

// Hardcoded local Supabase values
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔗 Testing Supabase connection...\n')
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return false
    }
    console.log('✅ Basic connection works\n')
    
    // Test auth status
    console.log('2. Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('❌ Auth check failed:', authError.message)
      return false
    }
    
    if (!user) {
      console.log('❌ No user authenticated')
      console.log('💡 You need to log in through the app first\n')
      return false
    }
    
    console.log('✅ User authenticated:', {
      id: user.id,
      email: user.email
    })
    console.log()
    
    // Test conversation creation directly
    console.log('3. Testing conversation creation...')
    const testData = {
      title: 'Test Conversation ' + Date.now(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    }
    
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert(testData)
      .select()
      .single()
      
    if (convError) {
      console.log('❌ Conversation creation failed:')
      console.log('  Code:', convError.code)
      console.log('  Message:', convError.message)
      console.log('  Details:', convError.details)
      console.log('  Hint:', convError.hint)
      return false
    }
    
    console.log('✅ Conversation created successfully!')
    console.log('  ID:', conversation.id)
    
    // Clean up
    await supabase.from('conversations').delete().eq('id', conversation.id)
    console.log('✅ Test conversation cleaned up\n')
    
    return true
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    return false
  }
}

async function main() {
  const success = await testConnection()
  
  if (success) {
    console.log('🎉 All tests passed! Conversation creation should work in your app.')
  } else {
    console.log('🔧 Issues found. Please:')
    console.log('   1. Copy fix-rls-direct.sql content to Supabase Studio SQL Editor')
    console.log('   2. Run the SQL to fix RLS policies')
    console.log('   3. Make sure you are logged in through the app')
    console.log('   4. Try creating a conversation again')
  }
}

main().catch(console.error)
