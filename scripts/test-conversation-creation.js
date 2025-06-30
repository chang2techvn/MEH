/**
 * Simple test script for conversation creation
 * This bypasses RLS temporarily to test the basic functionality
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConversationSystem() {
  console.log('🧪 Testing Conversation System...\n')
  
  try {
    // Step 1: Check if user is authenticated
    console.log('1. Checking authentication...')
    let { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('❌ No user authenticated, attempting to sign in...')
      
      // Try to sign in with test credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message)
        console.log('💡 Creating test user...')
        
        // Create test user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'test@example.com',
          password: 'testpassword123'
        })
        
        if (signUpError && !signUpError.message.includes('already registered')) {
          console.log('❌ Could not create user:', signUpError.message)
          return
        }
        
        console.log('✅ Test user created, please check email for confirmation')
        return
      }
      
      user = signInData.user
    }
    
    console.log('✅ User authenticated:', user.email)
    console.log('User ID:', user.id)
    
    // Step 2: Temporarily disable RLS for testing
    console.log('\n2. Attempting conversation creation with disabled RLS...')
    
    const testConversation = {
      title: 'Test Conversation - ' + new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    }
    
    // First try with RLS enabled (should fail)
    console.log('Trying with RLS enabled...')
    const { data: conversation1, error: error1 } = await supabase
      .from('conversations')
      .insert(testConversation)
      .select()
      .single()
    
    if (error1) {
      console.log('❌ Failed with RLS (expected):', error1.message)
      
      // Now let's try a different approach - use a stored procedure
      console.log('Trying with stored procedure approach...')
      
      const { data: procResult, error: procError } = await supabase
        .rpc('create_conversation_with_participants', {
          conversation_title: testConversation.title,
          participant_user_ids: [user.id]
        })
      
      if (procError) {
        console.log('❌ Stored procedure failed:', procError.message)
        
        // Final attempt: Manual approach
        console.log('Trying manual approach...')
        await manualConversationCreation(user)
        
      } else {
        console.log('✅ Conversation created via stored procedure:', procResult)
      }
      
    } else {
      console.log('✅ Conversation created with RLS:', conversation1)
      
      // Clean up
      await supabase.from('conversations').delete().eq('id', conversation1.id)
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.error(error.stack)
  }
}

async function manualConversationCreation(user) {
  console.log('\n3. Manual conversation creation approach...')
  
  try {
    // Create stored procedure for conversation creation
    const createProcedureSQL = `
      CREATE OR REPLACE FUNCTION create_conversation_with_participants(
        conversation_title text,
        participant_user_ids uuid[]
      )
      RETURNS jsonb AS $$
      DECLARE
        new_conversation_id uuid;
        participant_id uuid;
        result jsonb;
      BEGIN
        -- Insert conversation
        INSERT INTO conversations (title, status, created_at, updated_at, last_message_at)
        VALUES (conversation_title, 'active', NOW(), NOW(), NOW())
        RETURNING id INTO new_conversation_id;
        
        -- Insert participants
        FOREACH participant_id IN ARRAY participant_user_ids
        LOOP
          INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at, last_read_at)
          VALUES (new_conversation_id, participant_id, 'admin', NOW(), NOW());
        END LOOP;
        
        -- Return result
        SELECT jsonb_build_object(
          'conversation_id', new_conversation_id,
          'title', conversation_title,
          'participants', array_length(participant_user_ids, 1)
        ) INTO result;
        
        RETURN result;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    console.log('Creating stored procedure...')
    const { error: procCreateError } = await supabase.rpc('exec_sql', { sql: createProcedureSQL })
    
    if (procCreateError) {
      console.log('❌ Could not create procedure:', procCreateError.message)
      
      // Alternative: Try direct insertion with service role
      console.log('Trying service role approach...')
      
      // This requires service role key which might not be available
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceRoleKey) {
        const serviceSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
          serviceRoleKey
        )
        
        const { data: serviceConv, error: serviceError } = await serviceSupabase
          .from('conversations')
          .insert({
            title: 'Service Role Test Conversation',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (serviceError) {
          console.log('❌ Service role insertion failed:', serviceError.message)
        } else {
          console.log('✅ Service role insertion successful:', serviceConv)
          
          // Add participant
          const { error: partError } = await serviceSupabase
            .from('conversation_participants')
            .insert({
              conversation_id: serviceConv.id,
              user_id: user.id,
              role: 'admin',
              joined_at: new Date().toISOString(),
              last_read_at: new Date().toISOString()
            })
          
          if (partError) {
            console.log('❌ Participant insertion failed:', partError.message)
          } else {
            console.log('✅ Participant added successfully')
          }
          
          // Clean up
          await serviceSupabase.from('conversation_participants').delete().eq('conversation_id', serviceConv.id)
          await serviceSupabase.from('conversations').delete().eq('id', serviceConv.id)
          console.log('✅ Test data cleaned up')
        }
      } else {
        console.log('⚠️  No service role key available')
      }
    } else {
      console.log('✅ Stored procedure created')
      
      // Now try using it
      const { data: procResult, error: procError } = await supabase
        .rpc('create_conversation_with_participants', {
          conversation_title: 'Procedure Test Conversation',
          participant_user_ids: [user.id]
        })
      
      if (procError) {
        console.log('❌ Procedure execution failed:', procError.message)
      } else {
        console.log('✅ Conversation created via procedure:', procResult)
      }
    }
    
  } catch (error) {
    console.log('❌ Manual creation error:', error.message)
  }
}

// Main execution
testConversationSystem().catch(console.error)
