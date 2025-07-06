require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRealtime() {
  console.log('🔍 Debugging realtime and RLS policies...');
  
  const currentUserId = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'; // teacher1
  const conversationId = '17cba3eb-0c3f-4bd7-beab-0feaa4caacdc';
  
  // 1. Check RLS on conversation_messages table
  console.log('\n1. Checking RLS on conversation_messages table...');
  const { data: rlsCheck, error: rlsError } = await supabase
    .rpc('current_setting', { setting_name: 'row_security' });
  
  console.log('RLS setting:', rlsCheck, rlsError);
  
  // 2. Check table permissions
  console.log('\n2. Testing table permissions...');
  
  // Test SELECT
  const { data: selectTest, error: selectError } = await supabase
    .from('conversation_messages')
    .select('*')
    .limit(1);
  
  console.log('SELECT test:', selectTest ? 'SUCCESS' : 'FAILED', selectError);
  
  // Test INSERT
  const testMessage = {
    conversation_id: conversationId,
    sender_id: currentUserId,
    content: 'Debug test message ' + new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  const { data: insertTest, error: insertError } = await supabase
    .from('conversation_messages')
    .insert([testMessage])
    .select();
  
  console.log('INSERT test:', insertTest ? 'SUCCESS' : 'FAILED', insertError);
  
  // 3. Test realtime subscription
  console.log('\n3. Testing realtime subscription...');
  
  let messageReceived = false;
  
  const channel = supabase
    .channel(`debug-conversation-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('🟢 Realtime message received:', payload);
        messageReceived = true;
      }
    )
    .subscribe((status, err) => {
      console.log('🔔 Subscription status:', status, err);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime subscription successful');
        
        // Send test message after subscription
        setTimeout(async () => {
          console.log('📤 Sending realtime test message...');
          const realtimeTestMessage = {
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: 'Realtime debug test ' + new Date().toISOString(),
            created_at: new Date().toISOString()
          };
          
          const { data: realtimeResult, error: realtimeError } = await supabase
            .from('conversation_messages')
            .insert([realtimeTestMessage])
            .select();
          
          if (realtimeError) {
            console.error('❌ Error sending realtime test:', realtimeError);
          } else {
            console.log('✅ Realtime test message sent:', realtimeResult);
          }
          
          // Check if we received the message
          setTimeout(() => {
            if (!messageReceived) {
              console.log('❌ Realtime message NOT received - possible realtime issue');
            } else {
              console.log('✅ Realtime working correctly');
            }
          }, 2000);
        }, 1000);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('❌ Realtime subscription failed:', status, err);
      }
    });
  
  // 4. Check conversation participants
  console.log('\n4. Checking conversation participants...');
  const { data: participants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select('user_id, role')
    .eq('conversation_id', conversationId);
  
  console.log('Participants:', participants, participantsError);
  
  // Keep script running for realtime test
  setTimeout(() => {
    console.log('🔴 Cleaning up...');
    channel.unsubscribe();
    process.exit(0);
  }, 8000);
}

debugRealtime().catch(console.error);
