const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRealtimeWithValidData() {
  console.log('🔍 Testing Realtime with valid data...\n');

  try {
    // Get actual users
    console.log('1. Getting existing users:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5);
      
    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
      return;
    }
    
    if (!users || users.length < 2) {
      console.log('❌ Need at least 2 users in database');
      return;
    }
    
    console.log('✅ Found users:', users.map(u => `${u.name} (${u.id})`));

    // Set up realtime subscription
    console.log('\n2. Setting up realtime subscription:');
    let receivedEvents = 0;
    
    const channel = supabase
      .channel('test-messages-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' }, 
        (payload) => {
          receivedEvents++;
          console.log('📨 Realtime event received:', {
            eventType: payload.eventType,
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
            console.log('✅ Successfully subscribed to realtime');
            resolve();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.log('❌ Failed to subscribe to realtime');
            reject(new Error(`Channel ${status}`));
          }
        });
    });

    // Test inserting a message with valid user IDs
    console.log('\n3. Testing realtime with valid user IDs:');
    const testMessage = {
      sender_id: users[0].id,
      receiver_id: users[1].id,
      content: 'Test realtime message - ' + new Date().toISOString(),
      message_type: 'text'
    };
    
    console.log('Inserting message:', {
      from: users[0].name,
      to: users[1].name,
      content: testMessage.content
    });

    const { data: insertResult, error: insertError } = await supabase
      .from('messages')
      .insert(testMessage)
      .select();

    if (insertError) {
      console.log('❌ Error inserting test message:', insertError.message);
    } else {
      console.log('✅ Test message inserted:', insertResult[0]);
    }

    // Wait for realtime event
    console.log('\n4. Waiting for realtime event (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (receivedEvents > 0) {
      console.log(`✅ Success! Received ${receivedEvents} realtime event(s)`);
    } else {
      console.log('❌ No realtime events received');
    }

    // Test updating a message
    if (insertResult && insertResult[0]) {
      console.log('\n5. Testing realtime with message update:');
      const { data: updateResult, error: updateError } = await supabase
        .from('messages')
        .update({ content: 'Updated test message - ' + new Date().toISOString() })
        .eq('id', insertResult[0].id)
        .select();

      if (updateError) {
        console.log('❌ Error updating message:', updateError.message);
      } else {
        console.log('✅ Message updated:', updateResult[0]);
      }

      // Wait for update event
      console.log('⏳ Waiting for update event (3 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`\n✅ Realtime test completed. Total events received: ${receivedEvents}`);

    // Clean up
    channel.unsubscribe();

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  } finally {
    process.exit(0);
  }
}

testRealtimeWithValidData();
