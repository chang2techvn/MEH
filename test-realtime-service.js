const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔗 Testing Supabase Realtime with Service Role');
console.log('URL:', supabaseUrl);

// Create client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

async function testRealtimeServiceRole() {
  console.log('\n🔌 Testing realtime connection with service role...');
  
  try {
    // Test basic connection first
    console.log('📊 Testing basic database connection...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(3);

    if (usersError) {
      console.error('❌ Database connection failed:', usersError.message);
      return;
    }

    console.log('✅ Database connection successful. Found', users?.length, 'users');
    users?.forEach(user => console.log(' -', user.name, '(' + user.email + ')'));

    // Now test realtime
    console.log('\n📡 Setting up realtime subscription...');
    const channel = supabase.channel('test-channel-service');
    
    let connected = false;
    let error = null;
    
    channel
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversation_messages' 
        }, 
        (payload) => {
          console.log('📨 Realtime message received:', payload);
        }
      )
      .on('broadcast', 
        { event: 'test' }, 
        (payload) => {
          console.log('📻 Broadcast received:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          connected = true;
          console.log('✅ Realtime connection successful!');
          
          // Test broadcast
          setTimeout(() => {
            console.log('\n📤 Testing broadcast...');
            channel.send({
              type: 'broadcast',
              event: 'test',
              payload: { message: 'Hello from service role test!', timestamp: new Date().toISOString() }
            });
          }, 1000);
          
        } else if (status === 'CHANNEL_ERROR') {
          error = 'Channel error';
          connected = false;
          console.error('❌ Channel error occurred');
        } else if (status === 'TIMED_OUT') {
          error = 'Connection timed out';
          connected = false;
          console.error('❌ Connection timed out');
        }
      });

    // Wait for connection result
    await new Promise((resolve) => {
      setTimeout(() => {
        if (connected) {
          console.log('\n🎉 Realtime test completed successfully!');
          
          // Test database insert to trigger realtime
          console.log('\n💾 Testing database insert to trigger realtime...');
          insertTestMessage();
        } else {
          console.log('\n❌ Realtime connection failed:', error || 'Unknown error');
        }
        
        setTimeout(() => {
          // Cleanup
          channel.unsubscribe();
          resolve();
        }, 3000);
      }, 5000);
    });

  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

async function insertTestMessage() {
  try {
    // Get a conversation to insert into
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);

    if (convError || !conversations || conversations.length === 0) {
      console.log('⚠️ No conversations found to test with');
      return;
    }

    const conversationId = conversations[0].id;
    console.log('💬 Using conversation:', conversationId);

    // Get a user to send from
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.log('⚠️ No users found to test with');
      return;
    }

    const userId = users[0].id;

    // Insert test message
    const { data: message, error: messageError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: 'Test message from realtime test script',
        message_type: 'text',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error inserting test message:', messageError.message);
    } else {
      console.log('✅ Test message inserted:', message.id);
    }

  } catch (err) {
    console.error('💥 Error in insertTestMessage:', err.message);
  }
}

// Run the test
testRealtimeServiceRole().then(() => {
  console.log('\n🏁 Service role test completed');
  process.exit(0);
}).catch((err) => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});
