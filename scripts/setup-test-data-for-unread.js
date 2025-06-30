/**
 * Setup test data for unread message count testing
 * Creates test users, conversations, and messages to verify unread count system
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupTestData() {
  console.log('🔧 Setting up test data for unread message count system...\n')
  
  try {
    // Step 1: Create test users
    console.log('1. Creating test users...')
    
    const testUsers = [
      {
        id: 'user-1',
        email: 'teacher1@example.com',
        name: 'Teacher Alice',
        avatar: '/placeholder-user.jpg',
        is_active: true,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-2', 
        email: 'teacher2@example.com',
        name: 'Teacher Bob',
        avatar: '/placeholder-user.jpg',
        is_active: true,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-3',
        email: 'student1@example.com', 
        name: 'Student Charlie',
        avatar: '/placeholder-user.jpg',
        is_active: true,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    // Delete existing test users first
    await supabase.from('users').delete().in('id', testUsers.map(u => u.id))
    
    // Insert new test users
    const { error: usersError } = await supabase
      .from('users')
      .insert(testUsers)
    
    if (usersError) {
      console.error('❌ Error creating users:', usersError)
      return
    }
    console.log('✅ Created 3 test users')

    // Step 2: Create test conversations
    console.log('2. Creating test conversations...')
    
    const testConversations = [
      {
        id: 'conv-1',
        title: 'Teacher-Student Chat',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      },
      {
        id: 'conv-2',
        title: 'Teacher Discussion',
        status: 'active', 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      }
    ]
    
    // Delete existing test conversations
    await supabase.from('conversations').delete().in('id', testConversations.map(c => c.id))
    
    const { error: convError } = await supabase
      .from('conversations')
      .insert(testConversations)
    
    if (convError) {
      console.error('❌ Error creating conversations:', convError)
      return
    }
    console.log('✅ Created 2 test conversations')

    // Step 3: Add conversation participants
    console.log('3. Adding conversation participants...')
    
    const participants = [
      // Conversation 1: Teacher Alice & Student Charlie
      {
        conversation_id: 'conv-1',
        user_id: 'user-1',
        role: 'participant',
        joined_at: new Date().toISOString(),
        last_read_at: new Date(Date.now() - 60000).toISOString() // 1 minute ago
      },
      {
        conversation_id: 'conv-1', 
        user_id: 'user-3',
        role: 'participant',
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString() // just now
      },
      // Conversation 2: Teacher Alice & Teacher Bob
      {
        conversation_id: 'conv-2',
        user_id: 'user-1',
        role: 'participant',
        joined_at: new Date().toISOString(),
        last_read_at: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
      },
      {
        conversation_id: 'conv-2',
        user_id: 'user-2',
        role: 'participant', 
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString() // just now
      }
    ]
    
    // Delete existing participants
    await supabase.from('conversation_participants').delete().in('conversation_id', ['conv-1', 'conv-2'])
    
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants)
    
    if (participantsError) {
      console.error('❌ Error adding participants:', participantsError)
      return
    }
    console.log('✅ Added conversation participants')

    // Step 4: Create test messages with varying read status
    console.log('4. Creating test messages...')
    
    const testMessages = [
      // Conversation 1 messages
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender_id: 'user-3', // Student Charlie
        content: 'Hello teacher, I have a question about today\'s lesson',
        type: 'text',
        created_at: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
        updated_at: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        sender_id: 'user-3', // Student Charlie  
        content: 'Can you help me understand the grammar rule?',
        type: 'text',
        created_at: new Date(Date.now() - 90000).toISOString(), // 1.5 minutes ago
        updated_at: new Date(Date.now() - 90000).toISOString()
      },
      {
        id: 'msg-3',
        conversation_id: 'conv-1',
        sender_id: 'user-1', // Teacher Alice
        content: 'Of course! Which part are you confused about?',
        type: 'text',
        created_at: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
        updated_at: new Date(Date.now() - 30000).toISOString()
      },
      // Conversation 2 messages
      {
        id: 'msg-4',
        conversation_id: 'conv-2',
        sender_id: 'user-2', // Teacher Bob
        content: 'Hey Alice, how was your class today?',
        type: 'text',
        created_at: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
        updated_at: new Date(Date.now() - 240000).toISOString()
      },
      {
        id: 'msg-5',
        conversation_id: 'conv-2',
        sender_id: 'user-2', // Teacher Bob
        content: 'The students seem really engaged this week',
        type: 'text',
        created_at: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
        updated_at: new Date(Date.now() - 180000).toISOString()
      },
      {
        id: 'msg-6',
        conversation_id: 'conv-2',
        sender_id: 'user-2', // Teacher Bob
        content: 'Do you want to discuss lesson plans for next week?',
        type: 'text',
        created_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        updated_at: new Date(Date.now() - 60000).toISOString()
      }
    ]
    
    // Delete existing test messages
    await supabase.from('messages').delete().in('id', testMessages.map(m => m.id))
    
    const { error: messagesError } = await supabase
      .from('messages')
      .insert(testMessages)
    
    if (messagesError) {
      console.error('❌ Error creating messages:', messagesError)
      return
    }
    console.log('✅ Created 6 test messages')

    // Step 5: Verify unread count calculation
    console.log('\n5. Verifying unread count calculations...')
    
    // For user-1 (Teacher Alice):
    // - In conv-1: last_read_at was 1 minute ago, but there's a message from 30 seconds ago -> 1 unread
    // - In conv-2: last_read_at was 5 minutes ago, but there are 3 messages from Bob (4min, 3min, 1min ago) -> 3 unread
    
    // For user-2 (Teacher Bob):
    // - In conv-2: last_read_at was just now, no unread messages -> 0 unread
    
    // For user-3 (Student Charlie):
    // - In conv-1: last_read_at was just now, no unread messages -> 0 unread
    
    // Test the unread count query for user-1
    const { data: user1Unread, error: unreadError } = await supabase
      .rpc('get_unread_count_for_user', { user_id_param: 'user-1' })
    
    if (unreadError) {
      console.log('⚠️  Unread count function not available, creating it...')
      
      // Create the function if it doesn't exist
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION get_unread_count_for_user(user_id_param UUID)
        RETURNS TABLE(conversation_id UUID, unread_count INTEGER) 
        LANGUAGE sql
        AS $$
          SELECT 
            cp.conversation_id,
            COALESCE(COUNT(m.id), 0)::INTEGER as unread_count
          FROM conversation_participants cp
          LEFT JOIN messages m ON m.conversation_id = cp.conversation_id 
            AND m.sender_id != user_id_param 
            AND m.created_at > cp.last_read_at
          WHERE cp.user_id = user_id_param
          GROUP BY cp.conversation_id;
        $$;
      `
      
      const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL })
      if (funcError) {
        console.log('❌ Could not create unread count function')
      } else {
        console.log('✅ Created unread count function')
      }
    } else {
      console.log('✅ Unread count function available')
      console.log('📊 User-1 unread counts:', user1Unread)
    }
    
    // Display summary
    console.log('\n📋 Test Data Summary:')
    console.log('Users:')
    console.log('  - user-1 (Teacher Alice): should have unread messages in both conversations')
    console.log('  - user-2 (Teacher Bob): should have no unread messages')
    console.log('  - user-3 (Student Charlie): should have no unread messages')
    console.log('\nConversations:')
    console.log('  - conv-1: Teacher Alice & Student Charlie (1 unread for Alice)')
    console.log('  - conv-2: Teacher Alice & Teacher Bob (3 unread for Alice)')
    console.log('\n✅ Test data setup completed!')
    console.log('\nYou can now test the message dropdown and unread count system in your app.')

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
  }
}

// Run the setup
setupTestData()
