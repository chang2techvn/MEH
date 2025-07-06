require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSendMessage() {
  console.log('🔍 Testing send message functionality...');
  
  const currentUserId = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'; // teacher1
  
  // Get first conversation for teacher1
  const { data: conversationParticipants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUserId)
    .limit(1);
  
  if (participantsError || !conversationParticipants || conversationParticipants.length === 0) {
    console.error('❌ Error getting conversations:', participantsError);
    return;
  }
  
  const conversationId = conversationParticipants[0].conversation_id;
  console.log(`✅ Testing in conversation: ${conversationId}`);
  
  // Test sending a message
  const testMessage = {
    conversation_id: conversationId,
    sender_id: currentUserId,
    content: 'Test message from script at ' + new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  console.log('📤 Attempting to send message...');
  const { data: insertResult, error: insertError } = await supabase
    .from('conversation_messages')
    .insert([testMessage])
    .select();
  
  if (insertError) {
    console.error('❌ Error sending message:', insertError);
    
    // Check table permissions
    console.log('\n🔍 Checking table permissions...');
    const { data: testSelect, error: selectError } = await supabase
      .from('conversation_messages')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Cannot even SELECT from table:', selectError);
    } else {
      console.log('✅ SELECT works, INSERT permission issue');
    }
    
    return;
  }
  
  console.log('✅ Message sent successfully:', insertResult);
  
  // Test realtime subscription
  console.log('\n🔍 Testing realtime subscription...');
  
  const channel = supabase
    .channel(`test-conversation-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('🔴 Realtime message received:', payload);
      }
    )
    .subscribe((status, err) => {
      console.log('🔴 Realtime subscription status:', status, err);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime subscription successful');
        
        // Send another test message after subscription
        setTimeout(async () => {
          console.log('📤 Sending test message for realtime...');
          const realtimeTestMessage = {
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: 'Realtime test message at ' + new Date().toISOString(),
            created_at: new Date().toISOString()
          };
          
          const { error: realtimeError } = await supabase
            .from('conversation_messages')
            .insert([realtimeTestMessage]);
          
          if (realtimeError) {
            console.error('❌ Error sending realtime test message:', realtimeError);
          } else {
            console.log('✅ Realtime test message sent');
          }
        }, 2000);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('❌ Realtime subscription failed:', status, err);
      }
    });
  
  // Keep the script running to test realtime
  console.log('⏳ Keeping script running for 10 seconds to test realtime...');
  setTimeout(() => {
    console.log('🔴 Unsubscribing from realtime channel...');
    channel.unsubscribe();
    console.log('✅ Test completed');
    process.exit(0);
  }, 10000);
}

testSendMessage().catch(console.error);
