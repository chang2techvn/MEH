require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createMessagesForTeacher1() {
  console.log('🔄 Creating messages for teacher1 conversations...');
  
  const currentUserId = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'; // teacher1
  
  // Get teacher1's conversations
  const { data: teacherConversations, error: conversationError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUserId)
    .limit(3);
  
  if (conversationError || !teacherConversations || teacherConversations.length === 0) {
    console.error('❌ Error getting teacher1 conversations:', conversationError);
    return;
  }
  
  console.log(`✅ Found ${teacherConversations.length} conversations for teacher1`);
  
  // Get the other participants in each conversation
  for (const conv of teacherConversations) {
    const conversationId = conv.conversation_id;
    console.log(`\n🔍 Processing conversation: ${conversationId}`);
    
    // Get other participants
    const { data: otherParticipants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', currentUserId)
      .limit(1);
    
    if (otherParticipants && otherParticipants.length > 0) {
      const otherUserId = otherParticipants[0].user_id;
      console.log(`  Other participant: ${otherUserId}`);
      
      // Create some messages between teacher1 and the other participant
      const messages = [
        {
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: 'Hello! How are you doing with your English practice?',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          conversation_id: conversationId,
          sender_id: otherUserId,
          content: 'Hi! I\'m doing well, thank you for asking. The lessons are very helpful.',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        },
        {
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: 'That\'s great to hear! Keep up the good work.',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        }
      ];
      
      // Insert messages
      for (const message of messages) {
        console.log(`  📝 Creating: "${message.content}"`);
        
        const { error: insertError } = await supabase
          .from('conversation_messages')
          .insert([message]);
        
        if (insertError) {
          console.error(`  ❌ Error inserting message:`, insertError);
        } else {
          console.log(`  ✅ Message inserted`);
        }
      }
    }
  }
  
  console.log('\n✅ Messages created for teacher1 conversations!');
}

createMessagesForTeacher1().catch(console.error);
