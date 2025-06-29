const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRealtimeWithAuth() {
  console.log('🔍 Testing Realtime with Auth User...\n');

  try {
    // Sign in as a test user first
    console.log('1. Signing in as test user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@university.edu',
      password: 'teacher123456'
    });

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }

    console.log('✅ Signed in as:', authData.user.email);

    // Create auth client (non-service-role)
    const authClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
    
    // Set session for auth client
    await authClient.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token
    });

    // Get conversation
    console.log('\n2. Getting conversation with auth context...');
    const { data: conversation } = await supabase  // Use service role to get data
      .from('conversations')
      .select('id, title')
      .limit(1)
      .single();

    if (!conversation) {
      console.log('❌ No conversation found');
      return;
    }

    console.log('✅ Using conversation:', conversation.title, `(${conversation.id})`);

    // Set up realtime with auth client
    console.log('\n3. Setting up realtime with authenticated client:');
    let receivedEvents = 0;
    
    const channel = authClient
      .channel(`conversation-${conversation.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversation_messages', filter: `conversation_id=eq.${conversation.id}` }, 
        (payload) => {
          receivedEvents++;
          console.log('📨 Realtime event received:', {
            eventType: payload.eventType,
            conversationId: payload.new?.conversation_id || payload.old?.conversation_id,
            new: payload.new ? { id: payload.new.id, content: payload.new.content } : null
          });
        }
      );

    await new Promise((resolve, reject) => {
      channel.subscribe((status) => {
        console.log('📡 Channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed with auth context');
          resolve();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          reject(new Error(`Channel ${status}`));
        }
      });
    });

    // Test with authenticated insert
    console.log('\n4. Testing insert with service role (simulating auth):');
    // Get a database user that exists
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, name')
      .limit(1)
      .single();

    const { data: insertResult, error: insertError } = await supabase  // Use service role
      .from('conversation_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: dbUser.id,  // Use database user ID
        content: 'Realtime test message from ' + dbUser.name + ' - ' + new Date().toISOString(),
        message_type: 'text'
      })
      .select();

    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
    } else {
      console.log('✅ Message inserted with service role:', insertResult[0]);
    }

    // Wait for events
    console.log('\n5. Waiting for realtime events (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log(`\n✅ Auth realtime test completed. Events received: ${receivedEvents}`);

    // Clean up
    channel.unsubscribe();

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testRealtimeWithAuth();
