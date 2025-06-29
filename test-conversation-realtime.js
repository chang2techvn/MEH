const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConversationRealtime() {
  console.log('🔍 Testing Conversation Realtime...\n');

  try {
    // Get existing conversation and users
    console.log('1. Getting existing conversation and users:');
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, title')
      .limit(1)
      .single();
      
    if (convError || !conversation) {
      console.log('❌ Error getting conversation:', convError?.message);
      return;
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .limit(2);
      
    if (usersError || !users || users.length < 1) {
      console.log('❌ Error getting users:', usersError?.message);
      return;
    }
    
    console.log('✅ Using conversation:', conversation.title, `(${conversation.id})`);
    console.log('✅ Sender:', users[0].name, `(${users[0].id})`);

    // Set up realtime subscription for conversation_messages
    console.log('\n2. Setting up realtime subscription for conversation_messages:');
    let receivedEvents = 0;
    
    const channel = supabase
      .channel('test-conversation-messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversation_messages' }, 
        (payload) => {
          receivedEvents++;
          console.log('📨 Realtime event received:', {
            eventType: payload.eventType,
            conversationId: payload.new?.conversation_id || payload.old?.conversation_id,
            new: payload.new ? { id: payload.new.id, content: payload.new.content } : null,
            old: payload.old ? { id: payload.old.id } : null
          });
        }
      );

    await new Promise((resolve, reject) => {
      channel
        .subscribe((status) => {
          console.log('📡 Channel status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to conversation_messages realtime');
            resolve();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.log('❌ Failed to subscribe to realtime');
            reject(new Error(`Channel ${status}`));
          }
        });
    });

    // Test inserting a conversation message
    console.log('\n3. Testing realtime with conversation message insert:');
    const testMessage = {
      conversation_id: conversation.id,
      sender_id: users[0].id,
      content: 'Test conversation realtime message - ' + new Date().toISOString(),
      message_type: 'text'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('conversation_messages')
      .insert(testMessage)
      .select();

    if (insertError) {
      console.log('❌ Error inserting conversation message:', insertError.message);
    } else {
      console.log('✅ Conversation message inserted:', insertResult[0]);
    }

    // Wait for realtime event
    console.log('\n4. Waiting for realtime event (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (receivedEvents > 0) {
      console.log(`✅ Success! Received ${receivedEvents} realtime event(s) for conversation_messages`);
    } else {
      console.log('❌ No realtime events received for conversation_messages');
    }

    // Test updating the message
    if (insertResult && insertResult[0]) {
      console.log('\n5. Testing conversation message update:');
      const { data: updateResult, error: updateError } = await supabase
        .from('conversation_messages')
        .update({ content: 'Updated conversation message - ' + new Date().toISOString() })
        .eq('id', insertResult[0].id)
        .select();

      if (updateError) {
        console.log('❌ Error updating conversation message:', updateError.message);
      } else {
        console.log('✅ Conversation message updated:', updateResult[0]);
      }

      // Wait for update event
      console.log('⏳ Waiting for update event (3 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`\n✅ Conversation realtime test completed. Total events received: ${receivedEvents}`);

    // Clean up
    channel.unsubscribe();

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  } finally {
    process.exit(0);
  }
}

testConversationRealtime();
