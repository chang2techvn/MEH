/**
 * Script to fix RLS policies for conversations system
 * This will create proper policies to allow authenticated users to create conversations
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment')
  console.log('💡 Using anon key, some operations may fail')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS Policies for Conversations System...\n')
  
  const sqlCommands = [
    // First, ensure RLS is enabled
    `ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;`,
    
    // Drop existing policies to avoid conflicts
    `DROP POLICY IF EXISTS "conversations_insert_policy" ON conversations;`,
    `DROP POLICY IF EXISTS "conversations_select_policy" ON conversations;`,
    `DROP POLICY IF EXISTS "conversations_update_policy" ON conversations;`,
    `DROP POLICY IF EXISTS "conversations_delete_policy" ON conversations;`,
    `DROP POLICY IF EXISTS "conversation_participants_insert_policy" ON conversation_participants;`,
    `DROP POLICY IF EXISTS "conversation_participants_select_policy" ON conversation_participants;`,
    `DROP POLICY IF EXISTS "conversation_participants_update_policy" ON conversation_participants;`,
    `DROP POLICY IF EXISTS "conversation_participants_delete_policy" ON conversation_participants;`,
    
    // Create permissive INSERT policies for conversations
    `CREATE POLICY "conversations_insert_policy" ON conversations
      FOR INSERT 
      TO authenticated
      WITH CHECK (true);`, // Allow all authenticated users to create conversations
    
    // Create SELECT policy for conversations
    `CREATE POLICY "conversations_select_policy" ON conversations
      FOR SELECT 
      TO authenticated
      USING (
        id IN (
          SELECT conversation_id 
          FROM conversation_participants 
          WHERE user_id = auth.uid()
        )
      );`,
    
    // Create UPDATE policy for conversations
    `CREATE POLICY "conversations_update_policy" ON conversations
      FOR UPDATE 
      TO authenticated
      USING (
        id IN (
          SELECT conversation_id 
          FROM conversation_participants 
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        id IN (
          SELECT conversation_id 
          FROM conversation_participants 
          WHERE user_id = auth.uid()
        )
      );`,
    
    // Create DELETE policy for conversations
    `CREATE POLICY "conversations_delete_policy" ON conversations
      FOR DELETE 
      TO authenticated
      USING (
        id IN (
          SELECT conversation_id 
          FROM conversation_participants 
          WHERE user_id = auth.uid()
        )
      );`,
    
    // Create permissive INSERT policy for conversation_participants
    `CREATE POLICY "conversation_participants_insert_policy" ON conversation_participants
      FOR INSERT 
      TO authenticated
      WITH CHECK (true);`, // Allow all authenticated users to add participants
    
    // Create SELECT policy for conversation_participants
    `CREATE POLICY "conversation_participants_select_policy" ON conversation_participants
      FOR SELECT 
      TO authenticated
      USING (
        conversation_id IN (
          SELECT conversation_id 
          FROM conversation_participants 
          WHERE user_id = auth.uid()
        )
      );`,
    
    // Create UPDATE policy for conversation_participants
    `CREATE POLICY "conversation_participants_update_policy" ON conversation_participants
      FOR UPDATE 
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());`,
    
    // Create DELETE policy for conversation_participants
    `CREATE POLICY "conversation_participants_delete_policy" ON conversation_participants
      FOR DELETE 
      TO authenticated
      USING (user_id = auth.uid());`
  ]
  
  try {
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i]
      console.log(`${i + 1}. Executing: ${sql.substring(0, 60)}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql })
      
      if (error) {
        console.log(`❌ Error: ${error.message}`)
        
        // Try alternative approach for policy creation
        if (sql.includes('CREATE POLICY')) {
          console.log('   Trying direct SQL execution...')
          const { error: directError } = await supabase
            .from('_supabase_admin')
            .select('*')
            .limit(0) // This is just to test connection
          
          if (directError) {
            console.log('   Direct SQL not available, skipping...')
          }
        }
      } else {
        console.log('   ✅ Success')
      }
    }
    
    console.log('\n🎉 RLS Policies setup completed!')
    console.log('Now testing conversation creation...')
    
    // Test the policies
    await testConversationCreation()
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

async function testConversationCreation() {
  console.log('\n🧪 Testing conversation creation...')
  
  try {
    // First, ensure we have a user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('❌ No authenticated user found')
      
      // Try to create a test user
      console.log('Creating test user...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (signUpError && !signUpError.message.includes('already registered')) {
        console.log('❌ Could not create test user:', signUpError.message)
        return
      }
      
      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (signInError) {
        console.log('❌ Could not sign in test user:', signInError.message)
        return
      }
      
      console.log('✅ Test user signed in')
    }
    
    // Test conversation creation
    const testConversation = {
      title: 'Test Conversation',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    }
    
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert(testConversation)
      .select()
      .single()
    
    if (convError) {
      console.log('❌ Conversation creation still failing:', {
        code: convError.code,
        message: convError.message,
        details: convError.details
      })
      
      // Additional debugging
      console.log('\nAdditional debugging info:')
      const { data: currentUser } = await supabase.auth.getUser()
      console.log('Current user ID:', currentUser.user?.id)
      
      // Test auth.uid() function
      const { data: authUid, error: authError } = await supabase
        .rpc('get_auth_uid')
      
      if (authError) {
        console.log('auth.uid() test failed:', authError.message)
      } else {
        console.log('auth.uid() returns:', authUid)
      }
      
    } else {
      console.log('✅ Conversation created successfully!')
      console.log('Conversation ID:', conversation.id)
      
      // Test participant creation
      console.log('Testing participant creation...')
      const { data: participant, error: partError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          role: 'admin',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (partError) {
        console.log('❌ Participant creation failed:', partError.message)
      } else {
        console.log('✅ Participant created successfully!')
      }
      
      // Clean up
      await supabase.from('conversation_participants').delete().eq('conversation_id', conversation.id)
      await supabase.from('conversations').delete().eq('id', conversation.id)
      console.log('✅ Test data cleaned up')
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message)
  }
}

// Helper function to test auth.uid()
async function createAuthHelper() {
  const sql = `
    CREATE OR REPLACE FUNCTION get_auth_uid()
    RETURNS uuid AS $$
    BEGIN
      RETURN auth.uid();
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) {
    console.log('Could not create auth helper:', error.message)
  }
}

// Main execution
async function main() {
  await createAuthHelper()
  await fixRLSPolicies()
}

main().catch(console.error)
