const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testTeacher1Realtime() {
  console.log('🔍 Testing realtime for teacher1@university.edu...\n');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Sign in as teacher1
    console.log('1. Signing in as teacher1...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123456'
    });

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }

    console.log('✅ Signed in successfully:', authData.user.email);
    console.log('   User ID:', authData.user.id);

    // 2. Get user's conversations
    console.log('\n2. Getting conversations...');
    const { data: conversations, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        role,
        conversations!inner(
          id,
          title,
          status,
          created_at
        )
      `)
      .eq('user_id', authData.user.id);

    if (convError) {
      console.log('❌ Error getting conversations:', convError.message);
      return;
    }

    if (!conversations || conversations.length === 0) {
      console.log('❌ No conversations found for this user');
      return;
    }

    console.log('✅ Found conversations:');
    conversations.forEach(conv => {
      const conversation = Array.isArray(conv.conversations) ? conv.conversations[0] : conv.conversations;
      console.log(`   - ${conversation.title} (${conversation.id})`);
    });

    // 3. Get messages for first conversation
    const firstConversation = Array.isArray(conversations[0].conversations) 
      ? conversations[0].conversations[0] 
      : conversations[0].conversations;

    console.log(`\n3. Getting messages for: ${firstConversation.title}`);
    const { data: messages, error: msgError } = await supabase
      .from('conversation_messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        sender:users!sender_id(name)
      `)
      .eq('conversation_id', firstConversation.id)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.log('❌ Error getting messages:', msgError.message);
      return;
    }

    console.log(`✅ Found ${messages?.length || 0} messages:`);
    if (messages) {
      messages.forEach(msg => {
        const senderName = msg.sender?.name || 'Unknown';
        console.log(`   - ${senderName}: ${msg.content.substring(0, 50)}...`);
      });
    }

    // 4. Set up realtime subscription
    console.log('\n4. Setting up realtime subscription...');
    let eventCount = 0;

    const channel = supabase
      .channel(`conversation-${firstConversation.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'conversation_messages',
          filter: `conversation_id=eq.${firstConversation.id}`
        }, 
        (payload) => {
          eventCount++;
          console.log(`📨 New message received (${eventCount}):`, {
            id: payload.new.id,
            content: payload.new.content,
            sender_id: payload.new.sender_id
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    // Wait for subscription
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Test sending a message (simulate from another user)
    console.log('\n5. Simulating new message...');
    
    // Get other participant
    const { data: otherParticipants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', firstConversation.id)
      .neq('user_id', authData.user.id);

    if (otherParticipants && otherParticipants.length > 0) {
      const otherUserId = otherParticipants[0].user_id;
      
      // Use service role to insert message
      const serviceSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
      
      const { data: newMessage, error: sendError } = await serviceSupabase
        .from('conversation_messages')
        .insert({
          conversation_id: firstConversation.id,
          sender_id: otherUserId,
          content: `Realtime test message - ${new Date().toISOString()}`,
          message_type: 'text'
        })
        .select();

      if (sendError) {
        console.log('❌ Error sending test message:', sendError.message);
      } else {
        console.log('✅ Test message sent:', newMessage[0].content);
      }
    }

    // Wait for realtime event
    console.log('\n6. Waiting for realtime event (8 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    if (eventCount > 0) {
      console.log(`\n✅ Success! Received ${eventCount} realtime event(s)`);
    } else {
      console.log('\n❌ No realtime events received');
    }

    // Cleanup
    supabase.removeChannel(channel);
    await supabase.auth.signOut();

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testTeacher1Realtime();
