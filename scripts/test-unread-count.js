import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testUnreadCount() {
  console.log('🧪 Testing unread count calculation...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in as teacher1
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'teacher1@university.edu',
    password: 'teacher123'
  });

  if (signInError) {
    console.log('❌ Sign in error:', signInError.message);
    return;
  }

  console.log('✅ Signed in as teacher1');
  const userId = authData.user.id;

  // Get conversations with last_read_at info
  const { data: conversations, error: convError } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      last_read_at,
      conversations (
        title
      )
    `)
    .eq('user_id', userId);

  if (convError) {
    console.log('❌ Error:', convError.message);
    return;
  }

  console.log(`\n📋 Found ${conversations.length} conversations:\n`);

  for (const conv of conversations) {
    const title = Array.isArray(conv.conversations) 
      ? conv.conversations[0]?.title 
      : conv.conversations?.title;
    
    console.log(`🗣️ Conversation: ${title}`);
    console.log(`   Last read at: ${conv.last_read_at || 'Never'}`);

    // Get messages in this conversation
    const { data: messages, error: msgError } = await supabase
      .from('conversation_messages')
      .select('id, sender_id, content, created_at')
      .eq('conversation_id', conv.conversation_id)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.log(`   ❌ Error getting messages: ${msgError.message}`);
      continue;
    }

    const lastReadAt = new Date(conv.last_read_at || 0);
    console.log(`   Total messages: ${messages.length}`);

    // Calculate unread count manually
    const unreadMessages = messages.filter(msg => {
      const msgTime = new Date(msg.created_at);
      const isFromOther = msg.sender_id !== userId;
      const isAfterLastRead = msgTime > lastReadAt;
      return isFromOther && isAfterLastRead;
    });

    console.log(`   Unread messages: ${unreadMessages.length}`);
    
    if (unreadMessages.length > 0) {
      console.log(`   📨 Unread messages:`);
      unreadMessages.forEach((msg, i) => {
        console.log(`      ${i + 1}. "${msg.content}" (${new Date(msg.created_at).toLocaleTimeString()})`);
      });
    }
    console.log('');
  }

  console.log('✅ Test completed!');
}

testUnreadCount();
