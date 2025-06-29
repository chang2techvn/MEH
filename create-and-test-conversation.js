const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestConversationAndTestRealtime() {
  console.log('🔍 Creating Test Conversation and Testing Realtime...\n');

  try {
    // 1. Get users
    console.log('1. Getting users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(3);

    if (usersError || !users || users.length < 2) {
      console.log('❌ Error getting users:', usersError?.message || 'Not enough users');
      return;
    }

    console.log('✅ Found users:', users.map(u => `${u.name} (${u.email})`));

    // 2. Create a conversation
    console.log('\n2. Creating conversation...');
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        title: `Chat: ${users[0].name} & ${users[1].name}`,
        status: 'active'
      })
      .select()
      .single();

    if (convError) {
      console.log('❌ Error creating conversation:', convError.message);
      return;
    }

    console.log('✅ Created conversation:', conversation.title, `(${conversation.id})`);

    // 3. Add participants
    console.log('\n3. Adding participants...');
    const participants = [
      {
        conversation_id: conversation.id,
        user_id: users[0].id,
        role: 'participant',
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString()
      },
      {
        conversation_id: conversation.id,
        user_id: users[1].id,
        role: 'participant',
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString()
      }
    ];

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantsError) {
      console.log('❌ Error adding participants:', participantsError.message);
      return;
    }

    console.log('✅ Added participants to conversation');

    // 4. Test auth
    console.log('\n4. Testing auth with teacher1@university.edu...');
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const authClient = createClient(supabaseUrl, anonKey);

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123456'
    });

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      // Continue with service role
      console.log('📝 Will use service role for testing');
    } else {
      console.log('✅ Signed in as:', authData.user.email);
    }

    // 5. Set up realtime subscription
    console.log('\n5. Setting up realtime subscription...');
    let receivedEvents = 0;
    
    const realtimeClient = authData ? authClient : supabase; // Use auth client if available
    const channel = realtimeClient
      .channel(`conversation-messages-${conversation.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversation.id}`
        }, 
        (payload) => {
          receivedEvents++;
          console.log('📨 Realtime event received:', {
            eventType: payload.eventType,
            conversationId: payload.new?.conversation_id || payload.old?.conversation_id,
            senderId: payload.new?.sender_id,
            content: payload.new?.content || payload.old?.content
          });
        }
      );

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Subscription timeout'));
      }, 10000);

      channel.subscribe((status) => {
        console.log('📡 Channel status:', status);
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout);
          console.log('✅ Successfully subscribed to realtime');
          resolve();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          clearTimeout(timeout);
          reject(new Error(`Channel ${status}`));
        }
      });
    });

    // 6. Test multiple message inserts
    console.log('\n6. Testing multiple message inserts...');
    
    // Insert first message
    const { data: msg1, error: err1 } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: users[0].id,
        content: 'Hello! This is the first test message - ' + new Date().toISOString(),
        message_type: 'text'
      })
      .select();

    if (err1) {
      console.log('❌ Error inserting message 1:', err1.message);
    } else {
      console.log('✅ Message 1 inserted:', msg1[0].content);
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Insert second message
    const { data: msg2, error: err2 } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: users[1].id,
        content: 'Hi there! This is the second test message - ' + new Date().toISOString(),
        message_type: 'text'
      })
      .select();

    if (err2) {
      console.log('❌ Error inserting message 2:', err2.message);
    } else {
      console.log('✅ Message 2 inserted:', msg2[0].content);
    }

    // Wait for realtime events
    console.log('\n7. Waiting for realtime events (8 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    if (receivedEvents > 0) {
      console.log(`\n🎉 SUCCESS! Received ${receivedEvents} realtime event(s)`);
      console.log('✅ Realtime is working for conversation_messages!');
    } else {
      console.log('\n❌ No realtime events received');
      console.log('🔍 Checking if messages were actually inserted...');
      
      const { data: checkMessages } = await supabase
        .from('conversation_messages')
        .select('id, content, sender_id')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      console.log('📋 Messages in database:', checkMessages?.length || 0);
      if (checkMessages) {
        checkMessages.forEach((msg, i) => {
          console.log(`   ${i + 1}. ${msg.content.substring(0, 50)}...`);
        });
      }
    }

    // Clean up
    console.log('\n8. Cleaning up...');
    channel.unsubscribe();
    
    if (authData) {
      await authClient.auth.signOut();
    }

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestConversationAndTestRealtime();
