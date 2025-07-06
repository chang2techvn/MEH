require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConversationMessages() {
  console.log('🔍 Testing conversation messages...');
  
  const currentUserId = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'; // teacher1
  
  // Get first conversation for teacher1
  const { data: conversationParticipants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      conversations!inner(
        id,
        title
      )
    `)
    .eq('user_id', currentUserId)
    .limit(1);
  
  if (participantsError || !conversationParticipants || conversationParticipants.length === 0) {
    console.error('❌ Error getting conversations:', participantsError);
    return;
  }
  
  const conversationId = conversationParticipants[0].conversation_id;
  console.log(`✅ Testing conversation: ${conversationId}`);
  
  // Test messages loading
  const { data: messagesData, error: messagesError } = await supabase
    .from('conversation_messages')
    .select(`
      id,
      content,
      sender_id,
      created_at,
      message_type,
      media_url
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (messagesError) {
    console.error('❌ Error loading messages:', messagesError);
    return;
  }
  
  console.log(`✅ Found ${messagesData?.length || 0} messages`);
  
  if (messagesData && messagesData.length > 0) {
    console.log('📨 Recent messages:');
    messagesData.forEach((msg, index) => {
      console.log(`  ${index + 1}. "${msg.content}" by ${msg.sender_id} at ${msg.created_at}`);
    });
    
    // Test last message
    const lastMessage = messagesData[0]; // First in desc order
    console.log(`\n📅 Last message details:`);
    console.log(`  Content: "${lastMessage.content}"`);
    console.log(`  Timestamp: ${lastMessage.created_at}`);
    console.log(`  Parsed timestamp: ${new Date(lastMessage.created_at)}`);
  } else {
    console.log('⚠️ No messages found in this conversation');
    
    // Check if there are ANY messages in the database
    const { data: allMessages, error: allMessagesError } = await supabase
      .from('conversation_messages')
      .select('conversation_id, content, created_at')
      .limit(5);
    
    if (allMessages && allMessages.length > 0) {
      console.log(`\n📨 Found ${allMessages.length} messages in other conversations:`);
      allMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. "${msg.content}" in ${msg.conversation_id}`);
      });
    } else {
      console.log('⚠️ No messages found in entire database');
    }
  }
}

testConversationMessages().catch(console.error);
